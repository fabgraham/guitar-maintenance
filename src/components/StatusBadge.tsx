import { MaintenanceStatus } from '@/types';
import { getStatusText } from '@/utils/maintenance';

export const statusStyles = {
  good: { text: '#116b33', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.44)' },
  warning: { text: '#916000', bg: 'rgba(196,122,0,0.10)', border: 'rgba(196,122,0,0.44)' },
  urgent: { text: '#b91c1c', bg: 'rgba(212,32,32,0.10)', border: 'rgba(212,32,32,0.44)' },
};

export function StatusBadge({ status }: { status: MaintenanceStatus }) {
  const colors = statusStyles[status];
  return (
    <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ color: colors.text, background: colors.bg }}>
      {getStatusText(status)}
    </span>
  );
}
