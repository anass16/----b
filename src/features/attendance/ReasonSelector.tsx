import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { AttendanceRecord } from '@/types';
import { useReasonsStore, predefinedReasons } from '@/store/reasons';
import { attendanceApi } from '@/lib/api';
import { useLang } from '@/hooks/useLang';

interface ReasonSelectorProps {
  record: AttendanceRecord;
}

export function ReasonSelector({ record }: ReasonSelectorProps) {
  const queryClient = useQueryClient();
  const { customReasons, addCustomReason } = useReasonsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReason, setNewReason] = useState('');
  const { t } = useLang();

  const allReasons = useMemo(() => {
    return {
      predefined: predefinedReasons,
      custom: customReasons.map(r => ({ value: r, label: `${r} ${t('common.customReasonSuffix')}` }))
    };
  }, [customReasons, t]);

  const updateReasonMutation = useMutation({
    mutationFn: (reason: string) => attendanceApi.updateRecord(record.id, { reason }),
    onSuccess: () => {
      toast.success('Reason updated.');
      queryClient.invalidateQueries({ queryKey: ['attendance', record.date] });
    },
    onError: () => {
      toast.error('Failed to update reason.');
    }
  });

  const handleReasonChange = (value: string) => {
    if (value) {
      updateReasonMutation.mutate(value);
    }
  };

  const handleAddCustomReason = () => {
    if (newReason.trim()) {
      const reasonToAdd = newReason.trim();
      addCustomReason(reasonToAdd);
      handleReasonChange(reasonToAdd);
      setNewReason('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select onValueChange={handleReasonChange} value={record.reason || ''}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder={t('common.selectOrAddReason')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('common.predefinedReasons')}</SelectLabel>
            {allReasons.predefined.map(reason => (
              <SelectItem key={reason} value={reason}>{reason}</SelectItem>
            ))}
          </SelectGroup>
          {allReasons.custom.length > 0 && (
            <SelectGroup>
              <SelectSeparator />
              <SelectLabel>{t('common.customReasons')}</SelectLabel>
              {allReasons.custom.map(reason => (
                <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.addCustomReason')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-reason" className="text-right">
                {t('common.reason')}
              </Label>
              <Input
                id="new-reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="col-span-3"
                placeholder={t('common.egFamilyEmergency')}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomReason()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('buttons.cancel')}</Button>
            <Button type="submit" onClick={handleAddCustomReason}>{t('common.addReason')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
