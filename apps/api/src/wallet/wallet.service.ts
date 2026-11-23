import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiateWalletTransferDto, TopupWalletDto } from '@campusflow/contracts';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        entries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            transaction: true,
          },
        },
      },
    });

    if (!wallet) {
      // Find user's campus membership
      const membership = await this.prisma.campusMembership.findFirst({
        where: { userId },
      });
      const campusId = membership?.campusId || (await this.prisma.campus.findFirst())?.id;
      if (!campusId) {
        throw new NotFoundException('No active campus found for user wallet');
      }

      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          campusId,
          walletType: 'student',
          currency: 'ETB',
          balanceMinor: BigInt(0),
          status: 'active',
        },
        include: {
          entries: {
            include: { transaction: true },
          },
        },
      });
    }

    return {
      id: wallet.id,
      campusId: wallet.campusId,
      userId: wallet.userId,
      walletType: wallet.walletType,
      currency: wallet.currency,
      balanceMinor: wallet.balanceMinor.toString(),
      status: wallet.status,
      version: wallet.version,
      recentTransactions: wallet.entries.map((entry) => ({
        id: entry.id,
        transactionId: entry.transactionId,
        entryType: entry.entryType,
        amountMinor: entry.amountMinor.toString(),
        balanceAfter: entry.balanceAfter.toString(),
        referenceNumber: entry.transaction.referenceNumber,
        category: entry.transaction.category,
        state: entry.transaction.state,
        description: entry.transaction.description,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }

  async transfer(senderUserId: string, dto: InitiateWalletTransferDto) {
    const amountMinor = BigInt(dto.amountMinor.toString());
    if (amountMinor <= 0n) {
      throw new BadRequestException('Transfer amount must be greater than zero');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Get sender wallet with lock check
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: senderUserId },
      });
      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }
      if (senderWallet.status !== 'active') {
        throw new BadRequestException('Sender wallet is not active');
      }
      if (senderWallet.balanceMinor < amountMinor) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      // 2. Resolve recipient wallet
      // Can match phone number, student ID number, or user ID
      let recipientUser = await tx.user.findFirst({
        where: {
          OR: [
            { phone: dto.recipientIdentifier },
            { id: dto.recipientIdentifier.length === 36 ? dto.recipientIdentifier : undefined },
            { studentProfile: { studentIdNumber: dto.recipientIdentifier } },
          ],
        },
      });

      if (!recipientUser) {
        throw new NotFoundException(`Recipient '${dto.recipientIdentifier}' not found`);
      }
      if (recipientUser.id === senderUserId) {
        throw new BadRequestException('Cannot transfer funds to your own wallet');
      }

      let recipientWallet = await tx.wallet.findUnique({
        where: { userId: recipientUser.id },
      });
      if (!recipientWallet) {
        recipientWallet = await tx.wallet.create({
          data: {
            userId: recipientUser.id,
            campusId: senderWallet.campusId,
            walletType: 'student',
            currency: senderWallet.currency,
            balanceMinor: BigInt(0),
            status: 'active',
          },
        });
      }

      // 3. Compute balances
      const senderNewBalance = senderWallet.balanceMinor - amountMinor;
      const recipientNewBalance = recipientWallet.balanceMinor + amountMinor;

      // 4. Update sender wallet (optimistic lock guard)
      const updatedSender = await tx.wallet.updateMany({
        where: {
          id: senderWallet.id,
          version: senderWallet.version,
          balanceMinor: { gte: amountMinor },
        },
        data: {
          balanceMinor: senderNewBalance,
          version: { increment: 1 },
        },
      });
      if (updatedSender.count === 0) {
        throw new BadRequestException('Concurrent wallet transaction conflict. Please retry.');
      }

      // 5. Update recipient wallet
      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: {
          balanceMinor: recipientNewBalance,
          version: { increment: 1 },
        },
      });

      // 6. Record transaction and balanced ledger entries
      const referenceNumber = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const transaction = await tx.walletTransaction.create({
        data: {
          campusId: senderWallet.campusId,
          referenceNumber,
          idempotencyKey: dto.idempotencyKey || null,
          category: 'p2p_transfer',
          state: 'succeeded',
          amountMinor,
          feeMinor: BigInt(0),
          currency: senderWallet.currency,
          description: dto.description || 'P2P Transfer',
          completedAt: new Date(),
          entries: {
            create: [
              {
                walletId: senderWallet.id,
                entryType: 'debit',
                amountMinor,
                currency: senderWallet.currency,
                balanceAfter: senderNewBalance,
              },
              {
                walletId: recipientWallet.id,
                entryType: 'credit',
                amountMinor,
                currency: recipientWallet.currency,
                balanceAfter: recipientNewBalance,
              },
            ],
          },
        },
      });

      return {
        success: true,
        referenceNumber: transaction.referenceNumber,
        amountMinor: amountMinor.toString(),
        currency: transaction.currency,
        senderBalanceAfter: senderNewBalance.toString(),
        recipientName: recipientUser.displayName,
        createdAt: transaction.createdAt.toISOString(),
      };
    });
  }

  async topup(userId: string, dto: TopupWalletDto) {
    const amountMinor = BigInt(dto.amountMinor.toString());
    if (amountMinor <= 0n) {
      throw new BadRequestException('Top-up amount must be greater than zero');
    }

    return this.prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });
      if (!wallet) {
        throw new NotFoundException('User wallet not found');
      }

      // Get campus treasury clearing account
      let treasuryWallet = await tx.wallet.findFirst({
        where: { campusId: wallet.campusId, walletType: 'campus_treasury' },
      });
      if (!treasuryWallet) {
        treasuryWallet = await tx.wallet.create({
          data: {
            campusId: wallet.campusId,
            walletType: 'campus_treasury',
            currency: 'ETB',
            balanceMinor: BigInt(500000000),
            status: 'active',
          },
        });
      }

      const newStudentBalance = wallet.balanceMinor + amountMinor;
      const newTreasuryBalance = treasuryWallet.balanceMinor - amountMinor;

      // Update student wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceMinor: newStudentBalance,
          version: { increment: 1 },
        },
      });

      // Update treasury clearing wallet
      await tx.wallet.update({
        where: { id: treasuryWallet.id },
        data: {
          balanceMinor: newTreasuryBalance,
          version: { increment: 1 },
        },
      });

      // Create double-entry transaction
      const category =
        dto.provider === 'telebirr'
          ? 'topup_telebirr'
          : dto.provider === 'cbe_birr'
          ? 'topup_cbe_birr'
          : 'topup_chapa';

      const referenceNumber = `TOPUP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const transaction = await tx.walletTransaction.create({
        data: {
          campusId: wallet.campusId,
          referenceNumber,
          category,
          state: 'succeeded',
          amountMinor,
          feeMinor: BigInt(0),
          currency: wallet.currency,
          description: `${dto.provider.toUpperCase()} Mobile Top-up`,
          completedAt: new Date(),
          entries: {
            create: [
              {
                walletId: wallet.id,
                entryType: 'credit',
                amountMinor,
                currency: wallet.currency,
                balanceAfter: newStudentBalance,
              },
              {
                walletId: treasuryWallet.id,
                entryType: 'debit',
                amountMinor,
                currency: treasuryWallet.currency,
                balanceAfter: newTreasuryBalance,
              },
            ],
          },
        },
      });

      return {
        success: true,
        referenceNumber: transaction.referenceNumber,
        provider: dto.provider,
        amountMinor: amountMinor.toString(),
        balanceMinor: newStudentBalance.toString(),
        currency: wallet.currency,
        completedAt: transaction.completedAt?.toISOString(),
      };
    });
  }
}
