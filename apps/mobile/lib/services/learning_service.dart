import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/learning.dart';

class LearningService {
  final ApiClient _apiClient = ApiClient();

  Future<List<LearningResource>> getResources({String? department, String? resourceType}) async {
    final response = await _apiClient.get(
      ApiEndpoints.learningResources,
      queryParameters: {
        if (department != null && department != 'All') 'department': department,
        if (resourceType != null && resourceType != 'All') 'resourceType': resourceType,
      },
    );

    final List<dynamic> data = response.data;
    return data.map((item) => LearningResource.fromJson(item)).toList();
  }

  Future<Map<String, dynamic>> recordDownload(String resourceId) async {
    final response = await _apiClient.post('${ApiEndpoints.learningResources}/$resourceId/download');
    return response.data;
  }
}
