import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';
import '../wallet/wallet_screen.dart';
import '../emergency/emergency_screen.dart';
import '../digital_id/digital_id_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showPrivacyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
            child: const Text('I Understand', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
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
      applicationIcon: const Icon(Icons.school_rounded, size: 36, color: AppColors.primary),
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
        title: const Text('Student Profile & Account', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Hero Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppColors.heroGradient,
              borderRadius: BorderRadius.circular(24),
              boxShadow: AppColors.glowShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(color: Colors.amber, shape: BoxShape.circle),
                      child: const CircleAvatar(
                        radius: 28,
                        backgroundColor: Colors.white,
                        child: Icon(Icons.person_rounded, size: 36, color: AppColors.primary),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Tigist Haile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                          SizedBox(height: 2),
                          Text('Software Engineering · Year 3', style: TextStyle(fontSize: 12, color: Colors.white70)),
                          SizedBox(height: 2),
                          Text('ID: RAMA/8921/14', style: TextStyle(fontSize: 11, color: Colors.amber, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    IconButton(
                      style: IconButton.styleFrom(backgroundColor: Colors.white24),
                      icon: const Icon(Icons.qr_code_2_rounded, color: Colors.white),
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const DigitalIdScreen()));
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Quick Stats Row
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatColumn('ETB 1,250', 'Wallet'),
                      Container(height: 24, width: 1, color: Colors.white24),
                      _buildStatColumn('4 Orders', 'History'),
                      Container(height: 24, width: 1, color: Colors.white24),
                      _buildStatColumn('3.85', 'GPA'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Main Account Options
          _buildOptionTile(
            context,
            icon: Icons.account_balance_wallet_rounded,
            color: Colors.green,
            title: 'Campus Pay & Digital Wallet',
            subtitle: 'Balance: ETB 1,250.00 · Telebirr / CBE Birr',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const WalletScreen())),
          ),
          const SizedBox(height: 10),

          _buildOptionTile(
            context,
            icon: Icons.badge_rounded,
            color: Colors.amber.shade800,
            title: 'Digital Student ID Pass',
            subtitle: 'Official University ID & Barcode Pass',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DigitalIdScreen())),
          ),
          const SizedBox(height: 10),

          _buildOptionTile(
            context,
            icon: Icons.emergency_rounded,
            color: Colors.red,
            title: 'Campus Safety & Emergency Contacts',
            subtitle: 'Security patrol, Health Clinic & 24/7 SOS',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EmergencyScreen())),
          ),
          const SizedBox(height: 20),

          const Text('Settings & Privacy', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary)),
          const SizedBox(height: 10),

          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppColors.border)),
            leading: const Icon(Icons.notifications_active_outlined, color: AppColors.primary),
            title: const Text('Order & Shuttle Alerts', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            subtitle: const Text('Push notifications enabled', style: TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.check_circle_rounded, size: 18, color: AppColors.success),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notifications are active for your device.')),
              );
            },
          ),
          const SizedBox(height: 10),

          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppColors.border)),
            leading: const Icon(Icons.security_outlined, color: AppColors.primary),
            title: const Text('Privacy & Data Rights', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            subtitle: const Text('Proclamation No. 1321/2024 compliance', style: TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
            onTap: () => _showPrivacyDialog(context),
          ),
          const SizedBox(height: 10),

          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppColors.border)),
            leading: const Icon(Icons.info_outline_rounded, color: AppColors.primary),
            title: const Text('About CampusFlow', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            subtitle: const Text('v1.0.0 · Haramaya Pilot Edition', style: TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
            onTap: () => _showAboutDialog(context),
          ),
          const SizedBox(height: 24),

          // Sign Out Button
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: const BorderSide(color: AppColors.danger),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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
            icon: const Icon(Icons.logout_rounded, color: AppColors.danger, size: 18),
            label: const Text('Sign Out', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String val, String label) {
    return Column(
      children: [
        Text(val, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }

  Widget _buildOptionTile(BuildContext context, {required IconData icon, required Color color, required String title, required String subtitle, required VoidCallback onTap}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.softShadow,
        border: Border.all(color: AppColors.border),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: ListTile(
          onTap: onTap,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 22),
          ),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
          subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
        ),
      ),
    );
  }
}
