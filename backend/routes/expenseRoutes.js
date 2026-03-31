const express = require('express');
const router = express.Router();
const { addExpense, getTripExpenses, getSettlements } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addExpense);
router.get('/trip/:tripId', protect, getTripExpenses);
router.get('/trip/:tripId/settlements', protect, getSettlements);

module.exports = router;
