"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
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

interface DashboardProps {
  user: any;
  isAdmin: boolean;
}

export function DashboardComponent({ user, isAdmin }: DashboardProps) {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Dashboard: Fetching data with token:', token ? 'exists' : 'not found');
      
      // Fetch employees (admin only)
      if (isAdmin) {
        console.log('Dashboard: Fetching employees...');
        const employeesResponse = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Dashboard: Employees response status:', employeesResponse.status);
        
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData);
          console.log('Dashboard: Employees loaded:', employeesData.length);
        } else {
          console.error('Dashboard: Failed to fetch employees');
        }
      }

      // Fetch payroll records
      console.log('Dashboard: Fetching payroll records...');
      const payrollResponse = await fetch('/api/payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Dashboard: Payroll response status:', payrollResponse.status);
      
      if (payrollResponse.ok) {
        const payrollData = await payrollResponse.json();
        setPayrollRecords(payrollData);
        console.log('Dashboard: Payroll records loaded:', payrollData.length);
      } else {
        console.error('Dashboard: Failed to fetch payroll records');
      }
    } catch (error) {
      console.error('Dashboard: Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading dashboard...</p>
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

  // Calculate summary statistics
  const totalEmployees = employees.length;

  // Get latest month data (most recent period)
  const latestMonthRecords = payrollRecords.length > 0 
    ? payrollRecords.filter((record) => record.payPeriod === payrollRecords[0].payPeriod)
    : [];

  const totalMonthlyGrossPay = latestMonthRecords.reduce((sum, record) => sum + record.grossPay, 0);
  const totalMonthlyNetPay = latestMonthRecords.reduce((sum, record) => sum + record.netPay, 0);
  const pendingPayrolls = payrollRecords.filter((record) => record.status === "Pending").length;

  // Prepare chart data
  const payrollDistributionData = latestMonthRecords.map((record) => {
    return {
      name: record.employeeId.name.split(" ")[0] || "Unknown",
      grossPay: record.grossPay,
      netPay: record.netPay,
      deductions: record.grossPay - record.netPay,
    }
  });

  const pieChartData = [
    { name: "Net Pay", value: totalMonthlyNetPay, color: "#10b981" },
    { name: "Deductions", value: totalMonthlyGrossPay - totalMonthlyNetPay, color: "#f59e0b" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const currentPeriod = latestMonthRecords.length > 0 ? latestMonthRecords[0].payPeriod : "No Data";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! {isAdmin ? 'Here\'s your payroll overview.' : 'Here\'s your personal payroll summary.'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Total Employees' : 'My Records'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAdmin ? totalEmployees : payrollRecords.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Active employees in system' : 'Your payroll records'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Monthly Gross Pay' : 'Total Gross Pay'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyGrossPay)}</div>
            <p className="text-xs text-muted-foreground">
              {currentPeriod} total gross pay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Monthly Net Pay' : 'Total Net Pay'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyNetPay)}</div>
            <p className="text-xs text-muted-foreground">
              {currentPeriod} total net pay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Pending Payrolls' : 'Pending Records'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayrolls}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Awaiting processing' : 'Your pending records'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Only show if there's data */}
      {payrollDistributionData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Distribution - {currentPeriod}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={payrollDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="grossPay" fill="#3b82f6" name="Gross Pay" />
                  <Bar dataKey="netPay" fill="#10b981" name="Net Pay" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pay vs Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data Message */}
      {payrollRecords.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {isAdmin 
                ? 'No payroll records found. Create some payroll records to see the dashboard data.'
                : 'No payroll records found for your account yet.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
