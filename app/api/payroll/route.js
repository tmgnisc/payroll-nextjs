import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PayrollRecord from '@/models/PayrollRecord';
import User from '@/models/User';
// import { authenticateUser } from '@/lib/auth';

// GET - Get payroll records (no auth)
export async function GET(request) {
  try {
    await connectDB();
    // BYPASS AUTH FOR DEV
    // const user = authenticateUser(request);
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const payPeriod = searchParams.get('payPeriod');

    let query = {};
    if (employeeId) {
      query.employeeId = employeeId;
    }
    if (payPeriod) {
      query.payPeriod = payPeriod;
    }

    const payrollRecords = await PayrollRecord.find(query)
      .populate('employeeId', 'name email employeeId position department')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(payrollRecords);
  } catch (error) {
    console.error('Get payroll records error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new payroll record (no auth)
export async function POST(request) {
  try {
    await connectDB();
    // BYPASS AUTH FOR DEV
    // const user = authenticateUser(request);
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const {
      employeeId,
      payPeriod,
      grossPay,
      netPay,
      allowances,
      deductions,
      cit,
      pf
    } = await request.json();

    if (!employeeId || !payPeriod || !grossPay || !netPay) {
      return NextResponse.json(
        { error: 'Employee ID, pay period, gross pay, and net pay are required' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if payroll record already exists for this employee and period
    const existingRecord = await PayrollRecord.findOne({
      employeeId,
      payPeriod
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Payroll record already exists for this employee and period' },
        { status: 400 }
      );
    }

    const newPayrollRecord = new PayrollRecord({
      employeeId,
      payPeriod,
      grossPay,
      netPay,
      allowances: allowances || {},
      deductions: deductions || {},
      cit: cit || 0,
      pf: pf || 0,
      processedBy: null // no user
    });

    await newPayrollRecord.save();

    const populatedRecord = await PayrollRecord.findById(newPayrollRecord._id)
      .populate('employeeId', 'name email employeeId position department')
      .populate('processedBy', 'name');

    return NextResponse.json({
      message: 'Payroll record created successfully',
      record: populatedRecord
    }, { status: 201 });

  } catch (error) {
    console.error('Create payroll record error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 