import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PayrollRecord from '@/models/PayrollRecord';
// import { authenticateUser } from '@/lib/auth';

// PUT - Process payment (mark as paid, no auth)
export async function PUT(request, { params }) {
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

    const { id } = params;

    const payrollRecord = await PayrollRecord.findById(id);
    if (!payrollRecord) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      );
    }

    if (payrollRecord.status === 'Paid') {
      return NextResponse.json(
        { error: 'Payment has already been processed' },
        { status: 400 }
      );
    }

    // Update the record to mark as paid
    payrollRecord.status = 'Paid';
    payrollRecord.paymentDate = new Date();
    payrollRecord.processedBy = null; // no user
    payrollRecord.updatedAt = new Date();

    await payrollRecord.save();

    const populatedRecord = await PayrollRecord.findById(id)
      .populate('employeeId', 'name email employeeId position department')
      .populate('processedBy', 'name');

    return NextResponse.json({
      message: 'Payment processed successfully',
      record: populatedRecord
    });

  } catch (error) {
    console.error('Process payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 