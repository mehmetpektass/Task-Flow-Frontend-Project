'use client';
import { useState } from 'react';
import { Card } from '../types';
import { useToast } from '../lib/toast';

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: (cardId: string, data: Partial<Card>) => void;
  onDelete: (cardId: string) => void;
}

export default function CardModal({ card, onClose, onUpdate, onDelete }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(card._id, { title, description });
    setSaving(false);
    setSaved(true);
    showToast('Kart başarıyla güncellendi', 'success');
    setTimeout(() => onClose(), 1000); 
  };

  const handleDelete = () => {
    if (confirm('Bu kartı kalıcı olarak silmek istediğine emin misin?')) {
      onDelete(card._id);
      showToast('Kart silindi', 'error');
    }
  };

  return (
    <>
      {/* Toast bildirimi */}
      {saved && (
        <div className="fixed top-5 right-5 z-[100] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-xl shadow-emerald-200 font-medium animate-fade-in flex items-center gap-2">
          <span>✓</span> Kaydedildi
        </div>
      )}

      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/5 w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Kartı Düzenle</h2>
            <button 
              onClick={onClose} 
              className="bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Başlık</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Açıklama</label>
              <textarea
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-700 leading-relaxed placeholder:text-slate-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu görev hakkında daha fazla detay ekle..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={handleDelete} 
              className="text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              🗑 Kartı Sil
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-70 transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                {saving ? 'Kaydediliyor...' : saved ? '✓ Kaydedildi' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}