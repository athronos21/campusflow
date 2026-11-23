import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';

class AiAssistantService {
  static Future<String> getAnswer(String query) async {
    try {
      final response = await ApiClient.client.post(
        ApiEndpoints.assistantQuery,
        data: {'query': query},
      );

      final data = response.data;
      if (data is Map && data['answer'] != null) {
        return data['answer'].toString();
      }
    } catch (e) {
      print('AI Assistant API query error (using fallback): $e');
    }

    return _fallbackAnswer(query);
  }

  static String _fallbackAnswer(String query) {
    final q = query.toLowerCase();

    if (q.contains('library') || q.contains('book')) {
      return '📚 Haramaya Main Library is open 24/7 during exam season! Regular hours: Monday–Saturday 7:00 AM to 11:00 PM. Postgraduate Library is located behind Block 12.';
    } else if (q.contains('shuttle') || q.contains('bus') || q.contains('transport')) {
      return '🚌 HU Express Shuttles operate every 15 minutes between Main Campus Lounge, Technology Institute (HiT), and Health Sciences. Next shuttle departs in 12 mins (Bus HU-3-8841).';
    } else if (q.contains('exam') || q.contains('schedule') || q.contains('midterm')) {
      return '📝 Mid-Semester Exams for 2024/25 Semester II start Monday, March 10, 2025. Venue assignments are posted on the Announcements tab in CampusFlow!';
    } else if (q.contains('cafe') || q.contains('food') || q.contains('buna') || q.contains('coffee')) {
      return '☕ Main Campus Cafe & Snack near Student Lounge serves Special Buna (25 ETB) and Ful with Egg (80 ETB). You can order pickup directly under the Explore tab!';
    } else if (q.contains('gpa') || q.contains('grade')) {
      return '📊 You can project your semester GPA using the GPA & Timetable tool under Campus Super Services!';
    } else if (q.contains('emergency') || q.contains('doctor') || q.contains('clinic') || q.contains('security')) {
      return '🚨 For campus emergencies, tap the Emergency SOS button or call Campus Security (+251 25 553 0331) or Student Clinic (+251 25 553 0100).';
    } else {
      return '🤖 I am your CampusFlow AI Assistant for Haramaya University. You can ask me about library hours, shuttle bus times, cafeteria menus, exam schedules, or emergency contacts!';
    }
  }
}
