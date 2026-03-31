import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
      const res = await axios.get('/api/trips');
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
      const res = await axios.post('/api/trips', {
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
      await axios.post('/api/trips/join', { inviteCode: joinCode });
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your shared expenses effortlessly.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
          >
            <Users className="h-4 w-4" />
            Join Trip
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </button>
        </div>
      </header>

      {trips.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-3xl py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Wallet className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">No trips yet</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm">
            Create a new trip or join an existing one using an invite code to start tracking expenses.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link
              key={trip._id}
              to={`/trip/${trip._id}`}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 transition-transform group-hover:scale-150"></div>
              
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-bold tracking-tight">{trip.name}</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800/50 dark:text-slate-300 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{trip.members?.length || 1} members</span>
                  </div>
                  {trip.budget > 0 && (
                    <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Wallet className="h-4 w-4" />
                      <span>₹{trip.budget} budget</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <h3 className="mb-4 text-xl font-bold">Create New Trip</h3>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>}
            <form onSubmit={handleCreateTrip}>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Trip Name *</label>
                  <input
                    type="text"
                    required
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700"
                    placeholder="e.g. Goa Trip 2026"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Total Budget (Optional)</label>
                  <input
                    type="number"
                    value={newTripBudget}
                    onChange={(e) => setNewTripBudget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700"
                    placeholder="e.g. 50000"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl bg-slate-100 py-2.5 font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Trip Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <h3 className="mb-4 text-xl font-bold">Join Trip</h3>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</div>}
            <form onSubmit={handleJoinTrip}>
              <div>
                <label className="mb-1 block text-sm font-medium">Invite Code</label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 font-mono uppercase tracking-widest outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700"
                  placeholder="EX: A1B2C3D4"
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 rounded-xl bg-slate-100 py-2.5 font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
