class Formatters {
  /// Converts integer minor units (cents) to Ethiopian Birr (ETB) format
  /// Example: 2500 -> "25.00 ETB"
  static String formatETB(dynamic minorUnits) {
    if (minorUnits == null) return "0.00 ETB";
    final num cents = minorUnits is num ? minorUnits : int.tryParse(minorUnits.toString()) ?? 0;
    final double amount = cents / 100.0;
    return '${amount.toStringAsFixed(2)} ETB';
  }
}
