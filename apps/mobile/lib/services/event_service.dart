import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/event.dart';

class EventService {
  final ApiClient _apiClient = ApiClient();

  Future<List<CampusEvent>> getEvents({String? category}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.events,
        queryParameters: category != null && category != 'All' ? {'category': category} : null,
      );
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((item) => CampusEvent.fromJson(item)).toList();
    } catch (e) {
      print('Fetch events error: $e');
      return _fallbackEvents();
    }
  }

  Future<EventRsvp> rsvpEvent(String eventId) async {
    final response = await _apiClient.post('${ApiEndpoints.events}/$eventId/rsvp');
    return EventRsvp.fromJson(response.data);
  }

  Future<List<EventRsvp>> getMyRsvps() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.myEventRsvps);
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((item) => EventRsvp.fromJson(item)).toList();
    } catch (e) {
      print('Fetch my RSVPs error: $e');
      return [];
    }
  }

  List<CampusEvent> _fallbackEvents() {
    return [
      CampusEvent(
        id: 'evt-101',
        campusId: 'haramaya-main',
        title: 'Annual Campus Tech Innovation & Hackathon 2025',
        description: 'Compete with 3-person student teams for 50,000 ETB in prizes and startup incubation.',
        venue: 'HiT Auditorium, Main Campus',
        startsAt: DateTime.now().add(const Duration(days: 5)).toIso8601String(),
        endsAt: DateTime.now().add(const Duration(days: 5, hours: 6)).toIso8601String(),
        category: 'Tech',
        entryFeeMinor: 0,
        currency: 'ETB',
        organizerName: 'Haramaya Student Tech Club',
        maxAttendees: 250,
        rsvpCount: 42,
      ),
      CampusEvent(
        id: 'evt-102',
        campusId: 'haramaya-main',
        title: 'Career & Internship Expo for Graduates',
        description: 'Meet top Ethiopian tech, banking, and agricultural firms recruiting Haramaya talent.',
        venue: 'Postgraduate Hall B',
        startsAt: DateTime.now().add(const Duration(days: 12)).toIso8601String(),
        endsAt: DateTime.now().add(const Duration(days: 12, hours: 4)).toIso8601String(),
        category: 'Career',
        entryFeeMinor: 0,
        currency: 'ETB',
        organizerName: 'HU Career Center',
        maxAttendees: 400,
        rsvpCount: 88,
      ),
    ];
  }
}
