const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');
const { calculateSettlements, getTripStats } = require('../services/settlementService');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { description, amount, paidBy, splitAmong, category, tripId, receiptImage } = req.body;

    // Verify trip exists and user is a member
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'User is not a member of this trip' });
    }

    const expense = await Expense.create({
      description,
      amount,
      paidBy: paidBy || req.user._id,
      splitAmong,
      category,
      trip: tripId,
      receiptImage
    });

    // Populate user details for the frontend
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splitAmong.user', 'name email');

    // Emit real-time update
    if (req.io) {
      req.io.to(tripId.toString()).emit('new_expense', populatedExpense);
    }

    // Create notifications for members who were split among (excluding payer)
    const notifications = splitAmong
      .filter(split => split.user.toString() !== (paidBy || req.user._id).toString())
      .map(split => ({
        user: split.user,
        message: `New expense added: ${description} by ${req.user.name}. Your share: ₹${split.amount}`,
        trip: tripId
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      // Optional: Emit notification events via socket
    }

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses for a trip
// @route   GET /api/expenses/trip/:tripId
// @access  Private
const getTripExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate('paidBy', 'name email')
      .populate('splitAmong.user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get settlements and stats for a trip
// @route   GET /api/expenses/trip/:tripId/settlements
// @access  Private
const getSettlements = async (req, res) => {
  try {
    const settlements = await calculateSettlements(req.params.tripId);
    const stats = await getTripStats(req.params.tripId, req.user);
    
    res.json({ settlements, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addExpense,
  getTripExpenses,
  getSettlements
};
