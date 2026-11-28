import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/booking.dart';
import '../../models/business.dart';
import '../../services/booking_service.dart';
import '../../services/business_service.dart';
import '../../widgets/perforated_ticket_stub.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  final BookingService _bookingService = BookingService();
  List<Booking> _bookings = [];
  List<Business> _businesses = [];
  bool _isLoading = true;

  final List<String> _availableServices = [
    'Thesis Printing & Hardcover Binding',
    'Laptop OS & Software Diagnostics',
    'Campus Laundry & Ironing Drop-off',
    'Barbershop Express Grooming',
  ];

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() => _isLoading = true);
    final results = await _bookingService.getMyBookings();
    final bizList = await BusinessService.getBusinesses();
    if (!mounted) return;
    setState(() {
      _bookings = results;
      _businesses = bizList;
      _isLoading = false;
    });
  }

  void _showNewBookingDialog() {
    String selectedService = _availableServices.first;
    DateTime selectedDateTime = DateTime.now().add(const Duration(days: 1, hours: 2));
    final messenger = ScaffoldMessenger.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
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
                        'Book Campus Appointment',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.2,
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const Text(
                    'Select a verified campus service and preferred appointment slot.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  const Divider(height: 24, color: AppColors.border),

                  const Text(
                    'Service Type',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: selectedService,
                    isExpanded: true,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.muted,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    items: _availableServices
                        .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => selectedService = val);
                    },
                  ),
                  const SizedBox(height: 16),

                  const Text(
                    'Preferred Date & Time',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.muted,
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calendar_today, size: 15, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text(
                              selectedDateTime.toLocal().toString().substring(0, 16),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                        TextButton(
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: selectedDateTime,
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(const Duration(days: 30)),
                            );
                            if (date != null && context.mounted) {
                              final time = await showTimePicker(
                                context: context,
                                initialTime: TimeOfDay.fromDateTime(selectedDateTime),
                              );
                              if (time != null) {
                                setModalState(() {
                                  selectedDateTime = DateTime(
                                    date.year,
                                    date.month,
                                    date.day,
                                    time.hour,
                                    time.minute,
                                  );
                                });
                              }
                            }
                          },
                          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                          child: const Text('Change', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () async {
                        try {
                          Business? matchedBiz;
                          final sLower = selectedService.toLowerCase();
                          if (sLower.contains('print') || sLower.contains('thesis') || sLower.contains('stationery')) {
                            matchedBiz = _businesses.cast<Business?>().firstWhere(
                              (b) => b != null && (b.name.toLowerCase().contains('stationery') || b.name.toLowerCase().contains('print') || b.name.toLowerCase().contains('afras')),
                              orElse: () => null,
                            );
                          } else if (sLower.contains('laptop') || sLower.contains('software') || sLower.contains('diagnostics')) {
                            matchedBiz = _businesses.cast<Business?>().firstWhere(
                              (b) => b != null && (b.name.toLowerCase().contains('tech') || b.name.toLowerCase().contains('electronic')),
                              orElse: () => null,
                            );
                          }

                          final targetBizId = matchedBiz?.id ?? (_businesses.isNotEmpty ? _businesses.first.id : 'biz-102');

                          final createdBooking = await _bookingService.createBooking(
                            businessId: targetBizId,
                            serviceName: selectedService,
                            startsAt: selectedDateTime.toIso8601String(),
                          );

                          if (mounted) {
                            setState(() {
                              _bookings.insert(0, createdBooking);
                            });
                          }

                          if (ctx.mounted) Navigator.pop(ctx);
                          messenger.showSnackBar(
                            const SnackBar(
                              backgroundColor: AppColors.success,
                              content: Text('Appointment confirmed! Tap "Counter Pass QR" to view.'),
                            ),
                          );
                        } catch (e) {
                          messenger.showSnackBar(
                            SnackBar(content: Text('Failed to book: $e')),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Confirm Appointment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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

  void _showCancelBookingDialog(Booking b) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border),
        ),
        title: const Text('Cancel Appointment', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        content: Text(
          'Are you sure you want to cancel your appointment for "${b.serviceName}"?',
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Appointment', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await _bookingService.cancelBooking(b.id);
              if (mounted) {
                setState(() {
                  _bookings.removeWhere((item) => item.id == b.id);
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Appointment cancelled successfully.')),
                );
              }
            },
            child: const Text('Cancel Appointment', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showAppointmentQrPass(Booking b) {
    final refCode = b.id.length > 8 ? b.id.substring(0, 8).toUpperCase() : b.id.toUpperCase();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          margin: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              PerforatedTicketStub(
                accent: TicketStubAccent.ink,
                title: b.serviceName,
                subtitle: b.businessName ?? 'Campus Partner Shop',
                code: 'HU-APPT-$refCode',
                qrValue: 'CAMPUSFLOW:APPT:${b.id}:${b.serviceName}',
                badge: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: b.status.toLowerCase() == 'confirmed'
                        ? AppColors.success
                        : AppColors.warning,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    b.status.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                meta: [
                  TicketStubMetaItem(label: 'Shop', value: b.businessName ?? 'Partner Shop'),
                  TicketStubMetaItem(label: 'Slot', value: b.startsAt.length > 16 ? b.startsAt.substring(0, 16) : b.startsAt),
                  TicketStubMetaItem(label: 'Status', value: b.status.toUpperCase()),
                  const TicketStubMetaItem(label: 'Campus', value: 'Main (Bate)'),
                ],
                footer: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Close Pass', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Service Appointments',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.textPrimary),
        ),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppColors.border, height: 1),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppColors.primary),
            onPressed: _showNewBookingDialog,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _loadBookings,
              child: _bookings.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                              ),
                              child: const Icon(Icons.calendar_today, size: 28, color: AppColors.primary),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'No Service Appointments Yet',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Book campus thesis binding, laptop repairs, or laundry drop-offs.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 20),
                            SizedBox(
                              height: 44,
                              child: ElevatedButton.icon(
                                onPressed: _showNewBookingDialog,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.add, size: 18),
                                label: const Text('Book Appointment', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _bookings.length,
                      itemBuilder: (context, index) {
                        final b = _bookings[index];
                        final isConfirmed = b.status.toLowerCase() == 'confirmed';
                        final isCancelled = b.status.toLowerCase() == 'cancelled';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.border, width: 1),
                          ),
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
                                        b.serviceName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                          color: AppColors.textPrimary,
                                          letterSpacing: -0.2,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: isConfirmed
                                            ? AppColors.successBg
                                            : (isCancelled ? AppColors.dangerBg : AppColors.warningBg),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: isConfirmed
                                              ? AppColors.success.withValues(alpha: 0.3)
                                              : (isCancelled
                                                  ? AppColors.danger.withValues(alpha: 0.3)
                                                  : AppColors.warning.withValues(alpha: 0.3)),
                                        ),
                                      ),
                                      child: Text(
                                        b.status.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: isConfirmed
                                              ? AppColors.success
                                              : (isCancelled ? AppColors.danger : AppColors.warning),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.store, size: 14, color: AppColors.textSecondary),
                                    const SizedBox(width: 5),
                                    Text(
                                      b.businessName ?? 'Campus Partner Shop',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                                    const SizedBox(width: 5),
                                    Text(
                                      'Slot: ${b.startsAt}',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: SizedBox(
                                        height: 40,
                                        child: OutlinedButton.icon(
                                          onPressed: () => _showAppointmentQrPass(b),
                                          icon: const Icon(Icons.qr_code_2, size: 16),
                                          label: const Text('Counter Pass QR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: AppColors.primary,
                                            side: const BorderSide(color: AppColors.border),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                        ),
                                      ),
                                    ),
                                    if (!isCancelled) ...[
                                      const SizedBox(width: 8),
                                      IconButton(
                                        icon: const Icon(Icons.cancel_outlined, color: AppColors.danger, size: 20),
                                        tooltip: 'Cancel Appointment',
                                        onPressed: () => _showCancelBookingDialog(b),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
