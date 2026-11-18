class Product {
  final String id;
  final String businessId;
  final String? categoryId;
  final String name;
  final String? description;
  final int priceMinor;
  final String currency;
  final bool isAvailable;

  Product({
    required this.id,
    required this.businessId,
    this.categoryId,
    required this.name,
    this.description,
    required this.priceMinor,
    this.currency = 'ETB',
    this.isAvailable = true,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      businessId: json['businessId'] ?? '',
      categoryId: json['categoryId'],
      name: json['name'] ?? '',
      description: json['description'],
      priceMinor: json['priceMinor'] is int
          ? json['priceMinor']
          : int.tryParse(json['priceMinor'].toString()) ?? 0,
      currency: json['currency'] ?? 'ETB',
      isAvailable: json['isAvailable'] ?? true,
    );
  }
}
