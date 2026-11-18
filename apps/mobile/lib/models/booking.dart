class Booking {
  final String id;
  final String businessId;
  final String customerId;
  final String serviceName;
  final String startsAt;
  final String? endsAt;
  final String status;
  final String createdAt;
  final String? businessName;

  Booking({
    required this.id,
    required this.businessId,
    required this.customerId,
    required this.serviceName,
    required this.startsAt,
    this.endsAt,
    required this.status,
    required this.createdAt,
    this.businessName,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      businessId: json['businessId'] ?? '',
      customerId: json['customerId'] ?? '',
      serviceName: json['serviceName'] ?? 'Campus Service',
      startsAt: json['startsAt'] ?? '',
      endsAt: json['endsAt'],
      status: json['status'] ?? 'pending',
      createdAt: json['createdAt'] ?? '',
      businessName: json['business'] != null ? json['business']['name'] : null,
    );
  }
}
