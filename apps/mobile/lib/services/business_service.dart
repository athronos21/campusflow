import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/business.dart';
import '../models/product.dart';

class BusinessService {
  static Future<List<Business>> getBusinesses({String? campusId, String? search}) async {
    try {
      final response = await ApiClient.client.get(
        ApiEndpoints.businesses,
        queryParameters: {
          if (campusId != null) 'campusId': campusId,
          if (search != null) 'search': search,
          'status': 'verified',
        },
      );

      final List<dynamic> list = response.data is List ? response.data : [];
      return list.map((b) => Business.fromJson(b)).toList();
    } catch (e) {
      print('Fetch businesses error: $e');
      return [];
    }
  }

  static Future<List<Product>> getProducts({String? businessId}) async {
    try {
      final response = await ApiClient.client.get(
        ApiEndpoints.products,
        queryParameters: {
          if (businessId != null) 'businessId': businessId,
        },
      );

      final List<dynamic> list = response.data is List ? response.data : [];
      return list.map((p) => Product.fromJson(p)).toList();
    } catch (e) {
      print('Fetch products error: $e');
      return [];
    }
  }
}
