import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, FileText, User, Plus, CreditCard } from 'lucide-react';

const BankLendingSystem = () => {
  const [activeTab, setActiveTab] = useState('lend');
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [message, setMessage] = useState('');

  // Form states
  const [lendForm, setLendForm] = useState({
    customer_id: '',
    loan_amount: '',
    loan_period_years: '',
    interest_rate_yearly: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    loan_id: '',
    amount: '',
    payment_type: 'EMI'
  });

  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleCustomers = [
      { customer_id: 'CUST001', name: 'John Doe', created_at: new Date().toISOString() },
      { customer_id: 'CUST002', name: 'Jane Smith', created_at: new Date().toISOString() },
      { customer_id: 'CUST003', name: 'Bob Johnson', created_at: new Date().toISOString() }
    ];
    setCustomers(sampleCustomers);
  }, []);

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateLoanDetails = (principal, years, rate) => {
    const totalInterest = principal * years * (rate / 100);
    const totalAmount = principal + totalInterest;
    const monthlyEMI = totalAmount / (years * 12);
    return { totalInterest, totalAmount, monthlyEMI };
  };

  const generateId = () => {
    return 'LOAN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Handle creating a new loan
  const handleCreateLoan = (e) => {
    e.preventDefault();
    const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = lendForm;
    
    if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
      setMessage('Please fill in all fields');
      return;
    }

    const principal = parseFloat(loan_amount);
    const years = parseInt(loan_period_years);
    const rate = parseFloat(interest_rate_yearly);

    const { totalInterest, totalAmount, monthlyEMI } = calculateLoanDetails(principal, years, rate);

    const newLoan = {
      loan_id: generateId(),
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
      created_at: new Date().toISOString(),
      payments: []
    };

    setLoans([...loans, newLoan]);
    setLendForm({ customer_id: '', loan_amount: '', loan_period_years: '', interest_rate_yearly: '' });
    setMessage(`Loan created successfully! Loan ID: ${newLoan.loan_id}`);
  };

  // Handle payment
  const handlePayment = (e) => {
    e.preventDefault();
    const { loan_id, amount, payment_type } = paymentForm;
    
    if (!loan_id || !amount) {
      setMessage('Please fill in all fields');
      return;
    }

    const loanIndex = loans.findIndex(l => l.loan_id === loan_id);
    if (loanIndex === -1) {
      setMessage('Loan not found');
      return;
    }

    const loan = loans[loanIndex];
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount > loan.balance_amount) {
      setMessage('Payment amount cannot exceed remaining balance');
      return;
    }

    const payment = {
      payment_id: 'PAY_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount: paymentAmount,
      payment_type,
      payment_date: new Date().toISOString()
    };

    const newAmountPaid = loan.amount_paid + paymentAmount;
    const newBalance = loan.balance_amount - paymentAmount;
    let newEmisLeft;
    
    if (payment_type === 'LUMP_SUM') {
      newEmisLeft = Math.max(0, Math.ceil(newBalance / loan.monthly_emi));
    } else {
      newEmisLeft = Math.max(0, loan.emis_left - 1);
    }

    const updatedLoans = [...loans];
    updatedLoans[loanIndex] = {
      ...loan,
      amount_paid: newAmountPaid,
      balance_amount: Math.max(0, newBalance),
      emis_left: newEmisLeft,
      status: newBalance <= 0 ? 'PAID_OFF' : 'ACTIVE',
      payments: [...(loan.payments || []), payment]
    };

    setLoans(updatedLoans);
    setPaymentForm({ loan_id: '', amount: '', payment_type: 'EMI' });
    setMessage(`Payment recorded successfully! Remaining balance: ${formatCurrency(Math.max(0, newBalance))}`);
  };

  // Load ledger data
  const loadLedger = (loanId) => {
    const loan = loans.find(l => l.loan_id === loanId);
    if (loan) {
      setLedgerData({
        ...loan,
        transactions: loan.payments || []
      });
    } else {
      setLedgerData(null);
    }
  };

  // Load overview data
  const loadOverview = (customerId) => {
    const customerLoans = loans.filter(l => l.customer_id === customerId);
    if (customerLoans.length > 0) {
      setOverviewData({
        customer_id: customerId,
        total_loans: customerLoans.length,
        loans: customerLoans
      });
    } else {
      setOverviewData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="h-8 w-8" />
              Bank Lending System
            </h1>
            <p className="mt-2 opacity-90">Manage loans, payments, and customer accounts</p>
          </div>

          {message && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
              {message}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'lend', label: 'Create Loan', icon: Plus },
                { id: 'payment', label: 'Make Payment', icon: CreditCard },
                { id: 'ledger', label: 'Loan Ledger', icon: FileText },
                { id: 'overview', label: 'Customer Overview', icon: User }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* LEND Tab */}
            {activeTab === 'lend' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Loan</h2>
                <form onSubmit={handleCreateLoan} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                      <select
                        value={lendForm.customer_id}
                        onChange={(e) => setLendForm({...lendForm, customer_id: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                          <option key={customer.customer_id} value={customer.customer_id}>
                            {customer.name} ({customer.customer_id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={lendForm.loan_amount}
                        onChange={(e) => setLendForm({...lendForm, loan_amount: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter loan amount"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loan Period (Years)</label>
                      <input
                        type="number"
                        value={lendForm.loan_period_years}
                        onChange={(e) => setLendForm({...lendForm, loan_period_years: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter years"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (% per year)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={lendForm.interest_rate_yearly}
                        onChange={(e) => setLendForm({...lendForm, interest_rate_yearly: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter interest rate"
                        required
                      />
                    </div>
                  </div>

                  {lendForm.loan_amount && lendForm.loan_period_years && lendForm.interest_rate_yearly && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">Loan Preview</h3>
                      {(() => {
                        const principal = parseFloat(lendForm.loan_amount);
                        const years = parseInt(lendForm.loan_period_years);
                        const rate = parseFloat(lendForm.interest_rate_yearly);
                        const { totalInterest, totalAmount, monthlyEMI } = calculateLoanDetails(principal, years, rate);
                        
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Principal:</span>
                              <div className="font-semibold">{formatCurrency(principal)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Interest:</span>
                              <div className="font-semibold">{formatCurrency(totalInterest)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Amount:</span>
                              <div className="font-semibold">{formatCurrency(totalAmount)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Monthly EMI:</span>
                              <div className="font-semibold">{formatCurrency(monthlyEMI)}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create Loan
                  </button>
                </form>
              </div>
            )}

            {/* PAYMENT Tab */}
            {activeTab === 'payment' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Payment</h2>
                <form onSubmit={handlePayment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Loan</label>
                    <select
                      value={paymentForm.loan_id}
                      onChange={(e) => setPaymentForm({...paymentForm, loan_id: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Loan</option>
                      {loans.filter(loan => loan.status === 'ACTIVE').map(loan => {
                        const customer = customers.find(c => c.customer_id === loan.customer_id);
                        return (
                          <option key={loan.loan_id} value={loan.loan_id}>
                            {loan.loan_id} - {customer?.name} - Balance: {formatCurrency(loan.balance_amount)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                      <select
                        value={paymentForm.payment_type}
                        onChange={(e) => setPaymentForm({...paymentForm, payment_type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="EMI">EMI Payment</option>
                        <option value="LUMP_SUM">Lump Sum Payment</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Record Payment
                  </button>
                </form>
              </div>
            )}

            {/* LEDGER Tab */}
            {activeTab === 'ledger' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Loan Ledger</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Loan</label>
                  <select
                    value={selectedLoanId}
                    onChange={(e) => {
                      setSelectedLoanId(e.target.value);
                      loadLedger(e.target.value);
                    }}
                    className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Loan</option>
                    {loans.map(loan => {
                      const customer = customers.find(c => c.customer_id === loan.customer_id);
                      return (
                        <option key={loan.loan_id} value={loan.loan_id}>
                          {loan.loan_id} - {customer?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {ledgerData && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <span className="text-sm text-gray-600">Principal</span>
                          <p className="font-semibold">{formatCurrency(ledgerData.principal_amount)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Total Amount</span>
                          <p className="font-semibold">{formatCurrency(ledgerData.total_amount)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Amount Paid</span>
                          <p className="font-semibold text-green-600">{formatCurrency(ledgerData.amount_paid)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Balance</span>
                          <p className="font-semibold text-red-600">{formatCurrency(ledgerData.balance_amount)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Monthly EMI</span>
                          <p className="font-semibold">{formatCurrency(ledgerData.monthly_emi)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">EMIs Left</span>
                          <p className="font-semibold">{ledgerData.emis_left}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Status</span>
                          <p className="font-semibold">{ledgerData.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                      {ledgerData.transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Payment ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ledgerData.transactions.map(transaction => (
                                <tr key={transaction.payment_id} className="border-b border-gray-100">
                                  <td className="py-3 px-4">{formatDate(transaction.payment_date)}</td>
                                  <td className="py-3 px-4 font-mono text-sm">{transaction.payment_id}</td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      transaction.payment_type === 'EMI' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {transaction.payment_type}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right font-semibold text-green-600">
                                    {formatCurrency(transaction.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No payments recorded yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OVERVIEW Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Overview</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      loadOverview(e.target.value);
                    }}
                    className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.customer_id} value={customer.customer_id}>
                        {customer.name} ({customer.customer_id})
                      </option>
                    ))}
                  </select>
                </div>

                {overviewData && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">All Loans</h3>
                      {overviewData.loans.length > 0 ? (
                        <div className="space-y-4">
                          {overviewData.loans.map(loan => (
                            <div key={loan.loan_id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-sm font-medium">{loan.loan_id}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {loan.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Principal:</span>
                                  <div className="font-semibold">{formatCurrency(loan.principal_amount)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Amount:</span>
                                  <div className="font-semibold">{formatCurrency(loan.total_amount)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Monthly EMI:</span>
                                  <div className="font-semibold">{formatCurrency(loan.monthly_emi)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Amount Paid:</span>
                                  <div className="font-semibold text-green-600">{formatCurrency(loan.amount_paid)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Interest:</span>
                                  <div className="font-semibold">{formatCurrency(loan.total_interest)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">EMIs Left:</span>
                                  <div className="font-semibold">{loan.emis_left}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No loans found for this customer</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankLendingSystem;