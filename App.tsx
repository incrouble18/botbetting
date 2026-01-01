
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Session, StrategyType, Source, Bet } from './types';
import { exportSessionToExcel } from './excelUtils';
import { STRATEGIES } from './constants';
import SessionCard from './components/SessionCard';
import NewSessionModal from './components/NewSessionModal';

const STORAGE_KEY = 'zenbet_parallel_v2';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      sessions: [],
      sources: []
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleAddSource = (name: string) => {
    const newSource: Source = { id: Math.random().toString(36).substr(2, 9), name };
    setState(prev => ({ ...prev, sources: [...prev.sources, newSource] }));
  };

  const handleRemoveSource = (id: string) => {
    if (confirm("Удалить этого прогнозиста? Все привязанные сессии останутся.")) {
      setState(prev => ({ ...prev, sources: prev.sources.filter(s => s.id !== id) }));
    }
  };

  const handleCreateSession = (config: { 
    name: string, 
    bank: number, 
    strategy: StrategyType, 
    sourceId: string,
    safeLadderInitialType?: 'percent' | 'fixed',
    safeLadderInitialValue?: number
  }) => {
    // Для стратегии SplitScale7 банк должен делиться на 6 круглыми суммами
    let initialBank = config.bank;
    if (config.strategy === StrategyType.SplitScale7) {
      const rawUnit = config.bank / 6;
      // Округляем юнит до ближайшего кратного 50 в меньшую сторону
      const roundedUnit = Math.max(50, Math.floor(rawUnit / 50) * 50);
      initialBank = roundedUnit * 6;
    }

    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      name: config.name,
      bank: initialBank,
      initialBank: initialBank,
      strategyType: config.strategy,
      sourceId: config.sourceId,
      currentLadderStep: 1,
      history: [],
      lastScalingBank: initialBank,
      flatPercentage: config.strategy === StrategyType.OrdinaryFlat ? 5 : undefined,
      safeLadderInitialType: config.safeLadderInitialType,
      safeLadderInitialValue: config.safeLadderInitialValue
    };
    setState(prev => ({ 
      ...prev, 
      sessions: [...prev.sessions, newSession].slice(0, 6) 
    }));
    setIsModalOpen(false);
  };

  const handleRemoveSession = (id: string) => {
    if (window.confirm("Вы точно хотите удалить этот тест?")) {
      setState(prev => ({ 
        ...prev, 
        sessions: prev.sessions.filter(s => s.id !== id) 
      }));
    }
  };

  const handleUpdateFlatPercent = (sessionId: string, percent: number) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, flatPercentage: percent } : s)
    }));
  };
  
  const handleUpdateSafeLadder = (sessionId: string, type: 'percent' | 'fixed', value: number) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, safeLadderInitialType: type, safeLadderInitialValue: value } : s)
    }));
  };

  const handleRemoveBet = (sessionId: string, betId: string) => {
    setState(prev => {
      const newSessions = prev.sessions.map(s => {
        if (s.id !== sessionId) return s;
        
        const betIndex = s.history.findIndex(b => b.id === betId);
        if (betIndex === -1) return s;
        
        const betToRemove = s.history[betIndex];
        const newHistory = s.history.filter(b => b.id !== betId);
        
        // Восстанавливаем банк
        let restoredBank = s.bank;
        if (betToRemove.type === 'adjustment') {
          restoredBank -= betToRemove.potentialProfit;
        } else {
          if (betToRemove.outcome === 'win') {
            restoredBank -= betToRemove.potentialProfit;
          } else {
            restoredBank += betToRemove.amount;
          }
        }

        // Восстанавливаем шаг
        // Если удаляем последнюю запись (betIndex === 0), возвращаемся к шагу этой записи
        let restoredStep = s.currentLadderStep;
        if (betIndex === 0) {
          // Если это была обычная ставка (не корректировка), откатываем шаг
          if (betToRemove.type === 'bet' || !betToRemove.type) {
            restoredStep = betToRemove.step;
          }
        }

        return { 
          ...s, 
          bank: Math.max(0, restoredBank), 
          history: newHistory,
          currentLadderStep: restoredStep
        };
      });
      return { ...prev, sessions: newSessions };
    });
  };

  const handleAdjustBank = (sessionId: string, amount: number, note: string) => {
    setState(prev => {
      const newSessions = prev.sessions.map(s => {
        if (s.id !== sessionId) return s;
        const newBank = Math.max(0, s.bank + amount);
        const adjEntry: Bet = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'adjustment',
          amount: Math.abs(amount),
          odds: 1,
          potentialProfit: amount,
          outcome: amount >= 0 ? 'win' : 'loss',
          notes: note || (amount >= 0 ? 'Пополнение' : 'Списание'),
          timestamp: Date.now(),
          strategy: s.strategyType,
          sourceId: s.sourceId,
          step: s.currentLadderStep,
          bankAfter: newBank,
          isSequenceEnd: false
        };
        return { ...s, bank: newBank, history: [adjEntry, ...s.history] };
      });
      return { ...prev, sessions: newSessions };
    });
  };

  const handleAddBet = (sessionId: string, betData: Omit<Bet, 'id' | 'timestamp' | 'step' | 'strategy' | 'sourceId' | 'isSequenceEnd' | 'bankAfter' | 'type'>) => {
    setState(prev => {
      const newSessions = prev.sessions.map(s => {
        if (s.id !== sessionId) return s;

        let newStep = s.currentLadderStep;
        let newBank = s.bank;
        let isSequenceEnd = false;

        if (betData.outcome === 'win') {
          if (s.strategyType === StrategyType.OrdinaryFlat) {
            newStep = 1;
            isSequenceEnd = true;
          } else if (s.strategyType === StrategyType.SafeLadder5) {
            if (newStep >= 3) {
              isSequenceEnd = true;
              newStep = 1;
            } else {
              newStep += 1;
            }
          } else if (s.strategyType === StrategyType.SplitScale7) {
            const initialUnit = s.initialBank / 6;
            // Цель всегда x6 от текущего юнита
            const scalingFactor = Math.floor(Math.log2(s.bank / s.initialBank));
            const currentUnit = initialUnit * Math.pow(2, Math.max(0, scalingFactor));
            const target = currentUnit * 6;
            
            // Завершаем цикл, если сумма после ставки близка к 6-кратному увеличению юнита
            if (betData.amount + betData.potentialProfit >= Math.round(target * 0.98)) {
              isSequenceEnd = true;
              newStep = 1;
            } else {
              newStep += 1;
            }
          }
          newBank += betData.potentialProfit;
        } else {
          newBank -= betData.amount;
          newStep = 1;
          isSequenceEnd = true;
        }

        const newBet: Bet = {
          ...betData,
          type: 'bet',
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          step: s.currentLadderStep,
          strategy: s.strategyType,
          sourceId: s.sourceId,
          isSequenceEnd: isSequenceEnd,
          bankAfter: Math.max(0, newBank)
        };

        return { 
          ...s, 
          history: [newBet, ...s.history], 
          bank: Math.max(0, newBank), 
          currentLadderStep: newStep
        };
      });
      return { ...prev, sessions: newSessions };
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#2d241e] flex flex-col p-4 md:p-8">
      <header className="max-w-[1600px] mx-auto w-full mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-serif italic text-amber-900">ZenBet</h1>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-md">Parallel Mode</span>
          </div>
          <p className="text-amber-600/60 font-medium tracking-widest text-xs uppercase mt-1">Параллельное сравнение стратегий</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={state.sessions.length >= 6}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl ${
              state.sessions.length >= 6 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Добавить сессию
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full relative">
        {state.sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 glass rounded-[3rem] border-dashed border-2 border-amber-200">
             <h2 className="text-2xl font-serif text-amber-900 mb-2">Начните сравнение</h2>
             <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-white border border-amber-200 text-amber-700 rounded-xl font-bold hover:bg-amber-50 mt-4 transition-colors shadow-sm">Создать первую сессию</button>
          </div>
        ) : (
          <div className="relative group/main">
            {/* Стрелки навигации - фиксированные по центру экрана */}
            <button 
              onClick={() => scroll('left')}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/80 backdrop-blur-sm border border-amber-100 rounded-full shadow-2xl text-amber-600 hover:bg-amber-50 hover:scale-110 transition-all hidden xl:block"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <button 
              onClick={() => scroll('right')}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/80 backdrop-blur-sm border border-amber-100 rounded-full shadow-2xl text-amber-600 hover:bg-amber-50 hover:scale-110 transition-all hidden xl:block"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>

            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {state.sessions.map(session => (
                <div key={session.id} className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-start">
                  <SessionCard 
                    session={session} 
                    source={state.sources.find(s => s.id === session.sourceId)}
                    onAddBet={(bet) => handleAddBet(session.id, bet)}
                    onAdjust={(amount, note) => handleAdjustBank(session.id, amount, note)}
                    onUpdateFlat={(p) => handleUpdateFlatPercent(session.id, p)}
                    onUpdateSafeLadder={(type, value) => handleUpdateSafeLadder(session.id, type, value)}
                    onRemoveBet={(betId) => handleRemoveBet(session.id, betId)}
                    onRemove={() => handleRemoveSession(session.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <NewSessionModal 
          sources={state.sources} 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateSession}
          onAddSource={handleAddSource}
          onRemoveSource={handleRemoveSource}
        />
      )}
    </div>
  );
};

export default App;
