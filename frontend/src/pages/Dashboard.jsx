jsx
import API from "../api";
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users, Wallet, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripBudget, setNewTripBudget] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const fetchTrips = async () => {
    try {
      const res = await API.get('/api/trips');
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
      const res = await API.post('/api/trips', {
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
      await API.post('/api/trips/join', { inviteCode: joinCode });
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your shared expenses effortlessly.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:scale-[1.02] sm:flex-none"
          >
            <Users className="h-4 w-4" />
            Join Trip
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-2xl sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </button>
        </div>
      </header>

      {trips.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-3xl py-24 text-center border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Wallet className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-white">No trips yet</h3>
          <p className="mt-2 text-slate-400 max-w-sm">
            Create a new trip or join an existing one using an invite code to start tracking expenses.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link
              key={trip._id}
              to={`/trip/${trip._id}`}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 blur-2xl transition-transform group-hover:scale-150"></div>

              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {trip.name}
                  </h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 backdrop-blur-md transition-all group-hover:bg-blue-500/20 group-hover:text-blue-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{trip.members?.length || 1} members</span>
                  </div>

                  {trip.budget > 0 && (
                    <div className="flex items-center gap-1 font-medium text-white">
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <h3 className="mb-4 text-xl font-semibold text-white">Create New Trip</h3>
            {error && <div className="mb-4 text-red-400">{error}</div>}
            <form onSubmit={handleCreateTrip}>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Trip Name *</label>
                  <input
                    type="text"
                    required
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="e.g. Goa Trip 2026"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Total Budget</label>
                  <input
                    type="number"
                    value={newTripBudget}
                    onChange={(e) => setNewTripBudget(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl bg-white/10 py-2.5 text-slate-300 hover:bg-white/20">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-white">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <h3 className="mb-4 text-xl font-semibold text-white">Join Trip</h3>

            <form onSubmit={handleJoinTrip}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Invite Code</label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  placeholder="EX: A1B2C3D4"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 rounded-xl bg-white/10 py-2.5 text-slate-300 hover:bg-white/20">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-white">
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

