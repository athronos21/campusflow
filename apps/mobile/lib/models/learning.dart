class LearningResource {
  final String id;
  final String campusId;
  final String title;
  final String? description;
  final String department;
  final String courseCode;
  final String resourceType;
  final String fileUrl;
  final int downloadCount;
  final String? uploaderName;

  LearningResource({
    required this.id,
    required this.campusId,
    required this.title,
    this.description,
    required this.department,
    required this.courseCode,
    required this.resourceType,
    required this.fileUrl,
    required this.downloadCount,
    this.uploaderName,
  });

  factory LearningResource.fromJson(Map<String, dynamic> json) {
    return LearningResource(
      id: json['id'],
      campusId: json['campusId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      department: json['department'] ?? '',
      courseCode: json['courseCode'] ?? '',
      resourceType: json['resourceType'] ?? 'lecture_note',
      fileUrl: json['fileUrl'] ?? '',
      downloadCount: json['downloadCount'] ?? 0,
      uploaderName: json['uploader'] != null ? json['uploader']['displayName'] : null,
    );
  }
}
