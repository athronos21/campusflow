import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/housing.dart';

class HousingService {
  final ApiClient _apiClient = ApiClient();

  Future<List<HousingListing>> getListings({String? propertyType}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.housingListings,
        queryParameters: propertyType != null && propertyType != 'all' ? {'propertyType': propertyType} : null,
      );
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((item) => HousingListing.fromJson(item)).toList();
    } catch (e) {
      print('Fetch housing listings error: $e');
      return _fallbackListings();
    }
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
    try {
      final response = await _apiClient.get(ApiEndpoints.housingMyViewings);
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((item) => HousingViewingRequest.fromJson(item)).toList();
    } catch (e) {
      print('Fetch my viewings error: $e');
      return [];
    }
  }

  List<HousingListing> _fallbackListings() {
    return [
      HousingListing(
        id: 'house-1',
        campusId: 'haramaya-main',
        title: 'Modern Single Studio Apartment near Gate 2',
        propertyType: 'single_room',
        rentMinor: 220000,
        currency: 'ETB',
        location: '5 min walk from Bate Gate 2',
        hasWater: true,
        hasElectricity: true,
        hasWifi: true,
        contactPhone: '+251 91 100 2233',
        description: 'Clean tiled room with private bathroom, quiet study environment.',
        isAvailable: true,
      ),
      HousingListing(
        id: 'house-2',
        campusId: 'haramaya-main',
        title: 'Shared 2-Bedroom Dorm Unit for Female Students',
        propertyType: 'shared_room',
        rentMinor: 140000,
        currency: 'ETB',
        location: '3 min walk from Main Campus',
        hasWater: true,
        hasElectricity: true,
        hasWifi: false,
        contactPhone: '+251 92 300 4455',
        description: 'Spacious room with study desks, beds, and shared kitchen facility.',
        isAvailable: true,
      ),
    ];
  }
}
