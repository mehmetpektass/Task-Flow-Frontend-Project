'use client';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card } from '../types';
import KanbanCard from './KanbanCard';

interface ColumnProps {
  column: ColumnType;
  cards: Card[];
  onAddCard: (columnId: string, title: string) => void;
  onCardClick: (card: Card) => void;
  onDeleteColumn: (columnId: string) => void;
}

export default function Column({ column, cards, onAddCard, onCardClick, onDeleteColumn }: ColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: column._id });

  const handleAdd = () => {
    if (!newCardTitle.trim()) return;
    onAddCard(column._id, newCardTitle);
    setNewCardTitle('');
    setAdding(false);
  };

  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] bg-slate-100/80 border border-slate-200/60 rounded-2xl p-3 flex flex-col shadow-sm"
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Başlık */}
      <div className="flex justify-between items-center mb-3 px-1 flex-shrink-0">
        <h3 className="font-semibold text-slate-700 text-sm truncate max-w-[160px]">
          {column.title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {cards.length}
          </span>
          <button
            onClick={() => onDeleteColumn(column._id)}
            className="text-slate-400 hover:text-red-500 transition text-sm w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Kartlar — scroll buradan */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto space-y-2 rounded-xl p-1 transition-colors min-h-[60px]
          ${isOver ? 'bg-indigo-50/80 ring-2 ring-indigo-200' : ''}`}
      >
        <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card._id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      {/* Kart ekleme */}
      <div className="flex-shrink-0 mt-2">
        {adding ? (
          <>
            <textarea
              autoFocus
              rows={2}
              placeholder="Kart başlığı..."
              className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
                if (e.key === 'Escape') setAdding(false);
              }}
            />
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={handleAdd}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition font-medium"
              >
                Ekle
              </button>
              <button
                onClick={() => setAdding(false)}
                className="text-slate-500 text-sm hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-200 transition"
              >
                İptal
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-slate-500 hover:text-slate-800 text-sm text-left hover:bg-slate-200/70 p-2 rounded-xl transition w-full flex items-center gap-1.5"
          >
            <span>+</span> Kart ekle
          </button>
        )}
      </div>
    </div>
  );
}