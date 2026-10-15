'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseState, User, UserRole } from '@/types/pmr';
import { INITIAL_DATABASE } from '@/lib/initial-data';
import {
  getStoredDatabase,
  saveDatabase,
  getCurrentUser,
  setCurrentUser,
  logoutUser,
} from '@/lib/storage';
import {
  fetchDatabaseFromSupabase,
  syncDatabaseToSupabase,
  getSupabaseConfig,
} from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

// Admin Components
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { MemberManagement } from '@/components/admin/MemberManagement';
import { CoachManagement } from '@/components/admin/CoachManagement';
import { SkillManagementTab } from '@/components/admin/SkillManagementTab';
import { SchoolSettingsTab } from '@/components/admin/SchoolSettingsTab';
import { BackupRestoreTab } from '@/components/admin/BackupRestoreTab';
import { IDCardPreview } from '@/components/idcard/IDCardPreview';
import { IDCardPrintBatch } from '@/components/idcard/IDCardPrintBatch';
import { IDCardWorkspace } from '@/components/idcard/IDCardWorkspace';

// Auth Component
import { LoginPage } from '@/components/auth/LoginPage';

// Coach Components
import { CoachDashboard } from '@/components/coach/CoachDashboard';
import { AttendanceManager } from '@/components/coach/AttendanceManager';
import { ModuleManager } from '@/components/coach/ModuleManager';
import { AssignmentManager } from '@/components/coach/AssignmentManager';
import { SkillVerification } from '@/components/coach/SkillVerification';
import { WhatsAppNotifier } from '@/components/coach/WhatsAppNotifier';

// Member Components
import { MemberDashboard } from '@/components/member/MemberDashboard';
import { MemberModules } from '@/components/member/MemberModules';
import { MemberAssignments } from '@/components/member/MemberAssignments';
import { MemberSkills } from '@/components/member/MemberSkills';
import { MemberCertificateView } from '@/components/member/MemberCertificateView';
import { SelfieAttendanceModal } from '@/components/member/SelfieAttendanceModal';
import { MemberProfileModal } from '@/components/member/MemberProfileModal';

import { Printer, CreditCard, Sparkles } from 'lucide-react';

export default function AyoPmrkuHome() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [db, setDb] = useState<DatabaseState>(INITIAL_DATABASE);
  const [currentUserState, setCurrentUserState] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedIdCardUser, setSelectedIdCardUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const storedDb = getStoredDatabase();
      setDb(storedDb);

      // Pastikan Halaman Login ditampilkan langsung saat dibuka agar pengguna dapat mencoba dan mengecek tampilan Login
      setCurrentUserState(null);
      logoutUser();

      // Sinkronisasi data dari Supabase jika kunci API telah dipasang di Vercel/Local
      const config = getSupabaseConfig();
      if (config.url && config.anonKey) {
        fetchDatabaseFromSupabase().then((res) => {
          if (res.success && res.data) {
            setDb(res.data);
            saveDatabase(res.data);
          }
        }).catch((err) => {
          console.warn('Supabase initial fetch info:', err);
        });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateDb = (newDb: DatabaseState) => {
    setDb(newDb);
    saveDatabase(newDb);

    // Kirim pembaruan ke Supabase di latar belakang jika online
    const config = getSupabaseConfig();
    if (config.url && config.anonKey) {
      syncDatabaseToSupabase(newDb).catch((err) => {
        console.warn('Supabase background sync info:', err);
      });
    }

    // Update currentUser if modified
    if (currentUserState) {
      const updatedUser = newDb.users.find((u) => u.id === currentUserState.id);
      if (updatedUser) {
        setCurrentUserState(updatedUser);
        setCurrentUser(updatedUser);
      }
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogin = (user: User) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    logoutUser();
    setActiveTab('dashboard');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center shadow-xl shadow-rose-600/30">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-x-2.5 inset-y-0 bg-white rounded-xs"></div>
              <div className="absolute inset-y-2.5 inset-x-0 bg-white rounded-xs"></div>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tight text-white">Ayo PMRku</h1>
            <p className="text-xs text-slate-400 mt-1">
              Sistem Informasi & Buku Induk Digital Palang Merah Remaja
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan Halaman Login jika pengguna belum masuk / memilih keluar
  if (!currentUserState) {
    return <LoginPage db={db} onLogin={handleLogin} />;
  }

  const pendingSkkCount = db.skillRequests.filter((r) => r.status === 'Pending').length;
  const pendingTasksCount = db.submissions.filter((s) => s.status === 'Pending').length;

  const members = db.users.filter((u) => u.role === 'member');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentUser={currentUserState}
        settings={db.settings}
        users={db.users}
        onSwitchUser={handleSwitchUser}
        onOpenBatchPrint={() => setIsBatchPrintOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          role={currentUserState.role}
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            if (tabId === 'selfie_attendance') {
              setIsSelfieModalOpen(true);
            } else {
              setActiveTab(tabId);
            }
          }}
          pendingSkkCount={pendingSkkCount}
          pendingTasksCount={pendingTasksCount}
          schoolName={db.settings.schoolName}
          memberCount={members.length}
          onLogout={handleLogout}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {/* ===================== ADMIN SCREENS ===================== */}
          {currentUserState.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  db={db}
                  onNavigate={(t) => setActiveTab(t)}
                  onOpenBatchPrint={() => setIsBatchPrintOpen(true)}
                />
              )}
              {activeTab === 'members' && (
                <MemberManagement
                  users={db.users}
                  settings={db.settings}
                  onUpdateUsers={(users) => handleUpdateDb({ ...db, users })}
                />
              )}
              {activeTab === 'coaches' && (
                <CoachManagement
                  users={db.users}
                  settings={db.settings}
                  onUpdateUsers={(users) => handleUpdateDb({ ...db, users })}
                />
              )}
              {activeTab === 'idcards' && (
                <IDCardWorkspace db={db} onUpdateDb={handleUpdateDb} />
              )}
              {activeTab === 'skills' && (
                <SkillManagementTab db={db} onUpdateDb={handleUpdateDb} />
              )}
              {activeTab === 'settings' && (
                <SchoolSettingsTab
                  settings={db.settings}
                  onUpdateSettings={(settings) =>
                    handleUpdateDb({ ...db, settings })
                  }
                />
              )}
              {activeTab === 'backup_restore' && (
                <BackupRestoreTab db={db} onUpdateDb={handleUpdateDb} />
              )}
            </>
          )}

          {/* ===================== COACH SCREENS ===================== */}
          {currentUserState.role === 'coach' && (
            <>
              {activeTab === 'dashboard' && (
                <CoachDashboard
                  db={db}
                  currentUser={currentUserState}
                  onNavigate={(t) => setActiveTab(t)}
                />
              )}
              {activeTab === 'attendance' && (
                <AttendanceManager db={db} onUpdateDb={handleUpdateDb} />
              )}
              {activeTab === 'modules' && (
                <ModuleManager db={db} onUpdateDb={handleUpdateDb} />
              )}
              {activeTab === 'assignments' && (
                <AssignmentManager db={db} onUpdateDb={handleUpdateDb} />
              )}
              {activeTab === 'skill_verification' && (
                <SkillVerification
                  db={db}
                  currentUser={currentUserState}
                  onUpdateDb={handleUpdateDb}
                />
              )}
              {activeTab === 'idcards' && (
                <IDCardWorkspace db={db} onUpdateDb={handleUpdateDb} />
              )}
              {activeTab === 'whatsapp' && <WhatsAppNotifier db={db} />}
            </>
          )}

          {/* ===================== MEMBER SCREENS ===================== */}
          {currentUserState.role === 'member' && (
            <>
              {activeTab === 'dashboard' && (
                <MemberDashboard
                  db={db}
                  currentUser={currentUserState}
                  onNavigate={(t) => setActiveTab(t)}
                  onOpenSelfieModal={() => setIsSelfieModalOpen(true)}
                />
              )}
              {activeTab === 'learning_modules' && <MemberModules db={db} />}
              {activeTab === 'my_assignments' && (
                <MemberAssignments
                  db={db}
                  currentUser={currentUserState}
                  onUpdateDb={handleUpdateDb}
                />
              )}
              {activeTab === 'my_skills' && (
                <MemberSkills
                  db={db}
                  currentUser={currentUserState}
                  onUpdateDb={handleUpdateDb}
                />
              )}
              {activeTab === 'my_certificates' && (
                <MemberCertificateView
                  db={db}
                  currentUser={currentUserState}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <IDCardPrintBatch
        users={db.users}
        settings={db.settings}
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
      />

      <SelfieAttendanceModal
        db={db}
        currentUser={currentUserState}
        isOpen={isSelfieModalOpen}
        onClose={() => setIsSelfieModalOpen(false)}
        onSuccess={handleUpdateDb}
      />

      <MemberProfileModal
        user={currentUserState}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={(updated) => {
          const newUsers = db.users.map((u) =>
            u.id === updated.id ? updated : u
          );
          handleUpdateDb({ ...db, users: newUsers });
        }}
      />
    </div>
  );
}
