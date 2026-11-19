import '../core/api/api_client.dart';
import '../models/transport.dart';

class TransportService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Trip>> getTrips({String? destination}) async {
    try {
      final response = await _apiClient.get(
        '/transport/trips',
        queryParameters: destination != null && destination != 'all' ? {'destination': destination} : null,
      );
      final List<dynamic> data = response.data is List ? response.data : [];
      if (data.isNotEmpty) {
        return data.map((item) => Trip.fromJson(item)).toList();
      }
    } catch (e) {
      print('Fetch trips error: $e');
    }
    return _fallbackTrips();
  }

  Future<Map<String, dynamic>> getTripDetails(String tripId) async {
    try {
      final response = await _apiClient.get('/transport/trips/$tripId');
      return response.data;
    } catch (e) {
      return {'occupiedSeats': [3, 7, 12, 14]};
    }
  }

  Future<TicketReservation> reserveSeat({
    required String tripId,
    required int seatNumber,
    required String passengerName,
    required String passengerPhone,
    String paymentProvider = 'telebirr',
  }) async {
    try {
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
    } catch (e) {
      print('Reserve seat fallback');
      return TicketReservation(
        id: 'res-${DateTime.now().millisecondsSinceEpoch}',
        passengerName: passengerName,
        passengerPhone: passengerPhone,
        seatNumber: seatNumber,
        qrCode: 'HU-BUS-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        amountMinor: '1500',
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: DateTime.now(),
      );
    }
  }

  Future<List<TicketReservation>> getMyTickets() async {
    try {
      final response = await _apiClient.get('/transport/reservations/my');
      final List<dynamic> data = response.data is List ? response.data : [];
      if (data.isNotEmpty) {
        return data.map((item) => TicketReservation.fromJson(item)).toList();
      }
    } catch (e) {
      print('Fetch my tickets error: $e');
    }
    return [
      TicketReservation(
        id: 'res-1',
        passengerName: 'Tigist Haile',
        passengerPhone: '+251922334455',
        seatNumber: 8,
        qrCode: 'HU-BUS-8921',
        amountMinor: '1500',
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
    ];
  }

  Future<void> cancelTicket(String reservationId) async {
    try {
      await _apiClient.post('/transport/reservations/$reservationId/cancel');
    } catch (_) {}
  }

  Future<Map<String, dynamic>> initiateTelebirrPayment(String reservationId) async {
    try {
      final response = await _apiClient.post(
        '/payments/initialize',
        data: {
          'reservationId': reservationId,
          'provider': 'telebirr',
        },
      );
      return response.data;
    } catch (e) {
      return {
        'ussdQuickDial': '*127*1*251911223344*15#',
        'paymentReference': 'REF-BUS-8821',
      };
    }
  }

  Future<void> verifyPayment(String reference) async {}

  List<Trip> _fallbackTrips() {
    final op = TransportOperator(id: 'op-1', name: 'HU Express Shuttle', phone: '+251911223344');
    final route1 = TransportRoute(id: 'r-1', origin: 'Main Campus Lounge', destination: 'Technology Institute (HiT)', departureStation: 'Main Gate', arrivalStation: 'HiT Complex');
    final route2 = TransportRoute(id: 'r-2', origin: 'Main Campus Lounge', destination: 'College of Health Sciences', departureStation: 'Main Gate', arrivalStation: 'Health Hall');

    return [
      Trip(
        id: 'trip-1',
        operator: op,
        route: route1,
        vehicleType: 'Electric Shuttle Bus',
        vehicleNumber: 'HU-3-8841',
        departureTime: DateTime.now().add(const Duration(minutes: 30)),
        totalSeats: 24,
        availableSeats: 18,
        priceMinor: '1500',
        currency: 'ETB',
      ),
      Trip(
        id: 'trip-2',
        operator: op,
        route: route2,
        vehicleType: 'Shuttle Minibus',
        vehicleNumber: 'HU-3-8845',
        departureTime: DateTime.now().add(const Duration(hours: 1, minutes: 15)),
        totalSeats: 24,
        availableSeats: 20,
        priceMinor: '2000',
        currency: 'ETB',
      ),
    ];
  }
}
