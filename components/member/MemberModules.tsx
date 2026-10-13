'use client';

import React, { useState } from 'react';
import { DatabaseState, LearningModule } from '@/types/pmr';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { BookOpen, Search, Eye, X, Tag, Image as ImageIcon } from 'lucide-react';

interface MemberModulesProps {
  db: DatabaseState;
}

export const MemberModules: React.FC<MemberModulesProps> = ({ db }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);

  const categories = [
    'all',
    'Gerakan Kepalangmerahan',
    'Pertolongan Pertama',
    'Perawatan Keluarga',
    'Remaja Sehat Peduli Sesama',
    'Donor Darah',
    'Kesiapsiagaan Bencana',
    'Kepemimpinan',
  ];

  const filteredModules = db.modules.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>Modul & Buku Saku Kepalangmerahan</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pelajari 7 materi pokok Palang Merah Indonesia untuk persiapan uji SKK dan praktik di lapangan
          </p>
        </div>
      </div>

      {/* Search & Topic Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi pertolongan pertama, pembalutan, cuci tangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Materi' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  {mod.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {mod.uploadDate}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {mod.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {mod.summary || mod.content.slice(0, 160)}
              </p>

              {mod.images && mod.images.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  <ImageIcon className="w-3 h-3" />
                  <span>{mod.images.length} Gambar Ilustrasi</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 italic">
                Pembina: {mod.author}
              </span>

              <button
                onClick={() => setActiveModule(mod)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Baca Lengkap</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {activeModule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-sky-50 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase">
                  {activeModule.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {activeModule.title}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Oleh: {activeModule.author} • Diunggah {activeModule.uploadDate}
                </span>
              </div>
              <button
                onClick={() => setActiveModule(null)}
                className="p-2 hover:bg-sky-200/50 rounded-xl text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-slate-800">
              <MarkdownRenderer
                content={activeModule.content}
                images={activeModule.images}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
