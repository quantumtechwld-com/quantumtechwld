import React from 'react';

export interface OrderStatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-200 text-yellow-800',
  APPROVED:   'bg-green-200 text-green-800',
  REJECTED:   'bg-red-200 text-red-800',
  COMPLETED:  'bg-blue-200 text-blue-800',
  IN_PRODUCTION: 'bg-purple-200 text-purple-800',
  PROPOSAL_SENT: 'bg-accent/15 text-accent-light border border-accent/30',
  REVISION:   'bg-orange-200 text-orange-800',
  // fallback
  DEFAULT:    'bg-gray-200 text-gray-800',
};

export default function OrderStatusBadge({ status }: Readonly<OrderStatusBadgeProps>) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}
