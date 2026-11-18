import React from 'react';
import { Badge } from '../ui/badge';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status.toLowerCase()) {
    case 'accepted':
    case 'preparing':
      return <Badge variant="warning">{status.toUpperCase()}</Badge>;
    case 'ready':
    case 'completed':
      return <Badge variant="success">{status.toUpperCase()}</Badge>;
    case 'cancelled':
    case 'rejected':
      return <Badge variant="danger">{status.toUpperCase()}</Badge>;
    default:
      return <Badge variant="default">{status.toUpperCase()}</Badge>;
  }
}
