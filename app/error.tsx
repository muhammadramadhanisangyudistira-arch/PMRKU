'use client';

import React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center shadow-xl shadow-amber-600/30 mb-4">
        <span className="text-2xl font-black">!</span>
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2">Terjadi Kendala</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        {error?.message || 'Terjadi kesalahan sistem yang tidak terduga.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
      >
        Muat Ulang
      </button>
    </div>
  );
}
