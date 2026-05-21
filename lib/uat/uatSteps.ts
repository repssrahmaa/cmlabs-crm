// ── TIPE DATA ──────────────────────────────────────────────────
export interface UATStep {
  id:           string
  route:        string        // halaman tempat step ini dijalankan
  title:        string
  description:  string
  substeps:     string[]
  checkpoint:   string
  tips?:        string
  warning?:     string
  action?:      string        // label tombol navigasi
  actionRoute?: string        // target navigasi
  isExternal?:  boolean
  externalUrl?: string
  role:         UATRole | "ALL"
}

export type UATRole = "SUPER_ADMIN" | "EXECUTIVE" | "SALES_MANAGER" | "ACCOUNT_EXECUTIVE"

export const GFORM_URL = "https://forms.gle/YOUR_FORM_LINK_HERE"

// ── WARNA PER ROLE ─────────────────────────────────────────────
export const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN:       "#ef4444",
  EXECUTIVE:         "#8b5cf6",
  SALES_MANAGER:     "#3b82f6",
  ACCOUNT_EXECUTIVE: "#10b981",
}

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:       "Super Admin",
  EXECUTIVE:         "Executive",
  SALES_MANAGER:     "Sales Manager",
  ACCOUNT_EXECUTIVE: "Account Executive",
}

// Akun demo per role
export const DEMO_ACCOUNTS: Record<UATRole, { email: string; password: string }> = {
  SUPER_ADMIN:       { email: "super_admin@cmlabs.co", password: "Test1234!" },
  EXECUTIVE:         { email: "executive@cmlabs.co",   password: "Test1234!" },
  SALES_MANAGER:     { email: "sales_mgr@cmlabs.co",  password: "Test1234!" },
  ACCOUNT_EXECUTIVE: { email: "ae@cmlabs.co",          password: "Test1234!" },
}

// ── SEMUA STEPS UAT ────────────────────────────────────────────
// Setiap step memiliki `role` untuk menentukan step mana
// yang ditampilkan untuk role tertentu.
// Steps dengan route "/login" dimulai sebelum user login.

export const ALL_STEPS: UATStep[] = [

  // ══════════════════════════════════════════════════════════════
  // LANGKAH 1 — LOGIN (semua role mulai di sini)
  // ══════════════════════════════════════════════════════════════
  {
    id: "login-1", route: "/login", role: "ALL",
    title: "Selamat datang di UAT CMLabs CRM",
    description: "Anda akan menguji sistem CRM berbasis web untuk monitoring leads dan sales. Ikuti setiap langkah yang ditampilkan hingga selesai dan mengisi kuesioner.",
    substeps: [
      "Baca deskripsi setiap langkah dengan teliti",
      "Lakukan instruksi yang diminta",
      "Klik tombol Langkah Berikutnya setelah selesai",
      "Bubble panduan ini akan selalu tampil di setiap halaman",
    ],
    checkpoint: "Anda memahami alur pengujian UAT yang akan dijalani.",
    tips: "Progress Anda tersimpan otomatis — jika browser ditutup, buka kembali dan lanjutkan dari langkah terakhir.",
  },
  {
    id: "login-2", route: "/login", role: "ALL",
    title: "Masuk ke sistem dengan akun demo",
    description: "Gunakan akun demo yang disediakan sesuai role yang Anda uji. Setiap role memiliki hak akses berbeda yang akan Anda eksplorasi.",
    substeps: [
      "Masukkan email sesuai role yang ditugaskan kepada Anda",
      "Masukkan password: Test1234!",
      "Klik tombol Masuk ke Dashboard",
      "Tunggu hingga halaman Dashboard terbuka",
    ],
    checkpoint: "Berhasil masuk dan melihat halaman Dashboard. Sidebar menampilkan menu navigasi.",
    tips: "Jika login gagal, pastikan Caps Lock tidak aktif. Password: Test1234! (huruf T kapital).",
    action: "Klik di sini jika belum login", actionRoute: "/login",
  },

  // ══════════════════════════════════════════════════════════════
  // DASHBOARD — semua role
  // ══════════════════════════════════════════════════════════════
  {
    id: "dash-1", route: "/dashboard", role: "ALL",
    title: "Eksplorasi Dashboard — KPI Cards",
    description: "Dashboard menampilkan 4 KPI card utama yang berisi ringkasan performa tim secara real-time.",
    substeps: [
      "Amati KPI card Pipeline Value — perhatikan breakdown per stage pipeline",
      "Amati KPI card Win Rate — perhatikan radial chart dan distribusi deal vs recycle",
      "Amati KPI card Total Revenue — perhatikan rata-rata per deal",
      "Amati KPI card Recycle — perhatikan persentase lead gagal",
      "Arahkan kursor ke setiap card untuk melihat efek hover",
    ],
    checkpoint: "4 KPI card menampilkan data dengan breakdown yang mudah dibaca.",
    action: "Buka Dashboard", actionRoute: "/dashboard",
  },
  {
    id: "dash-2", route: "/dashboard", role: "ALL",
    title: "Uji filter independen setiap section grafik",
    description: "Setiap section grafik di dashboard memiliki filter tahun/bulan yang independen — mengubah satu filter tidak mempengaruhi grafik lainnya.",
    substeps: [
      "Pada bagian header (KPI), ubah filter tahun — perhatikan 4 KPI card berubah",
      "Ubah filter pada grafik Tren (bagian berbeda dari KPI) — perhatikan hanya grafik itu yang berubah",
      "Ubah filter pada Distribusi Status — perhatikan hanya grafik batang itu berubah",
      "Ubah filter pada Leaderboard — perhatikan hanya ranking yang berubah",
      "Pastikan setiap perubahan filter hanya mempengaruhi section yang bersangkutan",
    ],
    checkpoint: "Setiap section berubah secara independen — filter satu tidak mempengaruhi lainnya.",
    tips: "Inilah keunggulan dashboard ini: analisis multi-periode dalam satu tampilan.",
  },
  {
    id: "dash-3", route: "/dashboard", role: "ALL",
    title: "Uji mode tampilan grafik Tren",
    description: "Grafik tren performa tim bisa ditampilkan dalam 3 mode berbeda.",
    substeps: [
      "Pada section Tren Performa Tim, klik tombol Area → Bar → Combo",
      "Toggle antara metrik Lead dan Revenue",
      "Amati perubahan visualisasi data di setiap mode",
      "Pilih mode yang menurut Anda paling mudah dipahami",
    ],
    checkpoint: "Grafik berubah sesuai mode dan metrik yang dipilih.",
  },

  // ══════════════════════════════════════════════════════════════
  // LEADS — Super Admin & Sales Manager & AE
  // ══════════════════════════════════════════════════════════════
  {
    id: "leads-1", route: "/leads", role: "ALL",
    title: "Buka halaman Leads — Kanban Board",
    description: "Halaman Leads menampilkan Kanban Board dengan 6 kolom yang merepresentasikan tahap pipeline leads.",
    substeps: [
      "Klik menu Leads di sidebar",
      "Amati 6 kolom: Approach, Cold Lead, Deck Request, Meeting, Deal, Recycle",
      "Perhatikan setiap card lead menampilkan: judul, nama klien, nilai deal, dan PIC",
    ],
    checkpoint: "Kanban Board 6 kolom terbuka dengan card leads di dalamnya.",
    action: "Buka Leads", actionRoute: "/leads",
  },
  {
    id: "leads-2", route: "/leads", role: "SUPER_ADMIN",
    title: "Tambah Lead baru (Super Admin)",
    description: "Sebagai Super Admin, Anda bisa menambah lead dan mengassign ke AE manapun.",
    substeps: [
      "Klik tombol + Tambah Lead",
      "Isi Judul Lead: 'Demo UAT Super Admin'",
      "Isi Nama Klien: 'PT Maju Bersama'",
      "Isi Jabatan Klien: 'Marketing Director'",
      "Isi Email: klien@example.com, Telepon: 08123456789",
      "Isi Nilai Deal: 25000000",
      "Pilih Prioritas: Tinggi",
      "Di kolom Deskripsi, coba bold text dan buat bullet list",
      "Pilih PIC: salah satu AE dari dropdown",
      "Klik Tambah Lead",
    ],
    checkpoint: "Lead 'Demo UAT Super Admin' muncul di kolom Approach.",
    tips: "Super Admin dapat assign lead ke siapapun. Formatting teks (bold, bullet) tersedia di field Deskripsi.",
  },
  {
    id: "leads-2-sm", route: "/leads", role: "SALES_MANAGER",
    title: "Tambah Lead dan assign ke AE",
    description: "Sales Manager dapat menambah lead dan menugaskannya ke Account Executive mana pun.",
    substeps: [
      "Klik tombol + Tambah Lead",
      "Isi Judul: 'Demo UAT Sales Manager'",
      "Isi data klien lengkap (nama, jabatan, perusahaan, email)",
      "Isi Nilai Deal: 20000000",
      "Di Deskripsi, coba formatting: tulis teks, klik Bold, klik List",
      "Pilih PIC: assign ke salah satu AE",
      "Klik Tambah Lead",
    ],
    checkpoint: "Lead baru muncul di kolom Approach dengan AE yang dipilih sebagai PIC.",
  },
  {
    id: "leads-2-ae", route: "/leads", role: "ACCOUNT_EXECUTIVE",
    title: "Tambah Lead (PIC otomatis = Anda)",
    description: "AE dapat menambah lead, namun PIC otomatis diisi dengan nama Anda sendiri.",
    substeps: [
      "Klik tombol + Tambah Lead",
      "Isi Judul: 'Demo UAT AE [nama Anda]'",
      "Isi data klien: nama, jabatan, perusahaan, email, telepon",
      "Isi Nilai Deal: 15000000",
      "Di Deskripsi, coba bold dan bullet list menggunakan toolbar",
      "Perhatikan field PIC sudah otomatis terisi nama Anda",
      "Klik Tambah Lead",
    ],
    checkpoint: "Lead muncul di kolom Approach. Field PIC menampilkan nama Anda.",
    tips: "AE tidak bisa mengassign lead ke orang lain — PIC selalu diri sendiri.",
  },
  {
    id: "leads-2-ex", route: "/leads", role: "EXECUTIVE",
    title: "Verifikasi akses Read-Only di Leads",
    description: "Executive hanya bisa melihat leads, tidak bisa mengubah data apapun.",
    substeps: [
      "Perhatikan: tidak ada tombol + Tambah Lead",
      "Klik salah satu card lead untuk membuka detail",
      "Perhatikan tidak ada tombol Edit atau Hapus",
      "Coba drag card lead ke kolom lain — amati notifikasi akses terbatas yang muncul",
    ],
    checkpoint: "Notifikasi akses terbatas muncul saat mencoba mengubah data. Tidak ada tombol edit.",
    tips: "Banner biru 'Mode Hanya Lihat' ditampilkan sebagai konfirmasi status akses Executive.",
    warning: "Executive tidak bisa mengubah data apapun — ini adalah batasan yang disengaja.",
  },
  {
    id: "leads-3", route: "/leads", role: "SUPER_ADMIN",
    title: "Pindahkan lead dengan Drag and Drop",
    description: "Drag and drop adalah fitur utama Kanban untuk memperbarui status lead.",
    substeps: [
      "Temukan lead 'Demo UAT Super Admin' di kolom Approach",
      "Klik dan tahan card lead tersebut",
      "Seret perlahan ke kolom Cold Lead",
      "Lepaskan — lead berpindah kolom",
      "Drag sekali lagi ke kolom Deck Request",
    ],
    checkpoint: "Lead berhasil berpindah ke kolom Deck Request melalui drag and drop.",
  },
  {
    id: "leads-3-sm", route: "/leads", role: "SALES_MANAGER",
    title: "Pindahkan lead via Drag and Drop",
    description: "Perbarui status lead dengan drag and drop di Kanban Board.",
    substeps: [
      "Temukan lead yang baru dibuat di kolom Approach",
      "Drag ke kolom Cold Lead",
      "Drag sekali lagi ke kolom Meeting",
    ],
    checkpoint: "Lead berpindah ke kolom Meeting.",
  },
  {
    id: "leads-3-ae", route: "/leads", role: "ACCOUNT_EXECUTIVE",
    title: "Pindah status lead sendiri & verifikasi batasan",
    description: "AE hanya bisa drag lead miliknya. Coba juga drag lead milik orang lain.",
    substeps: [
      "Drag lead milik Anda ke kolom Cold Lead",
      "Cari lead yang PIC-nya bukan Anda",
      "Coba drag lead tersebut — amati notifikasi yang muncul",
      "Klik lead milik orang lain — pastikan tidak ada tombol Edit",
    ],
    checkpoint: "Lead sendiri berhasil dipindah. Lead orang lain memunculkan notifikasi akses terbatas.",
  },
  {
    id: "leads-4", route: "/leads", role: "ALL",
    title: "Tambah aktivitas di Timeline Lead",
    description: "Setiap lead memiliki timeline aktivitas untuk mencatat semua komunikasi dengan klien.",
    substeps: [
      "Klik salah satu lead milik Anda untuk membuka detail",
      "Temukan section Timeline/Aktivitas di panel detail",
      "Klik tombol + Tambah Aktivitas",
      "Pilih tipe: Catatan Internal",
      "Isi judul: 'Follow up pertama'",
      "Di kolom catatan, tulis teks lalu coba: klik Bold (B), klik Bullet List",
      "Klik Simpan",
      "Perhatikan aktivitas muncul di timeline secara kronologis",
    ],
    checkpoint: "Aktivitas Catatan Internal muncul di timeline dengan teks berformat.",
    tips: "Toolbar formatting di textarea mendukung Bold, Italic, Underline, Bullet List, Numbered List, dan Heading.",
  },
  {
    id: "leads-5", route: "/leads", role: "ALL",
    title: "Jadwalkan Meeting di Timeline",
    description: "Buat aktivitas Meeting dengan detail waktu dan peserta di timeline lead.",
    substeps: [
      "Di panel timeline lead yang sama, klik + Tambah Aktivitas lagi",
      "Pilih tipe: Meeting",
      "Isi judul: 'Presentasi Proposal'",
      "Pilih tanggal (pilih besok atau lusa)",
      "Isi Jam Mulai: 09:00 dan Jam Selesai: 10:00",
      "Di field Peserta, isi email klien",
      "Isi Link Meeting: https://meet.google.com/xxx-xxxx-xxx (contoh)",
      "Klik Simpan Meeting",
    ],
    checkpoint: "Meeting terjadwal tampil di timeline dengan informasi waktu, peserta, dan link meeting.",
  },

  // ══════════════════════════════════════════════════════════════
  // FORECASTING — SA, SM, EX
  // ══════════════════════════════════════════════════════════════
  {
    id: "forecast-1", route: "/forecasting", role: "SUPER_ADMIN",
    title: "Buka Forecasting dan amati KPI",
    description: "Forecasting menampilkan proyeksi revenue berdasarkan weighted probability setiap lead.",
    substeps: [
      "Klik menu Forecasting di sidebar",
      "Amati 4 KPI: Total Forecast, Deal Confirmed, Weighted Forecast, Best Case",
      "Amati grafik tren revenue 12 bulan terakhir",
      "Ubah filter periode: coba Semua → Per Tahun → Per Bulan",
    ],
    checkpoint: "Halaman Forecasting terbuka dengan KPI dan grafik periode.",
    action: "Buka Forecasting", actionRoute: "/forecasting",
  },
  {
    id: "forecast-1-sm", route: "/forecasting", role: "SALES_MANAGER",
    title: "Analisis Forecasting untuk target tim",
    description: "Gunakan forecasting sebagai dasar penetapan target penjualan tim.",
    substeps: [
      "Buka Forecasting",
      "Filter dengan periode Bulan Ini",
      "Bandingkan Weighted Forecast vs Best Case",
      "Scroll ke tabel pipeline — klik salah satu lead",
      "Baca penjelasan perhitungan formula di modal",
    ],
    checkpoint: "Modal detail menampilkan formula: Nilai × Probabilitas = Weighted Value.",
    action: "Buka Forecasting", actionRoute: "/forecasting",
  },
  {
    id: "forecast-1-ex", route: "/forecasting", role: "EXECUTIVE",
    title: "Review Forecasting Revenue",
    description: "Lihat proyeksi revenue tim sebagai dasar evaluasi kinerja.",
    substeps: [
      "Buka Forecasting",
      "Baca KPI Weighted Forecast — ini estimasi realistis berdasarkan probabilitas",
      "Ubah filter periode",
      "Klik salah satu lead di tabel — baca detail perhitungan",
    ],
    checkpoint: "Modal detail memberi penjelasan lengkap tentang cara perhitungan forecast.",
    action: "Buka Forecasting", actionRoute: "/forecasting",
  },
  {
    id: "forecast-2", route: "/forecasting", role: "SUPER_ADMIN",
    title: "Drill-down perhitungan per lead",
    description: "Klik setiap lead di tabel pipeline untuk melihat detail perhitungan weighted value.",
    substeps: [
      "Scroll ke tabel Pipeline di bagian bawah halaman",
      "Klik tombol filter status untuk memfilter tampilan",
      "Klik salah satu baris lead",
      "Modal terbuka — perhatikan: Nilai Lead × Probabilitas (%) = Weighted Value",
      "Baca penjelasan probabilitas: stage lebih maju = probabilitas lebih tinggi",
      "Tutup modal — klik lead lain dengan stage berbeda",
      "Bandingkan weighted value kedua lead tersebut",
    ],
    checkpoint: "Setiap lead menampilkan detail perhitungan yang berbeda sesuai stage-nya.",
    tips: "Probabilitas: Approach 10%, Cold Lead 20%, Deck Request 35%, Meeting 60%, Deal 100%, Recycle 5%.",
  },

  // ══════════════════════════════════════════════════════════════
  // LAPORAN — SA, SM, EX
  // ══════════════════════════════════════════════════════════════
  {
    id: "report-1", route: "/reports", role: "SUPER_ADMIN",
    title: "Buka Laporan Performa Tim",
    description: "Halaman laporan menampilkan performa tim dengan filter periode dan drill-down per sales.",
    substeps: [
      "Klik menu Laporan & Dokumen di sidebar",
      "Pastikan tab Laporan Performa aktif",
      "Ubah filter bulan/tahun — amati KPI dan grafik berubah",
      "Scroll ke tabel Performa Sales",
    ],
    checkpoint: "Laporan terbuka dengan data yang responsif terhadap filter.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "report-1-sm", route: "/reports", role: "SALES_MANAGER",
    title: "Review laporan performa tim",
    description: "Lihat laporan tim dengan filter periode dan detail per sales.",
    substeps: [
      "Buka Laporan & Dokumen",
      "Ubah filter ke bulan ini",
      "Amati grafik tren lead bulanan",
      "Amati pie chart Deal vs Recycle",
    ],
    checkpoint: "Grafik menampilkan data sesuai filter.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "report-1-ex", route: "/reports", role: "EXECUTIVE",
    title: "Review laporan performa (read-only)",
    description: "Executive dapat melihat laporan lengkap namun tidak bisa mengubah data.",
    substeps: [
      "Buka Laporan & Dokumen",
      "Amati semua section: KPI, grafik tren, distribusi status, pie chart",
      "Ubah filter dan amati perubahan data",
      "Scroll ke tabel Performa Sales",
    ],
    checkpoint: "Semua data laporan tersedia dalam mode read-only.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "report-2", route: "/reports", role: "SUPER_ADMIN",
    title: "Lihat detail performa per sales",
    description: "Klik nama sales di tabel untuk melihat detail leads yang ditangani beserta statusnya.",
    substeps: [
      "Scroll ke tabel Performa Sales di halaman Laporan",
      "Klik salah satu nama sales di tabel",
      "Modal detail terbuka — perhatikan KPI: total lead, deal, recycle, revenue",
      "Klik tab Deal — lihat daftar leads yang berhasil closing",
      "Klik tab Recycle — lihat leads yang gagal",
      "Amati distribusi status dalam progress bar",
      "Ubah filter tahun/bulan di modal — amati data berubah",
    ],
    checkpoint: "Modal menampilkan data lengkap per sales dengan rincian lead deal dan recycle.",
  },
  {
    id: "report-2-sm", route: "/reports", role: "SALES_MANAGER",
    title: "Detail performa per anggota tim",
    description: "Drill-down ke performa individual setiap AE di tim.",
    substeps: [
      "Klik salah satu nama AE di tabel performa",
      "Modal terbuka — amati KPI individual",
      "Klik tab Deal dan Recycle secara bergantian",
      "Amati leads mana yang berhasil dan mana yang gagal",
    ],
    checkpoint: "Modal menampilkan breakdown leads per status untuk AE yang dipilih.",
  },
  {
    id: "report-2-ex", route: "/reports", role: "EXECUTIVE",
    title: "Detail performa per sales",
    description: "Klik sales di tabel untuk melihat detail kinerja individual.",
    substeps: [
      "Klik salah satu nama sales di tabel",
      "Amati KPI, distribusi status, dan win rate",
      "Ubah filter modal dan amati perubahan",
    ],
    checkpoint: "Modal detail berfungsi dalam mode read-only untuk Executive.",
  },

  // ══════════════════════════════════════════════════════════════
  // DOKUMEN — SA, SM, AE
  // ══════════════════════════════════════════════════════════════
  {
    id: "doc-1", route: "/reports", role: "SUPER_ADMIN",
    title: "Generate Dokumen Invoice",
    description: "Buat dokumen Invoice dalam format .docx dari lead yang ada.",
    substeps: [
      "Di halaman Laporan, klik tab Dokumen",
      "Klik tombol + Buat Dokumen",
      "Pilih lead dari dropdown",
      "Pilih tipe: Invoice",
      "Beri judul: 'Invoice Demo UAT'",
      "Klik Buat Dokumen",
      "Dokumen baru muncul di daftar dengan status Draft",
    ],
    checkpoint: "Dokumen Invoice berhasil dibuat dan tampil di daftar.",
  },
  {
    id: "doc-1-sm", route: "/reports", role: "SALES_MANAGER",
    title: "Generate Dokumen SPK",
    description: "Buat Surat Perintah Kerja dari lead yang sudah dibuat.",
    substeps: [
      "Di halaman Laporan, klik tab Dokumen",
      "Klik + Buat Dokumen",
      "Pilih lead milik tim",
      "Pilih tipe: SPK (Surat Perintah Kerja)",
      "Beri judul dokumen",
      "Klik Buat Dokumen",
    ],
    checkpoint: "Dokumen SPK berhasil dibuat.",
  },
  {
    id: "doc-1-ae", route: "/reports", role: "ACCOUNT_EXECUTIVE",
    title: "Generate Dokumen dari lead sendiri",
    description: "AE bisa membuat dokumen dari leads miliknya sendiri.",
    substeps: [
      "Buka Laporan & Dokumen",
      "Klik tab Dokumen",
      "Klik + Buat Dokumen",
      "Pilih lead milik Anda (bukan milik orang lain)",
      "Pilih tipe: Invoice",
      "Beri judul: 'Invoice Demo AE'",
      "Klik Buat Dokumen",
    ],
    checkpoint: "Dokumen berhasil dibuat dari lead milik sendiri.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "doc-2", route: "/reports", role: "ALL",
    title: "Buka detail dokumen dan download",
    description: "Klik dokumen untuk membuka halaman detail, finalisasi, dan download .docx.",
    substeps: [
      "Klik dokumen yang baru dibuat di daftar",
      "Halaman detail dokumen terbuka",
      "Perhatikan isi dokumen terisi otomatis dari data lead",
      "Klik tombol Download .docx — file tersimpan di komputer",
      "Buka file .docx di Microsoft Word atau Google Docs",
      "Kembali ke sistem: klik Finalisasi Dokumen",
      "Status berubah ke Finalized",
      "Klik Tandai Sudah Dikirim — status berubah ke Terkirim",
    ],
    checkpoint: "Dokumen ter-download dalam format .docx yang bisa diedit. Status dokumen berubah ke Terkirim.",
    tips: "Format .docx dipilih agar dokumen bisa diedit dan disesuaikan setelah di-download.",
  },

  // ══════════════════════════════════════════════════════════════
  // PERFORMA SAYA — SM, AE
  // ══════════════════════════════════════════════════════════════
  {
    id: "personal-1", route: "/reports/personal", role: "SALES_MANAGER",
    title: "Buka Performa Saya (Sales Manager)",
    description: "Lihat statistik kinerja personal dengan filter independen di setiap section.",
    substeps: [
      "Klik menu Performa Saya di sidebar",
      "Amati KPI: Total Lead, Deal, Win Rate, Revenue, Task Selesai",
      "Ubah filter KPI (tahun/bulan) — amati perubahan data",
    ],
    checkpoint: "KPI Performa Saya menampilkan data yang akurat dan responsif terhadap filter.",
    action: "Buka Performa Saya", actionRoute: "/reports/personal",
  },
  {
    id: "personal-1-ae", route: "/reports/personal", role: "ACCOUNT_EXECUTIVE",
    title: "Buka Performa Saya (Account Executive)",
    description: "Monitor kinerja personal Anda melalui berbagai grafik dan filter.",
    substeps: [
      "Klik menu Performa Saya di sidebar",
      "Amati KPI personal Anda",
      "Ubah filter KPI",
    ],
    checkpoint: "Halaman Performa Saya terbuka dengan data kinerja personal.",
    action: "Buka Performa Saya", actionRoute: "/reports/personal",
  },
  {
    id: "personal-2", route: "/reports/personal", role: "SALES_MANAGER",
    title: "Grafik Revenue dengan filter independen",
    description: "Filter Revenue pada tab Overview bekerja terpisah dari filter KPI.",
    substeps: [
      "Pastikan tab Overview aktif",
      "Pada grafik Revenue/Lead Trend, ubah filter (berbeda dari filter KPI di atas)",
      "Amati grafik tren berubah tanpa mempengaruhi KPI di header",
      "Ubah filter Revenue ke bulan yang berbeda dari filter KPI",
    ],
    checkpoint: "Filter Revenue dan filter KPI bekerja independen satu sama lain.",
  },
  {
    id: "personal-2-ae", route: "/reports/personal", role: "ACCOUNT_EXECUTIVE",
    title: "Grafik Revenue dengan filter independen",
    description: "Filter di setiap section Performa Saya bekerja secara independen.",
    substeps: [
      "Tab Overview aktif — ubah filter Revenue",
      "Amati grafik berubah tanpa mengubah KPI",
      "Ubah filter ke bulan berbeda",
    ],
    checkpoint: "Filter Revenue bekerja independen dari KPI.",
  },
  {
    id: "personal-3", route: "/reports/personal", role: "SALES_MANAGER",
    title: "Tab Pipeline — History lengkap",
    description: "Tab Pipeline menampilkan semua history lead termasuk Deal dan Recycle, bukan hanya yang aktif.",
    substeps: [
      "Klik tab Pipeline",
      "Amati semua stage ditampilkan termasuk Deal dan Recycle",
      "Perhatikan grafik batang dan progress bar per stage",
      "Bandingkan jumlah lead di setiap stage",
    ],
    checkpoint: "Pipeline menampilkan semua history lead di semua 6 stage.",
  },
  {
    id: "personal-3-ae", route: "/reports/personal", role: "ACCOUNT_EXECUTIVE",
    title: "Tab Pipeline — History dan Tab Aktivitas",
    description: "Pipeline menampilkan history lengkap. Tab Aktivitas punya filter sendiri.",
    substeps: [
      "Klik tab Pipeline — amati semua stage termasuk Deal dan Recycle",
      "Klik tab Aktivitas",
      "Ubah filter Aktivitas (tahun/bulan) — berbeda dari filter lainnya",
      "Amati grafik aktivitas per tipe berubah",
    ],
    checkpoint: "Pipeline menampilkan history lengkap. Filter Aktivitas bekerja independen.",
  },

  // ══════════════════════════════════════════════════════════════
  // TIM — SA, SM, EX
  // ══════════════════════════════════════════════════════════════
  {
    id: "team-1", route: "/team", role: "SUPER_ADMIN",
    title: "Buka halaman Tim",
    description: "Halaman Tim menampilkan daftar anggota beserta visualisasi distribusi role dan performa.",
    substeps: [
      "Klik menu Tim di sidebar",
      "Amati pie chart distribusi role tim",
      "Amati grafik Total Lead per Sales — ubah filter tahun/bulan",
      "Perhatikan tabel daftar anggota tim",
    ],
    checkpoint: "Halaman Tim terbuka dengan visualisasi yang akurat.",
    action: "Buka Tim", actionRoute: "/team",
  },
  {
    id: "team-1-sm", route: "/team", role: "SALES_MANAGER",
    title: "Buka Tim dan verifikasi batasan akses",
    description: "Sales Manager bisa edit anggota namun tidak bisa hapus atau ubah role.",
    substeps: [
      "Buka halaman Tim",
      "Amati visualisasi distribusi role dan grafik lead",
      "Klik Edit pada salah satu AE",
      "Amati: tidak ada opsi ubah Role",
      "Amati: tidak ada tombol Hapus",
    ],
    checkpoint: "Edit tersedia tapi tanpa opsi ubah role. Tidak ada tombol Hapus.",
    action: "Buka Tim", actionRoute: "/team",
    warning: "Sales Manager tidak bisa menghapus user atau mengubah role anggota.",
  },
  {
    id: "team-1-ex", route: "/team", role: "EXECUTIVE",
    title: "Lihat Tim dan visualisasi performa",
    description: "Executive dapat melihat semua data tim dalam mode read-only.",
    substeps: [
      "Buka halaman Tim",
      "Ubah filter pada grafik Lead per Sales",
      "Amati data berubah sesuai filter",
      "Perhatikan tidak ada tombol Tambah/Edit/Hapus",
    ],
    checkpoint: "Data tim dapat dilihat dalam mode read-only.",
    action: "Buka Tim", actionRoute: "/team",
  },
  {
    id: "team-2", route: "/team", role: "SUPER_ADMIN",
    title: "Tambah anggota tim baru",
    description: "Super Admin bisa menambah anggota dengan role apapun.",
    substeps: [
      "Klik tombol + Tambah Anggota",
      "Isi Nama: 'Test UAT User'",
      "Isi Email: test.uat@cmlabs.co",
      "Isi Password: Test1234!",
      "Isi No. Telepon: 089999999999",
      "Pilih Role: Account Executive",
      "Klik Tambah Anggota",
    ],
    checkpoint: "Anggota baru muncul di tabel dengan role Account Executive.",
  },
  {
    id: "team-3", route: "/team", role: "ALL",
    title: "Lihat detail performa per sales",
    description: "Klik tombol Performa untuk melihat detail kinerja individual setiap sales.",
    substeps: [
      "Di tabel anggota, cari baris AE atau SM",
      "Klik tombol Performa",
      "Modal terbuka dengan KPI individual",
      "Ubah filter tahun/bulan di dalam modal",
      "Amati data (deal, recycle, revenue, distribusi status) berubah",
      "Klik tab Deal dan Recycle di modal",
      "Tutup modal",
    ],
    checkpoint: "Modal performa menampilkan data lengkap yang sinkron dengan filter.",
  },

  // ══════════════════════════════════════════════════════════════
  // PROFIL
  // ══════════════════════════════════════════════════════════════
  {
    id: "profile-1", route: "/profile", role: "ALL",
    title: "Buka dan edit Profil Saya",
    description: "Setiap user bisa memperbarui nama dan nomor telepon melalui halaman profil.",
    substeps: [
      "Klik menu Profil Saya di sidebar",
      "Perhatikan informasi akun: nama, email, role, nomor telepon",
      "Klik tombol Edit Profil",
      "Ubah nama atau nomor telepon",
      "Klik Simpan Perubahan",
    ],
    checkpoint: "Perubahan tersimpan dan nama di sidebar/header ikut berubah.",
    action: "Buka Profil", actionRoute: "/profile",
  },

  // ══════════════════════════════════════════════════════════════
  // UI/UX — semua
  // ══════════════════════════════════════════════════════════════
  {
    id: "uiux-1", route: "/dashboard", role: "ALL",
    title: "Uji Dark Mode dan Light Mode",
    description: "Sistem mendukung dua mode tampilan yang bisa diubah kapan saja tanpa reload.",
    substeps: [
      "Klik tombol Dark Mode / Light Mode di sidebar bagian bawah",
      "Amati seluruh tampilan berubah ke mode gelap secara instan",
      "Jelajahi beberapa halaman: Leads, Forecasting, Laporan",
      "Pastikan semua teks terbaca jelas dalam dark mode",
      "Klik kembali untuk beralih ke Light Mode",
    ],
    checkpoint: "Pergantian mode terjadi instan tanpa reload. Semua halaman terbaca jelas di kedua mode.",
    tips: "Preferensi tema tersimpan di browser — tidak akan berubah saat refresh.",
    action: "Buka Dashboard", actionRoute: "/dashboard",
  },
  {
    id: "uiux-2", route: "/dashboard", role: "ALL",
    title: "Uji responsivitas mobile dan tablet",
    description: "Sistem responsif dan bisa diakses dari laptop, tablet, maupun mobile.",
    substeps: [
      "Tekan F12 (DevTools) di browser",
      "Klik ikon device simulator (tablet/phone icon)",
      "Pilih ukuran layar Mobile (misalnya iPhone 12)",
      "Perhatikan sidebar berubah menjadi tombol menu di atas",
      "Klik tombol menu — drawer navigasi terbuka",
      "Pastikan struktur menu sama dengan sidebar desktop",
      "Coba ukuran Tablet (misalnya iPad)",
    ],
    checkpoint: "Tampilan mobile dan tablet berfungsi dengan navigasi yang lengkap.",
  },

  // ══════════════════════════════════════════════════════════════
  // SELESAI — redirect ke Google Form
  // ══════════════════════════════════════════════════════════════
  {
    id: "finish-1", route: "/uat-guide", role: "ALL",
    title: "Pengujian selesai — Isi Kuesioner UAT",
    description: "Anda telah menyelesaikan semua skenario pengujian. Langkah terakhir adalah mengisi kuesioner UAT melalui Google Form.",
    substeps: [
      "Klik tombol Isi Kuesioner Google Form di bawah",
      "Google Form akan terbuka di tab baru",
      "Isi seluruh pertanyaan kuesioner dengan jujur",
      "Klik Submit setelah selesai",
      "Terima kasih atas partisipasi Anda!",
    ],
    checkpoint: "Kuesioner Google Form berhasil diisi dan disubmit.",
    tips: "Jawaban Anda bersifat rahasia dan hanya digunakan untuk keperluan penelitian akademis.",
    action: "Isi Kuesioner Google Form",
    isExternal: true, externalUrl: GFORM_URL,
  },
]

// Helper: filter steps berdasarkan role
export function getStepsForRole(role: UATRole): UATStep[] {
  return ALL_STEPS.filter((s) => s.role === "ALL" || s.role === role)
}