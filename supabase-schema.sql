-- =============================================================================
-- AYO PMRku: DATABASE SCHEMA & SEED DATA UNTUK SUPABASE (POSTGRESQL)
-- =============================================================================
-- Jalankan skrip ini langsung di "SQL Editor" pada dashboard Supabase Anda.
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PENGATURAN SEKOLAH (school_settings)
CREATE TABLE IF NOT EXISTS public.school_settings (
    id INT PRIMARY KEY DEFAULT 1,
    school_name TEXT NOT NULL DEFAULT 'MTs Marf''uah Palembang',
    unit_name TEXT NOT NULL DEFAULT 'PMR Unit 012 - Pangkalan MTs Marf''uah Palembang',
    school_level TEXT NOT NULL DEFAULT 'madya',
    address TEXT DEFAULT 'Jl. Talang keramat, lrg.kerta, Kota Palembang',
    phone TEXT DEFAULT '08974453505',
    email TEXT DEFAULT 'pmr.mtsmarfuah@gmail.com',
    principal_name TEXT DEFAULT 'RIRIA RABENA, S.H',
    principal_nip TEXT DEFAULT '19740512 200501 1 004',
    coach_name TEXT DEFAULT 'Muhammad Ramadhani, S.Pd',
    coach_nip TEXT DEFAULT '19880921 201503 1 002',
    logo_url TEXT,
    pmr_logo_url TEXT,
    signature_stamp_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- 3. TABEL PENGGUNA (users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'member')),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT 'pmr123',
    class_name TEXT DEFAULT '',
    gender TEXT CHECK (gender IN ('L', 'P')),
    birth_place TEXT DEFAULT '',
    birth_date TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    position_or_level TEXT DEFAULT 'PMR Madya',
    nis TEXT DEFAULT '',
    emergency_contact TEXT DEFAULT '',
    joined_date TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL SESI ABSENSI (attendance_sessions)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Rutin',
    qr_secret TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL REKAP PRESENSI (attendance_records)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alpa')),
    type TEXT NOT NULL CHECK (type IN ('Checklist', 'QR Code', 'Selfie Mandiri')),
    selfie_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL MODUL MATERI PMI (modules)
CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    author TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    summary TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL TUGAS & KUIS (assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pilgan', 'praktik')),
    description TEXT NOT NULL,
    deadline TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_date TEXT NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    passing_score INT DEFAULT 70,
    practical_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL JAWABAN & PENGUMPULAN (submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    score NUMERIC(5,2),
    feedback TEXT DEFAULT '',
    submitted_date TEXT NOT NULL,
    file_url TEXT DEFAULT '',
    file_name TEXT,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dinilai', 'Revisi')),
    answers JSONB DEFAULT '{}'::jsonb,
    total_questions INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL STANDAR SKK PMI (skill_requirements)
CREATE TABLE IF NOT EXISTS public.skill_requirements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    standards JSONB DEFAULT '[]'::jsonb,
    badge_icon TEXT NOT NULL,
    badge_color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABEL PERMOHONAN UJI SKK (skill_requests)
CREATE TABLE IF NOT EXISTS public.skill_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    requirement_id TEXT REFERENCES public.skill_requirements(id) ON DELETE CASCADE,
    requirement_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    score NUMERIC(5,2),
    examiner_notes TEXT DEFAULT '',
    requested_date TEXT NOT NULL,
    validated_by TEXT,
    proof_file_url TEXT DEFAULT '',
    report_text TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- KEBIJAKAN KEAMANAN & AKSES (ROW LEVEL SECURITY / RLS)
-- Memungkinkan akses baca dan tulis menggunakan Supabase Anon Key
-- =============================================================================

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_requests ENABLE ROW LEVEL SECURITY;

-- Buat Permissive Policies untuk Public/Anon Client
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access for school_settings" ON public.school_settings;
    CREATE POLICY "Public access for school_settings" ON public.school_settings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for users" ON public.users;
    CREATE POLICY "Public access for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for attendance_sessions" ON public.attendance_sessions;
    CREATE POLICY "Public access for attendance_sessions" ON public.attendance_sessions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for attendance_records" ON public.attendance_records;
    CREATE POLICY "Public access for attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for modules" ON public.modules;
    CREATE POLICY "Public access for modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for assignments" ON public.assignments;
    CREATE POLICY "Public access for assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for submissions" ON public.submissions;
    CREATE POLICY "Public access for submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for skill_requirements" ON public.skill_requirements;
    CREATE POLICY "Public access for skill_requirements" ON public.skill_requirements FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for skill_requests" ON public.skill_requests;
    CREATE POLICY "Public access for skill_requests" ON public.skill_requests FOR ALL USING (true) WITH CHECK (true);
END $$;

-- =============================================================================
-- DATA AWAL (SEED DATA DEFAULT)
-- =============================================================================

-- Seed School Settings
INSERT INTO public.school_settings (id, school_name, unit_name, school_level, address, phone, email, principal_name, principal_nip, coach_name, coach_nip)
VALUES (
    1,
    'MTs Marf''uah Palembang',
    'PMR Unit 012 - Pangkalan MTs Marf''uah Palembang',
    'madya',
    'Jl. Talang keramat, lrg.kerta, Kota Palembang',
    '08974453505',
    'pmr.mtsmarfuah@gmail.com',
    'RIRIA RABENA, S.H',
    '19740512 200501 1 004',
    'Muhammad Ramadhani, S.Pd',
    '19880921 201503 1 002'
) ON CONFLICT (id) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    unit_name = EXCLUDED.unit_name,
    coach_name = EXCLUDED.coach_name;

-- Seed Default Admin & Pembina
INSERT INTO public.users (id, full_name, role, username, password, class_name, gender, birth_place, birth_date, phone, address, position_or_level, nis, joined_date)
VALUES
    ('USR-001', 'Administrator Utama', 'admin', 'admin', 'admin123', 'Staf TU / Pembina', 'L', 'Palembang', '1985-02-14', '081271122334', 'Jl. Jend. Sudirman Km. 3.5 Palembang', 'Administrator Utama', 'ADM-001', '2022-07-01'),
    ('USR-002', 'Ustadz Ahmad Fauzi, S.Pd.I', 'coach', 'pelatih', 'pelatih123', 'Pembina PMR', 'L', 'Palembang', '1990-08-17', '081367891234', 'Jl. Sukabangun II Palembang', 'Pembina Utama', 'PBN-001', '2022-07-01'),
    ('USR-003', 'Aisyah Putri Azzahra', 'member', 'aisyah', 'siswa123', 'VIII.A', 'P', 'Palembang', '2010-04-12', '085211223344', 'Jl. Kolonel H. Barlian KM 9', 'PMR Madya', '222308001', '2023-07-15')
ON CONFLICT (id) DO NOTHING;

-- Seed 7 Standar SKK PMI
INSERT INTO public.skill_requirements (id, name, level, category, description, badge_icon, badge_color, standards)
VALUES
    ('SKK-01', 'Gerakan Kepalangmerahan', 'Semua', 'Kepalangmerahan', 'Menguasai sejarah Palang Merah, Prinsip Dasar, dan Lambang PMI.', 'Award', '#dc2626', '["Mampu menyebutkan 7 Prinsip Dasar Kepalangmerahan", "Mengetahui sejarah Jean Henry Dunant", "Memahami fungsi dan perlindungan Lambang Palang Merah"]'::jsonb),
    ('SKK-02', 'Pertolongan Pertama (PP)', 'madya', 'Kesehatan Lapangan', 'Mampu melakukan penilaian dini, pembalutan, pembidaian, dan evakuasi korban cedera.', 'HeartPulse', '#b91c1c', '["Penilaian dini penderita (ASNT & CAB)", "Pembalutan luka menggunakan mitella", "Pembidaian patah tulang ekstremitas", "Evakuasi darurat tanpa alat"]'::jsonb),
    ('SKK-03', 'Perawatan Keluarga (PK)', 'madya', 'Kesehatan Keluarga', 'Keterampilan merawat orang sakit di rumah dan kebersihan lingkungan.', 'Home', '#059669', '["Mencuci tangan 6 langkah higienis", "Mengukur suhu tubuh dan denyut nadi", "Menata tempat tidur orang sakit tanpa memindahkan pasien"]'::jsonb),
    ('SKK-04', 'Remaja Sehat Peduli Sesama', 'madya', 'Kesehatan Reproduksi & Gizi', 'Memahami gizi seimbang, sanitasi lingkungan, dan pencegahan penyakit menular.', 'Smile', '#d97706', '["Menyusun menu gizi seimbang untuk remaja", "Kampanye anti-rokok dan napza di sekolah", "Sanitasi dan pemilahan sampah sekolah"]'::jsonb),
    ('SKK-05', 'Kesiapsiagaan Bencana (Ayo Siaga Bencana)', 'Semua', 'Bencana', 'Kesiapsiagaan menghadapi gempa, banjir, dan evakuasi mandiri.', 'ShieldAlert', '#4f46e5', '["Membuat peta denah evakuasi sekolah", "Simulasi tindakan Drop, Cover, Hold On", "Menyiapkan Tas Siaga Bencana (TSB)"]'::jsonb),
    ('SKK-06', 'Donor Darah Sukarela (DDS)', 'madya', 'Darah', 'Edukasi pentingnya donor darah, golongan darah, dan peran PMR dalam promosi DDS.', 'Droplets', '#991b1b', '["Mengetahui 4 golongan darah dan sistem Rhesus", "Syarat menjadi pendonor darah sukarela", "Membantu kampanye donor darah rutin"]'::jsonb),
    ('SKK-07', 'Kepemimpinan & Dinamika Kelompok', 'Semua', 'Organisasi', 'Keterampilan komunikasi, kerjasama tim, dan etika kepemimpinan PMR.', 'Users', '#0891b2', '["Memimpin rapat dan baris-berbaris sederhana", "Menyampaikan pendapat secara santun", "Memecahkan masalah kelompok dengan musyawarah"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
