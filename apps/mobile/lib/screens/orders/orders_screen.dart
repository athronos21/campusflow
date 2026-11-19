import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/order.dart';
import '../../services/order_service.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<Order> _orders = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    final results = await OrderService.getMyOrders();
    setState(() {
      _orders = results.isNotEmpty ? results : _demoOrders();
      _isLoading = false;
    });
  }

  List<Order> _demoOrders() {
    return [
      Order(
        id: 'ord-101',
        campusId: 'haramaya-main',
        customerId: 'demo-user',
        businessId: 'demo-biz',
        businessName: 'Haramaya Campus Cafe & Snack',
        status: 'ready',
        paymentStatus: 'unpaid',
        totalMinor: 13000,
        createdAt: DateTime.now().subtract(const Duration(minutes: 15)),
        items: [
          OrderItem(id: '1', productName: 'Special Buna (Coffee)', unitPriceMinor: 2500, quantity: 2),
          OrderItem(id: '2', productName: 'Ful with Egg and Bread', unitPriceMinor: 8000, quantity: 1),
        ],
      ),
    ];
  }

  void _showTelebirrDialog(Order order) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final res = await OrderService.initializePayment(order.id, provider: 'telebirr');
      if (!mounted) return;
      final ussdCode = res['ussdQuickDial'] ?? '*127*1*251911223344*...#';
      final ref = res['paymentReference'] ?? res['providerReference'] ?? 'REF-DEMO';

      if (!mounted) return;
      showModalBottomSheet(
        context: context,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (ctx) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.phone_android, color: Colors.blue),
                      SizedBox(width: 8),
                      Text('Telebirr Digital Checkout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Order Total: ${Formatters.formatETB(order.totalMinor)}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Telebirr Quick-Dial USSD Code:', style: TextStyle(fontSize: 11, color: Colors.blueGrey)),
                    const SizedBox(height: 4),
                    Text(
                      ussdCode,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    try {
                      await OrderService.verifyPayment(ref);
                      if (ctx.mounted) Navigator.pop(ctx);
                      messenger.showSnackBar(
                        const SnackBar(content: Text('Telebirr Payment Confirmed!')),
                      );
                      _loadOrders();
                    } catch (e) {
                      messenger.showSnackBar(
                        SnackBar(content: Text('Payment verification failed: $e')),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue.shade700,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Simulate Telebirr Payment Succeeded', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      );
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(content: Text('Failed to initialize payment: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Campus Orders', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _loadOrders,
              color: AppColors.primary,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _orders.length,
                itemBuilder: (context, index) {
                  final order = _orders[index];
                  final isReady = order.status.toLowerCase() == 'ready';

                  return Card(
                    elevation: 0,
                    margin: const EdgeInsets.only(bottom: 12),
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
                              Text(
                                order.businessName ?? 'Campus Cafe',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isReady ? AppColors.successBg : AppColors.warningBg,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  order.status.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: isReady ? AppColors.success : AppColors.warning,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          ...order.items.map(
                            (i) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Text(
                                '${i.quantity}x ${i.productName}',
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                            ),
                          ),
                          const Divider(height: 20, color: AppColors.border),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    Formatters.formatETB(order.totalMinor),
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                                  ),
                                  Text(
                                    order.paymentStatus == 'paid' ? 'Paid via Telebirr' : 'Pay via Telebirr or at pickup',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                              if (order.paymentStatus != 'paid')
                                ElevatedButton.icon(
                                  onPressed: () => _showTelebirrDialog(order),
                                  icon: const Icon(Icons.payment, size: 14, color: Colors.white),
                                  label: const Text('Pay Telebirr', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue.shade700,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  ),
                                )
                              else if (isReady)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.success,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: const [
                                      Text(
                                        'Ready for Pickup!',
                                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                      SizedBox(width: 4),
                                      Icon(Icons.notifications_active, color: Colors.white, size: 14),
                                    ],
                                  ),
                                )
                              else
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade50,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.check_circle, color: Colors.green.shade800, size: 13),
                                      const SizedBox(width: 3),
                                      Text(
                                        'PAID',
                                        style: TextStyle(color: Colors.green.shade800, fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
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
