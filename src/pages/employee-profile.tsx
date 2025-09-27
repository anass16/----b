import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Mail, Phone, Briefcase } from 'lucide-react';
import { AttendanceHeatmap } from '@/features/employees/AttendanceHeatmap';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmployeeForm } from '@/features/employees/employee-form';
import { useLang } from '@/hooks/useLang';

const ProfileDetail = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
  <div className="flex items-center text-sm">
    <Icon className="h-4 w-4 mr-2 text-gray-500" />
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="ml-2 font-semibold text-gray-800 dark:text-gray-200">{value || 'N/A'}</span>
  </div>
);

export function EmployeeProfilePage() {
  const { matricule } = useParams<{ matricule: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t } = useLang();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', matricule],
    queryFn: () => employeeApi.getOne(matricule!),
    enabled: !!matricule,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Employee not found</h2>
        <Link to="/employees">
          <Button className="mt-4">Back to Employees</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/employees">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Employees</Button>
        </Link>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button><Edit className="h-4 w-4 mr-2" /> {t('buttons.edit')} Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('employee.editProfile')}</DialogTitle>
            </DialogHeader>
            <EmployeeForm employee={employee} onFinished={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${employee.matricule}`} />
              <AvatarFallback>{employee.firstName?.[0]}{employee.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{employee.name}</CardTitle>
              <p className="text-gray-500">{employee.role}</p>
              <Badge className="mt-2" variant={employee.status === 'Active' ? 'success' : 'destructive'}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <ProfileDetail icon={Briefcase} label="Department" value={employee.department} />
          <ProfileDetail icon={Mail} label="Email" value={employee.email} />
          <ProfileDetail icon={Phone} label="Phone" value={employee.phone} />
        </CardContent>
      </Card>

      <AttendanceHeatmap matricule={employee.matricule} />
    </div>
  );
}
