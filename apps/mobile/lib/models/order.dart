class OrderItem {
  final String id;
  final String? productId;
  final String productName;
  final int unitPriceMinor;
  final int quantity;

  OrderItem({
    required this.id,
    this.productId,
    required this.productName,
    required this.unitPriceMinor,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? '',
      productId: json['productId'],
      productName: json['productName'] ?? '',
      unitPriceMinor: json['unitPriceMinor'] is int
          ? json['unitPriceMinor']
          : int.tryParse(json['unitPriceMinor'].toString()) ?? 0,
      quantity: json['quantity'] ?? 1,
    );
  }
}

class Order {
  final String id;
  final String campusId;
  final String customerId;
  final String businessId;
  final String? businessName;
  final String status;
  String paymentStatus;
  final int totalMinor;
  final String currency;
  final DateTime createdAt;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.campusId,
    required this.customerId,
    required this.businessId,
    this.businessName,
    required this.status,
    required this.paymentStatus,
    required this.totalMinor,
    this.currency = 'ETB',
    required this.createdAt,
    this.items = const [],
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return Order(
      id: json['id'] ?? '',
      campusId: json['campusId'] ?? '',
      customerId: json['customerId'] ?? '',
      businessId: json['businessId'] ?? '',
      businessName: json['business']?['name'] ?? 'Campus Shop',
      status: json['status'] ?? 'pending',
      paymentStatus: json['paymentStatus'] ?? 'unpaid',
      totalMinor: json['totalMinor'] is int
          ? json['totalMinor']
          : int.tryParse(json['totalMinor'].toString()) ?? 0,
      currency: json['currency'] ?? 'ETB',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      items: rawItems.map((i) => OrderItem.fromJson(i)).toList(),
    );
  }
}
