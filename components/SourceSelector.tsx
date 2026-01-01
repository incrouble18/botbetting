
import React, { useState } from 'react';
import { Source } from '../types';

interface SourceSelectorProps {
  sources: Source[];
  currentSourceId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
}

const SourceSelector: React.FC<SourceSelectorProps> = ({ sources, currentSourceId, onSelect, onAdd }) => {
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="glass p-6 rounded-3xl space-y-6">
      <h2 className="text-xl font-serif text-amber-900 flex items-center gap-3">
        <span className="w-8 h-[1px] bg-amber-200"></span>
        1. Выберите источник
      </h2>
      
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {sources.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
              currentSourceId === s.id 
                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-900/10' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.name}</span>
              {currentSourceId === s.id && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              )}
            </div>
          </button>
        ))}
        
        {sources.length === 0 && !isAdding && (
          <p className="text-xs text-gray-400 italic text-center py-4">Нет добавленных источников</p>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Название (канал, каппер...)"
            className="w-full bg-white border border-amber-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm text-amber-900 mb-2"
          />
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="flex-1 px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 text-xs bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
            >
              Добавить
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-amber-100 rounded-xl text-amber-600/60 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all text-xs font-bold uppercase tracking-widest"
        >
          + Новый прогнозист
        </button>
      )}
    </div>
  );
};

export default SourceSelector;
