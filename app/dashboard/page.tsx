'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { getUser, logout } from '../../lib/auth';
import { Board } from '../../types';
import { useToast } from '../../lib/toast';

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api.get<Board[]>('/boards')
      .then((res) => setBoards(res.data))
      .finally(() => setLoading(false));
  }, []);

  const createBoard = async () => {
    if (!title.trim()) return;
    const res = await api.post<Board>('/boards', { title });
    setBoards([...boards, res.data]);
    setTitle('');
  };

  const deleteBoard = async (id: string) => {
    if (!confirm('Bu boardu silmek istediğine emin misin?')) return;
    await api.delete(`/boards/${id}`);
    setBoards(boards.filter((b) => b._id !== id));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    showToast('Hesaptan Çıkış Yapıldı', 'info');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Boardlarım</h1>
            <p className="text-slate-500 text-sm mt-1">Hoş geldin, <span className="font-medium text-slate-700">{user?.name}</span> 👋</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-4 py-2 rounded-xl transition-all duration-200"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Yeni board */}
        <div className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="Yeni proje veya board adı..."
            className="border border-slate-200 bg-white p-4 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createBoard()}
          />
          <button
            onClick={createBoard}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all font-medium active:scale-[0.98]"
          >
            + Oluştur
          </button>
        </div>

        {/* Board listesi */}
        {boards.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl">
            <p className="text-5xl mb-4 opacity-50">📋</p>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Henüz board yok</h3>
            <p className="text-slate-500">Yukarıdaki alandan ilk boardunu hemen oluştur!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div key={board._id} className="relative group">
                <Link href={`/board/${board._id}`}>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
                    <h2 className="text-lg font-bold text-slate-800 line-clamp-2">{board.title}</h2>
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {new Date(board.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                      <span className="text-indigo-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                        Git <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => deleteBoard(board._id)}
                  className="absolute -top-3 -right-3 bg-white text-slate-400 hover:text-white hover:bg-red-500 shadow-sm border border-slate-200 hover:border-red-500 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  title="Board'u Sil"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}