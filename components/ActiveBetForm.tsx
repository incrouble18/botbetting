
import React, { useState, useEffect } from 'react';
import { AppState, Bet, StrategyType, StrategyDefinition } from '../types';

interface ActiveBetFormProps {
  state: AppState;
  onAddBet: (bet: Omit<Bet, 'id' | 'timestamp' | 'strategy' | 'step'>) => void;
  strategy: StrategyDefinition;
}

const ActiveBetForm: React.FC<ActiveBetFormProps> = ({ state, onAddBet, strategy }) => {
  const [odds, setOdds] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [matchInfo, setMatchInfo] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let recommended = 0;
    if (state.currentStrategy === StrategyType.SafeLadder5) {
      if (state.currentLadderStep === 1) {
        recommended = state.bank * 0.05;
      } else {
        const lastBet = state.history.find(b => b.strategy === StrategyType.SafeLadder5);
        if (lastBet && lastBet.outcome === 'win') {
          recommended = lastBet.amount + lastBet.potentialProfit;
        } else {
          recommended = state.bank * 0.05;
        }
      }
    } else if (state.currentStrategy === StrategyType.SplitScale7) {
      const initialUnit = state.initialBank / 6;
      const scalingFactor = Math.floor(Math.log2(state.bank / state.initialBank));
      const unit = initialUnit * Math.pow(2, Math.max(0, scalingFactor));
      
      if (state.currentLadderStep === 1) {
        recommended = unit;
      } else {
        const lastBet = state.history.find(b => b.strategy === StrategyType.SplitScale7);
        if (lastBet && lastBet.outcome === 'win') {
          const nextAmount = lastBet.amount + lastBet.potentialProfit;
          const target = Math.round(unit * 6);
          // Если следующая ставка уже достигает или превышает цель x6 (с небольшим допуском), ограничиваем её целью
          recommended = nextAmount >= target * 0.98 ? target : nextAmount;
        } else {
          recommended = unit;
        }
      }
    }
    setAmount(Math.round(recommended));
  }, [state.bank, state.currentLadderStep, state.currentStrategy, state.history, state.initialBank]);

  const handleSubmit = (outcome: 'win' | 'loss') => {
    const numOdds = parseFloat(odds);
    if (!numOdds || numOdds <= 1) return alert('Введите корректный кф (> 1.0)');
    if (amount <= 0) return alert('Сумма ставки должна быть больше 0');

    onAddBet({
      amount,
      odds: numOdds,
      potentialProfit: amount * (numOdds - 1),
      outcome,
      matchInfo,
      notes
    });

    setOdds('');
    setMatchInfo('');
    setNotes('');
  };

  return (
    <div className="glass rounded-3xl p-8 space-y-8 lamp-glow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif text-amber-900">Помощник</h3>
        <div className="px-3 py-1 bg-amber-100 rounded-full border border-amber-200 text-amber-700 text-[10px] font-bold tracking-widest uppercase">
          Шаг {state.currentLadderStep}
        </div>
      </div>

      <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-[10px] text-amber-700/60 mb-1 font-bold uppercase tracking-widest">Рекомендуемая сумма</p>
        <div className="text-3xl font-bold text-amber-600 flex items-center gap-2">
          {amount.toLocaleString()}₽
          <span className="text-[10px] font-normal text-amber-400 italic">(Расчет бота)</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Коэффициент (кф)</label>
          <input 
            type="number" 
            step="0.01"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            placeholder="Например, 1.35"
            className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-amber-900"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Матч / Событие</label>
          <input 
            type="text" 
            value={matchInfo}
            onChange={(e) => setMatchInfo(e.target.value)}
            placeholder="Кто с кем играет?"
            className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-amber-900"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Заметки для себя</label>
          <textarea 
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Мысли по сделке..."
            className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-amber-900 resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <button 
          onClick={() => handleSubmit('loss')}
          className="bg-red-50 border border-red-100 hover:bg-red-100 text-red-500 font-bold py-4 rounded-2xl transition-all"
        >
          Проигрыш
        </button>
        <button 
          onClick={() => handleSubmit('win')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-900/10 transition-all"
        >
          Победа
        </button>
      </div>

      <div className="pt-4 border-t border-amber-100">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Правила шага</h4>
        <div className="space-y-2">
           {strategy.rules.map((r, i) => (
             <div key={i} className={`flex gap-3 text-xs leading-relaxed ${state.currentLadderStep === r.step ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}>
               <span className="opacity-30">{r.step}.</span>
               {r.action}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveBetForm;
