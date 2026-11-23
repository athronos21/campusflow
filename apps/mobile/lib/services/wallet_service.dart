import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';

class WalletService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>?> getMyWallet() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.walletMe);
      return response.data as Map<String, dynamic>?;
    } catch (e) {
      print('WalletService getMyWallet error: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>> transfer({
    required String recipientIdentifier,
    required dynamic amountMinor,
    String description = 'P2P Transfer',
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.walletTransfer,
      data: {
        'recipientIdentifier': recipientIdentifier,
        'amountMinor': amountMinor,
        'description': description,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> topup({
    required String provider,
    required dynamic amountMinor,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.walletTopup,
      data: {
        'provider': provider,
        'amountMinor': amountMinor,
      },
    );
    return response.data as Map<String, dynamic>;
  }
}
