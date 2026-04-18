import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Users, Receipt, ArrowRightLeft, UserPlus } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import SettlementList from '../components/SettlementList';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('expenses'); // expenses, settlements
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const fetchTripData = async () => {
   const config = {
  headers: {
    Authorization: `Bearer ${user.token}`
  }
};

const [tripRes, expensesRes, settlementsRes] = await Promise.all([
  axios.get(`${API}/api/trips/${id}`, config),
  axios.get(`${API}/api/expenses/trip/${id}`, config),
  axios.get(`${API}/api/expenses/trip/${id}/settlements`, config)
]);
      
      setTrip(tripRes.data);
      setExpenses(expensesRes.data);
      setSettlements(settlementsRes.data.settlements);
      setStats(settlementsRes.data.stats);
    } catch (err) {
      setError('Failed to load trip details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();

    if (socket) {
      socket.emit('join_trip', id);

      socket.on('new_expense', (newExpense) => {
        // Optimistically add to list and refetch settlements/stats
        setExpenses((prev) => [newExpense, ...prev]);
        
        axios.get(`/api/expenses/trip/${id}/settlements`).then(res => {
          setSettlements(res.data.settlements);
          setStats(res.data.stats);
        });
      });

      socket.on('member_joined', ({ user: newUser }) => {
        setTrip(prev => ({
          ...prev,
          members: [...prev.members, newUser]
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off('new_expense');
        socket.off('member_joined');
      }
    };
  }, [id, socket]);

  const handleAddExpense = async (payload) => {
    try {
      await axios.post(`${API}/api/expenses`, payload, config);
      setShowExpenseForm(false);
      // Not strictly necessary to fetch locally if socket is working, 
      // but good as a fallback
      fetchTripData();
    } catch (err) {
      console.error(err);
      alert('Failed to add expense');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(trip.inviteCode);
    alert('Invite code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !trip) {
    return <div className="text-center text-red-500 py-12">{error || 'Trip not found'}</div>;
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* Trip Header Card */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{trip.members.length} Members</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-mono text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 cursor-pointer hover:bg-blue-100 transition-colors" onClick={copyInviteCode} title="Click to copy">
                <UserPlus className="h-4 w-4" />
                <span className="font-semibold tracking-widest">{trip.inviteCode}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spent</p>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                ₹{stats?.totalSpent.toFixed(2) || '0.00'}
              </p>
            </div>
            {trip.budget > 0 && (
              <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            )}
            {trip.budget > 0 && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Budget</p>
                <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                  ₹{trip.budget.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (Listings) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 rounded-xl bg-slate-200/50 p-1 dark:bg-slate-800/50">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg p-2.5 text-sm font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Receipt className="h-4 w-4" />
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg p-2.5 text-sm font-semibold transition-all ${
                activeTab === 'settlements'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Settlements
            </button>
          </div>

          {activeTab === 'expenses' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Expenses</h2>
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  Add Expense
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
                  <p className="text-slate-500">No expenses added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense._id} className="glass flex items-center justify-between rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-900/20">
                          {expense.category === 'food' ? '🍔' : expense.category === 'travel' ? '✈️' : expense.category === 'hotel' ? '🏨' : '🧾'}
                        </div>
                        <div>
                          <p className="font-semibold">{expense.description}</p>
                          <p className="text-sm text-slate-500">
                            Paid by <span className="font-medium text-slate-700 dark:text-slate-300">{expense.paidBy.name.split(' ')[0]}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">₹{expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-xl font-bold">Balances</h2>
              <SettlementList settlements={settlements} members={trip.members} currentUserId={user.id || user._id} />
            </div>
          )}
        </div>

        {/* Right Column (Forms & Details) */}
        <div>
          {showExpenseForm && (
            <div className="sticky top-24">
              <ExpenseForm trip={trip} onAdd={handleAddExpense} onCancel={() => setShowExpenseForm(false)} />
            </div>
          )}
          
          {!showExpenseForm && (
            <div className="sticky top-24 space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="mb-4 font-bold">Your Status</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">You Paid For Trip</p>
                    <p className="font-mono text-xl font-bold">₹{stats?.userContribution?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  {/* Simplistic progress bar for budget if exists */}
                  {trip.budget > 0 && (
                    <div className="space-y-1 mt-4 border-t pt-4 dark:border-slate-700/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Budget Used</span>
                        <span className="font-medium">{Math.min(100, (stats?.totalSpent / trip.budget) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div 
                          className={`h-full rounded-full ${stats?.totalSpent > trip.budget ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, (stats?.totalSpent / trip.budget) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
