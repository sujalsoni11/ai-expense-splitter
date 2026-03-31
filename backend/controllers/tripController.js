const Trip = require('../models/Trip');
const crypto = require('crypto');

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { name, budget } = req.body;

    // Generate a unique invite code
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const trip = await Trip.create({
      name,
      budget: budget || 0,
      createdBy: req.user._id,
      members: [req.user._id], // Creator is automatically a member
      inviteCode
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trips for a user
// @route   GET /api/trips
// @access  Private
const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ members: req.user._id }).populate('members', 'name email');
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name email');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member
    if (!trip.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this trip' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a trip using invite code
// @route   POST /api/trips/join
// @access  Private
const joinTrip = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const trip = await Trip.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!trip) {
      return res.status(404).json({ message: 'Invalid invite code or trip not found' });
    }

    // Check if user is already a member
    if (trip.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this trip' });
    }

    trip.members.push(req.user._id);
    await trip.save();

    // Notify other members (can be handled via Socket.io later)
    if (req.io) {
      req.io.to(trip._id.toString()).emit('member_joined', { user: req.user, tripId: trip._id });
    }

    res.json({ message: 'Successfully joined trip', trip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  joinTrip
};
