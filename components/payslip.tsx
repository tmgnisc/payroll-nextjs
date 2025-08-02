"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, User, Calendar, DollarSign } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext';

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
}

interface PayslipProps {
  user: any;
}

export function PayslipComponent({ user }: PayslipProps) {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayslipData();
  }, []);

  const fetchPayslipData = async () => {
    try {
      // Fetch employees (admin only)
      if (user?.role === 'admin') {
        const employeesResponse = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData);
        }
      }

      // Fetch payroll records
      const payrollResponse = await fetch('/api/payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (payrollResponse.ok) {
        const payrollData = await payrollResponse.json();
        setPayrollRecords(payrollData);
      }
    } catch (error) {
      setError('Failed to load payslip data');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = user?.role === 'admin' 
    ? employees.find((emp) => emp._id === selectedEmployeeId)
    : { name: user?.name, employeeId: user?.employeeId, position: user?.position, department: user?.department };

  // Get the latest payroll record for the selected employee
  const latestPayrollRecord = selectedEmployeeId
    ? payrollRecords
        .filter((record) => record.employeeId?._id === selectedEmployeeId)
        .sort((a, b) => {
          // Sort by pay period
          if (a.payPeriod > b.payPeriod) return -1
          if (a.payPeriod < b.payPeriod) return 1
          return 0
        })[0]
    : user?.role === 'employee' 
      ? payrollRecords.sort((a, b) => {
          if (a.payPeriod > b.payPeriod) return -1
          if (a.payPeriod < b.payPeriod) return 1
          return 0
        })[0]
      : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not paid yet"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading payslip data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {user?.role === 'admin' ? 'Payslip Generation' : 'My Payslips'}
        </h2>
        <p className="text-muted-foreground">
          {user?.role === 'admin' 
            ? 'View and generate detailed payslips for employees'
            : 'View your personal payroll records'
          }
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{user?.role === 'admin' ? 'Employee Payslip' : 'My Payslip'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user?.role === 'admin' && (
              <div>
                <label className="text-sm font-medium">Select Employee</label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Choose an employee..." />
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
            )}

            {selectedEmployee && latestPayrollRecord && (
              <Card className="mt-6">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Payslip</CardTitle>
                      <p className="text-sm text-muted-foreground">{latestPayrollRecord.payPeriod}</p>
                    </div>
                    <Badge variant={latestPayrollRecord.status === "Paid" ? "default" : "secondary"}>
                      {latestPayrollRecord.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Employee Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Employee Information</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {selectedEmployee.name}</p>
                        <p><span className="font-medium">ID:</span> {selectedEmployee.employeeId}</p>
                        <p><span className="font-medium">Position:</span> {selectedEmployee.position}</p>
                        <p><span className="font-medium">Department:</span> {selectedEmployee.department}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Payment Details</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Pay Period:</span> {latestPayrollRecord.payPeriod}</p>
                        <p><span className="font-medium">Status:</span> {latestPayrollRecord.status}</p>
                        <p><span className="font-medium">Payment Date:</span> {formatDate(latestPayrollRecord.paymentDate)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Earnings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Earnings</span>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span>Gross Pay</span>
                        <span className="font-medium">{formatCurrency(latestPayrollRecord.grossPay)}</span>
                      </div>
                      {Object.entries(latestPayrollRecord.allowances).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span>{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Deductions */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Deductions</span>
                    </div>
                    <div className="grid gap-2">
                      {Object.entries(latestPayrollRecord.deductions).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span>-{formatCurrency(value)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm">
                        <span>CIT</span>
                        <span>-{formatCurrency(latestPayrollRecord.cit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>PF</span>
                        <span>-{formatCurrency(latestPayrollRecord.pf)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Net Pay */}
                  <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                    <span className="font-bold text-lg">Net Pay</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(latestPayrollRecord.netPay)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {!latestPayrollRecord && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {user?.role === 'admin' 
                    ? 'Select an employee to view their payslip.'
                    : 'No payroll records found for your account yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
