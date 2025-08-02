"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, DollarSign, CheckCircle, Clock } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  position: string;
  department: string;
  baseSalary: number;
}

interface PayrollRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
  };
  payPeriod: string;
  grossPay: number;
  netPay: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  cit: number;
  pf: number;
  status: 'Paid' | 'Pending';
  paymentDate: string | null;
  processedBy?: {
    name: string;
  };
}

export function PayrollProcessingComponent() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriod: '',
    grossPay: '',
    netPay: '',
    allowances: {} as Record<string, number>,
    deductions: {} as Record<string, number>,
    cit: '',
    pf: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees
      const employeesResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees');
      }

      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

      // Fetch payroll records
      const payrollResponse = await fetch('/api/payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!payrollResponse.ok) {
        throw new Error('Failed to fetch payroll records');
      }

      const payrollData = await payrollResponse.json();
      setPayrollRecords(payrollData);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          grossPay: Number(formData.grossPay),
          netPay: Number(formData.netPay),
          cit: Number(formData.cit),
          pf: Number(formData.pf)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payroll record');
      }

      await fetchData();
      handleCloseDialog();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleProcessPayment = async (recordId: string) => {
    try {
      const response = await fetch(`/api/payroll/${recordId}/process`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      await fetchData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      employeeId: '',
      payPeriod: '',
      grossPay: '',
      netPay: '',
      allowances: {},
      deductions: {},
      cit: '',
      pf: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payroll Processing</h2>
          <p className="text-muted-foreground">Create and manage payroll records</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Payroll Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Payroll Record</DialogTitle>
              <DialogDescription>
                Add a new payroll record for an employee
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name} ({employee.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payPeriod">Pay Period</Label>
                  <Input
                    id="payPeriod"
                    value={formData.payPeriod}
                    onChange={(e) => setFormData({ ...formData, payPeriod: e.target.value })}
                    placeholder="e.g., June 2025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grossPay">Gross Pay</Label>
                  <Input
                    id="grossPay"
                    type="number"
                    value={formData.grossPay}
                    onChange={(e) => setFormData({ ...formData, grossPay: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="netPay">Net Pay</Label>
                  <Input
                    id="netPay"
                    type="number"
                    value={formData.netPay}
                    onChange={(e) => setFormData({ ...formData, netPay: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cit">CIT</Label>
                  <Input
                    id="cit"
                    type="number"
                    value={formData.cit}
                    onChange={(e) => setFormData({ ...formData, cit: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pf">PF</Label>
                <Input
                  id="pf"
                  type="number"
                  value={formData.pf}
                  onChange={(e) => setFormData({ ...formData, pf: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records ({payrollRecords.length})</CardTitle>
          <CardDescription>All payroll records in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.employeeId?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{record.employeeId?.employeeId || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{record.payPeriod}</TableCell>
                  <TableCell>${record.grossPay.toLocaleString()}</TableCell>
                  <TableCell>${record.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Paid' ? "default" : "secondary"}>
                      {record.status === 'Paid' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.paymentDate 
                      ? new Date(record.paymentDate).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {record.status === 'Pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProcessPayment(record._id)}
                      >
                        <DollarSign className="mr-1 h-3 w-3" />
                        Process Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 