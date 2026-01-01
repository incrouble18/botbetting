
import React, { useState, useEffect } from 'react';
import { Session, Source, StrategyType, Bet } from '../types';
import { exportSessionToExcel } from '../excelUtils';
import { STRATEGIES } from '../constants';

interface SessionCardProps {
  session: Session;
  source?: Source;
  onAddBet: (bet: any) => void;
  onAdjust: (amount: number, note: string) => void;
  onUpdateFlat: (percent: number) => void;
  onUpdateSafeLadder?: (type: 'percent' | 'fixed', value: number) => void;
  onRemove: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, source, onAddBet, onAdjust, onUpdateFlat, onUpdateSafeLadder, onRemove }) => {
  const [odds, setOdds] = useState('');
  const [notes, setNotes] = useState('');
  const [adjAmount, setAdjAmount] = useState('');
  const [showAdj, setShowAdj] = useState(false);
  const [recAmount, setRecAmount] = useState(0);
  
  const strategy = STRATEGIES[session.strategyType];
  const profit = session.bank - session.initialBank;
  const isPositive = profit >= 0;

  useEffect(() => {
    let amount = 0;
    const lastRealBet = session.history.find(b => b.type === 'bet' || !b.type);

    if (session.strategyType === StrategyType.OrdinaryFlat) {
      const p = session.flatPercentage || 5;
      amount = session.bank * (p / 100);
    } else if (session.strategyType === StrategyType.SafeLadder5) {
      const initialType = session.safeLadderInitialType || 'percent';
      const initialValue = session.safeLadderInitialValue ?? 5;
      
      if (session.currentLadderStep === 1) {
        if (initialType === 'percent') {
          amount = session.bank * (initialValue / 100);
        } else {
          amount = initialValue;
        }
      } else {
        const defaultStart = initialType === 'percent' ? session.bank * (initialValue / 100) : initialValue;
        amount = lastRealBet ? lastRealBet.amount + lastRealBet.potentialProfit : defaultStart;
      }
    } else if (session.strategyType === StrategyType.SplitScale7) {
      const initialUnit = session.initialBank / 6;
      const scalingFactor = Math.floor(Math.log2(session.bank / session.initialBank));
      const unit = initialUnit * Math.pow(2, Math.max(0, scalingFactor));
      if (session.currentLadderStep === 1) {
        amount = unit;
      } else {
        amount = lastRealBet ? lastRealBet.amount + lastRealBet.potentialProfit : unit;
      }
    }
    setRecAmount(Math.round(amount));
  }, [session]);

  const handleAction = (outcome: 'win' | 'loss') => {
    const numOdds = parseFloat(odds);
    if (!numOdds || numOdds <= 1) {
      alert('Введите корректный кф (> 1.0)');
      return;
    }
    onAddBet({
      amount: recAmount,
      odds: numOdds,
      potentialProfit: recAmount * (numOdds - 1),
      outcome,
      notes: notes.trim(),
      timestamp: Date.now()
    });
    setOdds('');
    setNotes('');
  };

  const handleManualAdjust = () => {
    const val = parseFloat(adjAmount);
    if (!val || val === 0) return;
    onAdjust(val, "");
    setAdjAmount('');
    setShowAdj(false);
  };

  return (
    <div className="glass rounded-[2.5rem] p-6 md:p-8 flex flex-col space-y-6 lamp-glow relative group border-2 border-transparent hover:border-amber-100 transition-all h-full">
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-40 group-hover:opacity-100 z-20 focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="space-y-1 pr-8">
        <h3 className="text-2xl font-serif text-amber-900 truncate" title={session.name}>{session.name}</h3>
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-md border border-amber-100">
            {source?.name || 'Без источника'}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
            {strategy.name}
          </span>
        </div>
      </div>

      <div className="bg-amber-50/40 border border-amber-100/50 rounded-3xl p-5 shadow-inner">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">Текущий Банк</p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-amber-900 tabular-nums">{session.bank.toLocaleString()}₽</p>
              <button 
                onClick={() => setShowAdj(!showAdj)}
                className={`p-1.5 rounded-full transition-colors ${showAdj ? 'bg-amber-600 text-white' : 'bg-white text-amber-400 border border-amber-100 hover:text-amber-600'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>
              <button 
                onClick={() => exportSessionToExcel(session, source)}
                className="p-1.5 rounded-full bg-white text-green-600 border border-green-100 hover:bg-green-50 transition-colors"
                title="Скачать Excel"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">Профит</p>
            <div className={`flex items-center gap-1 justify-end font-bold text-lg tabular-nums ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              <span>{isPositive ? '+' : ''}{profit.toLocaleString()}₽</span>
            </div>
          </div>
        </div>

        {showAdj && (
          <div className="mt-4 pt-4 border-t border-amber-100 animate-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2">
              <input 
                type="number" 
                value={adjAmount}
                onChange={e => setAdjAmount(e.target.value)}
                placeholder="+/- Сумма"
                className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button onClick={handleManualAdjust} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Ок</button>
              <button onClick={() => setShowAdj(false)} className="text-gray-400 px-2 text-xl">×</button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 bg-white/50 p-5 rounded-3xl border border-gray-100/50">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ставка бота</span>
            <span className="text-xl font-bold text-amber-600 tabular-nums">{recAmount}₽</span>
          </div>
          {session.strategyType === StrategyType.OrdinaryFlat ? (
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase">%:</label>
              <input 
                type="number" 
                min="1" max="50"
                value={session.flatPercentage || 5}
                onChange={(e) => onUpdateFlat(parseInt(e.target.value) || 1)}
                className="w-12 bg-amber-50 border-none rounded-lg px-2 py-1 text-xs text-amber-700 font-bold text-center"
              />
            </div>
          ) : session.strategyType === StrategyType.SafeLadder5 ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onUpdateSafeLadder?.(session.safeLadderInitialType === 'fixed' ? 'percent' : 'fixed', session.safeLadderInitialValue ?? 5)}
                className="text-[9px] font-bold text-amber-600 uppercase hover:underline"
              >
                {session.safeLadderInitialType === 'fixed' ? 'Фикс:' : '%:'}
              </button>
              <input 
                type="number" 
                value={session.safeLadderInitialValue ?? 5}
                onChange={(e) => onUpdateSafeLadder?.(session.safeLadderInitialType || 'percent', parseFloat(e.target.value) || 0)}
                className="w-12 bg-amber-50 border-none rounded-lg px-2 py-1 text-xs text-amber-700 font-bold text-center"
              />
              <div className="px-2 py-1 bg-amber-100/50 rounded-full text-amber-700 text-[10px] font-black uppercase tracking-widest ml-1">
                Шаг {session.currentLadderStep}
              </div>
            </div>
          ) : (
            <div className="px-3 py-1 bg-amber-100/50 rounded-full text-amber-700 text-[10px] font-black uppercase tracking-widest">
              Шаг {session.currentLadderStep}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <input 
            type="number" 
            step="0.01"
            placeholder="Коэффициент"
            value={odds}
            onChange={e => setOdds(e.target.value)}
            className="w-full bg-white border border-amber-100 rounded-2xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500/10 text-lg text-amber-900 font-medium"
          />
          <input 
            type="text" 
            placeholder="Событие / Заметка"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-white/50 border border-gray-100 rounded-xl px-4 py-2 focus:outline-none text-xs text-amber-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleAction('loss')} className="py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 border border-red-100 transition-all active:scale-95">Мимо</button>
          <button onClick={() => handleAction('win')} className="py-4 bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg transition-all active:scale-95">Зашло</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
        <div className="flex items-center justify-between mb-3 text-gray-300">
          <span className="text-[10px] font-bold uppercase tracking-widest">История</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">{session.history.length} записей</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4 pb-4">
          {session.history.map((bet, index) => {
             const isAdj = bet.type === 'adjustment';
             const isEnd = bet.isSequenceEnd;
             
             let cardStyle = 'border-gray-50 bg-white/30';
             if (isAdj) cardStyle = 'border-sky-100 bg-sky-50/30';
             else if (isEnd) cardStyle = bet.outcome === 'win' ? 'border-amber-300 bg-amber-50/30' : 'border-red-200 bg-red-50/20';
             
             const betReturn = bet.outcome === 'win' ? (bet.amount + bet.potentialProfit) : 0;

             return (
              <React.Fragment key={bet.id}>
                <div className={`flex flex-col p-4 rounded-2xl border relative transition-all ${cardStyle}`}>
                  {isEnd && !isAdj && (
                    <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shadow-sm ${bet.outcome === 'win' ? 'bg-amber-600 text-white' : 'bg-red-500 text-white'}`}>
                      {session.strategyType === StrategyType.SplitScale7 ? 'Цель x6' : 'Завершено'}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[13px] font-bold tabular-nums ${isAdj ? 'text-sky-900' : 'text-amber-900'}`}>{bet.amount.toLocaleString()}₽</span>
                        {!isAdj && (
                          <>
                            <span className="text-[11px] text-gray-400 font-medium">@ {bet.odds.toFixed(2)}</span>
                            <span className="text-gray-300 text-sm">⮕</span>
                            <span className={`text-[13px] font-bold tabular-nums ${bet.outcome === 'win' ? 'text-green-600' : 'text-red-400'}`}>
                              {Math.round(betReturn).toLocaleString()}₽
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {isAdj ? 'Правка' : session.strategyType === StrategyType.OrdinaryFlat ? 'Ординар' : `Шаг ${bet.step}`}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className={`text-[13px] font-black tabular-nums ${isAdj ? 'text-sky-600' : (bet.outcome === 'win' ? 'text-green-600' : 'text-red-500')}`}>
                        {isAdj ? (bet.potentialProfit >= 0 ? `+${bet.potentialProfit}` : bet.potentialProfit) : (bet.outcome === 'win' ? `+${Math.round(bet.potentialProfit)}` : `-${bet.amount}`)}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium mt-0.5 tracking-tighter uppercase">
                        {new Date(bet.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium mt-0.5 tracking-tighter uppercase">
                        Банк: <span className="text-amber-900 font-bold">{(bet.bankAfter || 0).toLocaleString()}₽</span>
                      </div>
                    </div>
                  </div>

                  {/* Блок для заметок - Усилен визуально */}
                  {bet.notes && (
                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-start gap-2">
                      <svg className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                      <p className="text-[11px] text-amber-900/70 italic leading-snug font-medium">
                        {bet.notes}
                      </p>
                    </div>
                  )}
                </div>
                {isEnd && index !== session.history.length - 1 && !isAdj && (
                  <div className="flex items-center gap-2 py-1 opacity-20">
                    <div className="h-[1px] flex-1 bg-amber-900"></div>
                    <span className="text-[8px] font-black text-amber-900 uppercase tracking-widest">Новый цикл</span>
                    <div className="h-[1px] flex-1 bg-amber-900"></div>
                  </div>
                )}
              </React.Fragment>
             );
          })}
          
          {session.history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-12">
               <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p className="text-xs italic font-serif text-center">Ставок пока нет</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
