import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/order.dart';

class OrderService {
  static Future<List<Order>> getMyOrders() async {
    try {
      final response = await ApiClient.client.get(ApiEndpoints.myOrders);
      final List<dynamic> list = response.data is List ? response.data : [];
      return list.map((o) => Order.fromJson(o)).toList();
    } catch (e) {
      print('Fetch my orders error: $e');
      return [];
    }
  }

  static Future<Order?> createOrder({
    required String campusId,
    required String businessId,
    required List<Map<String, dynamic>> items,
  }) async {
    try {
      final response = await ApiClient.client.post(
        ApiEndpoints.orders,
        data: {
          'campusId': campusId,
          'businessId': businessId,
          'items': items,
        },
      );
      return Order.fromJson(response.data);
    } catch (e) {
      print('Create order error: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> initializePayment(String orderId, {String provider = 'telebirr'}) async {
    try {
      final response = await ApiClient.client.post(
        '/payments/initialize',
        data: {
          'orderId': orderId,
          'provider': provider,
        },
      );
      return response.data;
    } catch (e) {
      print('Init payment error: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> verifyPayment(String reference) async {
    try {
      final response = await ApiClient.client.post('/payments/verify/$reference');
      return response.data;
    } catch (e) {
      print('Verify payment error: $e');
      rethrow;
    }
  }
}
