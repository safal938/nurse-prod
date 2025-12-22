import React from 'react';
import { PatientStatus } from '../types';

interface BadgeProps {
  status: PatientStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getStyles = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.Critical:
        return 'bg-red-100 text-status-alert';
      case PatientStatus.Recovering:
        return 'bg-blue-100 text-primary'; // Using primary blue for recovering as per screenshot style
      case PatientStatus.Stable:
        return 'bg-neutral-100 text-neutral-600';
      case PatientStatus.Discharged:
        return 'bg-neutral-100 text-neutral-400';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getStyles(status)}`}>
      {status}
    </span>
  );
};
