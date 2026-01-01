
import React from 'react';
import { Bet, Source } from '../types';

interface SourceStatsDashboardProps {
  history: Bet[];
  sources: Source[];
  compact?: boolean;
}

const SourceStatsDashboard: React.FC<SourceStatsDashboardProps> = ({ history, sources, compact }) => {
  const stats = sources.map(source => {
    const sourceBets = history.filter(b => b.sourceId === source.id);
    const wins = sourceBets.filter(b => b.outcome === 'win');
    const losses = sourceBets.filter(b => b.outcome === 'loss');
    
    const profit = wins.reduce((acc, b) => acc + b.potentialProfit, 0) - losses.reduce((acc, b) => acc + b.amount, 0);
    const winRate = sourceBets.length > 0 ? (wins.length / sourceBets.length) * 100 : 0;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayBets = sourceBets.filter(b => b.timestamp >= startOfDay);
    const todayProfit = todayBets.reduce((acc, b) => {
      const p = b.type === 'adjustment' ? b.potentialProfit : (b.outcome === 'win' ? b.potentialProfit : -b.amount);
      return acc + p;
    }, 0);

    return {
      id: source.id,
      name: source.name,
      total: sourceBets.length,
      profit,
      todayProfit,
      winRate
    };
  }).sort((a, b) => b.profit - a.profit);

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.slice(0, 4).map(s => (
          <div key={s.id} className="glass p-4 rounded-2xl border-l-4 border-amber-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{s.name}</p>
            <div className={`text-sm font-bold mt-1 ${s.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {s.profit > 0 ? '+' : ''}{s.profit.toLocaleString()}₽
            </div>
            <div className={`text-[10px] font-bold ${s.todayProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              Сегодня: {s.todayProfit > 0 ? '+' : ''}{s.todayProfit.toLocaleString()}₽
            </div>
            <p className="text-[9px] text-gray-500">{s.winRate.toFixed(0)}% WR ({s.total} шт)</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-3xl space-y-4">
      <h3 className="text-sm font-serif text-amber-900 border-b border-amber-100 pb-2">Лидеры проходимости</h3>
      <div className="space-y-3">
        {stats.map((s, idx) => (
          <div key={s.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-300 font-serif italic">#{idx + 1}</span>
              <span className="font-medium text-gray-700 truncate w-24">{s.name}</span>
            </div>
            <div className="text-right">
              <div className={`font-bold ${s.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {s.profit > 0 ? '+' : ''}{s.profit.toLocaleString()}₽
              </div>
              <div className={`text-[10px] font-bold ${s.todayProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                Сегодня: {s.todayProfit > 0 ? '+' : ''}{s.todayProfit.toLocaleString()}₽
              </div>
              <div className="text-[9px] text-gray-400">WR: {s.winRate.toFixed(1)}%</div>
            </div>
          </div>
        ))}
        {stats.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">Нет данных для анализа</p>}
      </div>
    </div>
  );
};

export default SourceStatsDashboard;
