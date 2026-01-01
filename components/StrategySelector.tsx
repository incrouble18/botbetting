
import React, { useState } from 'react';
import { StrategyType } from '../types';
import { STRATEGIES } from '../constants';

interface StrategySelectorProps {
  onSelect: (type: StrategyType) => void;
}

const StrategySelector: React.FC<StrategySelectorProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<StrategyType | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const strategies = Object.keys(STRATEGIES) as StrategyType[];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : strategies.length - 1;
    setCurrentIndex(newIndex);
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: newIndex * clientWidth, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    const newIndex = currentIndex < strategies.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: newIndex * clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative group">
      {/* Стрелки навигации */}
      <button 
        type="button"
        onClick={handlePrev}
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 p-4 bg-white border border-amber-100 rounded-full shadow-2xl text-amber-600 hover:bg-amber-50 hover:scale-110 transition-all flex items-center justify-center group/btn"
      >
        <svg className="w-8 h-8 group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <button 
        type="button"
        onClick={handleNext}
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 p-4 bg-white border border-amber-100 rounded-full shadow-2xl text-amber-600 hover:bg-amber-50 hover:scale-110 transition-all flex items-center justify-center group/btn"
      >
        <svg className="w-8 h-8 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
      </button>

      <div 
        ref={scrollRef}
        className="flex overflow-x-hidden gap-8 pb-8 snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {strategies.map((key) => {
          const s = STRATEGIES[key];
          const isSelected = selected === key;
          
          return (
            <div 
              key={key}
              className={`min-w-full snap-start group relative glass rounded-3xl p-8 cursor-pointer transition-all duration-500 ${isSelected ? 'ring-2 ring-amber-500 shadow-xl shadow-amber-900/5 bg-white' : 'hover:bg-white/80'}`}
              onClick={() => setSelected(key)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  {key === StrategyType.SafeLadder5 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  )}
                </div>
                {isSelected && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Выбрано</span>
                )}
              </div>
              
              <h3 className="text-2xl font-serif text-amber-900 mb-3">{s.name}</h3>
              <p className="text-gray-500 leading-relaxed mb-6 h-12 line-clamp-2 text-sm">{s.shortDescription}</p>
              
              <div className="space-y-3 mb-8">
                {s.rules.slice(0, 3).map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                    {rule.action}
                  </div>
                ))}
              </div>

              {isSelected && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
                    <h4 className="text-amber-700 font-bold text-[10px] uppercase mb-3 tracking-widest">Суть стратегии</h4>
                    <p className="text-sm text-amber-900/80 leading-relaxed italic">"{s.fullDescription}"</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(key);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-900/10"
                  >
                    Подтвердить и начать
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategySelector;
