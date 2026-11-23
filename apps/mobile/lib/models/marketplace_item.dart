class MarketplaceItem {
  final String id;
  final String title;
  final String category;
  final double price;
  final String condition;
  final String sellerName;
  final String sellerDorm;
  final String phone;
  final String description;
  final DateTime createdAt;

  const MarketplaceItem({
    required this.id,
    required this.title,
    required this.category,
    required this.price,
    required this.condition,
    required this.sellerName,
    required this.sellerDorm,
    required this.phone,
    required this.description,
    required this.createdAt,
  });

  factory MarketplaceItem.fromJson(Map<String, dynamic> json) {
    final rawPriceMinor = json['priceMinor'];
    double computedPrice = 0.0;
    if (rawPriceMinor != null) {
      final numVal = rawPriceMinor is num ? rawPriceMinor.toDouble() : double.tryParse(rawPriceMinor.toString()) ?? 0.0;
      computedPrice = numVal / 100.0;
    } else if (json['price'] != null) {
      computedPrice = (json['price'] as num).toDouble();
    }

    return MarketplaceItem(
      id: json['id'] ?? '',
      title: json['name'] ?? json['title'] ?? 'Campus Item',
      category: json['category'] is Map ? (json['category']['name'] ?? 'General') : (json['category'] ?? 'General'),
      price: computedPrice > 0 ? computedPrice : 50.0,
      condition: json['condition'] ?? 'Like New',
      sellerName: json['business'] is Map ? (json['business']['name'] ?? 'Campus Merchant') : (json['sellerName'] ?? 'Haramaya Merchant'),
      sellerDorm: json['sellerDorm'] ?? 'Campus Center',
      phone: json['phone'] ?? '+251 91 122 3344',
      description: json['description'] ?? 'Verified campus listing.',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
