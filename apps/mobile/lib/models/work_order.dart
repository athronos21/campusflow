enum WorkOrderStatus { pending, assigned, inProgress, resolved }

class WorkOrder {
  final String id;
  final String category;
  final String title;
  final String dormBlock;
  final String roomNumber;
  final String description;
  final WorkOrderStatus status;
  final DateTime createdAt;

  const WorkOrder({
    required this.id,
    required this.category,
    required this.title,
    required this.dormBlock,
    required this.roomNumber,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  String get statusLabel {
    switch (status) {
      case WorkOrderStatus.pending:
        return 'Pending Review';
      case WorkOrderStatus.assigned:
        return 'Technician Assigned';
      case WorkOrderStatus.inProgress:
        return 'In Progress';
      case WorkOrderStatus.resolved:
        return 'Resolved & Fixed';
    }
  }
}
