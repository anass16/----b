import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AttendanceRecord } from '@/types';
import { format } from 'date-fns';
import { Clock, Briefcase, Hourglass, AlertCircle } from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | null }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center">
      <Icon className="h-5 w-5 mr-3 text-gray-500" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value || 'N/A'}</span>
  </div>
);

export function DayDetailModal({ isOpen, onClose, record }: DayDetailModalProps) {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>
            {record.name} - {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <DetailRow icon={Briefcase} label="Status" value={record.status} />
          <DetailRow icon={Clock} label="First In" value={record.firstIn} />
          <DetailRow icon={Clock} label="Last Out" value={record.lastOut} />
          <DetailRow icon={Hourglass} label="Total Hours" value={`${record.hours.toFixed(2)}h`} />
          <DetailRow icon={AlertCircle} label="Delay" value={`${record.delayMin} min`} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
