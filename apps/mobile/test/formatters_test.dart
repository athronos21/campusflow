import 'package:flutter_test/flutter_test.dart';
import 'package:campusflow_mobile/core/utils/formatters.dart';

void main() {
  group('Formatters Unit Tests', () {
    test('formatETB correctly converts integer minor units to ETB string', () {
      expect(Formatters.formatETB(1500), '15.00 ETB');
      expect(Formatters.formatETB(25000), '250.00 ETB');
      expect(Formatters.formatETB(0), '0.00 ETB');
      expect(Formatters.formatETB(75), '0.75 ETB');
    });

    test('formatETB handles null or string numbers gracefully', () {
      expect(Formatters.formatETB(null), '0.00 ETB');
      expect(Formatters.formatETB('3200'), '32.00 ETB');
      expect(Formatters.formatETB('invalid'), '0.00 ETB');
    });
  });
}
