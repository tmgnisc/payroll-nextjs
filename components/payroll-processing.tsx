"use client"

import { useState } from "react"
import type { PayrollRecord } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface PayrollProcessingProps {
  payrollRecords: PayrollRecord[]
  updatePayrollData: (records: PayrollRecord[]) => void
}

export function PayrollProcessingComponent({ payrollRecords, updatePayrollData }: PayrollProcessingProps) {
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info"
    text: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const pendingRecords = payrollRecords.filter((record) => record.status === "Pending")
  const latestPendingMonth = pendingRecords.length > 0 ? pendingRecords[0].payPeriod : "No pending payrolls"

  const processPayroll = async () => {
    setIsProcessing(true)
    setMessage(null)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (pendingRecords.length === 0) {
      setMessage({
        type: "error",
        text: "No pending payrolls found to process.",
      })
      setIsProcessing(false)
      return
    }

    // Update pending records to paid
    const updatedRecords = payrollRecords.map((record) => {
      if (record.status === "Pending") {
        return {
          ...record,
          status: "Paid" as const,
          paymentDate: new Date().toISOString().split("T")[0],
        }
      }
      return record
    })

    updatePayrollData(updatedRecords)

    setMessage({
      type: "success",
      text: `Successfully processed ${pendingRecords.length} payroll record(s) for ${latestPendingMonth}.`,
    })
    setIsProcessing(false)

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const totalPendingAmount = pendingRecords.reduce((sum, record) => sum + record.netPay, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payroll Processing</h2>
        <p className="text-muted-foreground">Process pending payrolls and manage payment distribution</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payrolls</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRecords.length}</div>
            <p className="text-xs text-muted-foreground">Records awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Total pending net pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Period</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestPendingMonth}</div>
            <p className="text-xs text-muted-foreground">Ready for processing</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Monthly Payroll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert
              className={
                message.type === "success"
                  ? "border-green-200 bg-green-50"
                  : message.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
              }
            >
              {message.type === "success" && <CheckCircle className="h-4 w-4" />}
              {message.type === "error" && <AlertCircle className="h-4 w-4" />}
              {message.type === "info" && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Process Payroll for {latestPendingMonth}</h3>
              <p className="text-sm text-muted-foreground">
                This will process all pending payroll records and mark them as paid.
              </p>
            </div>

            {pendingRecords.length > 0 && (
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Pending Records Summary:</h4>
                <ul className="text-sm space-y-1">
                  {pendingRecords.map((record) => (
                    <li key={record.id} className="flex justify-between">
                      <span>Employee {record.employeeId}</span>
                      <span>{formatCurrency(record.netPay)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-2 font-medium flex justify-between">
                  <span>Total:</span>
                  <span>{formatCurrency(totalPendingAmount)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={processPayroll}
              disabled={isProcessing || pendingRecords.length === 0}
              className="w-full md:w-auto"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing Payroll...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Process Payroll for {latestPendingMonth}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
