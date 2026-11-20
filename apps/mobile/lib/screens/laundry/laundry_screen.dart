import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class LaundryScreen extends StatefulWidget {
  const LaundryScreen({super.key});

  @override
  State<LaundryScreen> createState() => _LaundryScreenState();
}

class _LaundryScreenState extends State<LaundryScreen> {
  final List<_LaundrySlot> _slots = [
    _LaundrySlot('Machine #01 (Front Load)', 'Block 42 Laundry Room', '10:00 AM - 11:00 AM', 'Available', Colors.green),
    _LaundrySlot('Machine #02 (Heavy Duty)', 'Block 42 Laundry Room', '11:00 AM - 12:00 PM', 'Available', Colors.green),
    _LaundrySlot('Machine #03 (Washer & Dryer)', 'Block 12 Laundry Hub', '1:00 PM - 2:00 PM', 'Occupied', Colors.red),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Dorm Laundry Slot Booking', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.local_laundry_service_rounded, size: 40, color: Colors.blue.shade800),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Dormitory Washing Machines', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      SizedBox(height: 2),
                      Text('Reserve washing machine slots in your dorm block without waiting in long lines.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Text('Available Laundry Slots', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
          const SizedBox(height: 12),

          ..._slots.map((slot) => Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: slot.statusColor.withValues(alpha: 0.1),
                    child: Icon(Icons.local_laundry_service, color: slot.statusColor, size: 20),
                  ),
                  title: Text(slot.machine, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text('${slot.location} · ${slot.time}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  trailing: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: slot.status == 'Available' ? AppColors.primary : Colors.grey,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    ),
                    onPressed: slot.status == 'Available'
                        ? () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Laundry slot reserved for ${slot.machine} at ${slot.time}')),
                            );
                            setState(() => slot.status = 'Reserved');
                          }
                        : null,
                    child: Text(slot.status == 'Available' ? 'Book' : slot.status, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
              )),
        ],
      ),
    );
  }
}

class _LaundrySlot {
  final String machine;
  final String location;
  final String time;
  String status;
  final Color statusColor;

  _LaundrySlot(this.machine, this.location, this.time, this.status, this.statusColor);
}
