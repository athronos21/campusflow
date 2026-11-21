import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  int _balanceMinor = 125000; // 1,250.00 ETB in integer cents (no float rounding)

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Campus Pay Wallet', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Wallet Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primary, Colors.blue.shade900],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('CampusFlow Student Pass', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(6)),
                      child: const Text('ID: HU-8921', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 4),
                Text(
                  Formatters.formatETB(_balanceMinor),
                  style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          _showTopUpDialog(context);
                        },
                        icon: const Icon(Icons.add_card, size: 18),
                        label: const Text('Top Up', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          _showScanQRDialog(context);
                        },
                        icon: const Icon(Icons.qr_code_scanner, size: 18),
                        label: const Text('Scan & Pay', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white24,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () {
                        _showReceiveQrModal(context);
                      },
                      icon: const Icon(Icons.qr_code_2_rounded, size: 22),
                      tooltip: 'My Receiving QR',
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text(
            'Supported Top Up Methods',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              _buildPaymentProviderChip('Telebirr', Colors.blue),
              const SizedBox(width: 10),
              _buildPaymentProviderChip('CBE Birr', Colors.purple),
              const SizedBox(width: 10),
              _buildPaymentProviderChip('Chapa Pay', Colors.teal),
            ],
          ),
          const SizedBox(height: 24),

          const Text(
            'Recent Campus Transactions',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          _buildTransactionTile('Haramaya Campus Cafe', 'Food Order #104', '- ETB 120.00', 'Today, 1:15 PM', isDebit: true),
          _buildTransactionTile('Telebirr Top-Up', 'Wallet Recharge', '+ ETB 500.00', 'Yesterday', isDebit: false),
          _buildTransactionTile('HU Express Bus', 'Shuttle Ticket #882', '- ETB 15.00', '2 days ago', isDebit: true),
        ],
      ),
    );
  }

  Widget _buildPaymentProviderChip(String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Center(
          child: Text(label, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 13)),
        ),
      ),
    );
  }

  Widget _buildTransactionTile(String title, String subtitle, String amount, String date, {required bool isDebit}) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isDebit ? Colors.red.shade50 : Colors.green.shade50,
          child: Icon(isDebit ? Icons.arrow_upward : Icons.arrow_downward, color: isDebit ? Colors.red : Colors.green, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('$subtitle · $date', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        trailing: Text(
          amount,
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isDebit ? Colors.red.shade700 : Colors.green.shade700),
        ),
      ),
    );
  }

  void _showTopUpDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Top Up Campus Wallet', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Amount (ETB)',
                hintText: 'Enter amount e.g. 200',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              final val = double.tryParse(controller.text) ?? 0;
              if (val > 0) {
                final addedMinor = (val * 100).round();
                setState(() => _balanceMinor += addedMinor);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Successfully added ${Formatters.formatETB(addedMinor)} via Telebirr!')),
                );
              }
            },
            child: const Text('Pay via Telebirr', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showReceiveQrModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('My Receiving QR Pass', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close)),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: QrImageView(
                data: 'CAMPUSFLOW:WALLET:HU-00000-00:RECEIVE',
                version: QrVersions.auto,
                size: 140.0,
                backgroundColor: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            const Text('Sample Student · Telebirr & CBE Birr', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 4),
            const Text('ID: HU/00000/00 (Example)', style: TextStyle(fontFamily: 'monospace', fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('Ask another student or merchant to scan this QR code to transfer funds with zero fees.', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: Colors.black54)),
          ],
        ),
      ),
    );
  }

  void _showScanQRDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  const Icon(Icons.qr_code_scanner, size: 64, color: AppColors.primary),
                  Positioned(
                    bottom: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(4)),
                      child: const Text('CAMERA VIEWFINDER', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Text('Scan Campus Merchant QR Code', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 6),
            const Text('Point your camera at cafeteria, bookstore, or print shop QR code to pay instantly.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Simulated merchant payment of 85.00 ETB verified via Telebirr!')),
                  );
                },
                child: const Text('Simulate Merchant QR Scan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
