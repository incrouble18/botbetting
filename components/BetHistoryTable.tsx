
import React from 'react';
import { Bet, Source } from '../types';

interface BetHistoryTableProps {
  history: Bet[];
  sources: Source[];
  currentSourceId?: string | null;
}

const BetHistoryTable: React.FC<BetHistoryTableProps> = ({ history, sources, currentSourceId }) => {
  // If viewing in active session, filter by current source. 
  // Otherwise (could be global view) show all.
  const filteredHistory = currentSourceId 
    ? history.filter(b => b.sourceId === currentSourceId)
    : history;

  if (filteredHistory.length === 0) {
    return (
      <div className="glass rounded-3xl p-16 text-center text-gray-300 italic">
        <svg className="w-16 h-16 mx-auto mb-6 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        История для этого источника пуста. Сделайте первую ставку!
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-amber-50/50 border-b border-amber-100">
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Детали сделки</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Итог</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Прибыль/Убыток</th>
              <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Матч и Заметки</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredHistory.map((bet) => {
              const source = sources.find(s => s.id === bet.sourceId);
              return (
                <tr key={bet.id} className="hover:bg-amber-50/30 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-amber-900 font-semibold text-lg">{bet.amount.toLocaleString()}₽ <span className="text-gray-400 text-sm font-normal">@ {bet.odds.toFixed(2)}</span></span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-amber-600/60 uppercase font-bold tracking-widest">{bet.strategy} • Шаг {bet.step}</span>
                        {!currentSourceId && <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 rounded uppercase font-bold">{source?.name}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      bet.outcome === 'win' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-red-50 text-red-500 border-red-100'
                    }`}>
                      {bet.outcome === 'win' ? 'Победа' : 'Проигрыш'}
                    </span>
                  </td>
                  <td className={`px-6 py-6 text-right font-bold tabular-nums ${bet.outcome === 'win' ? 'text-green-600' : 'text-red-500'}`}>
                    {bet.outcome === 'win' ? `+${bet.potentialProfit.toLocaleString()}` : `-${bet.amount.toLocaleString()}`}₽
                  </td>
                  <td className="px-6 py-6">
                    <div className="max-w-xs">
                      <div className="text-sm text-amber-900 font-medium truncate group-hover:whitespace-normal" title={bet.matchInfo}>
                        {bet.matchInfo || <span className="opacity-10">—</span>}
                      </div>
                      {bet.notes && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all italic">
                          {bet.notes}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BetHistoryTable;
