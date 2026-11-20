import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class LostFoundScreen extends StatefulWidget {
  const LostFoundScreen({super.key});

  @override
  State<LostFoundScreen> createState() => _LostFoundScreenState();
}

class _LostFoundScreenState extends State<LostFoundScreen> {
  final List<_LostItem> _items = [
    _LostItem('Silver Casio Calculator (fx-991EX)', 'Found in Main Library 2nd Floor desk', 'Found', '+251 91 122 3344', '2 hours ago', Colors.green),
    _LostItem('Black Leather Wallet & Student ID', 'Lost near Student Lounge Cafe', 'Lost', '+251 92 233 4455', 'Yesterday', Colors.red),
    _LostItem('Blue Kingston 32GB Flash Drive', 'Found in HiT Computer Lab 02', 'Found', '+251 93 344 5566', '2 days ago', Colors.green),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Campus Lost & Found', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent Items', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Report item modal: Enter description, location, and contact number.')),
                  );
                },
                icon: const Icon(Icons.add, color: Colors.white, size: 16),
                label: const Text('Report Item', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          ..._items.map((item) => Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppColors.border)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: item.badgeColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                            child: Text(item.type.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: item.badgeColor)),
                          ),
                          const Spacer(),
                          Text(item.time, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary)),
                      const SizedBox(height: 4),
                      Text(item.location, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.phone, size: 14, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Text(item.contact, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                          const Spacer(),
                          TextButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Contacting poster at ${item.contact}')),
                              );
                            },
                            child: const Text('Claim / Contact →', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}

class _LostItem {
  final String title;
  final String location;
  final String type;
  final String contact;
  final String time;
  final Color badgeColor;

  _LostItem(this.title, this.location, this.type, this.contact, this.time, this.badgeColor);
}
