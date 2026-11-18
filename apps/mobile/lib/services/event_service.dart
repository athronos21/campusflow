import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/event.dart';

class EventService {
  final ApiClient _apiClient = ApiClient();

  Future<List<CampusEvent>> getEvents({String? category}) async {
    final response = await _apiClient.get(
      ApiEndpoints.events,
      queryParameters: category != null && category != 'All'
          ? {'category': category}
          : null,
    );

    final List<dynamic> data = response.data;
    return data.map((item) => CampusEvent.fromJson(item)).toList();
  }

  Future<EventRsvp> rsvpEvent(String eventId) async {
    final response = await _apiClient.post('${ApiEndpoints.events}/$eventId/rsvp');
    return EventRsvp.fromJson(response.data);
  }

  Future<List<EventRsvp>> getMyRsvps() async {
    final response = await _apiClient.get(ApiEndpoints.myEventRsvps);
    final List<dynamic> data = response.data;
    return data.map((item) => EventRsvp.fromJson(item)).toList();
  }
}
