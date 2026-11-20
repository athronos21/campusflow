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

  void _showRealPaymentCheckoutModal(Order order) async {
    String selectedProvider = 'telebirr';
    final messenger = ScaffoldMessenger.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final birrAmount = (order.totalMinor / 100).toStringAsFixed(2);

            return Padding(
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
                          Icon(Icons.payment_rounded, color: AppColors.primary, size: 24),
                          SizedBox(width: 10),
                          Text('Real Payment Checkout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                        ],
                      ),
                      IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded)),
                    ],
                  ),
                  const Divider(height: 20),

                  // Order Summary Box
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(order.businessName ?? 'Haramaya Campus Merchant', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(height: 2),
                            Text('${order.items.length} items · Pickup Order', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                          ],
                        ),
                        Text('ETB $birrAmount', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primary)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  const Text('Select Ethiopian Gateway Provider', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
                  const SizedBox(height: 10),

                  // Gateway Provider Radio Options
                  _buildProviderOption(
                    setModalState,
                    providerKey: 'chapa',
                    title: 'Chapa Gateway (Visa / MasterCard / Telebirr)',
                    subtitle: 'Secure instant debit/credit card & mobile wallet checkout',
                    color: Colors.green,
                    icon: Icons.credit_card_rounded,
                    selectedKey: selectedProvider,
                    onSelect: (val) => setModalState(() => selectedProvider = val),
                  ),
                  const SizedBox(height: 8),

                  _buildProviderOption(
                    setModalState,
                    providerKey: 'telebirr',
                    title: 'Telebirr (Ethio Telecom Direct)',
                    subtitle: 'USSD Quick Dial *127*1*251911223344*130# or App QR',
                    color: Colors.blue.shade700,
                    icon: Icons.phone_android_rounded,
                    selectedKey: selectedProvider,
                    onSelect: (val) => setModalState(() => selectedProvider = val),
                  ),
                  const SizedBox(height: 8),

                  _buildProviderOption(
                    setModalState,
                    providerKey: 'cbe_birr',
                    title: 'CBE Birr (Commercial Bank of Ethiopia)',
                    subtitle: 'USSD Dial *847# · Shortcode: 882194',
                    color: Colors.purple.shade700,
                    icon: Icons.account_balance_rounded,
                    selectedKey: selectedProvider,
                    onSelect: (val) => setModalState(() => selectedProvider = val),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () async {
                        try {
                          final res = await OrderService.initializePayment(order.id, provider: selectedProvider);
                          final ref = res['paymentReference'] ?? res['providerReference'] ?? 'REF-LIVE-${DateTime.now().millisecondsSinceEpoch}';
                          await OrderService.verifyPayment(ref);

                          if (ctx.mounted) Navigator.pop(ctx);
                          messenger.showSnackBar(
                            SnackBar(
                              backgroundColor: AppColors.success,
                              content: Text('Payment of ETB $birrAmount verified via ${selectedProvider.toUpperCase()}!'),
                            ),
                          );
                          setState(() {
                            order.paymentStatus = 'paid';
                          });
                          _loadOrders();
                        } catch (e) {
                          messenger.showSnackBar(SnackBar(content: Text('Payment error: $e')));
                        }
                      },
                      icon: const Icon(Icons.lock_rounded, color: Colors.white, size: 18),
                      label: Text('Proceed with $selectedProvider Payment', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
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

  Widget _buildProviderOption(
    StateSetter setModalState, {
    required String providerKey,
    required String title,
    required String subtitle,
    required Color color,
    required IconData icon,
    required String selectedKey,
    required ValueChanged<String> onSelect,
  }) {
    final isSelected = selectedKey == providerKey;
    return InkWell(
      onTap: () => onSelect(providerKey),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.08) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? color : AppColors.border, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isSelected ? color : AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                ],
              ),
            ),
            Radio<String>(
              value: providerKey,
              groupValue: selectedKey,
              activeColor: color,
              onChanged: (val) {
                if (val != null) onSelect(val);
              },
            ),
          ],
        ),
      ),
    );
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
                                    order.paymentStatus == 'paid' ? 'Paid via Real Gateway' : 'Chapa / Telebirr / CBE Birr',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                              if (order.paymentStatus != 'paid')
                                ElevatedButton.icon(
                                  onPressed: () => _showRealPaymentCheckoutModal(order),
                                  icon: const Icon(Icons.lock_rounded, size: 14, color: Colors.white),
                                  label: const Text('Pay Now', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
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
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
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
