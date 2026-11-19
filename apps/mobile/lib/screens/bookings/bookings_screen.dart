import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/booking.dart';
import '../../models/business.dart';
import '../../services/booking_service.dart';
import '../../services/business_service.dart';

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
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  const Text(
                    'Select a verified campus service and preferred appointment slot.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  const Divider(height: 24),

                  const Text(
                    'Service Type',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: selectedService,
                    isExpanded: true,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calendar_today, size: 14, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Text(
                              selectedDateTime.toLocal().toString().substring(0, 16),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
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
                          child: const Text('Change'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        try {
                          Business? matchedBiz;
                          final sLower = selectedService.toLowerCase();
                          if (sLower.contains('print') || sLower.contains('thesis') || sLower.contains('stationery')) {
                            matchedBiz = _businesses.cast<Business?>().firstWhere(
                              (b) => b != null && (b.name.toLowerCase().contains('stationery') || b.name.toLowerCase().contains('print')),
                              orElse: () => null,
                            );
                          } else if (sLower.contains('laptop') || sLower.contains('software') || sLower.contains('diagnostics')) {
                            matchedBiz = _businesses.cast<Business?>().firstWhere(
                              (b) => b != null && (b.name.toLowerCase().contains('tech') || b.name.toLowerCase().contains('electronic')),
                              orElse: () => null,
                            );
                          }

                          final targetBizId = matchedBiz?.id ?? (_businesses.isNotEmpty ? _businesses.first.id : '0bf3972e-20a4-4b29-b190-e67fb185118f');
                          await _bookingService.createBooking(
                            businessId: targetBizId,
                            serviceName: selectedService,
                            startsAt: selectedDateTime.toIso8601String(),
                          );
                          if (ctx.mounted) Navigator.pop(ctx);
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Appointment requested successfully!')),
                          );
                          _loadBookings();
                        } catch (e) {
                          messenger.showSnackBar(
                            SnackBar(content: Text('Failed to book: $e')),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple.shade700,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Confirm Appointment', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
        title: const Text('Service Appointments', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Colors.purple),
            onPressed: _showNewBookingDialog,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _loadBookings,
              child: _bookings.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.calendar_today_outlined, size: 48, color: AppColors.textMuted),
                          const SizedBox(height: 12),
                          const Text('No service appointments booked yet.', style: TextStyle(color: AppColors.textSecondary)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _showNewBookingDialog,
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple.shade700),
                            child: const Text('Request New Appointment', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _bookings.length,
                      itemBuilder: (context, index) {
                        final b = _bookings[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
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
                                    Expanded(
                                      child: Text(
                                        b.serviceName,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.purple.shade50,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        b.status.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.purple.shade800,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.store, size: 14, color: AppColors.textSecondary),
                                    const SizedBox(width: 4),
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
                                    const SizedBox(width: 4),
                                    Text(
                                      'Slot: ${b.startsAt}',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
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
    );
  }
}
