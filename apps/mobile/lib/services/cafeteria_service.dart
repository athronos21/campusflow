import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';

class CafeteriaService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>?> getMyDiningPass() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.cafeteriaPass);
      return response.data as Map<String, dynamic>?;
    } catch (e) {
      print('CafeteriaService getMyDiningPass error: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>> verifyPass({
    required String passCode,
    required String mealPeriod,
    required String diningHall,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.cafeteriaVerify,
      data: {
        'passCode': passCode,
        'mealPeriod': mealPeriod,
        'diningHall': diningHall,
      },
    );
    return response.data as Map<String, dynamic>;
  }
}
