import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/event.dart';
import '../../services/event_service.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> with SingleTickerProviderStateMixin {
  final EventService _eventService = EventService();
  late TabController _tabController;

  List<CampusEvent> _events = [];
  List<EventRsvp> _myRsvps = [];
  bool _isLoading = true;
  final String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final events = await _eventService.getEvents(category: _selectedCategory);
      final rsvps = await _eventService.getMyRsvps();
      if (!mounted) return;
      setState(() {
        _events = events;
        _myRsvps = rsvps;
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load events: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showTicketDialog(String title, String venue, String ticketCode) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.confirmation_number, color: AppColors.primary),
            SizedBox(width: 8),
            Text('Digital Event Pass', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            const SizedBox(height: 6),
            Text('📍 $venue', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 16),

            // Simulated QR box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                  const Icon(Icons.qr_code_2, size: 90, color: AppColors.textPrimary),
                  const SizedBox(height: 8),
                  Text(
                    ticketCode,
                    style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Show this digital code to gate marshals for entry verification.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Campus Events', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Upcoming Events'),
            Tab(text: 'My Passes'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildEventsTab(),
                _buildPassesTab(),
              ],
            ),
    );
  }

  Widget _buildEventsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _events.length,
      itemBuilder: (context, index) {
        final evt = _events[index];
        final isBooked = _myRsvps.any((r) => r.eventId == evt.id);
        final rsvp = _myRsvps.firstWhere(
          (r) => r.eventId == evt.id,
          orElse: () => EventRsvp(id: '', eventId: '', ticketCode: '', status: '', createdAt: ''),
        );

        return Card(
          margin: const EdgeInsets.only(bottom: 14),
          elevation: 0,
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
                        color: Colors.indigo.shade50,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        evt.category.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.indigo.shade800,
                        ),
                      ),
                    ),
                    Text(
                      evt.entryFeeMinor == 0 ? 'FREE ENTRY' : Formatters.formatETB(evt.entryFeeMinor),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: evt.entryFeeMinor == 0 ? Colors.green.shade700 : AppColors.primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  evt.title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 6),
                Text('📍 ${evt.venue}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                Text('🗓️ Starts: ${evt.startsAt}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                Text(
                  evt.description,
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const Divider(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('👥 ${evt.rsvpCount} registered', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    if (isBooked)
                      OutlinedButton.icon(
                        icon: const Icon(Icons.qr_code, size: 16),
                        label: const Text('View Pass', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: () => _showTicketDialog(evt.title, evt.venue, rsvp.ticketCode),
                      )
                    else
                      ElevatedButton(
                        onPressed: () async {
                          final messenger = ScaffoldMessenger.of(context);
                          try {
                            final res = await _eventService.rsvpEvent(evt.id);
                            if (!mounted) return;
                            _showTicketDialog(evt.title, evt.venue, res.ticketCode);
                            _loadData();
                          } catch (e) {
                            messenger.showSnackBar(
                              SnackBar(content: Text('RSVP failed: $e')),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        ),
                        child: const Text('Get RSVP Pass', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPassesTab() {
    if (_myRsvps.isEmpty) {
      return const Center(child: Text('No event passes registered yet.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _myRsvps.length,
      itemBuilder: (context, index) {
        final r = _myRsvps[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppColors.border),
          ),
          child: ListTile(
            leading: const Icon(Icons.confirmation_number, color: AppColors.primary, size: 36),
            title: Text(r.event?.title ?? 'Campus Event', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text('Ticket: ${r.ticketCode}\nVenue: ${r.event?.venue ?? 'Campus'}', style: const TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () => _showTicketDialog(r.event?.title ?? 'Event Pass', r.event?.venue ?? 'Main Campus', r.ticketCode),
          ),
        );
      },
    );
  }
}
