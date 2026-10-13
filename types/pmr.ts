export type UserRole = 'admin' | 'coach' | 'member';

export type PMRLevel = 'mula' | 'madya' | 'wira';

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  username: string;
  password?: string;
  className: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  phone: string;
  address: string;
  photoUrl: string;
  positionOrLevel: string; // e.g., 'PMR Mula', 'Pembina Utama', 'Pelatih Teknis'
  nis: string;
  emergencyContact?: string;
  joinedDate: string;
}

export interface SchoolSettings {
  schoolName: string;
  unitName: string; // e.g. "PMR Unit 012"
  schoolLevel: PMRLevel;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  principalNip: string;
  coachName: string;
  coachNip: string;
  logoUrl: string;
  pmrLogoUrl: string;
  signatureStampUrl: string;
}

export interface AttendanceSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'Rutin' | 'Khusus' | 'Latsar';
  qrSecret: string;
  isActive: boolean;
  notes: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
  date: string;
  time: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  type: 'Checklist' | 'QR Code' | 'Selfie Mandiri';
  selfieUrl?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  category: 
    | 'Gerakan Kepalangmerahan'
    | 'Pertolongan Pertama'
    | 'Perawatan Keluarga'
    | 'Remaja Sehat Peduli Sesama'
    | 'Donor Darah'
    | 'Kesiapsiagaan Bencana'
    | 'Kepemimpinan';
  content: string;
  fileUrl?: string;
  fileName?: string;
  author: string;
  uploadDate: string;
  summary: string;
  images?: string[];
}

export type AssignmentType = 'pilgan' | 'praktik';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[]; // [Opsi A, Opsi B, Opsi C, Opsi D]
  correctOptionIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation?: string;
}

export interface Assignment {
  id: string;
  title: string;
  category: string;
  type: AssignmentType; // 'pilgan' (Pilihan Ganda) | 'praktik' (Tugas Lapangan)
  description: string;
  deadline: string; // YYYY-MM-DD HH:mm
  createdBy: string;
  createdDate: string;
  // Khusus Pilihan Ganda
  questions?: QuizQuestion[];
  passingScore?: number;
  // Khusus Praktik Lapangan
  practicalInstructions?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  userId: string;
  studentName: string;
  score: number | null;
  feedback: string;
  submittedDate: string;
  fileUrl: string;
  fileName?: string;
  notes: string;
  status: 'Pending' | 'Dinilai' | 'Revisi';
  // Khusus hasil pengerjaan kuis pilgan
  answers?: Record<string, number>; // questionId -> chosen option index
  totalQuestions?: number;
  correctCount?: number;
}

export interface SkillRequirement {
  id: string;
  name: string;
  level: PMRLevel | 'Semua';
  category: string;
  description: string;
  standards: string[];
  badgeIcon: string;
  badgeColor: string;
}

export interface SkillRequest {
  id: string;
  userId: string;
  studentName: string;
  requirementId: string;
  requirementName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  score: number | null;
  examinerNotes: string;
  requestedDate: string;
  validatedBy?: string;
  proofFileUrl: string;
  reportText: string;
}

export interface DatabaseState {
  users: User[];
  settings: SchoolSettings;
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  modules: LearningModule[];
  assignments: Assignment[];
  submissions: Submission[];
  skillRequirements: SkillRequirement[];
  skillRequests: SkillRequest[];
}
