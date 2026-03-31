const express = require('express');
const router = express.Router();
const { createTrip, getUserTrips, getTripById, joinTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTrip);
router.get('/', protect, getUserTrips);
router.post('/join', protect, joinTrip);
router.get('/:id', protect, getTripById);

module.exports = router;
