import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ApplicationStatus } from '../types';

interface StatusLabelProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export default function StatusLabel({ status, size = 'sm' }: StatusLabelProps) {
  const baseClass =
    size === 'md'
      ? 'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0'
      : 'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0';

  if (status === 'Approved') {
    return (
      <span className={`${baseClass} border-emerald-200 bg-emerald-50 text-emerald-800`}>
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        <span>Approved</span>
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
      <span className={`${baseClass} border-red-200 bg-red-50 text-red-800`}>
        <XCircle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
        <span>Rejected</span>
      </span>
    );
  }

  return (
    <span className={`${baseClass} border-amber-200 bg-amber-50 text-amber-800`}>
      <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
      <span>Pending</span>
    </span>
  );
}
