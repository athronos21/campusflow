import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/work_order.dart';

class MaintenanceScreen extends StatefulWidget {
  const MaintenanceScreen({super.key});

  @override
  State<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends State<MaintenanceScreen> {
  final List<WorkOrder> _workOrders = [
    WorkOrder(
      id: 'WO-101',
      category: 'Plumbing',
      title: 'Water Tap Leakage in Bathroom',
      dormBlock: 'Block 42',
      roomNumber: 'Room 204',
      description: 'Main sink faucet is dripping continuously. Requires washer replacement.',
      status: WorkOrderStatus.inProgress,
      createdAt: DateTime.now().subtract(const Duration(hours: 18)),
    ),
    WorkOrder(
      id: 'WO-102',
      category: 'Electrical',
      title: 'Study Desk Socket Power Outage',
      dormBlock: 'Block 42',
      roomNumber: 'Room 204',
      description: 'Electrical outlet near desk 2 has no power. Circuit breaker check needed.',
      status: WorkOrderStatus.pending,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Dorm Maintenance & Repairs', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.build_circle, size: 40, color: Colors.orange.shade800),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Facility Maintenance Dispatch', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      SizedBox(height: 2),
                      Text('Report dorm repairs, plumbing, or electrical issues directly to campus engineering.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Active Repair Requests', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
              TextButton.icon(
                onPressed: () => _showNewRequestDialog(context),
                icon: const Icon(Icons.add, size: 18, color: AppColors.primary),
                label: const Text('New Request', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          ..._workOrders.map((wo) => _buildWorkOrderCard(wo)),
        ],
      ),
    );
  }

  Widget _buildWorkOrderCard(WorkOrder wo) {
    Color statusColor;
    switch (wo.status) {
      case WorkOrderStatus.pending:
        statusColor = Colors.orange;
        break;
      case WorkOrderStatus.assigned:
        statusColor = Colors.blue;
        break;
      case WorkOrderStatus.inProgress:
        statusColor = Colors.purple;
        break;
      case WorkOrderStatus.resolved:
        statusColor = Colors.green;
        break;
    }

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
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                  child: Text(
                    wo.statusLabel.toUpperCase(),
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                  ),
                ),
                const Spacer(),
                Text(wo.id, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
              ],
            ),
            const SizedBox(height: 10),
            Text(wo.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary)),
            const SizedBox(height: 4),
            Text('${wo.dormBlock} · ${wo.roomNumber}', style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(wo.description, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  void _showNewRequestDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    String category = 'Plumbing';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Report Maintenance Issue', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: category,
                decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
                items: ['Plumbing', 'Electrical', 'Carpentry/Furniture', 'Wi-Fi/Network', 'Locks & Doors']
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (val) => category = val ?? 'Plumbing',
              ),
              const SizedBox(height: 12),
              TextField(
                controller: titleController,
                decoration: const InputDecoration(labelText: 'Issue Title', hintText: 'e.g. Broken desk drawer', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description & Room #', hintText: 'Block 42 Room 204...', border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              if (titleController.text.isNotEmpty) {
                setState(() {
                  _workOrders.insert(
                    0,
                    WorkOrder(
                      id: 'WO-${103 + _workOrders.length}',
                      category: category,
                      title: titleController.text,
                      dormBlock: 'Block 42',
                      roomNumber: 'Room 204',
                      description: descController.text,
                      status: WorkOrderStatus.pending,
                      createdAt: DateTime.now(),
                    ),
                  );
                });
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Repair work order submitted to Haramaya Facilities Dept!')),
                );
              }
            },
            child: const Text('Submit Request', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
