class HousingListing {
  final String id;
  final String campusId;
  final String title;
  final String? description;
  final String location;
  final String propertyType;
  final int rentMinor;
  final String currency;
  final bool hasWater;
  final bool hasElectricity;
  final bool hasWifi;
  final String contactPhone;
  final String? imageUrl;
  final bool isAvailable;

  HousingListing({
    required this.id,
    required this.campusId,
    required this.title,
    this.description,
    required this.location,
    required this.propertyType,
    required this.rentMinor,
    required this.currency,
    required this.hasWater,
    required this.hasElectricity,
    required this.hasWifi,
    required this.contactPhone,
    this.imageUrl,
    required this.isAvailable,
  });

  factory HousingListing.fromJson(Map<String, dynamic> json) {
    return HousingListing(
      id: json['id'],
      campusId: json['campusId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      location: json['location'] ?? '',
      propertyType: json['propertyType'] ?? 'room',
      rentMinor: int.tryParse(json['rentMinor'].toString()) ?? 0,
      currency: json['currency'] ?? 'ETB',
      hasWater: json['hasWater'] ?? true,
      hasElectricity: json['hasElectricity'] ?? true,
      hasWifi: json['hasWifi'] ?? false,
      contactPhone: json['contactPhone'] ?? '',
      imageUrl: json['imageUrl'],
      isAvailable: json['isAvailable'] ?? true,
    );
  }
}

class HousingViewingRequest {
  final String id;
  final String listingId;
  final String studentPhone;
  final String preferredDate;
  final String? message;
  final String status;
  final String createdAt;
  final HousingListing? listing;

  HousingViewingRequest({
    required this.id,
    required this.listingId,
    required this.studentPhone,
    required this.preferredDate,
    this.message,
    required this.status,
    required this.createdAt,
    this.listing,
  });

  factory HousingViewingRequest.fromJson(Map<String, dynamic> json) {
    return HousingViewingRequest(
      id: json['id'],
      listingId: json['listingId'] ?? '',
      studentPhone: json['studentPhone'] ?? '',
      preferredDate: json['preferredDate'] ?? '',
      message: json['message'],
      status: json['status'] ?? 'pending',
      createdAt: json['createdAt'] ?? '',
      listing: json['listing'] != null ? HousingListing.fromJson(json['listing']) : null,
    );
  }
}
