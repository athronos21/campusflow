export type MaintenanceCategory = 'plumbing' | 'electrical' | 'carpentry' | 'network';

export interface ParsedWorkOrder {
  id: string;
  category: MaintenanceCategory;
  title: string;
  dormBlock: string;
  roomNumber: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  createdAt: string;
}

const VALID_CATEGORIES = new Set<MaintenanceCategory>([
  'plumbing',
  'electrical',
  'carpentry',
  'network',
]);

export function parseMaintenanceReport(report: {
  id: string;
  reason: string;
  entityId?: string;
  details?: string | null;
  status: string;
  createdAt: string;
}): ParsedWorkOrder {
  let category: MaintenanceCategory = 'plumbing';
  let title = report.reason;

  const prefixMatch = report.reason.match(/^\[([A-Z]+)\]\s*(.+)$/);
  if (prefixMatch) {
    const candidate = prefixMatch[1].toLowerCase() as MaintenanceCategory;
    if (VALID_CATEGORIES.has(candidate)) {
      category = candidate;
    }
    title = prefixMatch[2];
  }

  let dormBlock = report.entityId || 'Campus Residence';
  let roomNumber = 'Dorm Block';
  if (report.entityId && report.entityId.includes(' - ')) {
    const parts = report.entityId.split(' - ');
    dormBlock = parts[0].trim();
    roomNumber = parts.slice(1).join(' - ').trim() || 'Dorm Block';
  }

  return {
    id: report.id,
    category,
    title,
    dormBlock,
    roomNumber,
    description: report.details || 'Campus maintenance incident report.',
    status: report.status === 'resolved' ? 'resolved' : 'in_progress',
    createdAt: report.createdAt,
  };
}
