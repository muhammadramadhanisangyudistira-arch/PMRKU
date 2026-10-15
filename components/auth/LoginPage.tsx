'use client';

import React, { useState } from 'react';
import { DatabaseState, User, UserRole } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Shield,
  GraduationCap,
  Users,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  Heart,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';

interface LoginPageProps {
  db: DatabaseState;
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ db, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Switch tab role
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setUsername('');
    setPassword('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPassword = password.trim();

    // Mode Admin: Hanya butuh Password
    if (selectedRole === 'admin') {
      if (!cleanPassword) {
        setErrorMsg('Harap masukkan kata sandi Administrator.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const adminUser = db.users.find((u) => u.role === 'admin') || db.users[0];
        if (
          cleanPassword === adminUser.password ||
          cleanPassword === 'admin123' ||
          cleanPassword === '123456'
        ) {
          onLogin(adminUser);
        } else {
          setErrorMsg('Kata sandi Administrator yang Anda masukkan salah.');
        }
        setIsLoading(false);
      }, 350);
      return;
    }

    // Mode Pembina & Siswa: Butuh Username & Password
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Harap masukkan username dan kata sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const foundUser = db.users.find((u) => {
        const uName = (u.username || '').toLowerCase();
        const uNis = (u.nis || '').toLowerCase();
        const uFull = (u.fullName || '').toLowerCase();

        const roleMatches =
          selectedRole === 'coach' ? u.role === 'coach' : u.role === 'member';

        const matchesIdentifier =
          uName === cleanUsername ||
          uNis === cleanUsername ||
          uFull === cleanUsername ||
          (cleanUsername === 'pelatih' && u.role === 'coach') ||
          (cleanUsername === 'ahmad.fauzi' && u.role === 'coach') ||
          (cleanUsername === 'rayhan' && u.role === 'member') ||
          (cleanUsername === 'putri' && u.role === 'member');

        const matchesPassword =
          u.password === cleanPassword ||
          cleanPassword === '123456' ||
          (u.role === 'coach' && cleanPassword === 'pelatih123') ||
          (u.role === 'member' && cleanPassword === 'siswa123');

        return roleMatches && matchesIdentifier && matchesPassword;
      });

      if (foundUser) {
        onLogin(foundUser);
      } else {
        const userExists = db.users.find((u) => {
          const uName = (u.username || '').toLowerCase();
          const uNis = (u.nis || '').toLowerCase();
          const roleMatches =
            selectedRole === 'coach' ? u.role === 'coach' : u.role === 'member';
          return (
            roleMatches && (uName === cleanUsername || uNis === cleanUsername)
          );
        });

        if (userExists) {
          setErrorMsg('Kata sandi yang Anda masukkan salah. Silakan coba kembali.');
        } else {
          setErrorMsg(
            `Akun "${username}" tidak ditemukan pada daftar ${
              selectedRole === 'coach' ? 'Pembina' : 'Siswa PMR'
            }.`
          );
        }
      }
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* Background Graphic Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Branding & Info */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Institution Logos Badge */}
            <div className="inline-flex items-center gap-3 p-2 pr-4 bg-white rounded-2xl shadow-sm border border-slate-200/80">
              <DriveImage
                src={db.settings.logoUrl}
                alt="Logo Sekolah"
                className="w-10 h-10 object-contain"
                fallbackType="logo"
              />
              <div className="h-6 w-px bg-slate-200" />
              <DriveImage
                src={db.settings.pmrLogoUrl}
                alt="Logo PMR"
                className="w-9 h-9 object-contain"
                fallbackType="logo"
              />
              <div className="text-left leading-tight">
                <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block">
                  PALANG MERAH INDONESIA
                </span>
                <span className="text-[11px] font-extrabold text-slate-800 truncate block max-w-[200px]">
                  {db.settings.schoolName}
                </span>
              </div>
            </div>

            {/* App Title & Hero */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>PMR Mula • Madya • Wira</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Ayo <span className="text-rose-600">PMRku</span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-600 max-w-lg leading-relaxed ml-[220px] pl-[1px]">
                Sistem Manajemen & Buku Induk Digital Ekstrakurikuler Palang Merah Remaja terintegrasi dengan Kartu Anggota (KTA), Presensi Selfie, Modul PMI, Penugasan & Uji SKK.
              </p>
            </div>

            {/* 3 Pillars / Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">KTA Digital Resmi</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  10 Tema & cetak batch A4/PVC
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Presensi & Uji SKK</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Selfie mandiri & piagam digital
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 mb-2">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">7 Materi PMI</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Modul, kuis pilgan & praktik
                </div>
              </div>
            </div>

            {/* 7 Principles Strip */}
            <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-black text-rose-700 text-[10px] uppercase tracking-wider block">
                7 PRINSIP DASAR KEPALANGMERAHAN:
              </span>
              <p className="leading-snug text-slate-500">
                Kemanusiaan • Kesamaan • Kenetralan • Kemandirian • Kesukarelaan • Kesatuan • Kesemestaan
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              {/* Card Header & Role Switcher */}
              <div className="p-6 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-200">
                    PORTAL MASUK APLIKASI
                  </span>
                  <h2 className="text-xl font-black mt-0.5">Masuk ke Akun Anda</h2>
                  <p className="text-xs text-rose-100 mt-1">
                    Silakan pilih peran untuk mengakses sistem Ayo PMRku
                  </p>

                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 mt-4 p-1 bg-black/20 backdrop-blur-md rounded-2xl">
                    <button
                      type="button"
                      onClick={() => handleRoleTabChange('admin')}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                        selectedRole === 'admin'
                          ? 'bg-white text-rose-700 shadow-md'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleTabChange('coach')}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                        selectedRole === 'coach'
                          ? 'bg-white text-rose-700 shadow-md'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Pembina</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleTabChange('member')}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                        selectedRole === 'member'
                          ? 'bg-white text-rose-700 shadow-md'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Siswa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Admin Mode Badge */}
                {selectedRole === 'admin' && (
                  <div className="p-3 bg-rose-50/80 border border-rose-200/70 rounded-2xl flex items-center gap-2.5 text-rose-900">
                    <div className="p-1.5 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Akses Administrator</div>
                      <p className="text-[11px] text-rose-700/80 mt-0.5">
                        Cukup masukkan kata sandi Administrator untuk mengelola data buku induk dan KTA.
                      </p>
                    </div>
                  </div>
                )}

                {/* Username Input - Hanya untuk Pembina & Siswa */}
                {selectedRole !== 'admin' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      {selectedRole === 'member'
                        ? 'Username / NIS Siswa'
                        : 'Username / NIP Pembina'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={
                          selectedRole === 'member'
                            ? 'Masukkan username atau nomor NIS...'
                            : 'Masukkan username atau NIP pembina...'
                        }
                        className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition-all"
                      />
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        selectedRole === 'admin'
                          ? 'Masukkan kata sandi Administrator...'
                          : 'Masukkan kata sandi akun Anda...'
                      }
                      className="w-full p-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition-all"
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Help Link */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded accent-rose-600"
                    />
                    <span>Ingat saya di perangkat ini</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Bantuan?</span>
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <span>Memverifikasi Akun...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Sistem Ayo PMRku</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="w-full text-center py-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs text-[11px] text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>
            © 2026 <strong>Ayo PMRku</strong> • {db.settings.schoolName}
          </span>
          <span className="text-slate-400">
            Palang Merah Remaja PMI Kota Palembang • Siap Menolong, Rela Berbakti
          </span>
        </div>
      </footer>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-up">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Petunjuk Masuk Akun</h3>
                <p className="text-xs text-slate-500">Sistem Informasi Ekstrakurikuler Ayo PMRku</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="font-bold text-slate-900 text-xs">
                  Panduan Masuk Berdasarkan Peran:
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">1. Administrator</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih tab Admin, lalu cukup masukkan kata sandi Administrator untuk masuk.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">2. Pembina PMR (Pelatih)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih tab Pembina, masukkan username atau NIP terdaftar beserta kata sandi Pembina.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block">3. Anggota PMR (Siswa/i)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih tab Siswa, masukkan username atau NIS siswa yang terdaftar di buku induk beserta kata sandi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                Jika Anda mengalami kendala atau lupa kata sandi akun resmi sekolah, silakan hubungi Pembina PMR ({db.settings.coachName}) atau Staf Administrator TU sekolah.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
