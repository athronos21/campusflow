import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/booking.dart';

class BookingService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Booking>> getMyBookings() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.myBookings);
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((item) => Booking.fromJson(item)).toList();
    } catch (e) {
      print('Fetch my bookings error: $e');
      return [];
    }
  }

  Future<Booking> createBooking({
    required String businessId,
    required String serviceName,
    required String startsAt,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.bookings,
      data: {
        'businessId': businessId,
        'serviceName': serviceName,
        'startsAt': startsAt,
      },
    );

    return Booking.fromJson(response.data);
  }
}
