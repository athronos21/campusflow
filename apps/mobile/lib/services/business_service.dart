import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/business.dart';
import '../models/product.dart';

class BusinessService {
  static const String _cacheKey = 'campusflow_cached_businesses';

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
      if (list.isNotEmpty && search == null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_cacheKey, jsonEncode(list));
      }
      return list.map((b) => Business.fromJson(b)).toList();
    } catch (e) {
      // Offline fallback from local cache
      try {
        final prefs = await SharedPreferences.getInstance();
        final cached = prefs.getString(_cacheKey);
        if (cached != null) {
          final List<dynamic> list = jsonDecode(cached);
          return list.map((b) => Business.fromJson(b)).toList();
        }
      } catch (_) {}
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
      return [];
    }
  }
}
