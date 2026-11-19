import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors (indigo & violet modern theme)
  static const Color primary = Color(0xFF4F46E5); // Indigo 600
  static const Color primaryLight = Color(0xFFEEF2FF); // Indigo 50
  static const Color primaryDark = Color(0xFF3730A3); // Indigo 800
  static const Color accent = Color(0xFF8B5CF6); // Purple 500

  // Semantic Status Colors
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color successBg = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color warningBg = Color(0xFFFFFBEB);
  static const Color danger = Color(0xFFEF4444); // Red 500
  static const Color dangerBg = Color(0xFFFEF2F2);

  // Neutral Background & Surface Colors
  static const Color background = Color(0xFFF1F5F9); // Slate 100
  static const Color surface = Colors.white;
  static const Color border = Color(0xFFE2E8F0); // Slate 200

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400

  // Gradients
  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF1E1B4B), Color(0xFF4F46E5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient walletGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF334155)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Soft Card Box Shadow
  static List<BoxShadow> softShadow = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.04),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
  ];

  static List<BoxShadow> glowShadow = [
    BoxShadow(
      color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];
}
