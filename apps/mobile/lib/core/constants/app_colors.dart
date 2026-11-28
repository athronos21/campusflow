import 'package:flutter/material.dart';

/// CampusFlow — Haramaya Daylight Ledger Design System Colors for Mobile
class AppColors {
  // Brand Colors (Haramaya Forest Green & Harar Ochre)
  static const Color primary = Color(0xFF14532D); // Highland Forest Green
  static const Color primaryLight = Color(0xFFF0FDF4); // Daylight Green tint
  static const Color primaryDark = Color(0xFF052E16); // Deep Pine
  static const Color secondary = Color(0xFFB45309); // Harar Ochre / Terracotta
  static const Color secondaryLight = Color(0xFFFEF3C7); // Amber-gold tint
  static const Color accent = Color(0xFF0F766E); // Bate Pine Teal

  // Semantic Status Colors
  static const Color success = Color(0xFF15803D); // Emerald Green
  static const Color successBg = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFB45309); // Ochre Amber
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFBE123C); // Deep Crimson Rose
  static const Color dangerBg = Color(0xFFFFE4E6);

  // Neutral Background & Surface Colors (Daylight Limestone & Paper)
  static const Color background = Color(0xFFFAF8F5); // Warm Limestone Canvas
  static const Color surface = Colors.white; // Crisp Paper Card Surface
  static const Color border = Color(0xFFE2DDD5); // Hairline Travertine Border
  static const Color muted = Color(0xFFF2EFE9); // Warm Stone Well

  // High-Contrast Text Colors
  static const Color textPrimary = Color(0xFF161815); // Deep Charcoal Ink
  static const Color textSecondary = Color(0xFF57534E); // High-contrast Stone
  static const Color textMuted = Color(0xFF78716C); // Medium Stone

  // Theme Helpers
  static Color getBg(BuildContext context) => Theme.of(context).scaffoldBackgroundColor;
  static Color getSurface(BuildContext context) => Theme.of(context).cardColor;
  static Color getTextPrimary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? const Color(0xFFF5F3EE) : textPrimary;
  static Color getTextSecondary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? const Color(0xFFA8A29E) : textSecondary;
  static Color getBorder(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? const Color(0xFF292524) : border;

  // Daylight Ledger Gradients
  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF052E16), Color(0xFF14532D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF14532D), Color(0xFF15803D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient walletGradient = LinearGradient(
    colors: [Color(0xFF11241A), Color(0xFF1C3829), Color(0xFF0A1811)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Crisp Single-Elevation Shadow
  static List<BoxShadow> softShadow = [
    BoxShadow(
      color: const Color(0xFF161815).withValues(alpha: 0.04),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> glowShadow = [
    BoxShadow(
      color: const Color(0xFF14532D).withValues(alpha: 0.2),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];
}
