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
      ).timeout(const Duration(seconds: 1));

      final List<dynamic> list = response.data is List ? response.data : [];
      if (list.isNotEmpty && search == null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_cacheKey, jsonEncode(list));
      }
      return list.map((b) => Business.fromJson(b)).toList();
    } catch (e) {
      return _fallbackBusinesses();
    }
  }

  static Future<List<Product>> getProducts({String? businessId}) async {
    try {
      final response = await ApiClient.client.get(
        ApiEndpoints.products,
        queryParameters: {
          if (businessId != null) 'businessId': businessId,
        },
      ).timeout(const Duration(seconds: 1));

      final List<dynamic> list = response.data is List ? response.data : [];
      return list.map((p) => Product.fromJson(p)).toList();
    } catch (e) {
      return [];
    }
  }

  static List<Business> _fallbackBusinesses() {
    return [
      Business(
        id: 'biz-101',
        campusId: 'haramaya-main',
        name: 'Haramaya Campus Cafe & Snack',
        description: 'Fresh traditional Ethiopian coffee, snacks, breakfast, and fast food near Student Lounge.',
        status: 'verified',
        products: [
          Product(id: 'p-1', businessId: 'biz-101', name: 'Special Buna (Coffee)', description: 'Fresh Ethiopian roast', priceMinor: 2500),
          Product(id: 'p-2', businessId: 'biz-101', name: 'Ful with Egg & Bread', description: 'Hearty fava bean breakfast', priceMinor: 8000),
        ],
      ),
      Business(
        id: 'biz-102',
        campusId: 'haramaya-main',
        name: 'HiT Stationery & Printing Hub',
        description: 'Thesis binding, high-speed photocopying, color printing, and academic supplies.',
        status: 'verified',
        products: [
          Product(id: 'p-3', businessId: 'biz-102', name: 'Color Printing (per page)', description: 'A4 High Resolution', priceMinor: 1500),
          Product(id: 'p-4', businessId: 'biz-102', name: 'Hardcover Thesis Binding', description: 'Gold embossed title', priceMinor: 35000),
        ],
      ),
    ];
  }
}
