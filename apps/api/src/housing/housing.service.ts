import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHousingListingDto, RequestHousingViewingDto } from './dto/housing.dto';

@Injectable()
export class HousingService {
  constructor(private prisma: PrismaService) {}

  async getListings(campusId?: string, propertyType?: string) {
    const listings = await this.prisma.housingListing.findMany({
      where: {
        isAvailable: true,
        ...(campusId ? { campusId } : {}),
        ...(propertyType ? { propertyType: propertyType as any } : {}),
      },
      include: {
        landlord: {
          select: { displayName: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return listings.map((l) => ({
      ...l,
      rentMinor: l.rentMinor.toString(),
    }));
  }

  async getListingById(id: string) {
    const listing = await this.prisma.housingListing.findUnique({
      where: { id },
      include: {
        landlord: {
          select: { displayName: true, phone: true, email: true },
        },
      },
    });

    if (!listing) throw new NotFoundException('Housing listing not found');

    return {
      ...listing,
      rentMinor: listing.rentMinor.toString(),
    };
  }

  async createListing(landlordId: string, dto: CreateHousingListingDto) {
    const listing = await this.prisma.housingListing.create({
      data: {
        campusId: dto.campusId,
        landlordId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        propertyType: dto.propertyType || 'room',
        rentMinor: BigInt(dto.rentMinor),
        currency: 'ETB',
        hasWater: dto.hasWater ?? true,
        hasElectricity: dto.hasElectricity ?? true,
        hasWifi: dto.hasWifi ?? false,
        contactPhone: dto.contactPhone,
        imageUrl: dto.imageUrl,
      },
    });

    return {
      ...listing,
      rentMinor: listing.rentMinor.toString(),
    };
  }

  async requestViewing(studentId: string, dto: RequestHousingViewingDto) {
    const listing = await this.prisma.housingListing.findUnique({
      where: { id: dto.listingId },
      include: { landlord: true },
    });

    if (!listing) throw new NotFoundException('Housing listing not found');

    const request = await this.prisma.housingViewingRequest.create({
      data: {
        listingId: dto.listingId,
        studentId,
        preferredDate: new Date(dto.preferredDate),
        studentPhone: dto.studentPhone,
        message: dto.message,
      },
    });

    // Notify Landlord
    await this.prisma.notification.create({
      data: {
        userId: listing.landlordId,
        type: 'housing_viewing_request',
        title: 'New Student Housing Viewing Request',
        body: `A student requested a viewing for "${listing.title}". Phone: ${dto.studentPhone}`,
      },
    });

    return request;
  }

  async getMyViewingRequests(studentId: string) {
    return this.prisma.housingViewingRequest.findMany({
      where: { studentId },
      include: {
        listing: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
