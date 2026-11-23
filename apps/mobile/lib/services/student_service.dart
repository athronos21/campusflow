import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';

class StudentService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>?> getMyStudentProfile() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.studentMe);
      return response.data as Map<String, dynamic>?;
    } catch (e) {
      print('StudentService getMyStudentProfile error: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>> verifyStudentId(String studentIdNumber) async {
    final response = await _apiClient.get('${ApiEndpoints.studentVerify}/$studentIdNumber');
    return response.data as Map<String, dynamic>;
  }
}
