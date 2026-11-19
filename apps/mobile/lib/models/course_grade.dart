class CourseGrade {
  final String courseCode;
  final String courseName;
  final int creditHours;
  String grade; // A+, A, A-, B+, B, B-, C+, C, C-, D, F

  CourseGrade({
    required this.courseCode,
    required this.courseName,
    required this.creditHours,
    this.grade = 'A',
  });

  double get gradePoint {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
        return 4.0;
      case 'A-':
        return 3.75;
      case 'B+':
        return 3.5;
      case 'B':
        return 3.0;
      case 'B-':
        return 2.75;
      case 'C+':
        return 2.5;
      case 'C':
        return 2.0;
      case 'C-':
        return 1.75;
      case 'D':
        return 1.0;
      case 'F':
      default:
        return 0.0;
    }
  }
}
