import { ArrowRight, CheckCircle2 } from 'lucide-react';

const SettlementList = ({ settlements, members, currentUserId }) => {
  const getMemberName = (id) => {
    if (id === currentUserId) return 'You';
    const member = members.find(m => m._id === id);
    return member ? member.name.split(' ')[0] : 'Unknown';
  };

  if (!settlements || settlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold">All settled up!</h3>
        <p className="max-w-[200px] text-sm text-slate-500 dark:text-slate-400">
          No balances to settle right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {settlements.map((settle, i) => {
        const isUserOwed = settle.to === currentUserId;
        const isUserOwing = settle.from === currentUserId;
        
        let containerClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";
        if (isUserOwed) containerClass = "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30";
        if (isUserOwing) containerClass = "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30";

        return (
          <div 
            key={i} 
            className={`flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all ${containerClass}`}
          >
            <div className="flex flex-1 items-center justify-between pr-4">
              <span className={`font-medium ${isUserOwing ? 'text-red-700 dark:text-red-400' : ''}`}>
                {getMemberName(settle.from)}
              </span>
              <div className="flex flex-col items-center justify-center px-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">owes</span>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              </div>
              <span className={`font-medium ${isUserOwed ? 'text-green-700 dark:text-green-400' : ''}`}>
                {getMemberName(settle.to)}
              </span>
            </div>
            
            <div className="flex items-center gap-1 rounded-lg bg-white/60 px-3 py-1.5 font-mono text-lg font-bold text-slate-900 shadow-sm dark:bg-slate-900/50 dark:text-white">
              <span className="text-sm text-slate-400">₹</span>
              {settle.amount.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SettlementList;
