# Payroll Management System

A comprehensive payroll management system built with Next.js, MongoDB, and TypeScript. This system provides role-based access control with admin and employee functionalities.

## Features

### Admin Features
- **Employee Management**: Add, edit, and delete employees
- **Payroll Processing**: Create and manage payroll records
- **Payment Processing**: Mark payments as processed
- **Dashboard**: Overview of all payroll activities

### Employee Features
- **View Payslips**: Access personal payroll records
- **Dashboard**: Personal payroll overview
- **Profile Management**: View personal information

### Authentication & Security
- JWT-based authentication
- Role-based access control
- Session management
- Password hashing with bcrypt

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **UI**: Tailwind CSS, Radix UI components
- **Styling**: Tailwind CSS with custom components

## Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd payroll-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Initialize the admin user**
   ```bash
   npm run init-admin
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Default Admin Credentials

After running the init script, you can log in with:
- **Email**: admin@company.com
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### User Management (Admin Only)
- `GET /api/users` - Get all employees
- `POST /api/users` - Create new employee
- `PUT /api/users/[id]` - Update employee
- `DELETE /api/users/[id]` - Delete employee

### Payroll Management
- `GET /api/payroll` - Get payroll records (filtered by role)
- `POST /api/payroll` - Create payroll record (admin only)
- `PUT /api/payroll/[id]/process` - Process payment (admin only)

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/employee),
  employeeId: String (unique),
  position: String,
  department: String,
  baseSalary: Number,
  bankAccount: String,
  phone: String,
  isActive: Boolean
}
```

### PayrollRecord Model
```javascript
{
  employeeId: ObjectId (ref: User),
  payPeriod: String,
  grossPay: Number,
  netPay: Number,
  allowances: Map,
  deductions: Map,
  cit: Number,
  pf: Number,
  status: String (Paid/Pending),
  paymentDate: Date,
  processedBy: ObjectId (ref: User)
}
```

## Usage

### For Admins

1. **Login** with admin credentials
2. **Add Employees** through the Employee Management section
3. **Create Payroll Records** for employees
4. **Process Payments** to mark them as paid
5. **Monitor** all payroll activities through the dashboard

### For Employees

1. **Login** with employee credentials (created by admin)
2. **View Personal Payslips** in the My Payslips section
3. **Check Dashboard** for personal payroll overview

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Protected API routes

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   └── *.tsx            # Feature components
├── config/               # Configuration files
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── scripts/              # Utility scripts
```

### Adding New Features

1. **API Routes**: Add new routes in `app/api/`
2. **Components**: Create components in `components/`
3. **Models**: Add MongoDB models in `models/`
4. **Authentication**: Use the `useAuth` hook for protected routes

## Deployment

### Environment Variables
Ensure these are set in production:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT signing

### Build and Deploy
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 