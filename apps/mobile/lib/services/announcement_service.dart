import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/announcement.dart';

class AnnouncementService {
  static Future<List<Announcement>> getAnnouncements() async {
    try {
      final response = await ApiClient.client.get(ApiEndpoints.announcements);
      final List<dynamic> data = response.data is List ? response.data : [];
      if (data.isNotEmpty) {
        return data.map((item) => Announcement.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      print('Fetch announcements error (using fallback): $e');
    }

    return _fallbackAnnouncements();
  }

  static List<Announcement> _fallbackAnnouncements() {
    return [
      Announcement(
        id: 'ann-1',
        title: 'Mid-Semester Exam Schedule Released for 2024/25 Academic Year',
        summary: 'Registrar Office has published the final mid-semester exam timetable for all colleges.',
        content: 'Dear Haramaya University Students,\n\nThe Registrar Office has officially published the Mid-Semester Examination Timetable for Semester II. Examinations will commence on Monday, March 10, 2025 across all halls.\n\nPlease check your student portal or department notice boards for your specific venue assignments.',
        category: AnnouncementCategory.academic,
        publisher: 'HU Office of the Registrar',
        publishedAt: DateTime.now().subtract(const Duration(hours: 4)),
        isImportant: true,
      ),
      Announcement(
        id: 'ann-2',
        title: 'Campus Shuttle Bus Route Extension to Technology Institute',
        summary: 'New shuttle stops added connecting Main Campus Lounge to HiT & Health Sciences.',
        content: 'To improve student transit across campuses, two additional electric shuttle buses will operate daily between 7:00 AM and 7:00 PM.\n\nBus stops:\n1. Main Library\n2. Student Lounge & Cafeteria\n3. Haramaya Institute of Technology (HiT)\n4. College of Health Sciences',
        category: AnnouncementCategory.administrative,
        publisher: 'Campus Transport Dept.',
        publishedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      Announcement(
        id: 'ann-3',
        title: 'Annual Campus Innovation & Hackathon Challenge 2025',
        summary: 'Register your 3-person team for a chance to win 50,000 ETB funding.',
        content: 'Haramaya Student Union in partnership with Tech Hub presents the 2025 Innovation Challenge! Develop digital solutions for Ethiopian higher education and win cash prizes, mentorship, and cloud credits.\n\nDeadline for registration: March 15, 2025.',
        category: AnnouncementCategory.studentUnion,
        publisher: 'Student Union Tech Committee',
        publishedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];
  }
}
