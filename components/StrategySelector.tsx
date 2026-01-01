
import React, { useState } from 'react';
import { StrategyType } from '../types';
import { STRATEGIES } from '../constants';

interface StrategySelectorProps {
  onSelect: (type: StrategyType) => void;
}

const StrategySelector: React.FC<StrategySelectorProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<StrategyType | null>(null);

  const strategies = Object.keys(STRATEGIES) as StrategyType[];

  return (
    <div className="max-w-6xl mx-auto relative group">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        {strategies.map((key) => {
          const s = STRATEGIES[key];
          const isSelected = selected === key;
          
          return (
            <div 
              key={key}
              className={`group relative glass rounded-2xl p-4 cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-amber-500 shadow-lg bg-white' : 'hover:bg-white/80 border border-gray-100'}`}
              onClick={() => setSelected(key)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  {key === StrategyType.SafeLadder5 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  )}
                </div>
                {isSelected && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[8px] font-bold uppercase tracking-widest">Выбрано</span>
                )}
              </div>
              
              <h3 className="text-lg font-serif text-amber-900 mb-1">{s.name}</h3>
              <p className="text-gray-500 leading-tight mb-3 h-10 line-clamp-2 text-[11px]">{s.shortDescription}</p>
              
              <div className="space-y-1.5 mb-4">
                {s.rules.slice(0, 2).map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="w-1 h-1 rounded-full bg-amber-300 flex-shrink-0"></span>
                    <span className="truncate">{rule.action}</span>
                  </div>
                ))}
              </div>

              {isSelected && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                    <p className="text-[10px] text-amber-900/80 leading-snug italic">"{s.fullDescription}"</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(key);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-md"
                  >
                    Выбрать
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
