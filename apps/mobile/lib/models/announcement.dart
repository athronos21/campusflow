enum AnnouncementCategory { academic, administrative, studentUnion, emergency, general }

class Announcement {
  final String id;
  final String title;
  final String summary;
  final String content;
  final AnnouncementCategory category;
  final String publisher;
  final DateTime publishedAt;
  final bool isImportant;

  const Announcement({
    required this.id,
    required this.title,
    required this.summary,
    required this.content,
    required this.category,
    required this.publisher,
    required this.publishedAt,
    this.isImportant = false,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      summary: json['summary'] ?? '',
      content: json['content'] ?? '',
      category: _parseCategory(json['category']),
      publisher: json['publisher'] ?? 'Haramaya Administration',
      publishedAt: DateTime.tryParse(json['publishedAt'] ?? '') ?? DateTime.now(),
      isImportant: json['isImportant'] ?? false,
    );
  }

  static AnnouncementCategory _parseCategory(String? cat) {
    switch (cat?.toLowerCase()) {
      case 'academic':
        return AnnouncementCategory.academic;
      case 'administrative':
        return AnnouncementCategory.administrative;
      case 'studentunion':
      case 'student_union':
        return AnnouncementCategory.studentUnion;
      case 'emergency':
        return AnnouncementCategory.emergency;
      default:
        return AnnouncementCategory.general;
    }
  }

  String get categoryLabel {
    switch (category) {
      case AnnouncementCategory.academic:
        return 'Academic';
      case AnnouncementCategory.administrative:
        return 'Administrative';
      case AnnouncementCategory.studentUnion:
        return 'Student Union';
      case AnnouncementCategory.emergency:
        return 'Emergency';
      case AnnouncementCategory.general:
        return 'General';
    }
  }
}
