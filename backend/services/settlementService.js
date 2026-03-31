const Expense = require('../models/Expense');

// Calculate simplified debts "Who owes whom"
const calculateSettlements = async (tripId) => {
  const expenses = await Expense.find({ trip: tripId }).populate('paidBy', 'name email').populate('splitAmong.user', 'name email');
  
  // balances maps userId -> net balance
  // Positive means they should receive money, Negative means they owe money
  const balances = new Map();

  expenses.forEach(expense => {
    // Paid by gets positive balance
    const payerId = expense.paidBy._id.toString();
    balances.set(payerId, (balances.get(payerId) || 0) + expense.amount);

    // Split among get negative balance
    expense.splitAmong.forEach(split => {
      const splitUserId = split.user._id ? split.user._id.toString() : split.user.toString();
      balances.set(splitUserId, (balances.get(splitUserId) || 0) - split.amount);
    });
  });

  // Separate into debtors and creditors
  let debtors = [];
  let creditors = [];

  for (const [userId, balance] of balances.entries()) {
    // Using a tiny threshold to avoid floating point issues
    if (balance < -0.01) {
      debtors.push({ userId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    }
  }

  // Sort both arrays descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];

  let i = 0; // index for debtors
  let j = 0; // index for creditors

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: roundedAmount
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};

// Compute dashboard stats for a trip
const getTripStats = async (tripId, user) => {
  const expenses = await Expense.find({ trip: tripId });
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Group by category
  const categoryBreakdown = {};
  expenses.forEach(exp => {
    categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
  });

  // User's total contribution
  let userContribution = 0;
  expenses.forEach(exp => {
    if (exp.paidBy.toString() === user._id.toString()) {
      userContribution += exp.amount;
    }
  });

  return {
    totalSpent,
    categoryBreakdown,
    userContribution
  };
};

module.exports = {
  calculateSettlements,
  getTripStats
};
