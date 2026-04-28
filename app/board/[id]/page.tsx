'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import api from '../../../lib/api';
import { getUser } from '../../../lib/auth';
import { Board, Column as ColumnType, Card } from '../../../types';
import Column from '../../../components/Column';
import KanbanCard from '../../../components/KanbanCard';
import CardModal from '../../../components/CardModal';

interface BoardData {
  board: Board;
  columns: ColumnType[];
  cards: Card[];
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [newColTitle, setNewColTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!getUser()) {
      router.push('/login');
      return;
    }
    api.get<BoardData>(`/boards/${id}`)
      .then((res) => {
        setBoard(res.data.board);
        setColumns(res.data.columns);
        setCards(res.data.cards);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c._id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedCard = cards.find((c) => c._id === active.id);
    if (!draggedCard) return;

    const overCard = cards.find((c) => c._id === over.id);
    const overColumn = columns.find((c) => c._id === over.id);

    const targetColumnId = overCard ? overCard.column : overColumn?._id;
    if (!targetColumnId) return;

    if (draggedCard.column !== targetColumnId) {
      setCards((prev) =>
        prev.map((c) =>
          c._id === draggedCard._id ? { ...c, column: targetColumnId } : c
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const draggedCard = cards.find((c) => c._id === active.id);
    if (!draggedCard) return;

    const overCard = cards.find((c) => c._id === over.id);
    const overColumn = columns.find((c) => c._id === over.id);

    let newColumnId = draggedCard.column;
    let newOrder: number;

    if (overColumn) {
      newColumnId = overColumn._id;
      const colCards = cards
        .filter((c) => c.column === overColumn._id && c._id !== draggedCard._id)
        .sort((a, b) => a.order - b.order);
      newOrder = colCards.length > 0
        ? Math.max(...colCards.map((c) => c.order)) + 1
        : 1;
    } else if (overCard && overCard._id !== draggedCard._id) {
      newColumnId = overCard.column;

      const colCards = cards
        .filter((c) => c.column === overCard.column)
        .sort((a, b) => a.order - b.order);

      const activeIndex = colCards.findIndex((c) => c._id === draggedCard._id);
      const overIndex = colCards.findIndex((c) => c._id === overCard._id);

      const isMovingDown = activeIndex !== -1 && activeIndex < overIndex;

      if (isMovingDown) {
        const nextCard = colCards[overIndex + 1];
        if (!nextCard) {
          newOrder = overCard.order + 0.5;
        } else {
          newOrder = (overCard.order + nextCard.order) / 2;
        }
      } else {
        const prevCard = colCards[overIndex - 1];
        if (!prevCard) {
          newOrder = overCard.order - 0.5;
        } else {
          newOrder = (prevCard.order + overCard.order) / 2;
        }
      }
    } else {
      return; 
    }

    const previousCards = [...cards];

    setCards((prev) =>
      prev.map((c) =>
        c._id === draggedCard._id
          ? { ...c, column: newColumnId, order: newOrder }
          : c
      )
    );

    try {
      await api.patch(`/cards/${draggedCard._id}`, {
        column: newColumnId,
        order: newOrder,
      });
    } catch {
      setCards(previousCards);
    }
  };

  const addColumn = async () => {
    if (!newColTitle.trim()) return;
    const res = await api.post<ColumnType>('/columns', { title: newColTitle, boardId: id });
    setColumns([...columns, res.data]);
    setNewColTitle('');
  };

  const addCard = async (columnId: string, title: string) => {
    const res = await api.post<Card>('/cards', { title, columnId, boardId: id });
    setCards([...cards, res.data]);
  };

  const updateCard = async (cardId: string, data: Partial<Card>) => {
    const res = await api.patch<Card>(`/cards/${cardId}`, data);
    setCards((prev) => prev.map((c) => (c._id === cardId ? res.data : c)));
    setSelectedCard(res.data);
  };

  const deleteCard = async (cardId: string) => {
    await api.delete(`/cards/${cardId}`);
    setCards((prev) => prev.filter((c) => c._id !== cardId));
    setSelectedCard(null);
  };

  const deleteColumn = async (columnId: string) => {
    await api.delete(`/columns/${columnId}`);
    setColumns((prev) => prev.filter((c) => c._id !== columnId));
    setCards((prev) => prev.filter((c) => c.column !== columnId));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Board yükleniyor...</p>
      </div>
    </div>
  );

  if (!board) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <p className="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-100">Board bulunamadı.</p>
    </div>
  );

  return (
  <div className="flex flex-col bg-slate-50" style={{ height: '100dvh', overflow: 'hidden' }}>
    {/* Header */}
    <div className="flex-none px-4 md:px-6 lg:px-8 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all bg-white w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium"
        >
          <span>←</span>
          <span className="hidden md:inline ml-2">Geri</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight truncate">
          {board.title}
        </h1>
      </div>
    </div>

    {/* Kanban Alan */}
    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar min-w-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-nowrap gap-4 items-start px-4 md:px-6 lg:px-8 py-6" style={{ minWidth: 'max-content', height: '100%' }}>
          {columns.map((col) => {
            const colCards = cards
              .filter((c) => c.column === col._id)
              .sort((a, b) => a.order - b.order);
            return (
              <Column
                key={col._id}
                column={col}
                cards={colCards}
                onAddCard={addCard}
                onCardClick={setSelectedCard}
                onDeleteColumn={deleteColumn}
              />
            );
          })}

          <div className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]">
            <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-3">
              <input
                type="text"
                placeholder="Kolon adı..."
                className="w-full bg-white p-2.5 rounded-xl border border-slate-200 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addColumn()}
              />
              <button
                onClick={addColumn}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                + Kolon Ekle
              </button>
            </div>
          </div>
          <div className="w-4 flex-shrink-0" />
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="bg-white p-4 rounded-xl shadow-2xl ring-2 ring-indigo-400 opacity-95 w-[280px] rotate-2 cursor-grabbing">
              <p className="font-semibold text-sm text-slate-800">{activeCard.title}</p>
              {activeCard.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{activeCard.description}</p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>

    {selectedCard && (
      <CardModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdate={updateCard}
        onDelete={deleteCard}
      />
    )}
  </div>
);
}