import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/housing.dart';

class HousingService {
  final ApiClient _apiClient = ApiClient();

  Future<List<HousingListing>> getListings({String? propertyType}) async {
    final response = await _apiClient.get(
      ApiEndpoints.housingListings,
      queryParameters: propertyType != null && propertyType != 'all'
          ? {'propertyType': propertyType}
          : null,
    );

    final List<dynamic> data = response.data;
    return data.map((item) => HousingListing.fromJson(item)).toList();
  }

  Future<HousingViewingRequest> requestViewing({
    required String listingId,
    required String preferredDate,
    required String studentPhone,
    String? message,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.housingViewings,
      data: {
        'listingId': listingId,
        'preferredDate': preferredDate,
        'studentPhone': studentPhone,
        if (message != null && message.isNotEmpty) 'message': message,
      },
    );

    return HousingViewingRequest.fromJson(response.data);
  }

  Future<List<HousingViewingRequest>> getMyViewings() async {
    final response = await _apiClient.get(ApiEndpoints.housingMyViewings);
    final List<dynamic> data = response.data;
    return data.map((item) => HousingViewingRequest.fromJson(item)).toList();
  }
}
