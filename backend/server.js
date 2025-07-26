// Bank Lending System - Node.js Express Backend
// This implements the RESTful API for the bank lending system

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (for simplicity - replace with actual database in production)
let customers = [
  { customer_id: 'CUST001', name: 'John Doe', created_at: new Date().toISOString() },
  { customer_id: 'CUST002', name: 'Jane Smith', created_at: new Date().toISOString() },
  { customer_id: 'CUST003', name: 'Bob Johnson', created_at: new Date().toISOString() }
];

let loans = [];
let payments = [];

// Utility functions
const calculateLoanDetails = (principal, years, rate) => {
  // I(Interest) = P (Principal) * N (No of Years) * R (Rate of interest)
  const totalInterest = principal * years * (rate / 100);
  // A(Total Amount) = P + I
  const totalAmount = principal + totalInterest;
  // Monthly EMI = Total Amount / Total Months
  const monthlyEMI = totalAmount / (years * 12);
  
  return {
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    monthlyEMI: parseFloat(monthlyEMI.toFixed(2))
  };
};

const generateLoanId = () => {
  return 'LOAN_' + uuidv4().split('-')[0].toUpperCase();
};

const generatePaymentId = () => {
  return 'PAY_' + uuidv4().split('-')[0].toUpperCase();
};

// Routes

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bank Lending System API is running' });
});

// Get all customers (helper endpoint)
app.get('/api/v1/customers', (req, res) => {
  res.json(customers);
});

// LEND: Create a new loan
app.post('/api/v1/loans', (req, res) => {
  try {
    const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;
    
    // Validate input
    if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customer_id', 'loan_amount', 'loan_period_years', 'interest_rate_yearly']
      });
    }
    
    // Check if customer exists
    const customer = customers.find(c => c.customer_id === customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Validate numeric inputs
    const principal = parseFloat(loan_amount);
    const years = parseInt(loan_period_years);
    const rate = parseFloat(interest_rate_yearly);
    
    if (principal <= 0 || years <= 0 || rate < 0) {
      return res.status(400).json({ error: 'Invalid loan parameters' });
    }
    
    // Calculate loan details
    const { totalInterest, totalAmount, monthlyEMI } = calculateLoanDetails(principal, years, rate);
    
    // Create new loan
    const newLoan = {
      loan_id: generateLoanId(),
      customer_id,
      principal_amount: principal,
      total_amount: totalAmount,
      total_interest: totalInterest,
      interest_rate: rate,
      loan_period_years: years,
      monthly_emi: monthlyEMI,
      amount_paid: 0,
      balance_amount: totalAmount,
      emis_left: years * 12,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };
    
    loans.push(newLoan);
    
    // Return response as per API specification
    res.status(201).json({
      loan_id: newLoan.loan_id,
      customer_id: newLoan.customer_id,
      total_amount_payable: newLoan.total_amount,
      monthly_emi: newLoan.monthly_emi
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// PAYMENT: Record a payment for a loan
app.post('/api/v1/loans/:loan_id/payments', (req, res) => {
  try {
    const { loan_id } = req.params;
    const { amount, payment_type = 'EMI' } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    
    if (!['EMI', 'LUMP_SUM'].includes(payment_type)) {
      return res.status(400).json({ error: 'Invalid payment type. Must be EMI or LUMP_SUM' });
    }
    
    // Find loan
    const loanIndex = loans.findIndex(l => l.loan_id === loan_id);
    if (loanIndex === -1) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const loan = loans[loanIndex];
    
    // Check if loan is active
    if (loan.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Loan is not active' });
    }
    
    const paymentAmount = parseFloat(amount);
    
    // Validate payment amount
    if (paymentAmount > loan.balance_amount) {
      return res.status(400).json({ 
        error: 'Payment amount exceeds remaining balance',
        remaining_balance: loan.balance_amount
      });
    }
    
    // Create payment record
    const newPayment = {
      payment_id: generatePaymentId(),
      loan_id,
      amount: paymentAmount,
      payment_type,
      payment_date: new Date().toISOString()
    };
    
    payments.push(newPayment);
    
    // Update loan
    const newAmountPaid = loan.amount_paid + paymentAmount;
    const newBalance = loan.balance_amount - paymentAmount;
    
    // For lump sum payments, recalculate EMIs left
    let newEmisLeft;
    if (payment_type === 'LUMP_SUM') {
      newEmisLeft = Math.max(0, Math.ceil(newBalance / loan.monthly_emi));
    } else {
      newEmisLeft = Math.max(0, loan.emis_left - 1);
    }
    
    // Update loan status
    const newStatus = newBalance <= 0 ? 'PAID_OFF' : 'ACTIVE';
    
    loans[loanIndex] = {
      ...loan,
      amount_paid: newAmountPaid,
      balance_amount: Math.max(0, newBalance),
      emis_left: newEmisLeft,
      status: newStatus
    };
    
    res.status(200).json({
      payment_id: newPayment.payment_id,
      loan_id,
      message: 'Payment recorded successfully',
      remaining_balance: loans[loanIndex].balance_amount,
      emis_left: loans[loanIndex].emis_left
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// LEDGER: View loan details and transaction history
app.get('/api/v1/loans/:loan_id/ledger', (req, res) => {
  try {
    const { loan_id } = req.params;
    
    // Find loan
    const loan = loans.find(l => l.loan_id === loan_id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Get all payments for this loan
    const loanPayments = payments.filter(p => p.loan_id === loan_id);
    
    // Format transactions
    const transactions = loanPayments.map(payment => ({
      transaction_id: payment.payment_id,
      date: payment.payment_date,
      amount: payment.amount,
      type: payment.payment_type
    }));
    
    res.status(200).json({
      loan_id: loan.loan_id,
      customer_id: loan.customer_id,
      principal: loan.principal_amount,
      total_amount: loan.total_amount,
      monthly_emi: loan.monthly_emi,
      amount_paid: loan.amount_paid,
      balance_amount: loan.balance_amount,
      emis_left: loan.emis_left,
      transactions
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ACCOUNT OVERVIEW: View all loans for a customer
app.get('/api/v1/customers/:customer_id/overview', (req, res) => {
  try {
    const { customer_id } = req.params;
    
    // Check if customer exists
    const customer = customers.find(c => c.customer_id === customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get all loans for this customer
    const customerLoans = loans.filter(l => l.customer_id === customer_id);
    
    if (customerLoans.length === 0) {
      return res.status(404).json({ error: 'No loans found for this customer' });
    }
    
    // Format loan data as per specification
    const loanDetails = customerLoans.map(loan => ({
      loan_id: loan.loan_id,
      principal: loan.principal_amount,
      total_amount: loan.total_amount,
      total_interest: loan.total_interest,
      emi_amount: loan.monthly_emi,
      amount_paid: loan.amount_paid,
      emis_left: loan.emis_left,
      status: loan.status
    }));
    
    res.status(200).json({
      customer_id,
      total_loans: customerLoans.length,
      loans: loanDetails
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get all loans (helper endpoint for frontend)
app.get('/api/v1/loans', (req, res) => {
  try {
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bank Lending System API running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
  console.log('\nAvailable endpoints:');
  console.log('POST /api/v1/loans - Create new loan (LEND)');
  console.log('POST /api/v1/loans/:loan_id/payments - Record payment (PAYMENT)');
  console.log('GET /api/v1/loans/:loan_id/ledger - Get loan ledger (LEDGER)');
  console.log('GET /api/v1/customers/:customer_id/overview - Get customer overview (ACCOUNT OVERVIEW)');
  console.log('GET /api/v1/customers - Get all customers');
  console.log('GET /api/v1/loans - Get all loans');
});

module.exports = app;