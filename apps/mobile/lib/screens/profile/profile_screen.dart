import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showPrivacyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.verified_user, color: AppColors.primary),
            SizedBox(width: 8),
            Expanded(child: Text('Data Privacy Notice', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
          ],
        ),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Personal Data Protection Proclamation No. 1321/2024',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
              ),
              SizedBox(height: 8),
              Text(
                'CampusFlow is committed to safeguarding student data at Haramaya University and across Ethiopian higher education institutions:\n\n'
                '• Data Minimization: We collect only the data necessary to fulfill campus orders, bus ticketing, and service bookings.\n'
                '• Financial Protection: Transactions via Telebirr and CBE are verified through official secure channels without storing sensitive banking credentials.\n'
                '• Right to Erasure & Rectification: You may request review or deletion of your student account data at any time.\n'
                '• Zero Third-Party Selling: Your data is never sold or used for commercial marketing.',
                style: TextStyle(fontSize: 12, height: 1.4, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('I Understand', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'CampusFlow',
      applicationVersion: 'v1.0.0 (Haramaya Pilot MVP)',
      applicationIcon: const Icon(Icons.school, size: 36, color: AppColors.primary),
      children: const [
        SizedBox(height: 12),
        Text(
          'Unified Campus Super-App & Digital Services Platform for Haramaya University & Ethiopian Higher Education Institutions.',
          style: TextStyle(fontSize: 13, height: 1.4),
        ),
        SizedBox(height: 8),
        Text(
          'Pilot Campus: Haramaya University (Main Campus, Bate)\nCompliant with Proclamation No. 1321/2024.',
          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Student Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: AppColors.border),
            ),
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Tigist Haile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  SizedBox(height: 6),
                  Text('🏛️ Haramaya University (Main Campus)', style: TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600)),
                  SizedBox(height: 4),
                  Text('📱 +251 92 233 4455', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  SizedBox(height: 4),
                  Text('✉️ student@haramaya.edu.et', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Settings List
          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: AppColors.border)),
            leading: const Icon(Icons.notifications_outlined, color: AppColors.textPrimary),
            title: const Text('Order & Shuttle Alerts', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            subtitle: const Text('Push notifications & SMS alerts enabled', style: TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.check_circle, size: 16, color: AppColors.success),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notifications are currently enabled for your device.')),
              );
            },
          ),
          const SizedBox(height: 8),

          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: AppColors.border)),
            leading: const Icon(Icons.security_outlined, color: AppColors.textPrimary),
            title: const Text('Privacy & Data Rights', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            subtitle: const Text('Proclamation No. 1321/2024 compliance', style: TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
            onTap: () => _showPrivacyDialog(context),
          ),
          const SizedBox(height: 8),

          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: AppColors.border)),
            leading: const Icon(Icons.info_outline, color: AppColors.textPrimary),
            title: const Text('About CampusFlow', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            subtitle: const Text('v1.0.0 · Haramaya Pilot Edition', style: TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
            onTap: () => _showAboutDialog(context),
          ),
          const SizedBox(height: 24),

          // Sign Out Button
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: const BorderSide(color: AppColors.danger),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () async {
              await AuthService.logout();
              if (context.mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                );
              }
            },
            child: const Text('Sign Out', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
