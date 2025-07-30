import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
// import { authenticateUser } from '@/lib/auth';

// GET - Get all users (no auth)
export async function GET(request) {
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

    const users = await User.find({ role: 'employee' }).select('-password');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new employee (no auth)
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
      name,
      email,
      password,
      position,
      department,
      baseSalary,
      bankAccount,
      phone
    } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Generate employee ID
    const employeeCount = await User.countDocuments({ role: 'employee' });
    const employeeId = `EMP${String(employeeCount + 1).padStart(3, '0')}`;

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'employee',
      employeeId,
      position,
      department,
      baseSalary: baseSalary || 0,
      bankAccount,
      phone
    });

    await newUser.save();

    return NextResponse.json({
      message: 'Employee created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        employeeId: newUser.employeeId,
        position: newUser.position,
        department: newUser.department,
        baseSalary: newUser.baseSalary,
        bankAccount: newUser.bankAccount,
        phone: newUser.phone
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 