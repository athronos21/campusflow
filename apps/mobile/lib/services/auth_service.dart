import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/user.dart';
import 'storage_service.dart';

class AuthService {
  static Future<UserProfile?> login(String identifier, String password) async {
    try {
      final response = await ApiClient.client.post(
        ApiEndpoints.login,
        data: {
          'identifier': identifier,
          'password': password,
        },
      );

      final data = response.data;
      final token = data['accessToken'];
      if (token != null) {
        await StorageService.saveToken(token);
      }

      if (data['user'] != null) {
        final profile = UserProfile.fromJson(data['user']);
        await StorageService.saveUserName(profile.displayName);
        return profile;
      }
      return null;
    } catch (e) {
      print('Auth login error: $e');
      rethrow;
    }
  }

  static Future<void> logout() async {
    await StorageService.clear();
  }
}
