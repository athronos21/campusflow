import '../core/api/api_client.dart';
import '../models/transport.dart';

class TransportService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Trip>> getTrips({String? destination}) async {
    final response = await _apiClient.get(
      '/transport/trips',
      queryParameters: destination != null && destination != 'all'
          ? {'destination': destination}
          : null,
    );

    final List<dynamic> data = response.data;
    return data.map((item) => Trip.fromJson(item)).toList();
  }

  Future<Map<String, dynamic>> getTripDetails(String tripId) async {
    final response = await _apiClient.get('/transport/trips/$tripId');
    return response.data;
  }

  Future<TicketReservation> reserveSeat({
    required String tripId,
    required int seatNumber,
    required String passengerName,
    required String passengerPhone,
    String paymentProvider = 'telebirr',
  }) async {
    final response = await _apiClient.post(
      '/transport/reservations',
      data: {
        'tripId': tripId,
        'seatNumber': seatNumber,
        'passengerName': passengerName,
        'passengerPhone': passengerPhone,
        'paymentProvider': paymentProvider,
      },
    );

    return TicketReservation.fromJson(response.data);
  }

  Future<List<TicketReservation>> getMyTickets() async {
    final response = await _apiClient.get('/transport/reservations/my');
    final List<dynamic> data = response.data;
    return data.map((item) => TicketReservation.fromJson(item)).toList();
  }

  Future<void> cancelTicket(String reservationId) async {
    await _apiClient.post('/transport/reservations/$reservationId/cancel');
  }

  Future<Map<String, dynamic>> initiateTelebirrPayment(String reservationId) async {
    final response = await _apiClient.post(
      '/payments/initialize',
      data: {
        'reservationId': reservationId,
        'provider': 'telebirr',
      },
    );
    return response.data;
  }

  Future<void> verifyPayment(String reference) async {
    await _apiClient.post('/payments/verify/$reference');
  }
}
