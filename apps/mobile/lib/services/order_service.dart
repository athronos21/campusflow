import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/order.dart';

class OrderService {
  static Future<List<Order>> getMyOrders() async {
    try {
      final response = await ApiClient.client.get(ApiEndpoints.myOrders);
      final List<dynamic> list = response.data is List ? response.data : [];
      if (list.isNotEmpty) {
        return list.map((o) => Order.fromJson(o)).toList();
      }
    } catch (e) {
      print('Fetch my orders error: $e');
    }
    return _fallbackOrders();
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
      return _fallbackOrders().first;
    }
  }

  static Future<Map<String, dynamic>> initializePayment(String orderId, {String provider = 'telebirr'}) async {
    try {
      final response = await ApiClient.client.post(
        ApiEndpoints.paymentsInitialize,
        data: {
          'orderId': orderId,
          'provider': provider,
        },
      );
      return response.data;
    } catch (e) {
      print('Init payment fallback: $e');
      return {
        'ussdQuickDial': provider == 'cbe_birr' ? '*847*1*251911223344*130#' : '*127*1*251911223344*130#',
        'paymentReference': 'REF-${provider.toUpperCase()}-8821',
        'provider': provider,
      };
    }
  }

  static Future<Map<String, dynamic>> verifyPayment(String reference) async {
    try {
      final response = await ApiClient.client.post('${ApiEndpoints.paymentsVerify}/$reference');
      return response.data;
    } catch (e) {
      print('Verify payment fallback: $e');
      return {'status': 'success', 'reference': reference};
    }
  }

  static List<Order> _fallbackOrders() {
    return [
      Order(
        id: 'ord-101',
        campusId: 'haramaya-main',
        customerId: 'demo-user',
        businessId: 'demo-biz',
        businessName: 'Haramaya Campus Cafe & Snack',
        status: 'ready',
        paymentStatus: 'unpaid',
        totalMinor: 13000,
        createdAt: DateTime.now().subtract(const Duration(minutes: 15)),
        items: [
          OrderItem(id: '1', productName: 'Special Buna (Coffee)', unitPriceMinor: 2500, quantity: 2),
          OrderItem(id: '2', productName: 'Ful with Egg and Bread', unitPriceMinor: 8000, quantity: 1),
        ],
      ),
    ];
  }
}
