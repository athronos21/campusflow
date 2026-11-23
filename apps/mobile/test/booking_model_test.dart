import 'package:flutter_test/flutter_test.dart';
import 'package:campusflow_mobile/models/booking.dart';

void main() {
  group('Booking Model Unit Tests', () {
    test('Booking.fromJson parses full payload with nested business relation', () {
      final json = {
        'id': 'bk-1234',
        'businessId': 'biz-999',
        'customerId': 'HU-8921',
        'serviceName': 'Thesis Printing & Hardcover Binding',
        'startsAt': '2026-11-24T10:30:00Z',
        'endsAt': '2026-11-24T11:00:00Z',
        'status': 'confirmed',
        'createdAt': '2026-11-23T08:00:00Z',
        'business': {
          'name': 'Afras Campus Stationery',
        },
      };

      final booking = Booking.fromJson(json);

      expect(booking.id, 'bk-1234');
      expect(booking.businessId, 'biz-999');
      expect(booking.customerId, 'HU-8921');
      expect(booking.serviceName, 'Thesis Printing & Hardcover Binding');
      expect(booking.startsAt, '2026-11-24T10:30:00Z');
      expect(booking.endsAt, '2026-11-24T11:00:00Z');
      expect(booking.status, 'confirmed');
      expect(booking.businessName, 'Afras Campus Stationery');
    });

    test('Booking.fromJson applies sensible fallbacks when optional fields are omitted', () {
      final json = {
        'id': 'bk-minimal',
      };

      final booking = Booking.fromJson(json);

      expect(booking.id, 'bk-minimal');
      expect(booking.businessId, '');
      expect(booking.customerId, '');
      expect(booking.serviceName, 'Campus Service');
      expect(booking.status, 'pending');
      expect(booking.businessName, isNull);
    });
  });
}
