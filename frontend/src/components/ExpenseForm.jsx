import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Camera, RefreshCw, Plus, X } from 'lucide-react';

const ExpenseForm = ({ trip, onAdd, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [splitAmong, setSplitAmong] = useState(
    trip.members.map(m => ({ user: m._id, amount: 0, isIncluded: true }))
  );
  const [splitMethod, setSplitMethod] = useState('equal'); // equal, custom
  const [receiptImageRaw, setReceiptImageRaw] = useState(null);
  
  // OCR states
  const [isScanning, setIsScanning] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [receiptPath, setReceiptPath] = useState(null);

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setOcrError('');
    
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await axios.post('/api/ocr/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.amount) {
        setAmount(res.data.amount.toString());
        recalculateSplits(res.data.amount, splitAmong, splitMethod);
      } else {
        setOcrError('Could not detect amount automatically. Please enter manually.');
      }
      setReceiptPath(res.data.receiptImage);
    } catch (err) {
      setOcrError('Receipt scan failed.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const recalculateSplits = (totalAmt, currentSplits, method) => {
    const numericAmt = parseFloat(totalAmt) || 0;
    if (method === 'equal') {
      const includedCount = currentSplits.filter(s => s.isIncluded).length;
      const amountPerPerson = includedCount > 0 ? (numericAmt / includedCount).toFixed(2) : 0;
      
      setSplitAmong(currentSplits.map(s => 
        s.isIncluded ? { ...s, amount: parseFloat(amountPerPerson) } : { ...s, amount: 0 }
      ));
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    recalculateSplits(val, splitAmong, splitMethod);
  };

  const handleMethodChange = (method) => {
    setSplitMethod(method);
    recalculateSplits(amount, splitAmong, method);
  };

  const toggleMemberInclusion = (index) => {
    if (splitMethod !== 'equal') return;
    const newSplits = [...splitAmong];
    newSplits[index].isIncluded = !newSplits[index].isIncluded;
    setSplitAmong(newSplits);
    recalculateSplits(amount, newSplits, splitMethod);
  };

  const handleCustomSplitChange = (index, value) => {
    const newSplits = [...splitAmong];
    newSplits[index].amount = parseFloat(value) || 0;
    setSplitAmong(newSplits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate custom split sum
    if (splitMethod === 'custom') {
      const sum = splitAmong.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      if (Math.abs(sum - parseFloat(amount)) > 0.05) {
        alert('Custom split amounts must add up to the total amount.');
        return;
      }
    }

    const payload = {
      description,
      amount: parseFloat(amount),
      category,
      tripId: trip._id,
      receiptImage: receiptPath,
      splitAmong: splitAmong.filter(s => s.amount > 0).map(s => ({
        user: s.user,
        amount: s.amount
      }))
    };

    try {
      await onAdd(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold">Add Expense</h3>
        <button onClick={onCancel} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 text-center transition-colors dark:border-blue-900/50 dark:bg-blue-900/10">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
          {isScanning ? (
            <>
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Scanning Receipt with AI...</span>
            </>
          ) : (
            <>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <Camera className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Scan Receipt with AI (Auto-fill amount)
              </span>
              <span className="text-xs text-slate-500">Upload JPG/PNG</span>
            </>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleOcrUpload} disabled={isScanning} />
        </label>
        {ocrError && <p className="mt-2 text-xs text-red-500">{ocrError}</p>}
        {receiptPath && <p className="mt-2 text-xs text-green-600 dark:text-green-400">Receipt scanned successfully</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <input
            type="text"
            required
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700"
            placeholder="Dinner at Olive"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Amount (₹)</label>
            <input
              type="number"
              required
              step="0.01"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 font-medium text-blue-600 dark:text-blue-400"
              placeholder="0.00"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 appearance-none"
            >
              <option value="general">General</option>
              <option value="food">Food & Dining</option>
              <option value="travel">Travel</option>
              <option value="hotel">Accommodation</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-medium">Split Method</label>
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-700/50">
              <button
                type="button"
                onClick={() => handleMethodChange('equal')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${splitMethod === 'equal' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Equally
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange('custom')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${splitMethod === 'custom' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Custom
              </button>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            {trip.members.map((member, index) => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {splitMethod === 'equal' && (
                    <input
                      type="checkbox"
                      checked={splitAmong[index].isIncluded}
                      onChange={() => toggleMemberInclusion(index)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {member.name} {member._id === user._id ? '(You)' : ''}
                  </span>
                </div>
                {splitMethod === 'equal' ? (
                  <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                    ₹{splitAmong[index].amount.toFixed(2)}
                  </span>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={splitAmong[index].amount || ''}
                      onChange={(e) => handleCustomSplitChange(index, e.target.value)}
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 pl-7 text-right text-sm outline-none focus:border-blue-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
