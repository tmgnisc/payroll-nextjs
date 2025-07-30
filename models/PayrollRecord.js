import mongoose from 'mongoose';

const payrollRecordSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payPeriod: {
    type: String,
    required: true
  },
  grossPay: {
    type: Number,
    required: true
  },
  netPay: {
    type: Number,
    required: true
  },
  allowances: {
    type: Map,
    of: Number,
    default: {}
  },
  deductions: {
    type: Map,
    of: Number,
    default: {}
  },
  cit: {
    type: Number,
    default: 0
  },
  pf: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique payroll records per employee per period
payrollRecordSchema.index({ employeeId: 1, payPeriod: 1 }, { unique: true });

const PayrollRecord = mongoose.models.PayrollRecord || mongoose.model('PayrollRecord', payrollRecordSchema);

export default PayrollRecord; 