import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/learning.dart';

class LearningService {
  final ApiClient _apiClient = ApiClient();
  static const String _cacheKey = 'campusflow_cached_learning_resources';

  Future<List<LearningResource>> getResources({String? department, String? resourceType}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.learningResources,
        queryParameters: {
          if (department != null && department != 'All') 'department': department,
          if (resourceType != null && resourceType != 'All') 'resourceType': resourceType,
        },
      );

      final List<dynamic> data = response.data is List ? response.data : [];
      if (data.isNotEmpty && (department == null || department == 'All') && (resourceType == null || resourceType == 'All')) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_cacheKey, jsonEncode(data));
      }
      return data.map((item) => LearningResource.fromJson(item)).toList();
    } catch (e) {
      // Offline fallback from local cache
      try {
        final prefs = await SharedPreferences.getInstance();
        final cached = prefs.getString(_cacheKey);
        if (cached != null) {
          final List<dynamic> data = jsonDecode(cached);
          return data.map((item) => LearningResource.fromJson(item)).toList();
        }
      } catch (_) {}
      return [];
    }
  }

  Future<Map<String, dynamic>> recordDownload(String resourceId) async {
    final response = await _apiClient.post('${ApiEndpoints.learningResources}/$resourceId/download');
    return response.data;
  }
}
