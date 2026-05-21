"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession }   from "next-auth/react"
import { useRoleGuard } from "@/hooks/useRoleGuard"
import Link             from "next/link"
import { useRouter }    from "next/navigation"


// ── SVG Icons ──────────────────────────────────────────────────
const Ico = {
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ChevRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  ChevLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevDown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Info: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Target: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Clipboard: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  Flag: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  RotateCcw: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Play: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Map: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
}

// ────────────────────────────────────────────────────────────────
// STEP TYPE
// ────────────────────────────────────────────────────────────────
interface UATStep {
  id:          string
  title:       string
  description: string
  action?:     string       // teks tombol aksi utama
  actionRoute?: string      // route navigasi jika ada
  isExternal?: boolean      // jika link ke luar (Google Form)
  externalUrl?: string
  tips?:       string
  warning?:    string
  substeps?:   string[]     // langkah teknis detail
  checkpoint?: string       // yang harus dicek setelah step
}

interface UATScenario {
  id:          string
  no:          number
  title:       string
  feature:     string
  description: string
  steps:       UATStep[]
}

interface RoleConfig {
  role:        string
  label:       string
  color:       string
  intro:       string
  permissions: string[]
  scenarios:   UATScenario[]
}

// ────────────────────────────────────────────────────────────────
// SCENARIOS DATA
// ────────────────────────────────────────────────────────────────
const ROLE_CONFIGS: Record<string, RoleConfig> = {

  // ── SUPER ADMIN ──────────────────────────────────────────────
  SUPER_ADMIN: {
    role: "SUPER_ADMIN", label: "Super Admin", color: "#ef4444",
    intro: "Anda memiliki akses penuh ke seluruh sistem. Pengujian mencakup semua modul: Dashboard, Leads, Forecasting, Laporan, Dokumen, Tim, dan Profil.",
    permissions: ["Akses seluruh menu dan fitur","Tambah/edit/hapus leads","Kelola semua anggota tim","Ubah role pengguna","Generate dan finalisasi dokumen","Lihat semua laporan dan forecasting"],
    scenarios: [
      {
        id: "sa-1", no: 1, title: "Login dan Verifikasi Akses", feature: "Autentikasi",
        description: "Memastikan sistem autentikasi berjalan benar dan seluruh menu tersedia untuk Super Admin.",
        steps: [
          {
            id: "sa-1-1", title: "Buka halaman login",
            description: "Buka browser dan akses sistem CRM CMLabs melalui link yang diberikan.",
            substeps: ["Buka browser (Chrome/Edge/Firefox)","Masukkan URL: [link Vercel CRM CMLabs]","Tunggu hingga halaman login muncul"],
            checkpoint: "Halaman login tampil dengan form email dan password",
          },
          {
            id: "sa-1-2", title: "Masuk dengan akun Super Admin",
            description: "Gunakan kredensial akun Super Admin untuk masuk ke sistem.",
            substeps: ["Isi email: super_admin@cmlabs.co","Isi password: Test1234!","Klik tombol Masuk ke Dashboard","Tunggu hingga halaman dashboard terbuka"],
            action: "Buka Halaman Login", actionRoute: "/",
            checkpoint: "Berhasil masuk dan melihat Dashboard. Sidebar menampilkan semua menu.",
            tips: "Jika login gagal, pastikan caps lock tidak aktif dan email sudah benar.",
          },
          {
            id: "sa-1-3", title: "Periksa kelengkapan menu navigasi",
            description: "Pastikan semua menu tersedia di sidebar sesuai hak akses Super Admin.",
            substeps: ["Perhatikan sidebar di kiri layar","Pastikan menu berikut tersedia: Dashboard, Leads, Forecasting, Laporan & Dokumen, Performa Saya, Tim, Profil Saya, Panduan UAT","Perhatikan badge role 'Super Administrator' di bagian bawah sidebar"],
            checkpoint: "Semua 8 menu navigasi terlihat di sidebar.",
          },
        ],
      },
      {
        id: "sa-2", no: 2, title: "Dashboard Analitik", feature: "Dashboard",
        description: "Mengevaluasi tampilan KPI, grafik interaktif, dan fitur filter independen per section.",
        steps: [
          {
            id: "sa-2-1", title: "Buka Dashboard",
            description: "Navigasi ke halaman Dashboard dan amati 4 KPI card yang tersedia.",
            action: "Buka Dashboard", actionRoute: "/dashboard",
            substeps: ["Klik menu Dashboard di sidebar","Amati 4 KPI card: Pipeline Value, Win Rate, Total Revenue, Recycle","Perhatikan masing-masing card memiliki breakdown detail"],
            checkpoint: "Dashboard terbuka dengan 4 KPI card dan grafik.",
          },
          {
            id: "sa-2-2", title: "Uji filter KPI (independen)",
            description: "Filter KPI header tidak mempengaruhi grafik lain di bawahnya.",
            substeps: ["Di bagian header dashboard, ubah filter tahun ke tahun sebelumnya","Perhatikan angka di 4 KPI card berubah","Pastikan grafik Tren di bawah TIDAK ikut berubah","Ubah kembali filter ke tahun ini"],
            checkpoint: "Filter KPI hanya mengubah 4 KPI card, tidak mengubah grafik di bawahnya.",
            tips: "Setiap section grafik memiliki filternya sendiri — inilah yang membedakan dari sistem konvensional.",
          },
          {
            id: "sa-2-3", title: "Uji grafik Tren Performa",
            description: "Grafik tren memiliki filter sendiri dan bisa diganti mode tampilan.",
            substeps: ["Pada section grafik Tren, ubah filter bulan/tahun","Perhatikan grafik berubah sesuai filter","Klik tombol Area → coba mode Bar → coba mode Combo","Klik toggle Lead/Revenue untuk berganti metrik"],
            checkpoint: "Grafik tren berubah sesuai filter dan mode yang dipilih.",
          },
          {
            id: "sa-2-4", title: "Uji filter Distribusi Status dan Leaderboard",
            description: "Kedua section ini juga memiliki filter independen.",
            substeps: ["Pada section Distribusi Status Lead, ubah filter bulan","Perhatikan grafik batang berubah","Pada section Leaderboard, ubah filter ke bulan berbeda","Perhatikan ranking sales berubah"],
            checkpoint: "Setiap section grafik berubah secara independen tanpa mempengaruhi section lain.",
          },
        ],
      },
      {
        id: "sa-3", no: 3, title: "Manajemen Leads & Kanban", feature: "Leads",
        description: "Menguji seluruh operasi CRUD leads, drag-and-drop Kanban, dan pencatatan aktivitas timeline.",
        steps: [
          {
            id: "sa-3-1", title: "Buka halaman Leads",
            description: "Buka Kanban Board yang menampilkan 6 kolom pipeline.",
            action: "Buka Leads", actionRoute: "/leads",
            substeps: ["Klik menu Leads di sidebar","Amati 6 kolom Kanban: Approach, Cold Lead, Deck Request, Meeting, Deal, Recycle"],
            checkpoint: "Halaman Leads terbuka dengan 6 kolom Kanban.",
          },
          {
            id: "sa-3-2", title: "Tambah Lead baru",
            description: "Buat lead baru dengan mengisi semua field yang tersedia.",
            substeps: [
              "Klik tombol + Tambah Lead",
              "Isi Judul Lead: 'Demo UAT Super Admin'",
              "Isi Nama Klien: 'PT Maju Bersama'",
              "Isi Jabatan Klien: 'Marketing Director'",
              "Isi Email Klien: klien@example.com",
              "Isi Telepon: 081234567890",
              "Isi Perusahaan: PT Maju Bersama",
              "Isi Nilai Deal: 25000000",
              "Pilih Prioritas: Tinggi",
              "Di kolom Deskripsi, coba formatting: tulis teks, klik Bold (B), klik List (ul)",
              "Pilih PIC: assign ke salah satu AE",
              "Klik tombol Tambah Lead",
            ],
            checkpoint: "Lead baru muncul di kolom Approach.",
            tips: "PIC adalah person in charge — sebagai Super Admin Anda bisa assign ke siapapun.",
          },
          {
            id: "sa-3-3", title: "Pindahkan lead dengan Drag and Drop",
            description: "Gunakan drag and drop untuk memindahkan lead ke kolom berikutnya.",
            substeps: ["Temukan lead 'Demo UAT Super Admin' di kolom Approach","Klik dan tahan card lead tersebut","Seret ke kolom Cold Lead","Lepaskan — lead berpindah kolom","Ulangi: seret ke kolom Deck Request"],
            checkpoint: "Lead berhasil dipindah ke kolom Deck Request.",
          },
          {
            id: "sa-3-4", title: "Tambah aktivitas di timeline lead",
            description: "Buka detail lead dan tambahkan berbagai jenis aktivitas.",
            substeps: [
              "Klik card lead 'Demo UAT Super Admin' untuk membuka detail",
              "Di panel timeline, klik tombol + Tambah Aktivitas",
              "Pilih tipe: Catatan Internal",
              "Isi judul: 'Follow up awal'",
              "Di kolom catatan, tulis teks lalu coba formatting bold dan bullet list",
              "Klik Simpan",
              "Tambah aktivitas kedua: pilih tipe Telepon",
              "Isi judul: 'Telepon pertama klien'",
              "Isi catatan hasil telepon",
              "Klik Simpan",
            ],
            checkpoint: "2 aktivitas muncul di timeline lead secara kronologis.",
          },
          {
            id: "sa-3-5", title: "Jadwalkan Meeting",
            description: "Tambahkan aktivitas Meeting dengan detail waktu dan peserta.",
            substeps: [
              "Di panel timeline lead yang sama, tambah aktivitas baru",
              "Pilih tipe: Meeting",
              "Isi judul: 'Presentasi Proposal Q2'",
              "Pilih tanggal (pilih tanggal besok)",
              "Pilih jam mulai: 10:00, jam selesai: 11:00",
              "Isi peserta (email): tulis email klien",
              "Isi link meeting (opsional): https://meet.google.com/xxx",
              "Klik Simpan Meeting",
            ],
            checkpoint: "Meeting terjadwal muncul di timeline dengan detail waktu dan peserta.",
          },
        ],
      },
      {
        id: "sa-4", no: 4, title: "Forecasting Revenue", feature: "Forecasting",
        description: "Mengevaluasi proyeksi revenue, perhitungan weighted forecast, dan detail per lead.",
        steps: [
          {
            id: "sa-4-1", title: "Buka halaman Forecasting",
            action: "Buka Forecasting", actionRoute: "/forecasting",
            description: "Lihat ringkasan proyeksi revenue dan breakdown pipeline.",
            substeps: ["Klik menu Forecasting di sidebar","Amati KPI: Total Forecast, Deal Confirmed, Weighted Forecast, Best Case","Amati grafik tren revenue 12 bulan"],
            checkpoint: "Halaman Forecasting terbuka dengan KPI dan grafik.",
          },
          {
            id: "sa-4-2", title: "Uji filter periode forecasting",
            description: "Filter periode mengubah data yang ditampilkan.",
            substeps: ["Klik tombol filter Periode: Semua → Per Tahun → Per Bulan","Amati perubahan data di KPI dan tabel","Pilih tahun dan bulan tertentu"],
            checkpoint: "Data berubah sesuai filter yang dipilih.",
          },
          {
            id: "sa-4-3", title: "Klik detail perhitungan weighted value lead",
            description: "Setiap lead bisa diklik untuk melihat detail perhitungan forecast.",
            substeps: ["Scroll ke bawah ke tabel Pipeline","Klik salah satu baris lead","Modal detail terbuka","Perhatikan formula: Nilai Lead × Probabilitas % = Weighted Value","Baca penjelasan probabilitas setiap stage","Tutup modal"],
            checkpoint: "Modal detail menampilkan breakdown perhitungan yang jelas.",
            tips: "Probabilitas: Approach 10%, Cold Lead 20%, Deck Request 35%, Meeting 60%, Deal 100%, Recycle 5%.",
          },
        ],
      },
      {
        id: "sa-5", no: 5, title: "Laporan, Dokumen & Generate .docx", feature: "Laporan",
        description: "Menguji laporan performa tim, detail per sales, dan pembuatan dokumen Word.",
        steps: [
          {
            id: "sa-5-1", title: "Buka Laporan Performa",
            action: "Buka Laporan", actionRoute: "/reports",
            description: "Lihat laporan performa tim dengan filter periode.",
            substeps: ["Klik menu Laporan & Dokumen di sidebar","Pastikan tab Laporan Performa aktif","Ubah filter tahun/bulan","Perhatikan KPI card dan grafik berubah"],
            checkpoint: "Grafik dan KPI laporan berubah sesuai filter.",
          },
          {
            id: "sa-5-2", title: "Lihat detail performa per sales",
            description: "Klik nama sales di tabel untuk melihat detail leads yang ditangani.",
            substeps: ["Scroll ke tabel Performa Sales","Klik salah satu nama sales di tabel","Modal terbuka menampilkan detail lead","Perhatikan tab: Semua, Deal, Recycle","Klik tab Deal — lihat leads yang berhasil closing","Klik tab Recycle — lihat leads yang gagal"],
            checkpoint: "Modal menampilkan detail leads dengan distribusi status dan revenue.",
          },
          {
            id: "sa-5-3", title: "Buat dokumen Invoice",
            description: "Generate dokumen Invoice dalam format .docx dari lead yang ada.",
            substeps: ["Klik tab Dokumen di bagian atas","Klik tombol + Buat Dokumen","Pilih lead dari dropdown","Pilih tipe: Invoice","Isi judul: 'Invoice Demo UAT'","Klik Buat Dokumen"],
            checkpoint: "Dokumen baru muncul di daftar dengan status Draft.",
          },
          {
            id: "sa-5-4", title: "Finalisasi dan download dokumen",
            description: "Ubah status dokumen dan download dalam format .docx.",
            substeps: ["Klik dokumen yang baru dibuat","Halaman detail dokumen terbuka","Perhatikan isi dokumen terisi otomatis dari data lead","Klik tombol Download .docx — file tersimpan di komputer","Klik tombol Finalisasi Dokumen — status berubah ke Finalized","Klik Tandai Sudah Dikirim — status berubah ke Terkirim"],
            checkpoint: "Dokumen ter-download dan status berubah ke Terkirim.",
          },
        ],
      },
      {
        id: "sa-6", no: 6, title: "Manajemen Tim", feature: "Tim",
        description: "Menguji pengelolaan anggota tim beserta visualisasi performa.",
        steps: [
          {
            id: "sa-6-1", title: "Buka halaman Tim",
            action: "Buka Tim", actionRoute: "/team",
            description: "Lihat daftar anggota tim dan visualisasi distribusi role.",
            substeps: ["Klik menu Tim di sidebar","Amati chart distribusi role (pie chart)","Amati grafik total lead per sales — coba ubah filter tahun/bulan","Amati tabel daftar anggota tim"],
            checkpoint: "Halaman Tim terbuka dengan visualisasi dan tabel.",
          },
          {
            id: "sa-6-2", title: "Tambah anggota tim baru",
            description: "Buat akun anggota baru dengan role Account Executive.",
            substeps: ["Klik tombol + Tambah Anggota","Isi Nama: 'Test UAT User'","Isi Email: test.uat@cmlabs.co","Isi Password: Test1234!","Isi No. Telepon: 089999999999","Pilih Role: Account Executive","Klik Tambah Anggota"],
            checkpoint: "Anggota baru muncul di tabel dengan role Account Executive.",
          },
          {
            id: "sa-6-3", title: "Lihat detail performa sales",
            description: "Klik tombol Performa pada AE atau SM untuk melihat detail.",
            substeps: ["Di tabel anggota, cari salah satu AE atau SM","Klik tombol Performa","Modal terbuka dengan filter tahun/bulan","Ubah filter dan perhatikan data berubah","Lihat distribusi status, win rate, dan daftar leads"],
            checkpoint: "Modal performa menampilkan data yang sinkron dengan filter.",
          },
        ],
      },
      {
        id: "sa-7", no: 7, title: "Dark Mode & Responsivitas", feature: "UI/UX",
        description: "Memastikan tampilan konsisten di berbagai mode dan ukuran layar.",
        steps: [
          {
            id: "sa-7-1", title: "Toggle Dark Mode",
            description: "Beralih antara tampilan gelap dan terang.",
            substeps: ["Temukan tombol Dark Mode / Light Mode di sidebar bagian bawah atau header","Klik tombol untuk beralih ke Dark Mode","Jelajahi beberapa halaman: Dashboard, Leads, Forecasting","Pastikan semua teks terbaca jelas dalam dark mode","Klik kembali untuk beralih ke Light Mode"],
            checkpoint: "Pergantian mode terjadi instan tanpa reload halaman, semua teks terbaca.",
            tips: "Peralihan tema tidak memerlukan refresh halaman — ini adalah fitur instant theme switching.",
          },
          {
            id: "sa-7-2", title: "Uji tampilan mobile/tablet",
            description: "Kecilkan browser untuk menguji responsivitas.",
            substeps: ["Kecilkan ukuran browser hingga lebar < 640px (atau gunakan F12 → device simulator)","Perhatikan sidebar berubah menjadi tombol menu (hamburger) di atas","Klik tombol menu — drawer navigasi terbuka dari kanan","Pastikan semua menu tersedia di drawer","Pastikan struktur menu sama dengan sidebar desktop"],
            checkpoint: "Tampilan mobile berfungsi baik dengan drawer navigasi yang lengkap.",
          },
        ],
      },
    ],
  },

  // ── EXECUTIVE ────────────────────────────────────────────────
  EXECUTIVE: {
    role: "EXECUTIVE", label: "Executive", color: "#8b5cf6",
    intro: "Sebagai Executive, Anda memiliki akses lihat (read-only) ke seluruh data. Anda tidak bisa mengubah atau menambah data apapun.",
    permissions: ["Lihat semua dashboard dan KPI","Lihat semua leads (tidak bisa edit)","Lihat forecasting dan proyeksi revenue","Lihat laporan performa tim","Lihat data tim dan visualisasi performa","Tidak bisa tambah/edit/hapus data apapun"],
    scenarios: [
      {
        id: "ex-1", no: 1, title: "Login dan Verifikasi Akses Read-Only", feature: "RBAC",
        description: "Memastikan Executive hanya dapat melihat data tanpa bisa mengubah apapun.",
        steps: [
          {
            id: "ex-1-1", title: "Login sebagai Executive",
            description: "Masuk dengan akun Executive.",
            substeps: ["Buka halaman login","Isi email: executive@cmlabs.co","Isi password: Test1234!","Klik Masuk ke Dashboard"],
            action: "Buka Login", actionRoute: "/",
            checkpoint: "Berhasil masuk. Sidebar tidak menampilkan menu Tambah Lead atau Tim edit.",
          },
          {
            id: "ex-1-2", title: "Verifikasi batasan akses di Leads",
            description: "Pastikan Leads dalam mode read-only.",
            substeps: ["Klik menu Leads","Perhatikan tidak ada tombol + Tambah Lead","Klik salah satu card lead","Pastikan tidak ada tombol Edit atau Hapus","Coba drag card lead ke kolom lain — akan muncul notifikasi akses terbatas"],
            action: "Buka Leads", actionRoute: "/leads",
            checkpoint: "Tidak ada tombol edit/tambah di halaman Leads. Drag menampilkan notifikasi.",
            tips: "Banner biru 'Mode Hanya Lihat' ditampilkan di beberapa halaman sebagai konfirmasi status Executive.",
          },
        ],
      },
      {
        id: "ex-2", no: 2, title: "Analisis Dashboard", feature: "Dashboard",
        description: "Mengevaluasi kualitas visualisasi untuk pengambilan keputusan eksekutif.",
        steps: [
          {
            id: "ex-2-1", title: "Buka Dashboard dan amati KPI",
            action: "Buka Dashboard", actionRoute: "/dashboard",
            description: "Lihat 4 KPI card dan breakdown detailnya.",
            substeps: ["Klik menu Dashboard","Amati KPI card Pipeline Value — lihat breakdown per stage","Amati KPI card Win Rate — lihat radial chart dan distribusi deal/recycle","Amati KPI card Total Revenue — lihat rata-rata per deal","Amati KPI card Recycle — lihat persentase dari total lead"],
            checkpoint: "Semua 4 KPI card menampilkan data dengan breakdown yang jelas.",
          },
          {
            id: "ex-2-2", title: "Uji filter independen tiap section",
            description: "Filter tiap grafik tidak saling mempengaruhi.",
            substeps: ["Ubah filter tahun pada KPI header","Ubah filter bulan pada grafik Tren (berbeda dari KPI)","Ubah filter pada Distribusi Status","Ubah filter pada Leaderboard","Pastikan setiap perubahan hanya mempengaruhi section yang bersangkutan"],
            checkpoint: "Setiap section berubah secara independen.",
          },
        ],
      },
      {
        id: "ex-3", no: 3, title: "Review Forecasting", feature: "Forecasting",
        description: "Menilai kejelasan proyeksi revenue untuk perencanaan strategis.",
        steps: [
          {
            id: "ex-3-1", title: "Buka dan pelajari Forecasting",
            action: "Buka Forecasting", actionRoute: "/forecasting",
            description: "Pahami proyeksi revenue berdasarkan pipeline aktif.",
            substeps: ["Klik menu Forecasting","Lihat KPI: Weighted Forecast vs Best Case vs Deal Confirmed","Ubah filter periode dan amati perubahan","Klik salah satu lead di tabel untuk melihat detail perhitungan","Baca formula: Nilai × Probabilitas = Weighted Value"],
            checkpoint: "Detail perhitungan weighted value dapat dibaca dengan jelas.",
          },
        ],
      },
      {
        id: "ex-4", no: 4, title: "Laporan Performa Tim", feature: "Laporan",
        description: "Mengevaluasi kelengkapan data laporan untuk monitoring tim.",
        steps: [
          {
            id: "ex-4-1", title: "Review laporan dengan filter periode",
            action: "Buka Laporan", actionRoute: "/reports",
            description: "Lihat laporan performa dengan berbagai filter.",
            substeps: ["Buka Laporan & Dokumen","Ubah filter tahun/bulan","Amati grafik tren lead, distribusi status, dan pie chart deal vs recycle","Scroll ke tabel performa sales — amati kolom deal, recycle, win rate, revenue"],
            checkpoint: "Laporan menampilkan data lengkap yang bisa difilter.",
          },
        ],
      },
      {
        id: "ex-5", no: 5, title: "Visualisasi Tim", feature: "Tim",
        description: "Mengevaluasi visualisasi distribusi tim dan performa individual.",
        steps: [
          {
            id: "ex-5-1", title: "Buka Tim dan review visualisasi",
            action: "Buka Tim", actionRoute: "/team",
            description: "Lihat visualisasi distribusi role dan performa sales.",
            substeps: ["Buka halaman Tim","Amati pie chart distribusi role — perhatikan jumlah per role","Ubah filter pada grafik Lead per Sales — amati data berubah","Klik tombol Performa pada salah satu AE","Di modal, ubah filter tahun/bulan — amati data berubah","Lihat distribusi status, win rate, dan detail leads"],
            checkpoint: "Semua visualisasi menampilkan data yang akurat dan responsif terhadap filter.",
            warning: "Executive tidak bisa menambah, mengedit, atau menghapus anggota tim.",
          },
        ],
      },
    ],
  },

  // ── SALES MANAGER ────────────────────────────────────────────
  SALES_MANAGER: {
    role: "SALES_MANAGER", label: "Sales Manager", color: "#3b82f6",
    intro: "Sebagai Sales Manager, Anda dapat mengelola semua leads, tim AE, laporan, dan dokumen. Anda tidak dapat menghapus user atau mengubah role anggota.",
    permissions: ["Akses semua menu kecuali hapus user","Tambah/edit/hapus leads milik siapapun","Assign lead ke AE manapun","Tambah dan edit anggota AE","Generate dan finalisasi dokumen","Lihat Performa Saya + laporan tim"],
    scenarios: [
      {
        id: "sm-1", no: 1, title: "Login dan Verifikasi Hak Akses", feature: "RBAC",
        description: "Memastikan Sales Manager memiliki akses yang sesuai.",
        steps: [
          {
            id: "sm-1-1", title: "Login sebagai Sales Manager",
            description: "Masuk dengan akun Sales Manager.",
            substeps: ["Buka halaman login","Isi email: sales_mgr@cmlabs.co","Isi password: Test1234!","Klik Masuk ke Dashboard"],
            action: "Buka Login", actionRoute: "/",
            checkpoint: "Berhasil masuk. Sidebar menampilkan semua menu termasuk Performa Saya.",
          },
          {
            id: "sm-1-2", title: "Verifikasi batasan di Tim",
            description: "Sales Manager bisa edit tapi tidak hapus atau ubah role.",
            substeps: ["Buka halaman Tim","Pastikan ada tombol + Tambah Anggota","Klik Edit pada salah satu anggota","Pastikan tidak ada pilihan mengubah Role","Pastikan tidak ada tombol Hapus anggota"],
            action: "Buka Tim", actionRoute: "/team",
            checkpoint: "Tombol edit tersedia tapi tanpa opsi ubah role atau hapus.",
          },
        ],
      },
      {
        id: "sm-2", no: 2, title: "Monitor Dashboard Tim", feature: "Dashboard",
        description: "Menggunakan dashboard untuk monitoring performa tim sales.",
        steps: [
          {
            id: "sm-2-1", title: "Analisis leaderboard tim",
            action: "Buka Dashboard", actionRoute: "/dashboard",
            description: "Lihat posisi setiap AE di leaderboard.",
            substeps: ["Buka Dashboard","Scroll ke bagian Leaderboard Sales","Ubah filter bulan pada leaderboard","Bandingkan revenue antar anggota tim","Ubah filter berbeda pada grafik Distribusi Status"],
            checkpoint: "Leaderboard menampilkan ranking yang akurat per periode.",
          },
        ],
      },
      {
        id: "sm-3", no: 3, title: "Kelola Leads Tim", feature: "Leads",
        description: "Mengelola leads termasuk assign ke AE dan pemindahan status.",
        steps: [
          {
            id: "sm-3-1", title: "Tambah lead dan assign ke AE",
            action: "Buka Leads", actionRoute: "/leads",
            description: "Buat lead baru dan tugaskan ke salah satu AE.",
            substeps: ["Buka halaman Leads","Klik + Tambah Lead","Isi semua data lead","Di field PIC, pilih salah satu AE dari dropdown","Klik Tambah Lead"],
            checkpoint: "Lead baru muncul di kolom Approach dengan nama AE yang dipilih.",
          },
          {
            id: "sm-3-2", title: "Tambah aktivitas telepon dan meeting",
            description: "Catat aktivitas komunikasi di timeline lead.",
            substeps: ["Klik lead yang baru dibuat","Di timeline, tambah aktivitas Telepon","Isi hasil telepon dengan catatan berformat (bold/list)","Tambah aktivitas Meeting","Isi detail waktu (tanggal, jam mulai, jam selesai)","Isi email peserta meeting"],
            checkpoint: "Timeline lead menampilkan 2 aktivitas secara kronologis.",
          },
        ],
      },
      {
        id: "sm-4", no: 4, title: "Forecasting & Target Tim", feature: "Forecasting",
        description: "Menggunakan forecasting untuk penetapan target realistis tim.",
        steps: [
          {
            id: "sm-4-1", title: "Analisis weighted forecast",
            action: "Buka Forecasting", actionRoute: "/forecasting",
            description: "Bandingkan Weighted Forecast dengan Best Case sebagai basis target.",
            substeps: ["Buka Forecasting","Bandingkan nilai Weighted Forecast vs Best Case","Filter per bulan ini","Klik 3 lead berbeda di tabel — perhatikan probabilitas masing-masing stage","Lihat breakdown pipeline per stage di bawah KPI"],
            checkpoint: "Perbedaan Weighted vs Best Case terbaca jelas untuk perencanaan target.",
          },
        ],
      },
      {
        id: "sm-5", no: 5, title: "Laporan, Performa Saya & Dokumen", feature: "Laporan",
        description: "Laporan tim, kinerja personal, dan generate dokumen bisnis.",
        steps: [
          {
            id: "sm-5-1", title: "Review laporan tim dan detail sales",
            action: "Buka Laporan", actionRoute: "/reports",
            description: "Lihat laporan tim dan drill down per sales.",
            substeps: ["Buka Laporan & Dokumen","Ubah filter bulan ini","Klik salah satu sales di tabel — lihat modal detail leads","Klik tab Deal dan tab Recycle secara bergantian","Bandingkan performa antar sales"],
            checkpoint: "Modal detail sales menampilkan leads lengkap dengan status.",
          },
          {
            id: "sm-5-2", title: "Buka Performa Saya",
            action: "Buka Performa Saya", actionRoute: "/reports/personal",
            description: "Lihat statistik kinerja personal dengan filter independen.",
            substeps: ["Buka halaman Performa Saya","Ubah filter Lead (tahun/bulan) di header","Klik tab Overview — lihat grafik tren revenue","Ubah filter Revenue (berbeda dari filter Lead)","Klik tab Pipeline — lihat semua history pipeline","Klik tab Aktivitas — ubah filter Aktivitas secara terpisah"],
            checkpoint: "Setiap filter di tab Overview, Pipeline, Aktivitas bekerja independen.",
          },
          {
            id: "sm-5-3", title: "Generate dan download dokumen SPK",
            description: "Buat dokumen SPK dan download dalam format .docx.",
            substeps: ["Kembali ke Laporan — klik tab Dokumen","Klik + Buat Dokumen","Pilih lead dari dropdown","Pilih tipe: SPK","Beri judul dokumen","Klik Buat Dokumen","Klik dokumen → halaman detail terbuka","Klik Download .docx","Klik Finalisasi Dokumen"],
            checkpoint: "Dokumen SPK ter-download dan status berubah ke Finalized.",
          },
        ],
      },
    ],
  },

  // ── ACCOUNT EXECUTIVE ────────────────────────────────────────
  ACCOUNT_EXECUTIVE: {
    role: "ACCOUNT_EXECUTIVE", label: "Account Executive", color: "#10b981",
    intro: "Sebagai Account Executive, Anda bisa melihat semua leads tim namun hanya bisa mengelola leads yang ditugaskan kepada Anda.",
    permissions: ["Lihat semua leads tim (read-only untuk leads orang lain)","Tambah lead (PIC otomatis = diri sendiri)","Edit/hapus hanya leads sendiri","Tambah aktivitas di timeline leads sendiri","Lihat Performa Saya (kinerja personal)","Generate dokumen dari leads sendiri"],
    scenarios: [
      {
        id: "ae-1", no: 1, title: "Login dan Verifikasi Akses AE", feature: "RBAC",
        description: "Memastikan AE bisa kelola leads sendiri tapi read-only untuk leads orang lain.",
        steps: [
          {
            id: "ae-1-1", title: "Login sebagai Account Executive",
            description: "Masuk dengan akun Account Executive.",
            substeps: ["Buka halaman login","Isi email: ae@cmlabs.co","Isi password: Test1234!","Klik Masuk ke Dashboard"],
            action: "Buka Login", actionRoute: "/",
            checkpoint: "Berhasil masuk. Sidebar tidak menampilkan menu Tim. Ada menu Performa Saya.",
          },
          {
            id: "ae-1-2", title: "Verifikasi batasan akses lead orang lain",
            description: "Pastikan AE tidak bisa edit lead yang bukan miliknya.",
            substeps: ["Buka halaman Leads","Cari lead yang PIC-nya bukan Anda (nama orang lain)","Coba drag lead tersebut ke kolom lain — amati notifikasi","Klik lead tersebut — pastikan tidak ada tombol Edit"],
            action: "Buka Leads", actionRoute: "/leads",
            checkpoint: "Notifikasi akses terbatas muncul saat mencoba drag lead orang lain.",
          },
        ],
      },
      {
        id: "ae-2", no: 2, title: "Kelola Lead Sendiri", feature: "Leads",
        description: "Menguji alur lengkap pengelolaan lead dari pembuatan hingga update status.",
        steps: [
          {
            id: "ae-2-1", title: "Tambah lead baru",
            action: "Buka Leads", actionRoute: "/leads",
            description: "Buat lead baru — PIC otomatis diisi dengan nama Anda.",
            substeps: ["Buka Leads","Klik + Tambah Lead","Isi Judul: 'Demo UAT [nama Anda]'","Isi data klien lengkap (nama, jabatan, perusahaan, email, telepon)","Isi Nilai Deal: 15000000","Isi Deskripsi dengan teks berformat (coba bold dan bullet list)","Klik Tambah Lead"],
            checkpoint: "Lead baru muncul di kolom Approach dengan nama Anda sebagai PIC.",
            tips: "Field PIC tidak bisa diubah — sebagai AE, leads selalu ditugaskan ke diri sendiri.",
          },
          {
            id: "ae-2-2", title: "Pindah status dan tambah aktivitas",
            description: "Update status lead dan catat aktivitas komunikasi.",
            substeps: ["Drag lead Anda ke kolom Cold Lead","Klik lead untuk membuka detail","Tambah Catatan Internal: 'Klien tertarik, jadwal follow up minggu depan'","Tulis catatan dengan formatting bold","Tambah aktivitas Telepon: isi judul dan hasil telepon"],
            checkpoint: "Lead di Cold Lead dengan 2 aktivitas tercatat di timeline.",
          },
          {
            id: "ae-2-3", title: "Jadwalkan Meeting",
            description: "Jadwalkan meeting dengan klien melalui timeline lead.",
            substeps: ["Di timeline lead yang sama, klik + Tambah Aktivitas","Pilih tipe: Meeting","Isi judul: 'Presentasi Proposal'","Pilih tanggal besok, jam 09:00 – 10:00","Isi email peserta","Isi link Google Meet (opsional)","Klik Simpan"],
            checkpoint: "Meeting terjadwal muncul di timeline dengan detail lengkap.",
          },
        ],
      },
      {
        id: "ae-3", no: 3, title: "Performa Saya", feature: "Performa",
        description: "Memantau statistik kinerja personal melalui berbagai filter dan grafik.",
        steps: [
          {
            id: "ae-3-1", title: "Buka Performa Saya",
            action: "Buka Performa Saya", actionRoute: "/reports/personal",
            description: "Lihat KPI personal dan grafik kinerja.",
            substeps: ["Klik menu Performa Saya di sidebar","Amati KPI: Total Lead, Deal, Win Rate, Revenue, Task Selesai","Ubah filter KPI (tahun/bulan) di header"],
            checkpoint: "KPI berubah sesuai filter yang dipilih.",
          },
          {
            id: "ae-3-2", title: "Jelajahi tab Overview dan Revenue",
            description: "Lihat grafik tren dengan filter independen.",
            substeps: ["Pastikan tab Overview aktif","Amati grafik tren lead dan deal","Ubah filter Revenue (independen dari filter lead)","Amati grafik revenue per bulan berubah"],
            checkpoint: "Filter Revenue berubah tanpa mempengaruhi data KPI utama.",
          },
          {
            id: "ae-3-3", title: "Uji tab Pipeline dan Aktivitas",
            description: "Pipeline menampilkan semua history, bukan hanya yang aktif.",
            substeps: ["Klik tab Pipeline","Amati semua history lead termasuk Deal dan Recycle","Klik tab Aktivitas","Ubah filter Aktivitas secara terpisah","Amati grafik aktivitas per tipe berubah"],
            checkpoint: "Pipeline menampilkan history lengkap. Filter Aktivitas bekerja independen.",
          },
        ],
      },
      {
        id: "ae-4", no: 4, title: "Generate Dokumen", feature: "Dokumen",
        description: "Membuat dan download dokumen dari lead milik sendiri.",
        steps: [
          {
            id: "ae-4-1", title: "Buat dokumen dari lead sendiri",
            action: "Buka Laporan", actionRoute: "/reports",
            description: "Generate dokumen Invoice dari lead yang Anda miliki.",
            substeps: ["Buka Laporan & Dokumen","Klik tab Dokumen","Klik + Buat Dokumen","Pilih lead milik Anda dari dropdown","Pilih tipe: Invoice","Beri judul: 'Invoice Demo AE'","Klik Buat Dokumen"],
            checkpoint: "Dokumen muncul di daftar dengan status Draft.",
          },
          {
            id: "ae-4-2", title: "Download dan finalisasi dokumen",
            description: "Buka detail dokumen dan lakukan download.",
            substeps: ["Klik dokumen yang baru dibuat","Halaman detail terbuka","Periksa isi dokumen terisi otomatis dari data lead","Klik Download .docx","Klik Finalisasi Dokumen"],
            checkpoint: "Dokumen ter-download dan status berubah ke Finalized.",
          },
        ],
      },
    ],
  },
}

// ────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// ────────────────────────────────────────────────────────────────
const SK = "uat-wizard-v3"

function loadState(role: string) {
  try {
    const raw = localStorage.getItem(`${SK}-${role}`)
    return raw ? JSON.parse(raw) : { scenarioIdx: 0, stepIdx: 0, doneSteps: {} }
  } catch {
    return { scenarioIdx: 0, stepIdx: 0, doneSteps: {} }
  }
}

function saveState(role: string, state: any) {
  try { localStorage.setItem(`${SK}-${role}`, JSON.stringify(state)) } catch {}
}

// ────────────────────────────────────────────────────────────────
// BUBBLE OVERLAY COMPONENT
// ────────────────────────────────────────────────────────────────
function StepBubble({
  step, stepNo, totalSteps, color, onNext, onBack, onSkip,
  isFirst, isLast, isLastScenario,
}: {
  step:           UATStep
  stepNo:         number
  totalSteps:     number
  color:          string
  onNext:         () => void
  onBack:         () => void
  onSkip:         () => void
  isFirst:        boolean
  isLast:         boolean
  isLastScenario: boolean
}) {
  const router = useRouter()

  return (
    <div style={{
      position:     "fixed",
      bottom:       28,
      right:        28,
      zIndex:       999,
      width:        380,
      maxWidth:     "calc(100vw - 32px)",
      background:   "var(--bg-card)",
      border:       `1px solid ${color}40`,
      borderRadius: 16,
      boxShadow:    `0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px ${color}18`,
      overflow:     "hidden",
      animation:    "bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      {/* Top accent bar */}
      <div style={{
        height:     3, width: `${(stepNo / totalSteps) * 100}%`,
        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        transition: "width 0.4s ease",
      }} />

      {/* Header */}
      <div style={{
        padding:      "14px 16px 10px",
        borderBottom: "1px solid var(--border-light)",
        display:      "flex",
        alignItems:   "center",
        gap:          10,
      }}>
        {/* Step counter */}
        <div style={{
          width:          28, height: 28, borderRadius: "50%",
          background:     color + "18", color,
          display:        "flex", alignItems: "center", justifyContent: "center",
          fontSize:       11, fontWeight: 800, flexShrink: 0,
        }}>
          {stepNo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {step.title}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
            Langkah {stepNo} dari {totalSteps}
          </div>
        </div>
        <button
          onClick={onSkip}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 11, color: "var(--text-muted)", padding: "4px",
            flexShrink: 0,
          }}
        >
          Lewati
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 16px" }}>
        {/* Description */}
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
          {step.description}
        </p>

        {/* Substeps */}
        {step.substeps && step.substeps.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
            }}>
              Yang harus dilakukan:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {step.substeps.map((sub, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: color + "15", color, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55, flex: 1 }}>
                    {sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checkpoint */}
        {step.checkpoint && (
          <div style={{
            display:      "flex", gap: 7, alignItems: "flex-start",
            padding:      "8px 10px",
            background:   "rgba(16,185,129,0.07)",
            border:       "1px solid rgba(16,185,129,0.18)",
            borderRadius: 8,
            marginBottom: 8,
          }}>
            <span style={{ color: "#10b981", flexShrink: 0, marginTop: 1 }}>
              <Ico.Target />
            </span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                Hasil yang diharapkan:
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {step.checkpoint}
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        {step.tips && (
          <div style={{
            display:      "flex", gap: 7, alignItems: "flex-start",
            padding:      "7px 10px",
            background:   color + "0d",
            border:       `1px solid ${color}22`,
            borderRadius: 8,
            marginBottom: 8,
          }}>
            <span style={{ color, flexShrink: 0, marginTop: 1 }}><Ico.Info /></span>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <strong style={{ color }}>Tips: </strong>{step.tips}
            </p>
          </div>
        )}

        {/* Warning */}
        {step.warning && (
          <div style={{
            padding:      "7px 10px",
            background:   "rgba(245,158,11,0.08)",
            border:       "1px solid rgba(245,158,11,0.22)",
            borderRadius: 8,
            fontSize:     11, color: "var(--warning)",
            marginBottom: 8,
          }}>
            {step.warning}
          </div>
        )}

        {/* Action button */}
        {step.actionRoute && step.action && (
          <Link href={step.actionRoute} style={{
            display:        "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding:        "8px 14px", marginBottom: 10,
            background:     `linear-gradient(135deg, ${color}, ${color}cc)`,
            color:          "#fff", borderRadius: 9,
            fontSize:       12, fontWeight: 600,
            textDecoration: "none",
            boxShadow:      `0 3px 10px ${color}30`,
          }}>
            {step.action}
            <Ico.ArrowRight />
          </Link>
        )}
      </div>

      {/* Footer navigation */}
      <div style={{
        padding:      "10px 16px",
        borderTop:    "1px solid var(--border-light)",
        display:      "flex",
        alignItems:   "center",
        gap:          8,
      }}>
        <button
          onClick={onBack}
          disabled={isFirst}
          style={{
            display:    "flex", alignItems: "center", gap: 5,
            padding:    "7px 13px",
            background: "var(--bg-card2)",
            border:     "1px solid var(--border)",
            borderRadius: 8, color: "var(--text-secondary)",
            fontSize:   12, fontWeight: 500,
            cursor:     isFirst ? "not-allowed" : "pointer",
            opacity:    isFirst ? 0.4 : 1,
          }}
        >
          <Ico.ChevLeft /> Kembali
        </button>

        <div style={{ flex: 1, textAlign: "center" }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
            {Array.from({ length: Math.min(totalSteps, 8) }).map((_, i) => (
              <div key={i} style={{
                width:        i === stepNo - 1 ? 16 : 6,
                height:       6,
                borderRadius: 999,
                background:   i < stepNo ? color : "var(--border)",
                transition:   "all 0.2s",
              }} />
            ))}
            {totalSteps > 8 && (
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>+{totalSteps - 8}</span>
            )}
          </div>
        </div>

        {isLast && isLastScenario ? (
          
            <a
  href="https://forms.gle/fQxcNQjwspXH2wbDA"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  }}
>
  Isi Kuesioner
   <Ico.ExternalLink />
</a>
        ) : (
          <button
            onClick={onNext}
            style={{
              display:    "flex", alignItems: "center", gap: 5,
              padding:    "7px 13px",
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              color:      "#fff", border: "none", borderRadius: 8,
              fontSize:   12, fontWeight: 700,
              cursor:     "pointer",
              boxShadow:  `0 3px 10px ${color}30`,
            }}
          >
            {isLast ? "Skenario Berikutnya" : "Langkah Berikutnya"}
            <Ico.ChevRight />
          </button>
        )}
      </div>

      <style>{`
        @keyframes bubbleIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// SCENARIO OVERVIEW CARD
// ────────────────────────────────────────────────────────────────
function ScenarioCard({ scenario, color, stepsDone, isActive, isCurrent, onClick }: {
  scenario:   UATScenario
  color:      string
  stepsDone:  number
  isActive:   boolean
  isCurrent:  boolean
  onClick:    () => void
}) {
  const totalSteps = scenario.steps.length
  const pct        = totalSteps > 0 ? Math.round((stepsDone / totalSteps) * 100) : 0
  const allDone    = pct === 100

  return (
    <div
      onClick={onClick}
      style={{
        background:   isActive ? color + "0a" : "var(--bg-card)",
        border:       `1px solid ${isActive ? color + "40" : "var(--border)"}`,
        borderRadius: 12, padding: "13px 16px",
        cursor:       "pointer", transition: "all 0.2s",
        position:     "relative",
        transform:    isActive ? "none" : "none",
      }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = color + "35"; e.currentTarget.style.background = color + "06" } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-card)" } }}
    >
      {isCurrent && (
        <div style={{
          position:     "absolute", top: 10, right: 10,
          fontSize:     9, fontWeight: 800, padding: "2px 6px",
          borderRadius: 999, background: color + "20", color,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          Aktif
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width:          30, height: 30, borderRadius: "50%",
          background:     allDone ? color : isActive ? color + "18" : "var(--bg-card2)",
          border:         `2px solid ${allDone ? color : isActive ? color : "var(--border)"}`,
          display:        "flex", alignItems: "center", justifyContent: "center",
          flexShrink:     0, color: allDone ? "#fff" : color,
          fontSize:       11, fontWeight: 800,
        }}>
          {allDone ? <Ico.Check /> : scenario.no}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {scenario.title}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 999,
            background: color + "15", color, display: "inline-block", marginTop: 2,
          }}>
            {scenario.feature}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "var(--bg-card2)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 999,
          background: allDone
            ? "linear-gradient(90deg, #10b981, #34d399)"
            : `linear-gradient(90deg, ${color}, ${color}bb)`,
          transition: "width 0.5s ease",
        }} />
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, textAlign: "right" }}>
        {stepsDone}/{totalSteps} langkah
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────────
export default function UATGuidePage() {
  const { data: session } = useSession()
  const { role }          = useRoleGuard()
  const router            = useRouter()

  const [mounted,      setMounted]      = useState(false)
  const [scenarioIdx,  setScenarioIdx]  = useState(0)
  const [stepIdx,      setStepIdx]      = useState(0)
  const [doneSteps,    setDoneSteps]    = useState<Record<string, boolean>>({})
  const [showBubble,   setShowBubble]   = useState(true)
  const [guideStarted, setGuideStarted] = useState(false)

  const cfg = role ? ROLE_CONFIGS[role] : null

  useEffect(() => {
    setMounted(true)
    if (role) {
      const saved = loadState(role)
      setScenarioIdx(saved.scenarioIdx ?? 0)
      setStepIdx(saved.stepIdx ?? 0)
      setDoneSteps(saved.doneSteps ?? {})
      if (saved.guideStarted) setGuideStarted(true)
    }
  }, [role])

  // Save state whenever it changes
  useEffect(() => {
    if (!mounted || !role) return
    saveState(role, { scenarioIdx, stepIdx, doneSteps, guideStarted })
  }, [scenarioIdx, stepIdx, doneSteps, guideStarted, mounted, role])

  if (!mounted || !cfg) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const scenarios    = cfg.scenarios
  const curScenario  = scenarios[scenarioIdx]
  const curSteps     = curScenario?.steps ?? []
  const curStep      = curSteps[stepIdx]
  const isFirstStep  = scenarioIdx === 0 && stepIdx === 0
  const isLastStep   = stepIdx === curSteps.length - 1
  const isLastScenario = scenarioIdx === scenarios.length - 1
  const isVeryLast   = isLastStep && isLastScenario

  // Count total done
  const totalAllSteps = scenarios.reduce((s, sc) => s + sc.steps.length, 0)
  const totalDone     = Object.values(doneSteps).filter(Boolean).length
  const totalPct      = totalAllSteps > 0 ? Math.round((totalDone / totalAllSteps) * 100) : 0

  function markCurrent() {
    if (!curStep) return
    setDoneSteps((prev) => ({ ...prev, [curStep.id]: true }))
  }

  function handleNext() {
    markCurrent()
    if (!isLastStep) {
      setStepIdx((i) => i + 1)
    } else if (!isLastScenario) {
      setScenarioIdx((i) => i + 1)
      setStepIdx(0)
    }
  }

  function handleBack() {
    if (stepIdx > 0) {
      setStepIdx((i) => i - 1)
    } else if (scenarioIdx > 0) {
      setScenarioIdx((i) => i - 1)
      const prevSteps = scenarios[scenarioIdx - 1].steps
      setStepIdx(prevSteps.length - 1)
    }
  }

  function handleSkip() {
    if (!isLastStep) {
      setStepIdx((i) => i + 1)
    } else if (!isLastScenario) {
      setScenarioIdx((i) => i + 1)
      setStepIdx(0)
    }
  }

  function goToScenario(idx: number) {
    setScenarioIdx(idx)
    setStepIdx(0)
  }

  function reset() {
    if (!role || !confirm("Reset semua progress pengujian?")) return
    setScenarioIdx(0); setStepIdx(0)
    setDoneSteps({}); setGuideStarted(false)
    saveState(role, { scenarioIdx: 0, stepIdx: 0, doneSteps: {}, guideStarted: false })
  }

  // Count done steps per scenario
  function scenarioDoneCount(sc: UATScenario) {
    return sc.steps.filter((s) => doneSteps[s.id]).length
  }

  const ROLE_COLOR: Record<string, string> = {
    SUPER_ADMIN: "#ef4444", EXECUTIVE: "#8b5cf6",
    SALES_MANAGER: "#3b82f6", ACCOUNT_EXECUTIVE: "#10b981",
  }
  const color = ROLE_COLOR[role ?? ""] ?? "#3b82f6"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto", paddingBottom: 120 }}>

      {/* ── INTRO SCREEN ─────────────────────────────────────── */}
      {!guideStarted ? (
        <>
          {/* Hero */}
          <div style={{
            background:   `linear-gradient(135deg, var(--hero-a,#07111e) 0%, var(--hero-b,#0a1628) 60%, var(--hero-c,#060e1a) 100%)`,
            borderRadius: 18, padding: "28px 28px",
            position:     "relative", overflow: "hidden", boxShadow: "var(--shadow-lg)",
          }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:color, opacity:0.07, pointerEvents:"none" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{
                  display:"inline-flex", alignItems:"center", gap:5,
                  fontSize:9, fontWeight:800, padding:"3px 10px",
                  background:"rgba(75,158,243,0.18)", color:"#93c5fd",
                  border:"1px solid rgba(75,158,243,0.3)", borderRadius:999,
                  letterSpacing:"0.07em", textTransform:"uppercase",
                }}>
                  <Ico.Clipboard /> Panduan UAT
                </span>
                <span style={{
                  display:"inline-flex", alignItems:"center", gap:4,
                  fontSize:9, fontWeight:700, padding:"3px 10px",
                  background:color+"20", color,
                  border:`1px solid ${color}35`, borderRadius:999,
                  letterSpacing:"0.06em", textTransform:"uppercase",
                }}>
                  <Ico.Shield /> {cfg.label}
                </span>
              </div>

              <h1 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color:"#f0f6fc", letterSpacing:"-0.02em" }}>
                Selamat datang, {session?.user?.name?.split(" ")[0]}
              </h1>
              <p style={{ margin:"0 0 20px", fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:540 }}>
                {cfg.intro}
              </p>

              {/* Permission list */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:22 }} className="grid-2">
                {cfg.permissions.map((p, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                    <div style={{
                      width:16, height:16, borderRadius:"50%", flexShrink:0,
                      background:color+"20", display:"flex", alignItems:"center", justifyContent:"center",
                      color, marginTop:1,
                    }}>
                      <Ico.Check />
                    </div>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{p}</span>
                  </div>
                ))}
              </div>

              {/* Scenario overview */}
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:9, padding:"8px 14px" }}>
                  <div style={{ fontSize:18, fontWeight:800, color }}>{scenarios.length}</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Skenario</div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:9, padding:"8px 14px" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#93c5fd" }}>{totalAllSteps}</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Total Langkah</div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:9, padding:"8px 14px" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fbbf24" }}>15–30 mnt</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Estimasi Waktu</div>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div style={{ background:"var(--bg-card)", borderRadius:14, padding:"20px", border:"1px solid var(--border)", boxShadow:"var(--shadow-xs)" }}>
            <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>
              Cara Kerja Panduan UAT
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }} className="grid-3">
              {[
                { no:"1", title:"Bubble arahan muncul", desc:"Setiap langkah ditampilkan dalam bubble di pojok kanan bawah layar" },
                { no:"2", title:"Ikuti instruksi", desc:"Baca deskripsi, lakukan langkah, klik tombol navigasi yang tersedia" },
                { no:"3", title:"Lanjutkan atau kembali", desc:"Klik Langkah Berikutnya atau Kembali kapan saja sesuai kebutuhan" },
              ].map((s) => (
                <div key={s.no} style={{ background:"var(--bg-card2)", borderRadius:10, padding:"14px", border:"1px solid var(--border)" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:color+"18", color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, marginBottom:8 }}>
                    {s.no}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skenario list preview */}
          <div style={{ background:"var(--bg-card)", borderRadius:14, padding:"20px", border:"1px solid var(--border)" }}>
            <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>
              Daftar Skenario Pengujian
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {scenarios.map((sc, i) => (
                <div key={sc.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"var(--bg-card2)", borderRadius:9, border:"1px solid var(--border)" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:color+"18", color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
                    {sc.no}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)" }}>{sc.title}</div>
                    <div style={{ fontSize:11, color:"var(--text-muted)" }}>{sc.description}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:999, background:color+"15", color, flexShrink:0 }}>
                    {sc.steps.length} langkah
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo accounts */}
          <div style={{ background:"var(--bg-card2)", borderRadius:12, padding:"16px 18px", border:"1px solid var(--border)" }}>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              Akun Demo — Password: Test1234!
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7 }} className="grid-2">
              {[
                { label:"Super Admin",       email:"super_admin@cmlabs.co", c:"#ef4444" },
                { label:"Executive",         email:"executive@cmlabs.co",   c:"#8b5cf6" },
                { label:"Sales Manager",     email:"sales_mgr@cmlabs.co",  c:"#3b82f6" },
                { label:"Account Executive", email:"ae@cmlabs.co",          c:"#10b981" },
              ].map((a) => (
                <div key={a.email} style={{ padding:"9px 12px", background:"var(--bg-card)", border:`1px solid ${a.c}25`, borderLeft:`3px solid ${a.c}`, borderRadius:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:a.c, marginBottom:2 }}>{a.label}</div>
                  <div style={{ fontSize:10, color:"var(--text-muted)" }}>{a.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={() => setGuideStarted(true)}
            style={{
              display:      "flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:      "14px",
              background:   `linear-gradient(135deg, ${color}, ${color}cc)`,
              color:        "#fff", border:"none", borderRadius:12,
              fontSize:     15, fontWeight:700, cursor:"pointer",
              boxShadow:    `0 4px 20px ${color}40`,
              transition:   "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${color}50` }}
            onMouseLeave={(e) => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 4px 20px ${color}40` }}
          >
            <Ico.Play /> Mulai Pengujian UAT
          </button>
        </>
      ) : (
        // ── GUIDE ACTIVE SCREEN ──────────────────────────────────
        <>
          {/* Progress header */}
          <div style={{
            background:   `linear-gradient(135deg, var(--hero-a,#07111e), var(--hero-b,#0a1628))`,
            borderRadius: 16, padding:"18px 22px",
            position:     "relative", overflow:"hidden", boxShadow:"var(--shadow-md)",
          }}>
            <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:color, opacity:0.07, pointerEvents:"none" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                <div>
                  <h2 style={{ margin:"0 0 2px", fontSize:16, fontWeight:800, color:"#f0f6fc" }}>
                    Pengujian UAT — {cfg.label}
                  </h2>
                  <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                    Skenario {scenarioIdx+1} dari {scenarios.length}: {curScenario?.title}
                  </p>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:totalPct===100?"#34d399":"#93c5fd" }}>
                    {totalDone}/{totalAllSteps} ({totalPct}%)
                  </div>
                  <button
                    onClick={() => setShowBubble(!showBubble)}
                    style={{ padding:"5px 12px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:7, color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer" }}
                  >
                    {showBubble ? "Sembunyikan" : "Tampilkan"} Bubble
                  </button>
                  <button
                    onClick={reset}
                    style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:7, color:"#f87171", fontSize:11, cursor:"pointer" }}
                  >
                    <Ico.RotateCcw /> Reset
                  </button>
                </div>
              </div>

              {/* Overall progress */}
              <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:999, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:999, width:`${totalPct}%`,
                  background: totalPct===100 ? "linear-gradient(90deg,#10b981,#34d399)" : `linear-gradient(90deg,${color},#3b82f6)`,
                  transition:"width 0.5s ease",
                }} />
              </div>
            </div>
          </div>

          {/* Scenario list */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }} className="grid-3">
            {scenarios.map((sc, i) => (
              <ScenarioCard
                key={sc.id}
                scenario={sc}
                color={color}
                stepsDone={scenarioDoneCount(sc)}
                isActive={i === scenarioIdx}
                isCurrent={i === scenarioIdx}
                onClick={() => goToScenario(i)}
              />
            ))}
          </div>

          {/* Current scenario steps */}
          {curScenario && (
            <div style={{ background:"var(--bg-card)", borderRadius:14, border:"1px solid var(--border)", overflow:"hidden", boxShadow:"var(--shadow-xs)" }}>
              <div style={{ padding:"14px 18px 12px", borderBottom:"1px solid var(--border-light)", background:"var(--bg-card2)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:999, background:color+"18", color }}>
                    Skenario {curScenario.no}
                  </span>
                  <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>
                    {curScenario.title}
                  </h3>
                </div>
                <p style={{ margin:"4px 0 0", fontSize:12, color:"var(--text-muted)" }}>
                  {curScenario.description}
                </p>
              </div>

              <div style={{ padding:"16px" }}>
                {curSteps.map((step, i) => {
                  const isDone    = !!doneSteps[step.id]
                  const isCurrent = i === stepIdx
                  const isPast    = i < stepIdx || isDone

                  return (
                    <div key={step.id} style={{ display:"flex", gap:12, marginBottom: i < curSteps.length-1 ? 16 : 0, position:"relative" }}>
                      {/* Connector */}
                      {i < curSteps.length - 1 && (
                        <div style={{
                          position:"absolute", left:15, top:32, width:2,
                          height:"calc(100% - 16px)",
                          background: isPast ? color : "var(--border)",
                          transition:"background 0.3s",
                        }} />
                      )}

                      {/* Step indicator */}
                      <div
                        onClick={() => { setStepIdx(i); setShowBubble(true) }}
                        style={{
                          width:30, height:30, borderRadius:"50%", flexShrink:0,
                          background: isDone ? color : isCurrent ? color+"18" : "var(--bg-card2)",
                          border:`2px solid ${isDone || isCurrent ? color : "var(--border)"}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color: isDone ? "#fff" : isCurrent ? color : "var(--text-muted)",
                          fontSize:11, fontWeight:800, cursor:"pointer",
                          boxShadow: isCurrent ? `0 0 0 4px ${color}18` : "none",
                          transition:"all 0.2s",
                          zIndex:1,
                        }}
                      >
                        {isDone ? <Ico.Check /> : i + 1}
                      </div>

                      {/* Step content */}
                      <div
                        onClick={() => { setStepIdx(i); setShowBubble(true) }}
                        style={{
                          flex:1, paddingBottom:4, cursor:"pointer",
                          opacity: isCurrent ? 1 : isDone ? 0.7 : 0.5,
                        }}
                      >
                        <div style={{
                          fontSize:13, fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? color : isDone ? "var(--text-secondary)" : "var(--text-muted)",
                          textDecoration: isDone ? "line-through" : "none",
                          marginBottom:2,
                        }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.5 }}>
                          {step.description}
                        </div>
                        {isCurrent && (
                          <div style={{
                            display:"inline-flex", alignItems:"center", gap:4,
                            marginTop:4, fontSize:10, color,
                            background:color+"10", padding:"2px 8px", borderRadius:999,
                          }}>
                            Langkah saat ini — lihat bubble di kanan bawah
                            <Ico.ChevRight />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* All done */}
          {totalPct === 100 && (
            <div className="anim-scale" style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"18px 22px",
              background:"rgba(16,185,129,0.1)",
              border:"1px solid rgba(16,185,129,0.25)",
              borderRadius:14,
            }}>
              <div style={{
                width:48, height:48, borderRadius:"50%",
                background:"rgba(16,185,129,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#10b981", flexShrink:0,
              }}>
                <Ico.Flag />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--success)", marginBottom:4 }}>
                  Semua skenario pengujian selesai
                </div>
                <p style={{ margin:0, fontSize:12, color:"var(--text-muted)" }}>
                  Terima kasih, {session?.user?.name?.split(" ")[0]}. Silakan isi kuesioner UAT kami untuk melengkapi pengujian.
                </p>
              </div>
              <a
  href="https://forms.gle/fQxcNQjwspXH2wbDA"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  }}
>
  Isi Kuesioner
   <Ico.ExternalLink />
</a>
            </div>
          )}

          {/* Kuesioner CTA always visible */}
          <div style={{
            background:"var(--bg-card)", borderRadius:14, padding:"20px",
            border:"1px solid var(--border)", textAlign:"center",
          }}>
            <div style={{
              width:40, height:40, borderRadius:10, margin:"0 auto 12px",
              background:"var(--primary-pale)",
              display:"flex", alignItems:"center", justifyContent:"center", color:"var(--primary)",
            }}>
              <Ico.Clipboard />
            </div>
            <h3 style={{ margin:"0 0 6px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>
              Sudah selesai? Isi Kuesioner UAT
            </h3>
            <p style={{ margin:"0 0 16px", fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>
              Feedback Anda bersifat rahasia dan sangat berharga untuk pengembangan sistem.
            </p>
            
             <a
  href="https://forms.gle/fQxcNQjwspXH2wbDA"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  }}
>
  Isi Kuesioner
   <Ico.ExternalLink />
</a>
          </div>
        </>
      )}

      {/* ── BUBBLE OVERLAY ─────────────────────────────────────── */}
      {guideStarted && showBubble && curStep && !isVeryLast && (
        <StepBubble
          step={curStep}
          stepNo={scenarioIdx * 999 + stepIdx + 1}
          totalSteps={totalAllSteps}
          color={color}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          isFirst={isFirstStep}
          isLast={isLastStep && isLastScenario}
          isLastScenario={isLastScenario}
        />
      )}

      {/* ── BUBBLE: COMPLETION ──────────────────────────────────── */}
      {guideStarted && showBubble && isVeryLast && (
        <div style={{
          position:"fixed", bottom:28, right:28, zIndex:999,
          width:340, maxWidth:"calc(100vw - 32px)",
          background:"var(--bg-card)",
          border:"1px solid rgba(16,185,129,0.4)",
          borderRadius:16,
          boxShadow:"0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(16,185,129,0.12)",
          overflow:"hidden",
          animation:"bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{ height:3, background:"linear-gradient(90deg,#10b981,#34d399)", width:"100%" }} />
          <div style={{ padding:"20px", textAlign:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(16,185,129,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#10b981", margin:"0 auto 12px" }}>
              <Ico.Flag />
            </div>
            <h3 style={{ margin:"0 0 6px", fontSize:15, fontWeight:700, color:"var(--success)" }}>
              Pengujian selesai!
            </h3>
            <p style={{ margin:"0 0 16px", fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>
              Semua skenario berhasil dijalankan. Isi kuesioner untuk menyelesaikan UAT.
            </p>
            <a
  href="https://forms.gle/fQxcNQjwspXH2wbDA"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  }}
>
  Isi Kuesioner
   <Ico.ExternalLink />
</a>
          </div>
          <style>{`
            @keyframes bubbleIn{from{transform:translateY(20px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
          `}</style>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}