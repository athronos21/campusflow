class Campus {
  final String id;
  final String name;
  final String slug;
  final String city;
  final bool isActive;

  Campus({
    required this.id,
    required this.name,
    required this.slug,
    required this.city,
    required this.isActive,
  });

  factory Campus.fromJson(Map<String, dynamic> json) {
    return Campus(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      city: json['city'] ?? '',
      isActive: json['isActive'] ?? true,
    );
  }
}
