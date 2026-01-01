
import React, { useState } from 'react';
import { StrategyType, Source } from '../types';
import { STRATEGIES } from '../constants';
import StrategySelector from './StrategySelector';

interface NewSessionModalProps {
  sources: Source[];
  onClose: () => void;
  onCreate: (config: any) => void;
  onAddSource: (name: string) => void;
  onRemoveSource: (id: string) => void;
}

const NewSessionModal: React.FC<NewSessionModalProps> = ({ sources, onClose, onCreate, onAddSource, onRemoveSource }) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [strategy, setStrategy] = useState<StrategyType>(StrategyType.SafeLadder5);
  const [sourceId, setSourceId] = useState(sources[0]?.id || '');
  const [safeLadderInitialType, setSafeLadderInitialType] = useState<'percent' | 'fixed'>('percent');
  const [safeLadderInitialValue, setSafeLadderInitialValue] = useState('5');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bank || !sourceId) return alert('Заполните все поля');
    onCreate({ 
      name, 
      bank: parseFloat(bank), 
      strategy, 
      sourceId,
      safeLadderInitialType,
      safeLadderInitialValue: parseFloat(safeLadderInitialValue)
    });
  };

  const handleAddSourceSubmit = () => {
    if (newSourceName.trim()) {
      onAddSource(newSourceName.trim());
      setNewSourceName('');
      setIsAddingSource(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-amber-900/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif text-amber-900">Новый тест</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Название сессии</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Напр: Лесенка для Иванова"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Начальный банк (₽)</label>
              <input 
                required
                type="number"
                value={bank}
                onChange={e => setBank(e.target.value)}
                placeholder="1000"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 ml-1">Выберите стратегию</label>
              <div className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100">
                <StrategySelector onSelect={(type) => setStrategy(type)} />
              </div>
            </div>
          </div>

          {strategy === StrategyType.SafeLadder5 && (
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-widest">Настройка первой ставки</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setSafeLadderInitialType('percent')}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${safeLadderInitialType === 'percent' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-600 border border-amber-200'}`}
                >
                  Процент от банка
                </button>
                <button 
                  type="button"
                  onClick={() => setSafeLadderInitialType('fixed')}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${safeLadderInitialType === 'fixed' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-600 border border-amber-200'}`}
                >
                  Фикс. сумма
                </button>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  value={safeLadderInitialValue}
                  onChange={e => setSafeLadderInitialValue(e.target.value)}
                  placeholder={safeLadderInitialType === 'percent' ? "5" : "100"}
                  className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-800 font-bold text-xs">
                  {safeLadderInitialType === 'percent' ? '%' : '₽'}
                </span>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-end mb-1 ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Прогнозист / Источник</label>
              {!isAddingSource && (
                <button type="button" onClick={() => setIsAddingSource(true)} className="text-[10px] text-amber-600 hover:underline">
                  + Добавить нового
                </button>
              )}
            </div>
            
            {isAddingSource ? (
              <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                <input 
                  autoFocus
                  value={newSourceName}
                  onChange={e => setNewSourceName(e.target.value)}
                  placeholder="Имя каппера"
                  className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
                />
                <button type="button" onClick={handleAddSourceSubmit} className="bg-amber-600 text-white px-4 rounded-xl text-xs font-bold">Ок</button>
                <button type="button" onClick={() => setIsAddingSource(false)} className="text-gray-400 px-2 text-xl">×</button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative group">
                  <select 
                    value={sourceId}
                    onChange={e => setSourceId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm pr-10"
                  >
                    <option value="" disabled>Выберите из списка...</option>
                    {sources.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                {/* Список для удаления источников */}
                {sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sources.map(s => (
                      <div key={s.id} className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
                        <span className="text-[10px] text-amber-800 font-medium">{s.name}</span>
                        <button 
                          type="button"
                          onClick={() => onRemoveSource(s.id)}
                          className="text-amber-400 hover:text-red-500 transition-colors"
                          title="Удалить источник"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-amber-900/10 transition-all mt-4"
          >
            Создать сессию тестирования
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewSessionModal;
