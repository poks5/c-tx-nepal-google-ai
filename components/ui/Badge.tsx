import React from 'react';
import { PhaseStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, color, className }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};

export const PhaseStatusBadge: React.FC<{ status: PhaseStatus }> = ({ status }) => {
  const statusConfig = {
    [PhaseStatus.Completed]: { label: 'Completed', color: 'green' as const },
    [PhaseStatus.InProgress]: { label: 'In Progress', color: 'blue' as const },
    [PhaseStatus.Available]: { label: 'Available', color: 'yellow' as const },
    [PhaseStatus.Locked]: { label: 'Locked', color: 'gray' as const },
    [PhaseStatus.ReviewNeeded]: { label: 'Review Needed', color: 'red' as const },
  };

  const { label, color } = statusConfig[status];

  return <Badge color={color}>{label}</Badge>;
};

export default Badge;