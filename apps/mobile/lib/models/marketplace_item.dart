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
}
