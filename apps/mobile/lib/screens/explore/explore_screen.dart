import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/business.dart';
import '../../services/business_service.dart';
import 'shop_detail_screen.dart';
import '../transport/transport_screen.dart';
import '../housing/housing_screen.dart';
import '../events/events_screen.dart';
import '../learning/learning_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  List<Business> _businesses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBusinesses();
  }

  Future<void> _loadBusinesses() async {
    setState(() => _isLoading = true);
    final results = await BusinessService.getBusinesses();
    setState(() {
      _businesses = results;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CampusFlow',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: AppColors.textPrimary),
            ),
            Text(
              'Haramaya University · Main Campus',
              style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
            onPressed: _loadBusinesses,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _loadBusinesses,
              color: AppColors.primary,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Search Bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const TextField(
                      decoration: InputDecoration(
                        icon: Icon(Icons.search, color: AppColors.textSecondary),
                        hintText: 'Search food, drinks, print shops...',
                        hintStyle: TextStyle(fontSize: 14, color: AppColors.textMuted),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Quick Campus Services
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildQuickServiceButton(
                        context,
                        icon: Icons.directions_bus,
                        color: Colors.amber.shade700,
                        bgColor: Colors.amber.shade50,
                        label: 'Transport',
                        screen: const TransportScreen(),
                      ),
                      _buildQuickServiceButton(
                        context,
                        icon: Icons.home_work_outlined,
                        color: Colors.teal.shade700,
                        bgColor: Colors.teal.shade50,
                        label: 'Housing',
                        screen: const HousingScreen(),
                      ),
                      _buildQuickServiceButton(
                        context,
                        icon: Icons.event,
                        color: Colors.indigo.shade700,
                        bgColor: Colors.indigo.shade50,
                        label: 'Events',
                        screen: const EventsScreen(),
                      ),
                      _buildQuickServiceButton(
                        context,
                        icon: Icons.menu_book,
                        color: Colors.cyan.shade800,
                        bgColor: Colors.cyan.shade50,
                        label: 'Academic',
                        screen: const LearningScreen(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  const Text(
                    'Verified Campus Merchants',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 12),

                  if (_businesses.isEmpty)
                    _buildPlaceholderCard(context)
                  else
                    ..._businesses.map((business) => _buildBusinessCard(context, business)),
                ],
              ),
            ),
    );
  }

  Widget _buildBusinessCard(BuildContext context, Business business) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ShopDetailScreen(business: business),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      business.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.successBg,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'VERIFIED',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.success),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                business.description ?? 'Campus merchant partner offering services to students.',
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('📍 Near Student Lounge', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  Text(
                    'View Menu →',
                    style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholderCard(BuildContext context) {
    // Demo card if API is not yet running
    return _buildBusinessCard(
      context,
      Business(
        id: 'demo-1',
        campusId: 'haramaya-main',
        name: 'Haramaya Campus Cafe & Snack',
        description: 'Fresh coffee, snacks, breakfast, and fast food near Student Lounge.',
        status: 'verified',
      ),
    );
  }

  Widget _buildQuickServiceButton(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required Color bgColor,
    required String label,
    required Widget screen,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => screen),
        );
      },
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withValues(alpha: 0.2)),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
