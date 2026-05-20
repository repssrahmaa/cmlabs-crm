"use client"

import { useState, useEffect } from "react"
import { useSession }    from "next-auth/react"
import { useRoleGuard }  from "@/hooks/useRoleGuard"
import Link              from "next/link"

// ── SVG Icons ──────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconChevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const IconInfo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconFlag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
)
const IconClipboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)
const IconRotateCcw = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v6h6"/>
    <path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

// ── Task Definition ────────────────────────────────────────────
interface UATTask {
  id:        string
  no:        number
  title:     string
  objective: string
  steps:     string[]
  route?:    string
  routeLabel?: string
  tips?:     string
  feature:   string
}

interface RoleGuide {
  role:        string
  label:       string
  color:       string
  description: string
  tasks:       UATTask[]
}

// ── UAT Scenarios per Role ─────────────────────────────────────
const ROLE_GUIDES: Record<string, RoleGuide> = {

  // ────────────────────────────────────────────────
  SUPER_ADMIN: {
    role: "SUPER_ADMIN", label: "Super Admin", color: "#ef4444",
    description: "Sebagai Super Admin, Anda memiliki akses penuh ke seluruh fitur sistem. Pastikan semua fungsi berjalan sesuai ekspektasi.",
    tasks: [
      {
        id: "sa-01", no: 1, title: "Verifikasi Akses Login",
        feature: "Autentikasi",
        objective: "Memastikan sistem autentikasi berjalan dengan benar dan hak akses Super Admin terpenuhi.",
        steps: [
          "Buka halaman login di browser.",
          "Masukkan email: super_admin@cmlabs.co dan password: Test1234!",
          "Klik tombol Masuk ke Dashboard.",
          "Perhatikan bahwa semua menu navigasi tersedia di sidebar.",
          "Perhatikan role badge 'Super Administrator' di sidebar bagian bawah.",
        ],
        tips: "Pastikan semua menu (Dashboard, Leads, Komunikasi, Forecasting, Laporan, Tim, Profil, Panduan UAT) terlihat di sidebar.",
      },
      {
        id: "sa-02", no: 2, title: "Eksplorasi Dashboard Analitik",
        feature: "Dashboard",
        route: "/dashboard", routeLabel: "Buka Dashboard",
        objective: "Mengevaluasi tampilan KPI, grafik tren, distribusi status lead, dan leaderboard sales.",
        steps: [
          "Buka halaman Dashboard.",
          "Perhatikan 4 KPI card: Pipeline Value, Win Rate, Total Revenue, dan Recycle.",
          "Coba filter tahun/bulan pada masing-masing section grafik secara terpisah.",
          "Toggle grafik Tren antara mode Area, Bar, dan Combo.",
          "Ganti tampilan antara data Lead dan Revenue.",
          "Perhatikan distribusi status lead pada grafik batang.",
          "Perhatikan leaderboard sales dengan ranking.",
        ],
        tips: "Setiap section grafik memiliki filter tahun-bulan yang independen — ubah satu filter tidak mempengaruhi grafik lainnya.",
      },
      {
        id: "sa-03", no: 3, title: "Kelola Leads — Tambah, Edit, Pindah Status",
        feature: "Manajemen Leads",
        route: "/leads", routeLabel: "Buka Leads",
        objective: "Menguji fitur Kanban Board beserta semua operasi CRUD pada leads.",
        steps: [
          "Buka halaman Leads — tampilan Kanban Board 6 kolom.",
          "Klik tombol Tambah Lead lalu isi semua field: judul, nama klien, jabatan klien, perusahaan, email, telepon, nilai deal, prioritas, dan deskripsi.",
          "Simpan lead baru — pastikan muncul di kolom Approach.",
          "Drag lead tersebut ke kolom Cold Lead menggunakan drag-and-drop.",
          "Klik lead untuk membuka detail — coba mode Edit, ubah nilai deal.",
          "Tambahkan aktivitas: klik lead, pilih tipe Catatan Internal, isi teks dengan formatting (bold/list).",
          "Tambahkan aktivitas Meeting: isi judul, tanggal, waktu, dan daftar peserta.",
        ],
        tips: "Kolom Kanban dari kiri ke kanan: Approach, Cold Lead, Deck Request, Meeting, Deal, Recycle.",
      },
      {
        id: "sa-04", no: 4, title: "Dashboard Forecasting",
        feature: "Forecasting",
        route: "/forecasting", routeLabel: "Buka Forecasting",
        objective: "Mengevaluasi proyeksi revenue, perhitungan weighted forecast, dan drill-down per lead.",
        steps: [
          "Buka halaman Forecasting.",
          "Perhatikan KPI: Total Forecast, Deal Confirmed, Weighted Forecast, Best Case.",
          "Lihat grafik tren revenue 12 bulan.",
          "Coba filter periode: Semua, Per Tahun, Per Bulan.",
          "Klik salah satu baris lead di tabel pipeline untuk melihat detail perhitungan weighted value.",
          "Perhatikan penjelasan formula: Nilai Lead × Probabilitas = Weighted Value.",
          "Klik tombol Lihat Panduan untuk melihat probabilitas per stage.",
        ],
        tips: "Probabilitas per stage: Approach 10%, Cold Lead 20%, Deck Request 35%, Meeting 60%, Deal 100%, Recycle 5%.",
      },
      {
        id: "sa-05", no: 5, title: "Laporan Performa & Generate Dokumen",
        feature: "Laporan & Dokumen",
        route: "/reports", routeLabel: "Buka Laporan",
        objective: "Mengevaluasi laporan performa tim dan fitur generate dokumen Word.",
        steps: [
          "Buka halaman Laporan & Dokumen, tab Laporan Performa.",
          "Gunakan filter tahun/bulan untuk mengubah periode laporan.",
          "Perhatikan tabel performa sales dengan kolom: deal, recycle, win rate, revenue.",
          "Klik salah satu sales di tabel untuk melihat detail lead yang ditangani.",
          "Beralih ke tab Dokumen — klik tombol Buat Dokumen.",
          "Pilih lead, pilih tipe Invoice, beri judul, klik Buat Dokumen.",
          "Klik dokumen yang baru dibuat untuk membuka halaman Detail Dokumen.",
          "Coba tombol Finalisasi Dokumen, lalu Tandai Sudah Dikirim.",
          "Download dokumen dalam format .docx.",
        ],
        tips: "Dokumen di-download dalam format .docx (Word) agar bisa diedit sesuai kebutuhan.",
      },
      {
        id: "sa-06", no: 6, title: "Manajemen Tim",
        feature: "Manajemen Tim",
        route: "/team", routeLabel: "Buka Tim",
        objective: "Menguji pengelolaan anggota tim beserta visualisasi performa.",
        steps: [
          "Buka halaman Tim.",
          "Perhatikan statistik distribusi role dalam bentuk pie chart.",
          "Perhatikan grafik total lead per sales dengan filter tahun/bulan.",
          "Klik tombol Tambah Anggota — isi nama, email, password, dan role.",
          "Edit salah satu anggota — ubah nomor telepon.",
          "Klik tombol Performa pada salah satu AE atau SM untuk melihat detail leads.",
          "Di modal detail, ubah filter tahun/bulan dan perhatikan data berubah.",
          "Coba toggle Nonaktifkan pada salah satu akun.",
        ],
        tips: "Super Admin dapat mengubah role anggota — fitur ini tidak tersedia untuk Sales Manager.",
      },
      {
        id: "sa-07", no: 7, title: "Dark Mode & Responsivitas",
        feature: "UI/UX",
        objective: "Memastikan tampilan konsisten di berbagai mode dan ukuran layar.",
        steps: [
          "Klik tombol Dark Mode / Light Mode di sidebar atau header.",
          "Jelajahi beberapa halaman dalam dark mode — pastikan semua teks terbaca.",
          "Coba akses sistem di browser mobile atau kecilkan ukuran browser.",
          "Pastikan sidebar berubah menjadi tombol hamburger di mobile.",
          "Buka mobile nav — verifikasi struktur menu sama dengan sidebar.",
        ],
        tips: "Peralihan tema terjadi secara instan tanpa reload halaman.",
      },
    ],
  },

  // ────────────────────────────────────────────────
  EXECUTIVE: {
    role: "EXECUTIVE", label: "Executive", color: "#8b5cf6",
    description: "Sebagai Executive, Anda dapat melihat semua data dan visualisasi, namun tidak dapat melakukan perubahan data apapun.",
    tasks: [
      {
        id: "ex-01", no: 1, title: "Verifikasi Akses Read-Only",
        feature: "RBAC",
        objective: "Memastikan Executive hanya dapat melihat data tanpa bisa mengubah apapun.",
        steps: [
          "Login dengan akun executive@cmlabs.co / Test1234!",
          "Perhatikan sidebar — semua menu analitik tersedia.",
          "Buka halaman Leads — pastikan tidak ada tombol Tambah Lead.",
          "Klik salah satu lead — pastikan tidak ada tombol Edit.",
          "Coba drag lead ke kolom lain — pastikan muncul notifikasi akses terbatas.",
          "Buka halaman Tim — pastikan tidak ada tombol Tambah/Edit/Hapus.",
        ],
        tips: "Banner biru 'Mode Hanya Lihat' ditampilkan di beberapa halaman sebagai konfirmasi status akses Executive.",
      },
      {
        id: "ex-02", no: 2, title: "Analisis Dashboard & KPI",
        feature: "Dashboard",
        route: "/dashboard", routeLabel: "Buka Dashboard",
        objective: "Mengevaluasi kualitas visualisasi data untuk keperluan pengambilan keputusan.",
        steps: [
          "Buka Dashboard dan perhatikan 4 KPI card.",
          "Pada card Pipeline Value, perhatikan breakdown per stage (Approach, Cold Lead, Deck Request, Meeting).",
          "Pada card Win Rate, perhatikan radial chart dan distribusi deal vs recycle.",
          "Pada card Total Revenue, perhatikan breakdown rata-rata per deal.",
          "Filter grafik Tren dengan tahun berbeda dan perhatikan perubahan data.",
          "Filter Distribusi Status dan Leaderboard secara terpisah.",
        ],
        tips: "Setiap grafik memiliki filter independen — Anda bisa membandingkan periode berbeda antar section.",
      },
      {
        id: "ex-03", no: 3, title: "Review Forecasting",
        feature: "Forecasting",
        route: "/forecasting", routeLabel: "Buka Forecasting",
        objective: "Menilai akurasi proyeksi revenue dan kejelasan visualisasi pipeline.",
        steps: [
          "Buka halaman Forecasting.",
          "Filter dengan periode Tahun Ini dan perhatikan weighted forecast.",
          "Klik salah satu lead di tabel pipeline.",
          "Perhatikan detail perhitungan: Nilai × Probabilitas = Weighted Value.",
          "Periksa penjelasan probabilitas per stage dalam Panduan Probabilitas.",
        ],
        tips: "Weighted forecast adalah estimasi realistis berdasarkan probabilitas closing setiap lead.",
      },
      {
        id: "ex-04", no: 4, title: "Laporan & Performa Tim",
        feature: "Laporan",
        route: "/reports", routeLabel: "Buka Laporan",
        objective: "Mengevaluasi kelengkapan data performa dan kemudahan membaca laporan.",
        steps: [
          "Buka halaman Laporan & Dokumen.",
          "Gunakan filter bulan/tahun dan perhatikan data laporan berubah.",
          "Perhatikan grafik tren lead bulanan.",
          "Perhatikan grafik distribusi status lead dan pie chart Deal vs Recycle.",
          "Lihat tabel performa sales — perhatikan kolom deal, recycle, win rate, revenue.",
        ],
        tips: "Laporan Executive bersifat read-only — seluruh data tim tersedia untuk monitoring.",
      },
      {
        id: "ex-05", no: 5, title: "Visualisasi Tim",
        feature: "Tim",
        route: "/team", routeLabel: "Buka Tim",
        objective: "Mengevaluasi visualisasi distribusi tim dan performa individual.",
        steps: [
          "Buka halaman Tim.",
          "Perhatikan chart distribusi role dalam pie chart.",
          "Filter grafik lead per sales dengan tahun/bulan berbeda.",
          "Klik tombol Performa pada salah satu AE.",
          "Di modal, ubah filter tahun/bulan dan perhatikan data berubah.",
          "Lihat distribusi status lead, win rate, dan daftar lead yang ditangani.",
        ],
        tips: "Tombol Performa tersedia untuk semua role termasuk Executive — ini adalah fitur monitoring eksklusif.",
      },
    ],
  },

  // ────────────────────────────────────────────────
  SALES_MANAGER: {
    role: "SALES_MANAGER", label: "Sales Manager", color: "#3b82f6",
    description: "Sebagai Sales Manager, Anda dapat mengelola semua leads, tim AE, laporan, dan dokumen. Anda tidak dapat menghapus user atau mengubah role.",
    tasks: [
      {
        id: "sm-01", no: 1, title: "Verifikasi Akses Sales Manager",
        feature: "RBAC",
        objective: "Memastikan hak akses Sales Manager sesuai — semua fitur tersedia kecuali delete user.",
        steps: [
          "Login dengan akun sales_mgr@cmlabs.co / Test1234!",
          "Perhatikan sidebar — semua menu tersedia termasuk Performa Saya.",
          "Buka halaman Tim — pastikan ada tombol Tambah Anggota dan Edit, namun tidak ada Hapus.",
          "Edit salah satu AE — pastikan tidak bisa mengubah role.",
        ],
        tips: "Sales Manager bisa menambah AE baru dan mengubah data anggota, namun tidak bisa mengubah role atau menghapus user.",
      },
      {
        id: "sm-02", no: 2, title: "Monitor Dashboard Tim",
        feature: "Dashboard",
        route: "/dashboard", routeLabel: "Buka Dashboard",
        objective: "Menilai kelengkapan informasi dashboard untuk monitoring tim sales.",
        steps: [
          "Buka Dashboard — perhatikan leaderboard sales.",
          "Filter section KPI dengan bulan tertentu.",
          "Filter grafik Tren dengan tahun berbeda.",
          "Perhatikan distribusi status lead di grafik batang.",
          "Bandingkan performa anggota tim di leaderboard.",
        ],
        tips: "Filter setiap section bersifat independen — Anda bisa melihat tren berbeda di setiap grafik.",
      },
      {
        id: "sm-03", no: 3, title: "Kelola Leads Tim",
        feature: "Leads",
        route: "/leads", routeLabel: "Buka Leads",
        objective: "Menguji pengelolaan leads termasuk assign ke AE dan pemindahan status.",
        steps: [
          "Buka halaman Leads.",
          "Klik Tambah Lead — isi semua data dan assign ke salah satu AE.",
          "Simpan lead — pastikan muncul di kolom Approach.",
          "Drag lead ke kolom Deck Request.",
          "Klik lead untuk membuka detail.",
          "Tambahkan aktivitas Telepon: isi judul dan catatan hasil telepon.",
          "Tambahkan aktivitas Meeting: isi judul, tanggal, waktu mulai, waktu selesai, dan peserta.",
        ],
        tips: "Sales Manager dapat assign lead ke AE manapun di tim.",
      },
      {
        id: "sm-04", no: 4, title: "Forecasting Tim",
        feature: "Forecasting",
        route: "/forecasting", routeLabel: "Buka Forecasting",
        objective: "Menggunakan forecasting untuk perencanaan target bulanan tim.",
        steps: [
          "Buka halaman Forecasting.",
          "Filter dengan periode bulan ini.",
          "Klik beberapa lead di tabel untuk melihat detail perhitungan weighted value.",
          "Bandingkan Best Case vs Weighted Forecast.",
          "Lihat breakdown pipeline per stage.",
        ],
        tips: "Gunakan Weighted Forecast sebagai acuan target realistis, bukan Best Case.",
      },
      {
        id: "sm-05", no: 5, title: "Laporan, Dokumen & Performa Saya",
        feature: "Laporan & Performa",
        route: "/reports", routeLabel: "Buka Laporan",
        objective: "Mengevaluasi laporan tim dan fitur generate dokumen bisnis.",
        steps: [
          "Buka Laporan — gunakan filter untuk melihat performa bulan ini.",
          "Klik salah satu sales di tabel untuk melihat detail lead yang ditangani.",
          "Perhatikan lead mana yang deal dan mana yang recycle.",
          "Beralih ke tab Dokumen — buat Invoice dari salah satu lead.",
          "Buka detail dokumen — klik Finalisasi Dokumen.",
          "Download dokumen .docx dan buka di Microsoft Word.",
          "Buka halaman Performa Saya.",
          "Eksplorasi tab Overview, Pipeline, dan Aktivitas.",
          "Ubah filter Revenue dan Aktivitas secara terpisah.",
        ],
        tips: "Di halaman Performa Saya, filter Revenue dan filter Aktivitas bersifat independen.",
      },
    ],
  },

  // ────────────────────────────────────────────────
  ACCOUNT_EXECUTIVE: {
    role: "ACCOUNT_EXECUTIVE", label: "Account Executive", color: "#10b981",
    description: "Sebagai Account Executive, Anda dapat mengelola leads yang ditugaskan kepada Anda. Anda bisa melihat semua leads namun hanya bisa mengedit leads milik sendiri.",
    tasks: [
      {
        id: "ae-01", no: 1, title: "Verifikasi Akses Account Executive",
        feature: "RBAC",
        objective: "Memastikan AE bisa melihat semua leads namun hanya bisa mengubah leads miliknya.",
        steps: [
          "Login dengan akun ae@cmlabs.co / Test1234!",
          "Perhatikan sidebar — tidak ada menu Tim dan tidak ada akses ke Laporan umum.",
          "Buka halaman Leads.",
          "Coba drag lead yang bukan milik Anda — perhatikan notifikasi akses terbatas.",
          "Klik lead milik orang lain — pastikan tidak ada tombol Edit atau Hapus.",
          "Klik lead milik Anda — pastikan tombol Edit tersedia.",
        ],
        tips: "PIC lead Anda ditampilkan di setiap lead card. Lead tanpa PIC atau dengan PIC orang lain tidak bisa Anda edit.",
      },
      {
        id: "ae-02", no: 2, title: "Tambah Lead & Aktivitas",
        feature: "Leads & Aktivitas",
        route: "/leads", routeLabel: "Buka Leads",
        objective: "Menguji alur lengkap pengelolaan lead dari pembuatan hingga pencatatan aktivitas.",
        steps: [
          "Buka Leads — klik Tambah Lead.",
          "Isi data: judul 'Demo UAT [nama Anda]', nama klien, perusahaan, email, nilai Rp 15.000.000.",
          "Simpan — perhatikan PIC otomatis terisi nama Anda.",
          "Lead baru muncul di kolom Approach.",
          "Drag lead ke kolom Cold Lead.",
          "Klik lead untuk membuka detail.",
          "Tambahkan Catatan Internal dengan formatting bold: tulis 'Klien tertarik, akan follow up minggu depan'.",
          "Tambahkan aktivitas Telepon: isi judul dan catatan hasil telepon.",
        ],
        tips: "Saat membuat lead, PIC otomatis diisi dengan nama Anda — tidak bisa diubah ke AE lain.",
      },
      {
        id: "ae-03", no: 3, title: "Scheduling Meeting",
        feature: "Activity — Meeting",
        route: "/leads", routeLabel: "Buka Leads",
        objective: "Menguji fitur penjadwalan meeting dengan link Google Meet dan undangan peserta.",
        steps: [
          "Buka salah satu lead milik Anda.",
          "Tambahkan aktivitas tipe Meeting.",
          "Isi judul: 'Presentasi Proposal Q2 2025'.",
          "Pilih tanggal, jam mulai, dan jam selesai.",
          "Masukkan email peserta (pisahkan dengan koma).",
          "Isi link Google Meet jika tersedia (opsional).",
          "Simpan meeting.",
          "Perhatikan meeting muncul di timeline lead dengan detail waktu dan peserta.",
        ],
        tips: "Link Google Meet bisa diisi manual atau dibuat dari platform Google Calendar.",
      },
      {
        id: "ae-04", no: 4, title: "Performa Saya",
        feature: "Performa Personal",
        route: "/reports/personal", routeLabel: "Buka Performa Saya",
        objective: "Mengevaluasi tampilan statistik kinerja personal dan kemudahan membaca data.",
        steps: [
          "Buka halaman Performa Saya.",
          "Perhatikan KPI: Total Lead, Deal, Win Rate, Revenue, Task Selesai.",
          "Filter KPI Lead dengan tahun ini.",
          "Buka tab Overview — lihat grafik tren lead dan revenue.",
          "Ubah filter Revenue (tahun/bulan) secara terpisah dari filter lead.",
          "Buka tab Pipeline — lihat distribusi semua lead termasuk history.",
          "Buka tab Aktivitas — perhatikan grafik aktivitas per tipe.",
          "Ubah filter Aktivitas (tahun/bulan) secara terpisah.",
        ],
        tips: "Di halaman Performa Saya, filter Lead, Revenue, dan Aktivitas masing-masing bersifat independen.",
      },
      {
        id: "ae-05", no: 5, title: "Generate Dokumen",
        feature: "Dokumen",
        route: "/reports", routeLabel: "Buka Laporan",
        objective: "Menguji pembuatan dan download dokumen bisnis dari lead.",
        steps: [
          "Buka Laporan — beralih ke tab Dokumen.",
          "Klik Buat Dokumen.",
          "Pilih lead milik Anda dari dropdown.",
          "Pilih tipe SPK, beri judul 'SPK Demo UAT'.",
          "Klik Buat Dokumen.",
          "Klik dokumen yang baru dibuat untuk membuka halaman detail.",
          "Perhatikan isi dokumen terisi otomatis dari data lead.",
          "Coba Download .docx.",
        ],
        tips: "Anda hanya bisa membuat dokumen dari lead yang ditugaskan kepada Anda.",
      },
    ],
  },
}

// ── Task Card ──────────────────────────────────────────────────
function TaskCard({ task, done, color, onToggle }: {
  task: UATTask; done: boolean; color: string; onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background:   done ? color + "08" : "var(--bg-card)",
      border:       `1px solid ${done ? color + "35" : "var(--border)"}`,
      borderRadius: 12,
      overflow:     "hidden",
      transition:   "all 0.22s ease",
      boxShadow:    done ? `0 0 0 1px ${color}18` : "var(--shadow-xs)",
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        12,
          padding:    "13px 16px",
          cursor:     "pointer",
          userSelect: "none",
        }}
      >
        {/* Step number / check */}
        <div style={{
          width:          30, height: 30,
          borderRadius:   "50%",
          background:     done ? color : "var(--bg-card2)",
          border:         `2px solid ${done ? color : "var(--border)"}`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          transition:     "all 0.2s",
          boxShadow:      done ? `0 0 0 3px ${color}18` : "none",
          color:          done ? "#fff" : "var(--text-muted)",
          fontSize:       11,
          fontWeight:     700,
        }}>
          {done ? <IconCheck /> : task.no}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{
              fontSize:       13,
              fontWeight:     600,
              color:          done ? color : "var(--text-primary)",
              textDecoration: done ? "line-through" : "none",
              opacity:        done ? 0.75 : 1,
            }}>
              {task.title}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999,
              background: color + "15", color,
            }}>
              {task.feature}
            </span>
          </div>
          {!expanded && (
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.objective}
            </p>
          )}
        </div>

        {/* Chevron */}
        <span style={{
          color:      "var(--text-muted)",
          transition: "transform 0.2s",
          transform:  expanded ? "rotate(90deg)" : "rotate(0deg)",
          flexShrink: 0,
        }}>
          <IconChevron />
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          padding:    "0 16px 16px",
          borderTop:  "1px solid var(--border-light)",
          paddingTop: 14,
          animation:  "fadeIn 0.2s ease",
        }}>
          {/* Objective */}
          <div style={{
            padding:      "9px 12px",
            background:   "var(--bg-card2)",
            border:       "1px solid var(--border)",
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Tujuan Pengujian
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {task.objective}
            </p>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Langkah Pengujian
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {task.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width:      20, height: 20, borderRadius: "50%",
                    background: color + "18", color,
                    display:    "flex", alignItems: "center", justifyContent: "center",
                    fontSize:   10, fontWeight: 800, flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {task.tips && (
            <div style={{
              display:      "flex", gap: 9, alignItems: "flex-start",
              padding:      "9px 12px",
              background:   color + "0d",
              border:       `1px solid ${color}22`,
              borderRadius: 8,
              marginBottom: 12,
            }}>
              <span style={{ flexShrink: 0, color, marginTop: 1 }}><IconInfo /></span>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <strong style={{ color }}>Tips:</strong> {task.tips}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {task.route && (
              <Link href={task.route} style={{
                display:        "inline-flex", alignItems: "center", gap: 6,
                padding:        "7px 14px",
                background:     `linear-gradient(135deg, ${color}, ${color}cc)`,
                color:          "#fff",
                borderRadius:   8, fontSize: 12, fontWeight: 600,
                textDecoration: "none",
                boxShadow:      `0 3px 10px ${color}30`,
                transition:     "all 0.15s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 5px 16px ${color}45` }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 3px 10px ${color}30` }}
              >
                {task.routeLabel}
                <IconArrowRight />
              </Link>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onToggle() }}
              style={{
                display:    "inline-flex", alignItems: "center", gap: 6,
                padding:    "7px 14px",
                background: done ? "var(--bg-card2)" : color + "15",
                color:      done ? "var(--text-muted)" : color,
                border:     `1px solid ${done ? "var(--border)" : color + "35"}`,
                borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor:     "pointer", transition: "all 0.15s",
              }}
            >
              {done ? <><IconRotateCcw /> Tandai Belum</> : <><IconCheck /> Tandai Selesai</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── STORAGE KEY ────────────────────────────────────────────────
const STORAGE_KEY = "uat-progress-v2"

function loadProgress(role: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${role}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveProgress(role: string, progress: Record<string, boolean>) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${role}`, JSON.stringify(progress))
  } catch {}
}

// ── GOOGLE FORM URL ────────────────────────────────────────────
// Ganti dengan URL Google Form kuesioner UAT Anda
const GFORM_URL = "https://forms.gle/YOUR_FORM_LINK_HERE"

// ── Main Page ──────────────────────────────────────────────────
export default function UATGuidePage() {
  const { data: session }          = useSession()
  const { role }                   = useRoleGuard()
  const [progress, setProgress]    = useState<Record<string, boolean>>({})
  const [mounted,  setMounted]     = useState(false)

  const guide = role ? ROLE_GUIDES[role] : null

  useEffect(() => {
    setMounted(true)
    if (role) setProgress(loadProgress(role))
  }, [role])

  function toggleTask(taskId: string) {
    if (!role) return
    const next = { ...progress, [taskId]: !progress[taskId] }
    setProgress(next)
    saveProgress(role, next)
  }

  function resetAll() {
    if (!role || !confirm("Reset semua progress pengujian?")) return
    setProgress({})
    saveProgress(role, {})
  }

  if (!mounted) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!guide) return (
    <div style={{ padding: 24, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)" }}>
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
        Panduan UAT tidak tersedia untuk role ini.
      </p>
    </div>
  )

  const tasks      = guide.tasks
  const doneCount  = tasks.filter((t) => progress[t.id]).length
  const totalCount = tasks.length
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const allDone    = doneCount === totalCount

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, margin: "0 auto" }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <div style={{
        background:   `linear-gradient(135deg, var(--hero-a,#07111e) 0%, var(--hero-b,#0a1628) 60%, var(--hero-c,#060e1a) 100%)`,
        borderRadius: 18,
        padding:      "24px 26px",
        position:     "relative",
        overflow:     "hidden",
        boxShadow:    "var(--shadow-lg)",
      }}>
        {/* Decorative */}
        <div style={{ position:"absolute", top:-40, right:-30, width:160, height:160, borderRadius:"50%", background:guide.color, opacity:0.07, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-20, left:60, width:80, height:80, borderRadius:"50%", background:"#3b82f6", opacity:0.06, pointerEvents:"none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              display:       "inline-flex", alignItems: "center", gap: 5,
              fontSize:      9, fontWeight: 800, padding: "3px 10px",
              background:    "rgba(75,158,243,0.18)", color: "#93c5fd",
              border:        "1px solid rgba(75,158,243,0.3)",
              borderRadius:  999, letterSpacing: "0.07em", textTransform: "uppercase",
            }}>
              <IconClipboard />
              Panduan UAT
            </span>
            <span style={{
              display:      "inline-flex", alignItems: "center", gap: 4,
              fontSize:     9, fontWeight: 700, padding: "3px 10px",
              background:   guide.color + "20", color: guide.color,
              border:       `1px solid ${guide.color}35`,
              borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              <IconShield />
              {guide.label}
            </span>
          </div>

          {/* Greeting */}
          <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#f0f6fc", letterSpacing: "-0.02em" }}>
            Halo, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 560 }}>
            {guide.description}
          </p>

          {/* Progress bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Progress pengujian</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? "#34d399" : "#93c5fd" }}>
                {doneCount} / {totalCount} tugas ({pct}%)
              </span>
            </div>
            <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height:     "100%", borderRadius: 999, width: `${pct}%`,
                background: pct === 100
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : `linear-gradient(90deg, ${guide.color}, #3b82f6)`,
                transition: "width 0.6s ease",
                boxShadow:  pct > 0 ? `0 0 10px ${guide.color}50` : "none",
              }} />
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { l: "Total Tugas",  v: totalCount,              c: "#93c5fd" },
              { l: "Selesai",      v: doneCount,               c: "#34d399" },
              { l: "Tersisa",      v: totalCount - doneCount,  c: "#fbbf24" },
            ].map((s) => (
              <div key={s.l} style={{
                background:   "rgba(255,255,255,0.06)",
                border:       "1px solid rgba(255,255,255,0.08)",
                borderRadius: 9,
                padding:      "8px 14px",
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Completion Banner ──────────────────────────── */}
      {allDone && (
        <div className="anim-scale" style={{
          display:      "flex", alignItems: "center", gap: 14,
          padding:      "16px 20px",
          background:   "rgba(16,185,129,0.1)",
          border:       "1px solid rgba(16,185,129,0.25)",
          borderRadius: 14,
        }}>
          <div style={{
            width:      44, height: 44, borderRadius: "50%",
            background: "rgba(16,185,129,0.15)",
            display:    "flex", alignItems: "center", justifyContent: "center",
            color:      "#10b981", flexShrink: 0,
          }}>
            <IconFlag />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--success)", marginBottom: 3 }}>
              Semua tugas pengujian selesai
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
              Terima kasih telah menyelesaikan skenario UAT. Silakan isi kuesioner Google Form berikut.
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
  <IconExternalLink />
</a>
        </div>
      )}

      {/* ── Info Box ──────────────────────────────────── */}
      <div style={{
        display:      "flex", gap: 12, alignItems: "flex-start",
        padding:      "13px 16px",
        background:   "var(--primary-pale)",
        border:       "1px solid var(--primary-glow)",
        borderRadius: 12,
      }}>
        <span style={{ flexShrink: 0, color: "var(--primary)", marginTop: 1 }}><IconInfo /></span>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
            Cara Menggunakan Panduan Ini
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Klik setiap kartu tugas untuk melihat langkah-langkah detail dan tips. Gunakan tombol navigasi
            untuk langsung berpindah ke halaman yang sedang diuji. Setelah mencoba, klik
            <strong> Tandai Selesai</strong> untuk mencatat progress. Progress tersimpan otomatis di browser Anda.
          </p>
        </div>
      </div>

      {/* ── Task List ─────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Daftar Tugas Pengujian
          </h2>
          {doneCount > 0 && (
            <button
              onClick={resetAll}
              style={{
                display:    "flex", alignItems: "center", gap: 5,
                padding:    "5px 12px",
                background: "var(--bg-card2)",
                border:     "1px solid var(--border)",
                borderRadius: 7, fontSize: 11,
                color:      "var(--text-muted)", cursor: "pointer",
              }}
            >
              <IconRotateCcw /> Reset Progress
            </button>
          )}
        </div>

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            done={!!progress[task.id]}
            color={guide.color}
            onToggle={() => toggleTask(task.id)}
          />
        ))}
      </div>

      {/* ── Kuesioner CTA ─────────────────────────────── */}
      <div style={{
        background:   "var(--bg-card)",
        borderRadius: 16,
        padding:      "24px",
        border:       "1px solid var(--border)",
        boxShadow:    "var(--shadow-xs)",
        textAlign:    "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: "0 auto 14px",
          background: "var(--primary-pale)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--primary)",
        }}>
          <IconClipboard />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
          Sudah selesai mencoba sistem?
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Mohon luangkan 10 menit untuk mengisi kuesioner UAT kami.
          Feedback Anda sangat berharga untuk pengembangan sistem CRM CMLabs ke depannya.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          
           <a
  href="https://forms.gle/fQxcNQjwspXH2wbDA"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "#fff",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 4px 18px rgba(59,130,246,0.4)",
    transition: "all 0.2s",
  }}
  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translateY(-1px)"
    e.currentTarget.style.boxShadow = "0 8px 28px rgba(59,130,246,0.5)"
  }}
  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "none"
    e.currentTarget.style.boxShadow = "0 4px 18px rgba(59,130,246,0.4)"
  }}
>
  Isi Kuesioner Google Form
  <IconExternalLink />
</a>
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
          Data Anda bersifat rahasia dan hanya digunakan untuk keperluan penelitian ilmiah.
        </p>
      </div>

      {/* ── Demo Accounts Info ─────────────────────────── */}
      <div style={{
        background:   "var(--bg-card2)",
        borderRadius: 12,
        padding:      "16px 18px",
        border:       "1px solid var(--border)",
      }}>
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Akun Demo — Password: Test1234!
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }} className="grid-2">
          {[
            { label: "Super Admin",       email: "super_admin@cmlabs.co", color: "#ef4444" },
            { label: "Executive",         email: "executive@cmlabs.co",   color: "#8b5cf6" },
            { label: "Sales Manager",     email: "sales_mgr@cmlabs.co",  color: "#3b82f6" },
            { label: "Account Executive", email: "ae@cmlabs.co",          color: "#10b981" },
          ].map((a) => (
            <div key={a.email} style={{
              padding:      "9px 12px",
              background:   "var(--bg-card)",
              border:       `1px solid ${a.color}25`,
              borderLeft:   `3px solid ${a.color}`,
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: a.color, marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "DM Mono, monospace" }}>{a.email}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn    { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}