import 'package:dio/dio.dart';
import 'api_endpoints.dart';
import '../../services/storage_service.dart';

class ApiClient {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 2),
      receiveTimeout: const Duration(seconds: 2),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  static bool _interceptorAdded = false;

  static Dio get client {
    if (!_interceptorAdded) {
      _interceptorAdded = true;
      _dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            try {
              final token = await StorageService.getToken().timeout(const Duration(milliseconds: 500), onTimeout: () => null);
              if (token != null && token.isNotEmpty) {
                options.headers['Authorization'] = 'Bearer $token';
              }
            } catch (_) {}
            return handler.next(options);
          },
          onError: (DioException e, handler) {
            return handler.next(e);
          },
        ),
      );
    }
    return _dio;
  }

  // Instance methods
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) {
    return client.get<T>(path, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) {
    return client.post<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) {
    return client.put<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response<T>> delete<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) {
    return client.delete<T>(path, data: data, queryParameters: queryParameters, options: options);
  }
}
