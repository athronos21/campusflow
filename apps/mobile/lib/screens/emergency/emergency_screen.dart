import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Campus Safety & Emergency', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // SOS Emergency Alert Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.red.shade200),
            ),
            child: Column(
              children: [
                const Icon(Icons.warning_amber_rounded, size: 48, color: Colors.red),
                const SizedBox(height: 8),
                const Text(
                  '24/7 Haramaya Emergency SOS',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.red),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Tap below if you require immediate security, medical, or fire assistance on campus.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade700,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      _showSOSConfirmDialog(context);
                    },
                    icon: const Icon(Icons.emergency, color: Colors.white),
                    label: const Text('TRIGGER EMERGENCY SOS ALERT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'Emergency Contacts Directory',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),

          _buildContactTile(
            context,
            icon: Icons.local_police,
            color: Colors.indigo,
            title: 'Campus Security Control Center',
            subtitle: 'Main Gate & Campus Patrol',
            phone: '+251 25 553 0331',
          ),
          _buildContactTile(
            context,
            icon: Icons.local_hospital,
            color: Colors.red,
            title: 'Haramaya Student Health Clinic',
            subtitle: '24/7 Outpatient & Ambulance Service',
            phone: '+251 25 553 0100',
          ),
          _buildContactTile(
            context,
            icon: Icons.night_shelter,
            color: Colors.amber.shade900,
            title: 'Proctor & Dormitory Warden',
            subtitle: 'Student Affairs & Accommodation Office',
            phone: '+251 25 553 0450',
          ),
          _buildContactTile(
            context,
            icon: Icons.fire_truck,
            color: Colors.orange.shade800,
            title: 'Fire & Rescue Service',
            subtitle: 'Haramaya District Fire Control',
            phone: '911',
          ),
        ],
      ),
    );
  }

  Widget _buildContactTile(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required String phone,
  }) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('$subtitle\n$phone', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        isThreeLine: true,
        trailing: IconButton(
          icon: const Icon(Icons.phone_in_talk, color: Colors.green),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Calling $title ($phone)...')),
            );
          },
        ),
      ),
    );
  }

  void _showSOSConfirmDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Emergency Alert', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
        content: const Text('This will send your GPS coordinates and student ID to Haramaya Security Patrol and Dispatch instantly.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  backgroundColor: Colors.red,
                  content: Text('SOS Alert sent to Security Dispatch! Patrol en route.'),
                ),
              );
            },
            child: const Text('SEND ALERT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
