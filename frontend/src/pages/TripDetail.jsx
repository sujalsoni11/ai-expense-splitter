import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api'; // ✅ FIXED
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
  const [activeTab, setActiveTab] = useState('expenses');
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const fetchTripData = async () => {
    try {
      const [tripRes, expensesRes, settlementsRes] = await Promise.all([
        API.get(`/api/trips/${id}`),
        API.get(`/api/expenses/trip/${id}`),
        API.get(`/api/expenses/trip/${id}/settlements`)
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
        setExpenses((prev) => [newExpense, ...prev]);

        API.get(`/api/expenses/trip/${id}/settlements`).then(res => {
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
      await API.post('/api/expenses', payload);
      setShowExpenseForm(false);
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
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="glass rounded-3xl p-6">
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <p>{trip.members.length} Members</p>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setActiveTab('expenses')}>Expenses</button>
        <button onClick={() => setActiveTab('settlements')}>Settlements</button>
      </div>

      {activeTab === 'expenses' ? (
        <div>
          <button onClick={() => setShowExpenseForm(true)}>Add Expense</button>
          {expenses.map(e => (
            <div key={e._id}>{e.description} - ₹{e.amount}</div>
          ))}
        </div>
      ) : (
        <SettlementList settlements={settlements} members={trip.members} currentUserId={user._id} />
      )}

      {showExpenseForm && (
        <ExpenseForm trip={trip} onAdd={handleAddExpense} onCancel={() => setShowExpenseForm(false)} />
      )}
    </div>
  );
};

export default TripDetail;