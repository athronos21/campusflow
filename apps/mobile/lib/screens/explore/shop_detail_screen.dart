import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/business.dart';
import '../../models/product.dart';
import '../../services/business_service.dart';

class ShopDetailScreen extends StatefulWidget {
  final Business business;

  const ShopDetailScreen({Key? key, required this.business}) : super(key: key);

  @override
  State<ShopDetailScreen> createState() => _ShopDetailScreenState();
}

class _ShopDetailScreenState extends State<ShopDetailScreen> {
  List<Product> _products = [];
  bool _isLoading = true;
  final Map<String, int> _cart = {};

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    final results = await BusinessService.getProducts(businessId: widget.business.id);
    setState(() {
      _products = results.isNotEmpty ? results : _demoProducts();
      _isLoading = false;
    });
  }

  List<Product> _demoProducts() {
    return [
      Product(
        id: 'p-1',
        businessId: widget.business.id,
        name: 'Special Buna (Coffee)',
        description: 'Freshly brewed traditional Ethiopian coffee.',
        priceMinor: 2500,
      ),
      Product(
        id: 'p-2',
        businessId: widget.business.id,
        name: 'Ful with Egg and Bread',
        description: 'Hearty fava bean stew served with fresh bread.',
        priceMinor: 8000,
      ),
    ];
  }

  int get _cartTotalMinor {
    int total = 0;
    for (var entry in _cart.entries) {
      final product = _products.firstWhere((p) => p.id == entry.key);
      total += product.priceMinor * entry.value;
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.business.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _products.length,
              itemBuilder: (context, index) {
                final product = _products[index];
                final count = _cart[product.id] ?? 0;

                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                product.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary),
                              ),
                              if (product.description != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  product.description!,
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  maxLines: 2,
                                ),
                              ],
                              const SizedBox(height: 8),
                              Text(
                                Formatters.formatETB(product.priceMinor),
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.primary),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            if (count > 0) ...[
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline, color: AppColors.danger),
                                onPressed: () {
                                  setState(() {
                                    if (count > 1) {
                                      _cart[product.id] = count - 1;
                                    } else {
                                      _cart.remove(product.id);
                                    }
                                  });
                                },
                              ),
                              Text('$count', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            ],
                            IconButton(
                              icon: const Icon(Icons.add_circle, color: AppColors.primary, size: 28),
                              onPressed: () {
                                setState(() {
                                  _cart[product.id] = count + 1;
                                });
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      bottomNavigationBar: _cart.isNotEmpty
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Total (Pickup)', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        Text(
                          Formatters.formatETB(_cartTotalMinor),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.extrabold, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Order placed successfully! Check your Orders tab.'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                        setState(() => _cart.clear());
                      },
                      child: const Text('Confirm Pickup Order', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }
}
