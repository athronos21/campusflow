import 'product.dart';

class Business {
  final String id;
  final String campusId;
  final String name;
  final String? description;
  final String status;
  final List<Product> products;

  Business({
    required this.id,
    required this.campusId,
    required this.name,
    this.description,
    required this.status,
    this.products = const [],
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    final rawProducts = json['products'] as List<dynamic>? ?? [];
    return Business(
      id: json['id'] ?? '',
      campusId: json['campusId'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      status: json['status'] ?? 'pending',
      products: rawProducts.map((p) => Product.fromJson(p)).toList(),
    );
  }
}
