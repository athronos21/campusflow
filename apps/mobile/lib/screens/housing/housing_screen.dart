import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/housing.dart';
import '../../services/housing_service.dart';

class HousingScreen extends StatefulWidget {
  const HousingScreen({super.key});

  @override
  State<HousingScreen> createState() => _HousingScreenState();
}

class _HousingScreenState extends State<HousingScreen> with SingleTickerProviderStateMixin {
  final HousingService _housingService = HousingService();
  late TabController _tabController;

  List<HousingListing> _listings = [];
  List<HousingViewingRequest> _myViewings = [];
  bool _isLoading = true;
  String _selectedType = 'all';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final listings = await _housingService.getListings(propertyType: _selectedType);
      final viewings = await _housingService.getMyViewings();
      if (!mounted) return;
      setState(() {
        _listings = listings;
        _myViewings = viewings;
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load housing: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showViewingBookingDialog(HousingListing listing) {
    final phoneController = TextEditingController(text: '+251911223344');
    final noteController = TextEditingController();
    DateTime preferredDate = DateTime.now().add(const Duration(days: 1));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Schedule Viewing',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  Text(
                    listing.title,
                    style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                  ),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        '${listing.location} • ${Formatters.formatETB(listing.rentMinor)}/mo',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  TextField(
                    controller: phoneController,
                    decoration: const InputDecoration(
                      labelText: 'Student Contact Phone',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.phone),
                    ),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: noteController,
                    decoration: const InputDecoration(
                      labelText: 'Note for Landlord (Optional)',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.note),
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        final messenger = ScaffoldMessenger.of(context);
                        try {
                          await _housingService.requestViewing(
                            listingId: listing.id,
                            preferredDate: preferredDate.toIso8601String(),
                            studentPhone: phoneController.text.trim(),
                            message: noteController.text.trim(),
                          );
                          if (ctx.mounted) Navigator.pop(ctx);
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Viewing request submitted! Landlord will call you.')),
                          );
                          _loadData();
                        } catch (e) {
                          messenger.showSnackBar(
                            SnackBar(content: Text('Failed: $e')),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal.shade800,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Confirm Viewing', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Off-Campus Housing', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.teal.shade800,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: Colors.teal.shade800,
          tabs: const [
            Tab(text: 'Available Rooms'),
            Tab(text: 'My Viewings'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildListingsTab(),
                _buildViewingsTab(),
              ],
            ),
    );
  }

  Widget _buildListingsTab() {
    return Column(
      children: [
        // Filter pills
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              _buildFilterPill('all', 'All Types'),
              const SizedBox(width: 8),
              _buildFilterPill('room', 'Single Room'),
              const SizedBox(width: 8),
              _buildFilterPill('shared', 'Shared House'),
              const SizedBox(width: 8),
              _buildFilterPill('studio', 'Studio'),
            ],
          ),
        ),

        Expanded(
          child: _listings.isEmpty
              ? const Center(child: Text('No accommodations found for this filter.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _listings.length,
                  itemBuilder: (context, index) {
                    final item = _listings[index];
                    return Card(
                      elevation: 0,
                      margin: const EdgeInsets.only(bottom: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                        side: const BorderSide(color: AppColors.border),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.teal.shade50,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    item.propertyType.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.teal.shade800,
                                    ),
                                  ),
                                ),
                                Text(
                                  '${Formatters.formatETB(item.rentMinor)}/mo',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.teal.shade900,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              item.title,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                                const SizedBox(width: 4),
                                Text(
                                  item.location,
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                            if (item.description != null) ...[
                              const SizedBox(height: 6),
                              Text(
                                item.description!,
                                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                            const SizedBox(height: 10),

                            // Amenities
                            Wrap(
                              spacing: 6,
                              children: [
                                if (item.hasWater)
                                  _buildAmenityBadge(Icons.water_drop, 'Water'),
                                if (item.hasElectricity)
                                  _buildAmenityBadge(Icons.bolt, 'Power'),
                                if (item.hasWifi)
                                  _buildAmenityBadge(Icons.wifi, 'WiFi'),
                              ],
                            ),
                            const Divider(height: 20),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.phone, size: 14, color: AppColors.textSecondary),
                                    const SizedBox(width: 4),
                                    Text(
                                      item.contactPhone,
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                  ],
                                ),
                                ElevatedButton(
                                  onPressed: () => _showViewingBookingDialog(item),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.teal.shade800,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  ),
                                  child: const Text('Schedule Viewing', style: TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildViewingsTab() {
    if (_myViewings.isEmpty) {
      return const Center(child: Text('No viewing appointments scheduled yet.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _myViewings.length,
      itemBuilder: (context, index) {
        final req = _myViewings[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      req.listing?.title ?? 'Room Viewing',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        req.status.toUpperCase(),
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(req.listing?.location ?? 'Near Campus', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 14, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text('Preferred Date: ${req.preferredDate}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ],
                ),
                if (req.message != null && req.message!.isNotEmpty)
                  Text('Note: "${req.message}"', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFilterPill(String type, String label) {
    final isSelected = _selectedType == type;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedType = type);
        _loadData();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.teal.shade800 : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildAmenityBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: AppColors.textSecondary),
          const SizedBox(width: 3),
          Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
