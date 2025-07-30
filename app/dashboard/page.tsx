"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/header';
import { DashboardComponent } from '@/components/dashboard';
import { EmployeeManagementComponent } from '@/components/employee-management';
import { PayrollProcessingComponent } from '@/components/payroll-processing-api';
import { PayslipComponent } from '@/components/payslip';
import { useState } from 'react';

export type ViewType = "dashboard" | "employees" | "process-payroll" | "payslips";

export default function DashboardPage() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // Will redirect to login
  }

  // Filter navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { id: "dashboard" as ViewType, label: "Dashboard", icon: "BarChart3" },
      { id: "payslips" as ViewType, label: "My Payslips", icon: "FileText" },
    ];

    if (isAdmin()) {
      baseItems.splice(1, 0, 
        { id: "employees" as ViewType, label: "Employees", icon: "Users" },
        { id: "process-payroll" as ViewType, label: "Process Payroll", icon: "Calculator" }
      );
    }

    return baseItems;
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardComponent user={user} isAdmin={isAdmin()} />;
      case "employees":
        return isAdmin() ? <EmployeeManagementComponent /> : null;
      case "process-payroll":
        return isAdmin() ? <PayrollProcessingComponent /> : null;
      case "payslips":
        return <PayslipComponent user={user} />;
      default:
        return <DashboardComponent user={user} isAdmin={isAdmin()} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
        navItems={getNavItems()}
        isAdmin={isAdmin()}
      />
      <main className="container mx-auto px-4 py-6">
        {renderCurrentView()}
      </main>
    </div>
  );
} 