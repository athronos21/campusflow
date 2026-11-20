import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/business.dart';
import '../../services/business_service.dart';
import '../../widgets/ai_assistant_sheet.dart';
import 'shop_detail_screen.dart';
import '../transport/transport_screen.dart';
import '../housing/housing_screen.dart';
import '../events/events_screen.dart';
import '../announcements/announcements_screen.dart';
import '../marketplace/marketplace_screen.dart';
import '../emergency/emergency_screen.dart';
import '../wallet/wallet_screen.dart';
import '../academic/academic_screen.dart';
import '../maintenance/maintenance_screen.dart';
import '../digital_id/digital_id_screen.dart';
import '../campus_map/campus_map_screen.dart';
import '../cafeteria/cafeteria_pass_screen.dart';
import '../laundry/laundry_screen.dart';
import '../lost_found/lost_found_screen.dart';
import '../study_groups/study_groups_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  List<Business> _businesses = [];
  bool _isLoading = true;
  String _searchQuery = '';
  bool _isAmharic = false;

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

  void _openAiAssistant() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AiAssistantSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredMerchants = _businesses
        .where((b) => _searchQuery.isEmpty || b.name.toLowerCase().contains(_searchQuery) || (b.description?.toLowerCase().contains(_searchQuery) ?? false))
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAiAssistant,
        backgroundColor: AppColors.primary,
        elevation: 6,
        icon: const Icon(Icons.smart_toy_rounded, color: Colors.amber),
        label: Text(
          _isAmharic ? 'የካምፓስ AI ረዳት' : 'Campus AI Guide',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : RefreshIndicator(
                onRefresh: _loadBusinesses,
                color: AppColors.primary,
                child: CustomScrollView(
                  slivers: [
                    // Modern Hero Header Section
                    SliverToBoxAdapter(
                      child: Container(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                        decoration: const BoxDecoration(
                          gradient: AppColors.heroGradient,
                          borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(color: Colors.amber, shape: BoxShape.circle),
                                      child: const CircleAvatar(
                                        radius: 20,
                                        backgroundColor: Colors.white,
                                        child: Icon(Icons.person_rounded, color: AppColors.primary),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(_isAmharic ? 'ሰላም፣ ትዕግሥት 👋' : 'Selam, Tigist 👋', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17)),
                                        Text(_isAmharic ? 'ሐረማያ ዩኒቨርሲቲ · ዋና ግቢ' : 'Haramaya University · Main Campus', style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500)),
                                      ],
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    // Amharic 🇪🇹 / English 🇬🇧 Toggle Chip
                                    InkWell(
                                      onTap: () => setState(() => _isAmharic = !_isAmharic),
                                      borderRadius: BorderRadius.circular(16),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: Colors.white24,
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                        child: Text(
                                          _isAmharic ? '🇪🇹 አማርኛ' : '🇬🇧 EN',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    IconButton(
                                      style: IconButton.styleFrom(backgroundColor: Colors.white12),
                                      icon: const Icon(Icons.badge_outlined, color: Colors.white),
                                      onPressed: () {
                                        Navigator.push(context, MaterialPageRoute(builder: (context) => const DigitalIdScreen()));
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),

                            // Floating Modern Search Input
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.1),
                                    blurRadius: 15,
                                    offset: const Offset(0, 5),
                                  ),
                                ],
                              ),
                              child: TextField(
                                onChanged: (val) => setState(() => _searchQuery = val.toLowerCase().trim()),
                                decoration: InputDecoration(
                                  icon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 22),
                                  hintText: _isAmharic ? 'ካፌዎችን፣ የህትመት ሱቆችን፣ ማስታወሻዎችን ይፈልጉ...' : 'Search cafeterias, print shops, study notes...',
                                  hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                                  border: InputBorder.none,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Quick Campus Services Carousel Section
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isAmharic ? 'የካምፓስ አገልግሎቶች' : 'Campus Super Services',
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 14),
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  _buildModernServiceCard(context, icon: Icons.flatware_rounded, color: const Color(0xFF059669), bg: const Color(0xFFECFDF5), label: _isAmharic ? 'የምግብ ቲኬት' : 'Meal Pass', screen: const CafeteriaPassScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.local_laundry_service_rounded, color: const Color(0xFF2563EB), bg: const Color(0xFFEFF6FF), label: _isAmharic ? 'ልብስ ማጠቢያ' : 'Laundry', screen: const LaundryScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.find_in_page_rounded, color: const Color(0xFFD97706), bg: const Color(0xFFFFFBEB), label: _isAmharic ? 'የጠፉ ዕቃዎች' : 'Lost & Found', screen: const LostFoundScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.groups_rounded, color: const Color(0xFF7C3AED), bg: const Color(0xFFF5F3FF), label: _isAmharic ? 'የጥናት ቡድን' : 'Study Groups', screen: const StudyGroupsScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.campaign_rounded, color: const Color(0xFF2563EB), bg: const Color(0xFFEFF6FF), label: _isAmharic ? 'ማስታወቂያዎች' : 'Notices', screen: const AnnouncementsScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.storefront_rounded, color: const Color(0xFF7C3AED), bg: const Color(0xFFF5F3FF), label: _isAmharic ? 'ገበያ' : 'Marketplace', screen: const MarketplaceScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.account_balance_wallet_rounded, color: const Color(0xFF059669), bg: const Color(0xFFECFDF5), label: _isAmharic ? 'ካምፓስ ፔይ' : 'Campus Pay', screen: const WalletScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.badge_rounded, color: const Color(0xFFD97706), bg: const Color(0xFFFFFBEB), label: _isAmharic ? 'መታወቂያ' : 'Digital ID', screen: const DigitalIdScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.map_rounded, color: const Color(0xFF0D9488), bg: const Color(0xFFF0FDFA), label: _isAmharic ? 'የግቢው ካርታ' : 'Campus Map', screen: const CampusMapScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.calculate_rounded, color: const Color(0xFF4F46E5), bg: const Color(0xFFEEF2FF), label: _isAmharic ? 'GPA እና ክፍለ-ጊዜ' : 'GPA & Timetable', screen: const AcademicScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.build_circle_rounded, color: const Color(0xFFEA580C), bg: const Color(0xFFFFF7ED), label: _isAmharic ? 'የዶርም ጥገና' : 'Dorm Repairs', screen: const MaintenanceScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.emergency_rounded, color: const Color(0xFFDC2626), bg: const Color(0xFFFEF2F2), label: _isAmharic ? '24/7 አደጋ' : '24/7 SOS', screen: const EmergencyScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.directions_bus_rounded, color: const Color(0xFFB45309), bg: const Color(0xFFFEF3C7), label: _isAmharic ? 'ትራንስፖርት' : 'Transport', screen: const TransportScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.home_work_rounded, color: const Color(0xFF0F766E), bg: const Color(0xFFCCFBF1), label: _isAmharic ? 'መኖሪያ' : 'Housing', screen: const HousingScreen()),
                                  const SizedBox(width: 12),
                                  _buildModernServiceCard(context, icon: Icons.event_rounded, color: const Color(0xFF4338CA), bg: const Color(0xFFE0E7FF), label: _isAmharic ? 'ኩነቶች' : 'Events', screen: const EventsScreen()),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Verified Merchants Header & List
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _isAmharic ? 'የተረጋገጡ የግቢው ነጋዴዎች' : 'Verified Campus Merchants',
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            TextButton(
                              onPressed: _loadBusinesses,
                              child: Text(_isAmharic ? 'አድስ' : 'Refresh', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ),
                    ),

                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      sliver: filteredMerchants.isEmpty
                          ? SliverToBoxAdapter(child: _buildPlaceholderCard(context))
                          : SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  final business = filteredMerchants[index];
                                  return _buildModernBusinessCard(context, business);
                                },
                                childCount: filteredMerchants.length,
                              ),
                            ),
                    ),
                    const SliverToBoxAdapter(child: SizedBox(height: 80)),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildModernServiceCard(BuildContext context, {required IconData icon, required Color color, required Color bg, required String label, required Widget screen}) {
    return InkWell(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) => screen));
      },
      borderRadius: BorderRadius.circular(18),
      child: Column(
        children: [
          Container(
            width: 62,
            height: 62,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: color.withValues(alpha: 0.15)),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildModernBusinessCard(BuildContext context, Business business) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppColors.softShadow,
        border: Border.all(color: AppColors.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => ShopDetailScreen(business: business)));
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(14)),
                    child: const Icon(Icons.storefront_rounded, color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(business.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
                        const SizedBox(height: 2),
                        Text(_isAmharic ? 'ዋና ግቢ · ክፍት' : 'Main Campus Lounge · Open', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: AppColors.successBg, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(Icons.verified, color: AppColors.success, size: 12),
                        const SizedBox(width: 4),
                        Text(_isAmharic ? 'የተረጋገጠ' : 'VERIFIED', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.success)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                business.description ?? (_isAmharic ? 'ትኩስ ምግብ፣ ቡና እና የካምፓስ ፍላጎቶች።' : 'Fresh food, coffee, and campus essentials available for instant pickup.'),
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(_isAmharic ? '4.8 (120+ አስተያየቶች)' : '4.8 (120+ reviews)', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                    child: Text(_isAmharic ? 'ሜኑ ይመልከቱ →' : 'Explore Menu →', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
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
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppColors.softShadow,
        border: Border.all(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(14)),
                  child: const Icon(Icons.local_cafe_rounded, color: AppColors.primary, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_isAmharic ? 'ሐረማያ ግቢ ካፌ እና ምግቦች' : 'Haramaya Campus Cafe & Snack', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
                      const SizedBox(height: 2),
                      Text(_isAmharic ? 'ተማሪዎች ላውንጅ አጠገብ · ክፍት' : 'Near Student Lounge · Open', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.successBg, borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    children: [
                      const Icon(Icons.verified, color: AppColors.success, size: 12),
                      const SizedBox(width: 4),
                      Text(_isAmharic ? 'የተረጋገጠ' : 'VERIFIED', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.success)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              _isAmharic ? 'ትኩስ የኢትዮጵያ ባህላዊ ቡና፣ ቁርስ እና ፈጣን ምግቦች ከተማሪዎች ላውንጅ አጠገብ።' : 'Fresh traditional Ethiopian coffee, snacks, breakfast, and fast food near Student Lounge.',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                const SizedBox(width: 4),
                Text(_isAmharic ? '4.9 (240+ አስተያየቶች)' : '4.9 (240+ reviews)', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                  child: Text(_isAmharic ? 'ሜኑ ይመልከቱ →' : 'Explore Menu →', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
