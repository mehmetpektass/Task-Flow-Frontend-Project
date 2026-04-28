'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../types';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
}

export default function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl select-none group
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Sürükleme alanı */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 rounded-xl cursor-grab active:cursor-grabbing z-10"
      />

      {/* Kart içeriği — click buradan */}
      <div
        onClick={() => !isDragging && onClick()}
        className={`p-4 rounded-xl border transition-all duration-150
          ${isDragging
            ? 'shadow-xl border-indigo-300'
            : 'shadow-sm border-slate-200 hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5'}
        `}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors
          ${isDragging ? 'bg-indigo-400' : 'bg-transparent group-hover:bg-indigo-300'}`}
        />
        <p className="text-[14px] font-semibold text-slate-800 leading-snug">
          {card.title}
        </p>
        {card.description && (
          <div className="mt-2 flex items-start gap-1.5">
            <span className="text-slate-400 text-[10px] mt-0.5">≡</span>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {card.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}