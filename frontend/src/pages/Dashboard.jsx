import API from "../api";
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users, Wallet, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripBudget, setNewTripBudget] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const fetchTrips = async () => {
    try {
      const res = await API.get('/api/trips'); // ✅ FIXED
      setTrips(res.data);
    } catch (err) {
      console.error('Error fetching trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/api/trips', { // ✅ FIXED
        name: newTripName,
        budget: newTripBudget ? Number(newTripBudget) : 0
      });

      setTrips([...trips, res.data]);
      setShowCreateModal(false);
      setNewTripName('');
      setNewTripBudget('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    }
  };

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/api/trips/join', { inviteCode: joinCode }); // ✅ FIXED
      fetchTrips();
      setShowJoinModal(false);
      setJoinCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join trip');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your shared expenses effortlessly.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowJoinModal(true)} className="btn">
            <Users className="h-4 w-4" />
            Join Trip
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            New Trip
          </button>
        </div>
      </header>

      {trips.length === 0 ? (
        <div className="text-center py-24">
          <Wallet className="h-8 w-8 mx-auto mb-4" />
          <h3>No trips yet</h3>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip._id} to={`/trip/${trip._id}`}>
              {trip.name}
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <form onSubmit={handleCreateTrip}>
          <input
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
            required
          />
          <input
            value={newTripBudget}
            onChange={(e) => setNewTripBudget(e.target.value)}
          />
          <button type="submit">Create</button>
        </form>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <form onSubmit={handleJoinTrip}>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
          />
          <button type="submit">Join</button>
        </form>
      )}
    </div>
  );
};

export default Dashboard;