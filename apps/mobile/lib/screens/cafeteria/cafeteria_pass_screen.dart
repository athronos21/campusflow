import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class CafeteriaPassScreen extends StatefulWidget {
  const CafeteriaPassScreen({super.key});

  @override
  State<CafeteriaPassScreen> createState() => _CafeteriaPassScreenState();
}

class _CafeteriaPassScreenState extends State<CafeteriaPassScreen> {
  String _dietaryPreference = 'Non-Fasting';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Campus Dining & Meal Pass', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Meal Ticket Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF059669), Color(0xFF10B981)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF059669).withValues(alpha: 0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('HARAMAYA DINING PASS', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(6)),
                      child: const Text('MEAL PASS VALID', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                Row(
                  children: [
                    const CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.white,
                      child: Icon(Icons.restaurant_menu_rounded, color: Color(0xFF059669), size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Tigist Haile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                          const SizedBox(height: 2),
                          Text('Preference: $_dietaryPreference', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                          const Text('Dining Hall 02 · Table Pass', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // QR Code
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: [
                      const Icon(Icons.qr_code_2_rounded, size: 90, color: Colors.black87),
                      const SizedBox(height: 4),
                      Text('*HU-DINING-PASS-$_dietaryPreference*', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Dietary Preference Selector
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppColors.border)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Dietary Preference', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary)),
                  const SizedBox(height: 10),
                  Row(
                    children: ['Non-Fasting', 'Fasting (Tsom)', 'Vegetarian'].map((pref) {
                      final isSelected = _dietaryPreference == pref;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(pref),
                          selected: isSelected,
                          selectedColor: const Color(0xFF059669),
                          labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 12),
                          onSelected: (_) => setState(() => _dietaryPreference = pref),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          const Text('Today\'s Campus Menu Schedule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
          const SizedBox(height: 12),

          _buildMealScheduleTile('Breakfast (ቁርስ)', '7:00 AM - 8:30 AM', 'Special Kinche, Fresh Bread & Tea', Colors.amber),
          _buildMealScheduleTile('Lunch (ምሳ)', '12:00 PM - 2:00 PM', 'Shiro Wot with Injera & Salad', Colors.green),
          _buildMealScheduleTile('Dinner (እራት)', '6:00 PM - 8:00 PM', 'Misir Wot, Rice & Tea', Colors.indigo),
        ],
      ),
    );
  }

  Widget _buildMealScheduleTile(String title, String time, String menu, Color color) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.withValues(alpha: 0.1), child: Icon(Icons.flatware_rounded, color: color, size: 20)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('$time\n$menu', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        isThreeLine: true,
      ),
    );
  }
}
