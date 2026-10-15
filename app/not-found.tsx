import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center shadow-xl shadow-rose-600/30 mb-4">
        <span className="text-2xl font-black">404</span>
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        Halaman yang Anda cari tidak tersedia atau rute telah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
      >
        Kembali ke Halaman Utama
      </Link>
    </div>
  );
}
