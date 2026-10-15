# 🚀 PANDUAN LENGKAP: SETUP SUPABASE & DEPLOY KE VERCEL (AYO PMRku)

Panduan ini dibuat khusus untuk memandu Anda mengonlinekan database menggunakan **Supabase (PostgreSQL - 100% Gratis tanpa kendala billing)** dan mendeploy web aplikasi **Ayo PMRku (Next.js) ke Vercel (Free Hobby Plan)**.

---

## 📋 DAFTAR ISI
1. [Langkah 1: Setup Database Online di Supabase (Free Tier)](#langkah-1-setup-database-online-di-supabase)
2. [Langkah 2: Menjalankan Skrip Schema SQL di Supabase](#langkah-2-menjalankan-skrip-schema-sql-di-supabase)
3. [Langkah 3: Mengambil Kunci API (URL & Anon Key)](#langkah-3-mengambil-kunci-api-url--anon-key)
4. [Langkah 4: Push Kode ke GitHub](#langkah-4-push-kode-ke-github)
5. [Langkah 5: Deploy ke Vercel (1-Click)](#langkah-5-deploy-ke-vercel)
6. [Tanya Jawab & Troubleshooting](#tanya-jawab--troubleshooting)

---

## 🗄️ LANGKAH 1: Setup Database Online di Supabase

Supabase menyediakan database PostgreSQL cloud gratis tanpa memerlukan kartu kredit/billing wajib.

1. Buka situs [supabase.com](https://supabase.com/) dan klik **Start your project** / **Sign In** (bisa login menggunakan akun GitHub).
2. Di dashboard, klik tombol **New Project**.
3. Isi informasi project:
   - **Name**: `ayo-pmrku-db` (atau nama sekolah Anda)
   - **Database Password**: Buat password yang kuat dan catat.
   - **Region**: Pilih yang terdekat, misalnya **Singapore (ap-southeast-1)** agar akses dari Indonesia sangat cepat.
   - **Pricing Plan**: Pilih **Free Plan ($0/month)**.
4. Klik **Create new project** dan tunggu sekitar 1-2 menit hingga status database menjadi *Active*.

---

## ⚡ LANGKAH 2: Menjalankan Skrip Schema SQL di Supabase

Aplikasi telah dilengkapi dengan file `supabase-schema.sql` yang siap pakai, mencakup seluruh tabel (sekolah, pengguna/anggota, presensi selfie, modul materi, kuis & tugas, serta uji SKK) beserta data awal 31 anggota PMR:

1. Di dashboard project Supabase Anda, klik menu **SQL Editor** (ikon terminal/SQL `>_` di bilah kiri).
2. Klik tombol **New Query**.
3. Buka file **`supabase-schema.sql`** yang ada di folder utama aplikasi ini, salin (**Copy**) seluruh isinya.
4. Tempel (**Paste**) kode SQL tersebut ke dalam editor query Supabase.
5. Klik tombol hijau **Run** (atau tekan `Ctrl + Enter`).
6. Pastikan muncul pesan **"Success. No rows returned"**.
7. Klik menu **Table Editor** di bilah kiri; Anda akan melihat 9 tabel otomatis terbuat:
   - `school_settings`
   - `users` (sudah terisi akun default admin, pembina, dan anggota)
   - `attendance_sessions`
   - `attendance_records`
   - `modules`
   - `assignments`
   - `submissions`
   - `skill_requirements` (sudah terisi 7 SKK standar PMI)
   - `skill_requests`

---

## 🔑 LANGKAH 3: Mengambil Kunci API (URL & Anon Key)

Untuk menghubungkan Next.js ke Supabase, Anda butuh 2 nilai:

1. Di dashboard Supabase, buka menu **Project Settings** (ikon gerigi di bilah kiri bawah).
2. Pilih submenu **Data API** (atau **API** di versi lama).
3. Salin 2 nilai berikut:
   - **Project URL**: contoh `https://xyzcompany.supabase.co`
   - **Project API Keys** bagian **anon** / **public**: contoh `eyJhbGciOiJIUzI1NiIsInR5cCI...`

---

## 🐙 LANGKAH 4: Push Kode ke GitHub

Sebelum deploy ke Vercel, pastikan source code aplikasi diunggah ke akun GitHub Anda:

1. Buat repository baru di [github.com/new](https://github.com/new) (misalnya nama repo: `ayo-pmrku`).
2. Di komputer lokal Anda (folder project ini), jalankan terminal:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi Ayo PMRku dengan Supabase & Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/ayo-pmrku.git
   git push -u origin main
   ```

---

## 🌐 LANGKAH 5: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com/) dan login dengan akun GitHub Anda.
2. Klik tombol **Add New...** di pojok kanan atas, lalu pilih **Project**.
3. Cari repository `ayo-pmrku` yang baru saja Anda push, lalu klik **Import**.
4. Di bagian konfigurasi proyek:
   - **Framework Preset**: Biarkan otomatis **Next.js**.
   - **Root Directory**: `./` (default).
5. Buka bagian **Environment Variables** (sangat penting), lalu tambahkan:
   | Key | Value | Keterangan |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz....supabase.co` | Diambil dari Langkah 3 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Diambil dari Langkah 3 |
   | `GEMINI_API_KEY` | *(Opsional)* | Jika menggunakan AI fitur asisten/pembuat kuis |
6. Klik tombol **Deploy**!
7. Tunggu proses build (sekitar 1-2 menit).
8. Selesai! Web Anda sekarang resmi online di alamat `https://ayo-pmrku.vercel.app` (atau nama domain custom Anda) dan langsung terhubung dengan database Supabase secara real-time.

---

## 🔄 FITUR INTEGRASI DI DALAM APLIKASI

Anda juga bisa mengatur dan menguji koneksi langsung dari dalam aplikasi:
1. Login sebagai **Admin** (`username: admin` / `password: admin123`).
2. Masuk ke menu **Backup & Restore Data**.
3. Pilih sub-tab **Supabase & Vercel**.
4. Anda dapat:
   - Menempelkan URL & Anon Key lalu klik **Uji Koneksi**.
   - Menekan tombol **Sinkronkan Data Lokal ke Supabase** untuk mengunggah semua perubahan.
   - Menekan tombol **Tarik Data dari Supabase** untuk memperbarui data di perangkat mana pun.
   - Menyalin skrip SQL langsung dari layar.

---

## 💡 PERTANYAAN UMUM (FAQ)

### Q: Apakah Supabase benar-benar gratis?
**Ya.** Supabase Free Tier menyediakan 500 MB database PostgreSQL dan transfer data hingga 2 GB/bulan, yang lebih dari cukup untuk menampung ribuan data anggota PMR, nilai tugas, dan absensi selama bertahun-tahun tanpa biaya sepeser pun.

### Q: Apakah Vercel gratis?
**Ya.** Akun Hobby Vercel 100% gratis untuk proyek personal dan sekolah/ekstrakurikuler.

### Q: Apakah aplikasi tetap bisa dibuka offline jika internet mati?
**Ya.** Aplikasi dirancang dengan arsitektur hybrid: data tersimpan di LocalStorage browser untuk kecepatan dan cadangan offline, kemudian disinkronkan ke Supabase saat online.
