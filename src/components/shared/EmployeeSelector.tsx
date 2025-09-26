import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { employeeApi } from '@/lib/api';
import { useLang } from '@/hooks/useLang';
import { User } from '@/lib/data';

interface EmployeeSelectorProps {
  value?: string; // matricule
  onSelect: (employee: { matricule: string; name: string }) => void;
}

export function EmployeeSelector({ value, onSelect }: EmployeeSelectorProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  
  const { data: employees = [], isLoading } = useQuery<User[]>({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  const selectedEmployeeName = useMemo(() => {
    return employees.find((employee) => employee.matricule === value)?.name;
  }, [employees, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {value ? selectedEmployeeName : t('common.selectEmployee')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={t('common.filterByNameOrMatricule')} />
          <CommandList>
            <CommandEmpty>{t('common.noEmployeesFound')}</CommandEmpty>
            <CommandGroup>
              {employees.map((employee) => (
                <CommandItem
                  key={employee.matricule}
                  value={`${employee.name} ${employee.matricule}`}
                  onSelect={() => {
                    onSelect({ matricule: employee.matricule, name: employee.name });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === employee.matricule ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {employee.name} ({employee.matricule})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
