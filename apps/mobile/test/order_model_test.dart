import 'package:flutter_test/flutter_test.dart';
import 'package:campusflow_mobile/models/order.dart';
import 'package:campusflow_mobile/models/product.dart';

void main() {
  group('Order & Product Model Unit Tests', () {
    test('Product.fromJson parses integer and string priceMinor values correctly', () {
      final jsonInt = {
        'id': 'prod-1',
        'businessId': 'biz-1',
        'name': 'Special Buna',
        'priceMinor': 2500,
        'currency': 'ETB',
        'isAvailable': true,
      };

      final p1 = Product.fromJson(jsonInt);
      expect(p1.id, 'prod-1');
      expect(p1.priceMinor, 2500);
      expect(p1.currency, 'ETB');

      final jsonString = {
        'id': 'prod-2',
        'businessId': 'biz-1',
        'name': 'Ful with Egg',
        'priceMinor': '8000',
        'currency': 'ETB',
      };

      final p2 = Product.fromJson(jsonString);
      expect(p2.id, 'prod-2');
      expect(p2.priceMinor, 8000);
    });

    test('Order.fromJson parses nested items and stringified BigInt totalMinor', () {
      final json = {
        'id': 'ord-9921',
        'campusId': 'camp-1',
        'customerId': 'HU-8921',
        'businessId': 'biz-101',
        'business': {
          'name': 'Haramaya Campus Cafe & Snack',
        },
        'status': 'preparing',
        'paymentStatus': 'paid',
        'totalMinor': '13000',
        'currency': 'ETB',
        'createdAt': '2026-11-23T06:00:00Z',
        'items': [
          {
            'id': 'item-1',
            'productId': 'prod-1',
            'productName': 'Special Buna',
            'unitPriceMinor': '2500',
            'quantity': 2,
          },
          {
            'id': 'item-2',
            'productId': 'prod-2',
            'productName': 'Ful with Egg',
            'unitPriceMinor': 8000,
            'quantity': 1,
          },
        ],
      };

      final order = Order.fromJson(json);

      expect(order.id, 'ord-9921');
      expect(order.businessName, 'Haramaya Campus Cafe & Snack');
      expect(order.status, 'preparing');
      expect(order.paymentStatus, 'paid');
      expect(order.totalMinor, 13000);
      expect(order.items.length, 2);
      expect(order.items[0].productName, 'Special Buna');
      expect(order.items[0].unitPriceMinor, 2500);
      expect(order.items[0].quantity, 2);
      expect(order.items[1].productName, 'Ful with Egg');
      expect(order.items[1].unitPriceMinor, 8000);
      expect(order.items[1].quantity, 1);
    });
  });
}
