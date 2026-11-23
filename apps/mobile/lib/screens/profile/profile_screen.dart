import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../services/auth_service.dart';
import '../../services/student_service.dart';
import '../../services/wallet_service.dart';
import '../auth/login_screen.dart';
import '../wallet/wallet_screen.dart';
import '../emergency/emergency_screen.dart';
import '../digital_id/digital_id_screen.dart';
import '../cafeteria/cafeteria_pass_screen.dart';
import '../bookings/bookings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final StudentService _studentService = StudentService();
  final WalletService _walletService = WalletService();

  String _name = 'Tigist Haile';
  String _department = 'Software Engineering';
  String _academicLevel = 'Undergraduate';
  String _studentId = 'HU-8921';
  int _balanceMinor = 125000;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);
    try {
      final studentData = await _studentService.getMyStudentProfile();
      if (studentData != null && mounted) {
        setState(() {
          if (studentData['studentIdNumber'] != null) {
            _studentId = studentData['studentIdNumber'];
          }
          if (studentData['department'] != null) {
            _department = studentData['department'];
          }
          if (studentData['academicLevel'] != null) {
            final lvl = studentData['academicLevel'].toString().toLowerCase();
            _academicLevel = lvl[0].toUpperCase() + lvl.substring(1);
          }
          if (studentData['user'] != null && studentData['user']['name'] != null) {
            _name = studentData['user']['name'];
          }
        });
      }
    } catch (_) {}

    try {
      final walletData = await _walletService.getMyWallet();
      if (walletData != null && walletData['balanceMinor'] != null && mounted) {
        setState(() {
          _balanceMinor = (walletData['balanceMinor'] is int)
              ? walletData['balanceMinor'] as int
              : int.tryParse(walletData['balanceMinor'].toString()) ?? _balanceMinor;
        });
      }
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

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
                'Ethiopian Data Protection Law Compliance',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary),
              ),
              SizedBox(height: 6),
              Text(
                'CampusFlow operates in accordance with FDRE Data Protection Proclamation No. 1321/2024. Your student credentials, payment history, and campus transport logs are end-to-end encrypted and stored exclusively on secure Haramaya University server infrastructure.',
                style: TextStyle(fontSize: 12, height: 1.4),
              ),
              SizedBox(height: 12),
              Text('Your Data Rights:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              SizedBox(height: 4),
              Text('• Right to access your stored transport & marketplace logs.', style: TextStyle(fontSize: 12)),
              Text('• Right to request account deletion upon graduation.', style: TextStyle(fontSize: 12)),
              Text('• Zero commercial data sharing with external third parties.', style: TextStyle(fontSize: 12)),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Understood', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.school, color: AppColors.primary),
            SizedBox(width: 8),
            Text('About CampusFlow', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('CampusFlow v1.0.0 (Haramaya Edition)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            SizedBox(height: 6),
            Text(
              'Digital Student Super-App for Ethiopian Higher Education Institutions. Built for Haramaya University Main Campus.',
              style: TextStyle(fontSize: 12, height: 1.4, color: AppColors.textSecondary),
            ),
            SizedBox(height: 12),
            Text('Developed with Flutter & NestJS Mono-repo.', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.getBg(context),
      appBar: AppBar(
        title: const Text('Student Profile & Account', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.getSurface(context),
        foregroundColor: AppColors.getTextPrimary(context),
        elevation: 0.5,
        actions: [
          IconButton(
            icon: _isLoading
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _loadProfileData,
            tooltip: 'Refresh Profile',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadProfileData,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Hero Student Card
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
                          children: [
                            Text(_name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                            const SizedBox(height: 2),
                            Text('$_department · $_academicLevel', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text('ID: $_studentId', style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.qr_code_2_rounded, color: Colors.white, size: 30),
                        tooltip: 'View Official Digital ID',
                        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DigitalIdScreen())),
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
                        _buildStatColumn(Formatters.formatETB(_balanceMinor), 'Wallet'),
                        Container(height: 24, width: 1, color: Colors.white24),
                        _buildStatColumn('Dining Pass', 'Valid (NF)'),
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
              subtitle: 'Balance: ${Formatters.formatETB(_balanceMinor)} · 0% Student Fee',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const WalletScreen())),
            ),
            const SizedBox(height: 10),

            _buildOptionTile(
              context,
              icon: Icons.badge_rounded,
              color: Colors.amber.shade800,
              title: 'Digital Student ID Pass',
              subtitle: 'Official Gate Pass & Real Dynamic QR Pass',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DigitalIdScreen())),
            ),
            const SizedBox(height: 10),

            _buildOptionTile(
              context,
              icon: Icons.flatware_rounded,
              color: const Color(0xFF059669),
              title: 'Campus Dining & Meal Pass',
              subtitle: 'Boarding dining hall ticket & dietary schedule',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CafeteriaPassScreen())),
            ),
            const SizedBox(height: 10),

            _buildOptionTile(
              context,
              icon: Icons.calendar_today_rounded,
              color: Colors.purple.shade700,
              title: 'Service Appointments & Bookings',
              subtitle: 'Thesis binding, laptop repairs & counter passes',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const BookingsScreen())),
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

            Text('Settings & Privacy', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.getTextPrimary(context))),
            const SizedBox(height: 10),

            ValueListenableBuilder<ThemeMode>(
              valueListenable: themeNotifier,
              builder: (context, mode, _) {
                final activeDark = mode == ThemeMode.dark;
                return ListTile(
                  tileColor: AppColors.getSurface(context),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: AppColors.getBorder(context))),
                  leading: Icon(activeDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded, color: activeDark ? Colors.amber : AppColors.primary),
                  title: Text(activeDark ? 'Dark Mode Active' : 'Light Mode Active', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.getTextPrimary(context))),
                  subtitle: Text(activeDark ? 'Comfortable viewing in low light' : 'Bright high contrast theme', style: TextStyle(fontSize: 11, color: AppColors.getTextSecondary(context))),
                  trailing: Switch(
                    value: activeDark,
                    activeColor: AppColors.primary,
                    onChanged: (_) => AppTheme.toggleTheme(),
                  ),
                );
              },
            ),
            const SizedBox(height: 10),

            ListTile(
              tileColor: AppColors.getSurface(context),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: AppColors.getBorder(context))),
              leading: const Icon(Icons.notifications_active_outlined, color: AppColors.primary),
              title: Text('Order & Shuttle Alerts', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.getTextPrimary(context))),
              subtitle: Text('Push notifications enabled', style: TextStyle(fontSize: 11, color: AppColors.getTextSecondary(context))),
              trailing: const Icon(Icons.check_circle_rounded, size: 18, color: AppColors.success),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Notifications are active for your device.')),
                );
              },
            ),
            const SizedBox(height: 10),

            ListTile(
              tileColor: AppColors.getSurface(context),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: AppColors.getBorder(context))),
              leading: const Icon(Icons.security_outlined, color: AppColors.primary),
              title: Text('Privacy & Data Rights', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.getTextPrimary(context))),
              subtitle: Text('Proclamation No. 1321/2024 compliance', style: TextStyle(fontSize: 11, color: AppColors.getTextSecondary(context))),
              trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
              onTap: () => _showPrivacyDialog(context),
            ),
            const SizedBox(height: 10),

            ListTile(
              tileColor: AppColors.getSurface(context),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: AppColors.getBorder(context))),
              leading: const Icon(Icons.info_outline_rounded, color: AppColors.primary),
              title: Text('About CampusFlow', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.getTextPrimary(context))),
              subtitle: Text('v1.0.0 · Haramaya Pilot Edition', style: TextStyle(fontSize: 11, color: AppColors.getTextSecondary(context))),
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
        color: AppColors.getSurface(context),
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.softShadow,
        border: Border.all(color: AppColors.getBorder(context)),
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
          title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.getTextPrimary(context))),
          subtitle: Text(subtitle, style: TextStyle(fontSize: 11, color: AppColors.getTextSecondary(context))),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
        ),
      ),
    );
  }
}
