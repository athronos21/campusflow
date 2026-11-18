class UserProfile {
  final String id;
  final String displayName;
  final String? email;
  final String? phone;
  final String status;
  final List<String> roles;

  UserProfile({
    required this.id,
    required this.displayName,
    this.email,
    this.phone,
    required this.status,
    this.roles = const ['student'],
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final memberships = json['memberships'] as List<dynamic>? ?? [];
    final roles = memberships.map((m) => m['role']?.toString() ?? 'student').toList();

    return UserProfile(
      id: json['id'] ?? '',
      displayName: json['displayName'] ?? '',
      email: json['email'],
      phone: json['phone'],
      status: json['status'] ?? 'active',
      roles: roles.isEmpty ? ['student'] : roles,
    );
  }
}
