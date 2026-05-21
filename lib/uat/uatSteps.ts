// ── TYPES ─────────────────────────────────────────────────────
export interface UATStep {
  id:           string
  route:        string
  title:        string
  description:  string
  substeps:     string[]
  checkpoint:   string
  tips?:        string
  warning?:     string
  action?:      string
  actionRoute?: string
  isExternal?:  boolean
  externalUrl?: string
  backlog?:     string   // nomor product backlog
  role:         UATRole | "ALL"
}

export type UATRole =
  | "SUPER_ADMIN"
  | "EXECUTIVE"
  | "SALES_MANAGER"
  | "ACCOUNT_EXECUTIVE"

// ── GANTI DENGAN LINK GOOGLE FORM ANDA ────────────────────────
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

export const ROLE_JABATAN: Record<string, string> = {
  SUPER_ADMIN:       "Developer Tim",
  EXECUTIVE:         "Head / C-Level",
  SALES_MANAGER:     "Leader Divisi",
  ACCOUNT_EXECUTIVE: "Marketing Team",
}

// ── DAFTAR AKUN UAT — 30 RESPONDEN, 34 AKUN UNIK ─────────────
// Password semua: Test1234!
// SA-01 ~ SA-02 : Super Admin (Developer Tim)
// SM-01 ~ SM-05 : Sales Manager (Leader Divisi)
// AE-01 ~ AE-20 : Account Executive (Marketing Team)
// EX-01 ~ EX-03 : Executive (Head / C-Level)
export const UAT_ACCOUNTS = [
  { no:"SA-01", email:"superadmin01@cmlabs.co", password:"Test1234!", role:"SUPER_ADMIN" as UATRole, name:"SA Responden 1", jabatan:"Developer / System Admin" },
  { no:"SA-02", email:"superadmin02@cmlabs.co", password:"Test1234!", role:"SUPER_ADMIN" as UATRole, name:"SA Responden 2", jabatan:"Developer / System Admin" },
  { no:"SM-01", email:"sm01@cmlabs.co",          password:"Test1234!", role:"SALES_MANAGER" as UATRole, name:"SM Responden 1", jabatan:"Leader Divisi Digital" },
  { no:"SM-02", email:"sm02@cmlabs.co",          password:"Test1234!", role:"SALES_MANAGER" as UATRole, name:"SM Responden 2", jabatan:"Leader Divisi Content" },
  { no:"SM-03", email:"sm03@cmlabs.co",          password:"Test1234!", role:"SALES_MANAGER" as UATRole, name:"SM Responden 3", jabatan:"Leader Divisi SEO" },
  { no:"SM-04", email:"sm04@cmlabs.co",          password:"Test1234!", role:"SALES_MANAGER" as UATRole, name:"SM Responden 4", jabatan:"Leader Divisi Design" },
  { no:"SM-05", email:"sm05@cmlabs.co",          password:"Test1234!", role:"SALES_MANAGER" as UATRole, name:"SM Responden 5", jabatan:"Leader Divisi Ads" },
  ...Array.from({ length: 20 }, (_, i) => ({
    no:       `AE-${String(i+1).padStart(2,"0")}`,
    email:    `ae${String(i+1).padStart(2,"0")}@cmlabs.co`,
    password: "Test1234!",
    role:     "ACCOUNT_EXECUTIVE" as UATRole,
    name:     `AE Responden ${i+1}`,
    jabatan:  "Marketing Team",
  })),
  { no:"EX-01", email:"exec01@cmlabs.co", password:"Test1234!", role:"EXECUTIVE" as UATRole, name:"Exec Responden 1", jabatan:"Head of Department" },
  { no:"EX-02", email:"exec02@cmlabs.co", password:"Test1234!", role:"EXECUTIVE" as UATRole, name:"Exec Responden 2", jabatan:"C-Level / Direktur" },
  { no:"EX-03", email:"exec03@cmlabs.co", password:"Test1234!", role:"EXECUTIVE" as UATRole, name:"Exec Responden 3", jabatan:"C-Level / Direktur" },
]

// Cari akun berdasarkan email
export function findAccountByEmail(email: string) {
  return UAT_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null
}

// ── SEMUA STEPS UAT ────────────────────────────────────────────
// Product Backlog:
// PB-1: Login Management & Role
// PB-2: Dashboard Analytics
// PB-3: Leads Management (Kanban Board)
// PB-4: Team Management
// PB-5: Profile Management
// PB-6: Timeline Aktivitas per Lead  ← (pengganti Mailing System)
// PB-7: Dashboard Forecasting
// PB-8: Reporting & Document Generator

export const ALL_STEPS: UATStep[] = [

  // ══════════════════════════════════════════════════════════════
  // ONBOARDING — semua role (di halaman login)
  // ══════════════════════════════════════════════════════════════
  {
    id: "onboard-1", route: "/login", role: "ALL",
    backlog: "Persiapan",
    title: "Selamat datang di sesi UAT CMLabs CRM",
    description: "Anda akan menguji sistem CRM berbasis web yang dikembangkan untuk skripsi. Ikuti setiap langkah bubble ini sampai selesai dan berakhir dengan mengisi kuesioner Google Form.",
    substeps: [
      "Baca setiap langkah dengan teliti sebelum melakukan aksi",
      "Bubble panduan ini akan SELALU tampil di setiap halaman",
      "Gunakan tombol Langkah Berikutnya setelah selesai melakukan instruksi",
      "Gunakan tombol Kembali jika ingin mengulang langkah sebelumnya",
      "Tombol Lewati tersedia jika ada kendala teknis pada langkah tertentu",
      "Progress Anda tersimpan otomatis — aman jika browser ditutup",
    ],
    checkpoint: "Anda memahami cara menggunakan bubble panduan UAT ini.",
    tips: "Estimasi waktu pengujian: 20–30 menit. Jawab kuesioner dengan jujur berdasarkan pengalaman nyata.",
  },
  {
    id: "onboard-2", route: "/login", role: "ALL",
    backlog: "Persiapan",
    title: "Cek akun login Anda",
    description: "Setiap responden memiliki akun unik. Pastikan Anda menggunakan akun yang sudah diberikan — jangan berbagi akun dengan responden lain.",
    substeps: [
      "Periksa pesan WhatsApp yang dikirimkan kepada Anda",
      "Temukan email dan password akun UAT Anda",
      "Contoh format: ae05@cmlabs.co / Test1234!",
      "Pastikan tidak menggunakan akun milik responden lain",
    ],
    checkpoint: "Anda sudah memegang email dan password akun UAT masing-masing.",
    tips: "Password semua akun: Test1234! (T kapital). Akun Anda sudah terdaftar sebelumnya.",
    warning: "Jangan berbagi akun — setiap akun diidentifikasi untuk tracking data responden.",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-1: LOGIN MANAGEMENT & ROLE
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb1-1", route: "/login", role: "ALL",
    backlog: "PB-1",
    title: "PB-1: Login ke sistem",
    description: "Masuk ke sistem CRM menggunakan akun UAT Anda. Ini adalah pengujian fitur Login Management & Role.",
    substeps: [
      "Ketikkan email akun UAT Anda di field Email",
      "Ketikkan password: Test1234! di field Password",
      "Klik tombol coba eye (lihat/sembunyikan password) untuk memastikan password benar",
      "Klik tombol Masuk ke Dashboard",
      "Tunggu hingga halaman Dashboard terbuka",
    ],
    checkpoint: "Berhasil masuk. Halaman Dashboard terbuka dan nama Anda tampil di sidebar.",
    tips: "Jika login gagal, periksa apakah Caps Lock aktif. Password harus: Test1234! (huruf T kapital, angka 1234, tanda seru).",
    action: "Buka Login", actionRoute: "/login",
  },
  {
    id: "pb1-2", route: "/dashboard", role: "ALL",
    backlog: "PB-1",
    title: "PB-1: Verifikasi menu navigasi sesuai role",
    description: "Periksa menu di sidebar kiri — setiap role menampilkan menu yang berbeda sesuai hak aksesnya.",
    substeps: [
      "Lihat sidebar di kiri layar",
      "Perhatikan menu yang tersedia sesuai role Anda",
      "Super Admin: semua menu termasuk Tim",
      "Sales Manager: semua menu termasuk Performa Saya dan Tim",
      "Account Executive: menu Leads, Performa Saya, Profil (tanpa Tim)",
      "Executive: semua menu dalam mode baca-saja",
      "Perhatikan badge role di bagian bawah sidebar",
    ],
    checkpoint: "Menu navigasi tampil sesuai role. Badge role (Super Admin/Executive/dll) terlihat di sidebar.",
    action: "Buka Dashboard", actionRoute: "/dashboard",
  },
  {
    id: "pb1-3", route: "/leads", role: "ACCOUNT_EXECUTIVE",
    backlog: "PB-1",
    title: "PB-1: Verifikasi batasan akses AE",
    description: "Sebagai Account Executive, Anda bisa melihat semua leads tim tapi hanya bisa edit leads milik sendiri.",
    substeps: [
      "Buka halaman Leads",
      "Cari card lead yang PIC-nya bukan nama Anda",
      "Coba drag card lead tersebut ke kolom lain",
      "Amati notifikasi akses terbatas yang muncul",
      "Klik lead orang lain — pastikan tidak ada tombol Edit",
    ],
    checkpoint: "Notifikasi akses terbatas muncul. Tidak ada tombol Edit pada lead milik orang lain.",
    action: "Buka Leads", actionRoute: "/leads",
    warning: "Ini adalah fitur RBAC (Role-Based Access Control) yang disengaja.",
  },
  {
    id: "pb1-4", route: "/leads", role: "EXECUTIVE",
    backlog: "PB-1",
    title: "PB-1: Verifikasi akses Read-Only Executive",
    description: "Executive dapat melihat semua data namun tidak bisa mengubah apapun.",
    substeps: [
      "Buka halaman Leads",
      "Perhatikan: tidak ada tombol + Tambah Lead",
      "Klik salah satu card lead",
      "Perhatikan: tidak ada tombol Edit atau Hapus di detail lead",
      "Coba drag card lead — amati notifikasi yang muncul",
    ],
    checkpoint: "Halaman Leads tampil dalam mode baca-saja. Banner 'Mode Hanya Lihat' terlihat.",
    action: "Buka Leads", actionRoute: "/leads",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-2: DASHBOARD ANALYTICS
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb2-1", route: "/dashboard", role: "ALL",
    backlog: "PB-2",
    title: "PB-2: Amati 4 KPI Card di Dashboard",
    description: "Dashboard menampilkan 4 KPI card utama yang meringkas performa tim secara real-time.",
    substeps: [
      "Pastikan Anda berada di halaman Dashboard",
      "Amati KPI card Pipeline Value — perhatikan breakdown per stage (Approach, Cold Lead, Deck Request, Meeting)",
      "Amati KPI card Win Rate — perhatikan radial chart dan progress bar deal vs recycle",
      "Amati KPI card Total Revenue — perhatikan rata-rata per deal",
      "Amati KPI card Recycle — perhatikan persentase dari total lead",
      "Arahkan kursor ke setiap card untuk melihat efek hover",
    ],
    checkpoint: "4 KPI card menampilkan data dengan breakdown yang mudah dibaca.",
    action: "Buka Dashboard", actionRoute: "/dashboard",
  },
  {
    id: "pb2-2", route: "/dashboard", role: "ALL",
    backlog: "PB-2",
    title: "PB-2: Uji filter independen tiap section grafik",
    description: "Setiap section grafik punya filter sendiri — mengubah filter satu tidak mempengaruhi yang lain.",
    substeps: [
      "Di header Dashboard, ubah filter tahun pada KPI — perhatikan 4 card berubah",
      "Pada section grafik Tren, ubah filter ke tahun atau bulan yang berbeda",
      "Pastikan perubahan filter Tren TIDAK mengubah KPI di atas",
      "Pada section Distribusi Status, ubah filternya",
      "Pada section Leaderboard, ubah filter bulan",
      "Verifikasi setiap section berubah secara independen",
    ],
    checkpoint: "Setiap section grafik berubah secara mandiri. Filter satu section tidak mengubah section lain.",
    tips: "Ini adalah fitur multi-period comparison — satu halaman bisa menampilkan data 4 periode berbeda sekaligus.",
  },
  {
    id: "pb2-3", route: "/dashboard", role: "ALL",
    backlog: "PB-2",
    title: "PB-2: Uji mode visualisasi grafik Tren",
    description: "Grafik Tren Performa Tim mendukung 3 mode tampilan dan 2 metrik berbeda.",
    substeps: [
      "Pada section grafik Tren, klik tombol Area",
      "Klik tombol Bar — amati perubahan ke grafik batang",
      "Klik tombol Combo — amati kombinasi area dan batang",
      "Klik toggle Lead → amati grafik menampilkan data leads",
      "Klik toggle Revenue → amati grafik menampilkan data revenue",
    ],
    checkpoint: "Grafik berubah sesuai mode (Area/Bar/Combo) dan metrik (Lead/Revenue) yang dipilih.",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-3: LEADS MANAGEMENT (KANBAN BOARD)
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb3-1", route: "/leads", role: "ALL",
    backlog: "PB-3",
    title: "PB-3: Buka Leads — Kanban Board 6 kolom",
    description: "Halaman Leads menampilkan Kanban Board dengan 6 kolom yang merepresentasikan tahap pipeline.",
    substeps: [
      "Klik menu Leads di sidebar",
      "Amati 6 kolom pipeline: Approach → Cold Lead → Deck Request → Meeting → Deal → Recycle",
      "Perhatikan setiap card menampilkan: judul lead, nama klien, nilai deal, dan PIC",
      "Scroll horizontal jika diperlukan untuk melihat semua kolom",
    ],
    checkpoint: "Kanban Board 6 kolom tampil lengkap dengan card leads di setiap kolom.",
    action: "Buka Leads", actionRoute: "/leads",
  },
  {
    id: "pb3-2", route: "/leads", role: "SUPER_ADMIN",
    backlog: "PB-3",
    title: "PB-3: Tambah Lead baru (Super Admin)",
    description: "Buat lead baru dan assign ke salah satu AE. Uji juga fitur formatting di Deskripsi.",
    substeps: [
      "Klik tombol + Tambah Lead",
      "Isi Judul: 'UAT Lead SA-01' (sesuaikan dengan nomor akun Anda)",
      "Isi Nama Klien: 'PT Demo UAT'",
      "Isi Jabatan Klien: 'Marketing Manager'",
      "Isi Email: klien.demo@example.com",
      "Isi Nilai Deal: 20000000",
      "Pilih Prioritas: Tinggi",
      "Di field Deskripsi: tulis teks, klik ikon Bold (B), lalu coba buat bullet list",
      "Di field PIC: pilih salah satu AE dari dropdown",
      "Klik Tambah Lead",
    ],
    checkpoint: "Lead baru muncul di kolom Approach. PIC menampilkan nama AE yang dipilih.",
    tips: "Toolbar formatting di Deskripsi mendukung: Bold, Italic, Underline, Bullet List, Numbered List.",
  },
  {
    id: "pb3-2-sm", route: "/leads", role: "SALES_MANAGER",
    backlog: "PB-3",
    title: "PB-3: Tambah Lead dan assign ke AE",
    description: "Sales Manager dapat membuat lead baru dan menugaskannya ke Account Executive manapun.",
    substeps: [
      "Klik tombol + Tambah Lead",
      "Isi Judul: 'UAT Lead SM-01' (sesuaikan nomor Anda)",
      "Isi data klien: nama, jabatan, perusahaan, email, telepon",
      "Isi Nilai Deal: 15000000",
      "Di Deskripsi: coba bold dan bullet list",
      "Pilih PIC: assign ke salah satu AE",
      "Klik Tambah Lead",
    ],
    checkpoint: "Lead muncul di kolom Approach dengan AE yang dipilih sebagai PIC.",
  },
  {
    id: "pb3-2-ae", route: "/leads", role: "ACCOUNT_EXECUTIVE",
    backlog: "PB-3",
    title: "PB-3: Tambah Lead (PIC otomatis = Anda)",
    description: "AE membuat lead baru. PIC otomatis diisi nama Anda sendiri — tidak bisa diubah.",
    substeps: [
      "Klik tombol + Tambah Lead",
      "Isi Judul: 'UAT Lead AE-01' (sesuaikan nomor akun Anda)",
      "Isi data klien lengkap: nama, jabatan, perusahaan, email, telepon",
      "Isi Nilai Deal: 10000000",
      "Di Deskripsi: coba toolbar formatting (Bold, List)",
      "Perhatikan field PIC sudah terisi nama Anda (tidak bisa diubah)",
      "Klik Tambah Lead",
    ],
    checkpoint: "Lead muncul di kolom Approach. PIC otomatis menampilkan nama Anda.",
    tips: "AE tidak bisa assign lead ke orang lain — setiap lead yang dibuat AE langsung menjadi tanggung jawabnya.",
  },
  {
    id: "pb3-3", route: "/leads", role: "SUPER_ADMIN",
    backlog: "PB-3",
    title: "PB-3: Pindahkan lead via Drag and Drop",
    description: "Drag and drop adalah cara utama memperbarui status lead di Kanban Board.",
    substeps: [
      "Temukan lead yang baru Anda buat di kolom Approach",
      "Klik dan tahan card lead tersebut dengan mouse",
      "Seret perlahan ke kolom Cold Lead",
      "Lepaskan — lead berpindah ke Cold Lead",
      "Drag sekali lagi ke kolom Deck Request",
    ],
    checkpoint: "Lead berhasil dipindah ke kolom Deck Request melalui drag and drop.",
  },
  {
    id: "pb3-3-sm", route: "/leads", role: "SALES_MANAGER",
    backlog: "PB-3",
    title: "PB-3: Drag and Drop lead",
    description: "Perbarui status lead dengan drag and drop.",
    substeps: [
      "Temukan lead yang baru dibuat di kolom Approach",
      "Drag ke kolom Cold Lead",
      "Drag lagi ke kolom Meeting",
    ],
    checkpoint: "Lead berhasil berpindah ke kolom Meeting.",
  },
  {
    id: "pb3-3-ae", route: "/leads", role: "ACCOUNT_EXECUTIVE",
    backlog: "PB-3",
    title: "PB-3: Drag lead sendiri & verifikasi batasan",
    description: "AE bisa drag lead miliknya. Coba juga drag lead orang lain untuk melihat batasan.",
    substeps: [
      "Drag lead milik Anda ke kolom Cold Lead",
      "Cari lead yang PIC-nya bukan Anda",
      "Coba drag lead tersebut — amati notifikasi yang muncul",
      "Klik lead milik orang lain — pastikan tidak ada tombol Edit",
    ],
    checkpoint: "Lead sendiri berhasil dipindah. Lead orang lain memunculkan notifikasi akses terbatas.",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-6: TIMELINE AKTIVITAS PER LEAD
  // (PB-6 dijalankan sebelum PB-4/5 karena lebih relevan setelah leads)
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb6-1", route: "/leads", role: "ALL",
    backlog: "PB-6",
    title: "PB-6: Tambah Catatan Internal di Timeline",
    description: "Setiap lead memiliki timeline untuk mencatat semua aktivitas komunikasi secara kronologis.",
    substeps: [
      "Klik salah satu lead milik Anda untuk membuka detail",
      "Temukan section Timeline / Aktivitas di panel detail lead",
      "Klik tombol + Tambah Aktivitas",
      "Pilih tipe: Catatan Internal",
      "Isi Judul: 'Follow up awal UAT'",
      "Di kolom catatan: ketik teks, lalu klik ikon Bold (B) untuk menebalkan",
      "Buat bullet list dengan klik ikon bullet list",
      "Klik Simpan",
    ],
    checkpoint: "Aktivitas Catatan Internal muncul di timeline dengan teks yang terformat (bold/list).",
    tips: "Toolbar di textarea mendukung: Bold, Italic, Underline, Bullet List, Numbered List, Heading, Quote.",
    action: "Buka Leads", actionRoute: "/leads",
  },
  {
    id: "pb6-2", route: "/leads", role: "ALL",
    backlog: "PB-6",
    title: "PB-6: Tambah Aktivitas Telepon",
    description: "Catat hasil telepon/panggilan dengan klien.",
    substeps: [
      "Di panel timeline lead yang sama, klik + Tambah Aktivitas lagi",
      "Pilih tipe: Telepon",
      "Isi Judul: 'Telepon pertama klien UAT'",
      "Di kolom catatan: isi hasil telepon (bold poin-poin penting)",
      "Klik Simpan",
      "Perhatikan aktivitas kedua muncul di timeline di bawah catatan pertama",
    ],
    checkpoint: "Aktivitas Telepon muncul di timeline. Urutan kronologis: Catatan Internal → Telepon.",
  },
  {
    id: "pb6-3", route: "/leads", role: "ALL",
    backlog: "PB-6",
    title: "PB-6: Jadwalkan Meeting di Timeline",
    description: "Buat aktivitas Meeting dengan detail waktu, peserta, dan link Google Meet.",
    substeps: [
      "Tambah aktivitas baru: pilih tipe Meeting",
      "Isi Judul: 'Presentasi Proposal UAT'",
      "Pilih tanggal (pilih besok atau lusa)",
      "Isi Jam Mulai: 10:00 dan Jam Selesai: 11:00",
      "Di field Peserta: isi email contoh (misal: klien@example.com)",
      "Di field Link Meeting: isi https://meet.google.com/xxx-demo (opsional)",
      "Klik Simpan Meeting",
    ],
    checkpoint: "Meeting terjadwal tampil di timeline dengan info: waktu, peserta, dan link meeting.",
    tips: "Timeline lead menggantikan fitur Mailing System — semua komunikasi dengan klien dicatat di sini.",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-7: DASHBOARD FORECASTING
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb7-1", route: "/forecasting", role: "SUPER_ADMIN",
    backlog: "PB-7",
    title: "PB-7: Buka Forecasting dan amati KPI",
    description: "Forecasting menampilkan proyeksi revenue berdasarkan weighted probability setiap lead.",
    substeps: [
      "Klik menu Forecasting di sidebar",
      "Amati 4 KPI: Total Forecast, Deal Confirmed, Weighted Forecast, Best Case",
      "Amati grafik tren revenue 12 bulan",
      "Ubah filter periode: Semua → Per Tahun → Per Bulan",
      "Perhatikan data KPI dan grafik berubah sesuai filter",
    ],
    checkpoint: "Halaman Forecasting terbuka. KPI dan grafik responsif terhadap filter periode.",
    action: "Buka Forecasting", actionRoute: "/forecasting",
  },
  {
    id: "pb7-1-sm", route: "/forecasting", role: "SALES_MANAGER",
    backlog: "PB-7",
    title: "PB-7: Analisis Forecasting untuk target tim",
    description: "Sales Manager menggunakan forecasting untuk menetapkan target realistis.",
    substeps: [
      "Buka Forecasting",
      "Filter dengan bulan ini",
      "Bandingkan nilai Weighted Forecast vs Best Case",
      "Scroll ke tabel pipeline di bawah",
    ],
    checkpoint: "Perbedaan Weighted Forecast dan Best Case terbaca jelas.",
    action: "Buka Forecasting", actionRoute: "/forecasting",
  },
  {
    id: "pb7-1-ex", route: "/forecasting", role: "EXECUTIVE",
    backlog: "PB-7",
    title: "PB-7: Review Forecasting Revenue",
    description: "Executive melihat proyeksi revenue untuk evaluasi kinerja tim.",
    substeps: [
      "Buka Forecasting",
      "Perhatikan Weighted Forecast = estimasi realistis berdasarkan probabilitas",
      "Ubah filter periode",
      "Klik salah satu lead di tabel pipeline",
    ],
    checkpoint: "Data forecasting tampil. Detail perhitungan bisa diakses dengan klik lead.",
    action: "Buka Forecasting", actionRoute: "/forecasting",
  },
  {
    id: "pb7-2", route: "/forecasting", role: "SUPER_ADMIN",
    backlog: "PB-7",
    title: "PB-7: Drill-down perhitungan Weighted Value",
    description: "Klik setiap lead di tabel pipeline untuk melihat detail perhitungan weighted forecast.",
    substeps: [
      "Scroll ke tabel Pipeline di halaman Forecasting",
      "Klik salah satu baris lead",
      "Modal detail terbuka",
      "Baca formula: Nilai Lead × Probabilitas (%) = Weighted Value",
      "Contoh: Rp 20.000.000 × 35% (Deck Request) = Rp 7.000.000",
      "Tutup modal dan klik lead lain dengan stage berbeda",
      "Bandingkan perbedaan weighted value antar stage",
    ],
    checkpoint: "Modal menampilkan formula perhitungan yang jelas dan mudah dipahami.",
    tips: "Probabilitas per stage: Approach 10%, Cold Lead 20%, Deck Request 35%, Meeting 60%, Deal 100%, Recycle 5%.",
  },
  {
    id: "pb7-2-sm", route: "/forecasting", role: "SALES_MANAGER",
    backlog: "PB-7",
    title: "PB-7: Detail perhitungan per lead",
    description: "Klik lead di tabel untuk memahami dasar perhitungan weighted forecast.",
    substeps: [
      "Di tabel pipeline, klik salah satu lead",
      "Baca: Nilai × Probabilitas = Weighted Value",
      "Klik lead lain dengan stage berbeda",
      "Bandingkan hasilnya",
    ],
    checkpoint: "Formula perhitungan terbaca jelas di modal detail.",
  },
  {
    id: "pb7-2-ex", route: "/forecasting", role: "EXECUTIVE",
    backlog: "PB-7",
    title: "PB-7: Pahami detail perhitungan forecasting",
    description: "Baca detail perhitungan untuk memahami basis proyeksi.",
    substeps: [
      "Klik lead di tabel pipeline",
      "Baca formula: Nilai × Probabilitas = Weighted Value",
      "Lihat penjelasan probabilitas per stage",
    ],
    checkpoint: "Detail perhitungan terbaca dan dapat dipahami.",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-8: REPORTING & DOCUMENT GENERATOR
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb8-1", route: "/reports", role: "SUPER_ADMIN",
    backlog: "PB-8",
    title: "PB-8: Buka Laporan Performa Tim",
    description: "Lihat laporan performa tim dengan filter periode dan drill-down per sales.",
    substeps: [
      "Klik menu Laporan & Dokumen di sidebar",
      "Pastikan tab Laporan Performa aktif",
      "Ubah filter bulan/tahun — amati KPI dan grafik berubah",
      "Amati grafik tren lead bulanan",
      "Amati pie chart Deal vs Recycle",
      "Scroll ke tabel Performa Sales",
    ],
    checkpoint: "Laporan tampil dengan data yang responsif terhadap filter.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "pb8-1-sm", route: "/reports", role: "SALES_MANAGER",
    backlog: "PB-8",
    title: "PB-8: Review laporan performa tim",
    description: "Lihat laporan tim dengan berbagai filter dan detail per sales.",
    substeps: [
      "Buka Laporan & Dokumen",
      "Ubah filter bulan ini",
      "Amati grafik distribusi status",
      "Scroll ke tabel Performa Sales",
    ],
    checkpoint: "Grafik dan tabel menampilkan data tim yang akurat.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "pb8-1-ex", route: "/reports", role: "EXECUTIVE",
    backlog: "PB-8",
    title: "PB-8: Review laporan performa (read-only)",
    description: "Executive melihat laporan lengkap dalam mode baca-saja.",
    substeps: [
      "Buka Laporan & Dokumen",
      "Ubah filter dan amati data berubah",
      "Amati semua grafik: tren, distribusi, pie chart",
      "Scroll ke tabel performa sales",
    ],
    checkpoint: "Semua data laporan tersedia dalam mode read-only.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "pb8-2", route: "/reports", role: "SUPER_ADMIN",
    backlog: "PB-8",
    title: "PB-8: Drill-down detail performa per sales",
    description: "Klik nama sales di tabel untuk melihat detail leads yang ditangani.",
    substeps: [
      "Di tabel Performa Sales, klik salah satu nama sales",
      "Modal terbuka — amati KPI individual: total lead, deal, recycle, revenue",
      "Klik tab Deal — lihat daftar leads yang berhasil closing",
      "Klik tab Recycle — lihat leads yang gagal/masuk recycle",
      "Ubah filter tahun/bulan di dalam modal",
      "Amati data berubah sesuai filter",
      "Tutup modal",
    ],
    checkpoint: "Modal performa menampilkan detail leads lengkap dengan distribusi status.",
  },
  {
    id: "pb8-2-sm", route: "/reports", role: "SALES_MANAGER",
    backlog: "PB-8",
    title: "PB-8: Detail performa per AE",
    description: "Drill-down kinerja individual setiap AE di tim.",
    substeps: [
      "Klik salah satu AE di tabel performa",
      "Amati KPI individual",
      "Klik tab Deal dan Recycle",
      "Ubah filter modal",
    ],
    checkpoint: "Modal menampilkan leads lengkap per status untuk AE yang dipilih.",
  },
  {
    id: "pb8-3", route: "/reports", role: "SUPER_ADMIN",
    backlog: "PB-8",
    title: "PB-8: Generate Dokumen Invoice (.docx)",
    description: "Buat dokumen Invoice dalam format .docx yang bisa diedit.",
    substeps: [
      "Klik tab Dokumen di bagian atas halaman",
      "Klik tombol + Buat Dokumen",
      "Pilih lead dari dropdown (pilih lead yang dibuat tadi)",
      "Pilih tipe: Invoice",
      "Isi judul: 'Invoice UAT Demo SA'",
      "Klik Buat Dokumen",
      "Dokumen muncul di daftar dengan status Draft",
    ],
    checkpoint: "Dokumen Invoice berhasil dibuat dengan status Draft.",
  },
  {
    id: "pb8-3-sm", route: "/reports", role: "SALES_MANAGER",
    backlog: "PB-8",
    title: "PB-8: Generate Dokumen SPK",
    description: "Buat Surat Perintah Kerja dari lead tim.",
    substeps: [
      "Klik tab Dokumen",
      "Klik + Buat Dokumen",
      "Pilih lead, pilih tipe SPK",
      "Beri judul, klik Buat Dokumen",
    ],
    checkpoint: "Dokumen SPK berhasil dibuat.",
  },
  {
    id: "pb8-3-ae", route: "/reports", role: "ACCOUNT_EXECUTIVE",
    backlog: "PB-8",
    title: "PB-8: Generate Dokumen dari lead sendiri",
    description: "AE membuat dokumen dari leads miliknya.",
    substeps: [
      "Buka Laporan & Dokumen",
      "Klik tab Dokumen",
      "Klik + Buat Dokumen",
      "Pilih lead milik Anda (bukan milik orang lain)",
      "Pilih tipe: Invoice",
      "Beri judul, klik Buat Dokumen",
    ],
    checkpoint: "Dokumen berhasil dibuat dari lead milik sendiri.",
    action: "Buka Laporan", actionRoute: "/reports",
  },
  {
    id: "pb8-4", route: "/reports", role: "ALL",
    backlog: "PB-8",
    title: "PB-8: Buka detail dokumen, download, dan finalisasi",
    description: "Buka halaman detail dokumen, verifikasi isi otomatis, download .docx, dan ubah status.",
    substeps: [
      "Klik dokumen yang baru dibuat di daftar",
      "Halaman detail dokumen terbuka",
      "Perhatikan isi dokumen terisi otomatis dari data lead (nama klien, nilai, PIC)",
      "Klik tombol Download .docx — file tersimpan di perangkat",
      "Buka file .docx di Microsoft Word atau Google Docs untuk verifikasi",
      "Kembali ke sistem: klik Finalisasi Dokumen — status berubah ke Finalized",
      "Klik Tandai Sudah Dikirim — status berubah ke Terkirim",
    ],
    checkpoint: "File .docx ter-download dan bisa dibuka. Status dokumen berubah melalui Draft → Finalized → Terkirim.",
    tips: "Format .docx dipilih agar dokumen bisa diedit dan disesuaikan setelah di-download.",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-4: TEAM MANAGEMENT
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb4-1", route: "/team", role: "SUPER_ADMIN",
    backlog: "PB-4",
    title: "PB-4: Buka Tim dan amati visualisasi",
    description: "Halaman Tim menampilkan distribusi role dan grafik performa sales.",
    substeps: [
      "Klik menu Tim di sidebar",
      "Amati pie chart distribusi role tim",
      "Amati grafik Total Lead per Sales",
      "Ubah filter tahun/bulan pada grafik — amati data berubah",
      "Perhatikan tabel daftar anggota tim",
    ],
    checkpoint: "Halaman Tim terbuka dengan visualisasi yang responsif terhadap filter.",
    action: "Buka Tim", actionRoute: "/team",
  },
  {
    id: "pb4-1-sm", route: "/team", role: "SALES_MANAGER",
    backlog: "PB-4",
    title: "PB-4: Tim — verifikasi batasan SM",
    description: "Sales Manager bisa edit anggota tapi tidak bisa hapus atau ubah role.",
    substeps: [
      "Buka halaman Tim",
      "Klik Edit pada salah satu AE",
      "Perhatikan: tidak ada opsi mengubah Role",
      "Perhatikan: tidak ada tombol Hapus",
      "Tutup modal edit",
    ],
    checkpoint: "Edit tersedia tapi tanpa opsi ubah role. Tidak ada tombol Hapus.",
    action: "Buka Tim", actionRoute: "/team",
    warning: "Sales Manager tidak bisa menghapus user atau mengubah role anggota.",
  },
  {
    id: "pb4-1-ex", route: "/team", role: "EXECUTIVE",
    backlog: "PB-4",
    title: "PB-4: Tim — verifikasi read-only Executive",
    description: "Executive melihat semua data tim dalam mode baca-saja.",
    substeps: [
      "Buka halaman Tim",
      "Ubah filter grafik Lead per Sales",
      "Perhatikan tidak ada tombol Tambah/Edit/Hapus",
      "Klik tombol Performa pada salah satu AE",
    ],
    checkpoint: "Data tim tampil lengkap. Tidak ada tombol perubahan data.",
    action: "Buka Tim", actionRoute: "/team",
  },
  {
    id: "pb4-2", route: "/team", role: "SUPER_ADMIN",
    backlog: "PB-4",
    title: "PB-4: Tambah anggota tim baru",
    description: "Super Admin menambah anggota baru dengan role tertentu.",
    substeps: [
      "Klik tombol + Tambah Anggota",
      "Isi Nama: 'Test UAT Baru'",
      "Isi Email: test.uat.baru@cmlabs.co",
      "Isi Password: Test1234!",
      "Isi No. Telepon: 089999999999",
      "Pilih Role: Account Executive",
      "Klik Tambah Anggota",
    ],
    checkpoint: "Anggota baru muncul di tabel dengan role Account Executive.",
  },
  {
    id: "pb4-3", route: "/team", role: "ALL",
    backlog: "PB-4",
    title: "PB-4: Lihat detail performa per sales",
    description: "Klik tombol Performa untuk melihat statistik kinerja individual setiap sales.",
    substeps: [
      "Di tabel anggota, cari baris yang memiliki tombol Performa (AE atau SM)",
      "Klik tombol Performa",
      "Modal terbuka — amati KPI: total lead, deal, recycle, revenue, win rate",
      "Ubah filter tahun/bulan di dalam modal",
      "Amati data berubah sesuai filter yang dipilih",
      "Klik tab Deal — amati daftar leads yang berhasil",
      "Klik tab Recycle — amati leads yang gagal",
      "Tutup modal",
    ],
    checkpoint: "Modal performa menampilkan data yang sinkron dengan filter. Tab Deal dan Recycle berfungsi.",
  },

  // ══════════════════════════════════════════════════════════════
  // PB-5: PROFILE MANAGEMENT
  // ══════════════════════════════════════════════════════════════
  {
    id: "pb5-1", route: "/profile", role: "ALL",
    backlog: "PB-5",
    title: "PB-5: Edit Profil Saya",
    description: "Setiap user dapat memperbarui nama dan nomor telepon melalui halaman profil.",
    substeps: [
      "Klik menu Profil Saya di sidebar",
      "Perhatikan informasi akun: nama, email, role, nomor telepon",
      "Klik tombol Edit Profil",
      "Ubah nama atau tambahkan nomor telepon",
      "Klik Simpan Perubahan",
      "Verifikasi nama berubah di sidebar dan header",
    ],
    checkpoint: "Perubahan tersimpan dan nama di sidebar/header ikut berubah.",
    action: "Buka Profil", actionRoute: "/profile",
  },

  // ══════════════════════════════════════════════════════════════
  // PERFORMA SAYA — SM dan AE
  // ══════════════════════════════════════════════════════════════
  {
    id: "personal-1", route: "/reports/personal", role: "SALES_MANAGER",
    backlog: "PB-8",
    title: "PB-8: Performa Saya — SM",
    description: "Sales Manager melihat statistik kinerja personal dengan filter independen.",
    substeps: [
      "Klik menu Performa Saya di sidebar",
      "Amati KPI: Total Lead, Deal, Win Rate, Revenue, Task Selesai",
      "Ubah filter KPI (tahun/bulan)",
      "Tab Overview: ubah filter Revenue secara terpisah dari KPI",
      "Tab Pipeline: amati semua history (termasuk Deal dan Recycle)",
      "Tab Aktivitas: ubah filter Aktivitas secara terpisah",
    ],
    checkpoint: "Setiap filter bekerja independen. Pipeline menampilkan history lengkap.",
    action: "Buka Performa Saya", actionRoute: "/reports/personal",
  },
  {
    id: "personal-1-ae", route: "/reports/personal", role: "ACCOUNT_EXECUTIVE",
    backlog: "PB-8",
    title: "PB-8: Performa Saya — AE",
    description: "Account Executive memonitor kinerja personal melalui berbagai grafik dan filter.",
    substeps: [
      "Klik menu Performa Saya di sidebar",
      "Amati KPI personal",
      "Ubah filter KPI",
      "Tab Overview: amati grafik tren, ubah filter Revenue",
      "Tab Pipeline: lihat semua history leads (bukan hanya aktif)",
      "Tab Aktivitas: ubah filter Aktivitas sendiri",
    ],
    checkpoint: "Pipeline menampilkan history lengkap. Filter Revenue dan Aktivitas independen.",
    action: "Buka Performa Saya", actionRoute: "/reports/personal",
  },

  // ══════════════════════════════════════════════════════════════
  // UI/UX — Dark Mode & Responsivitas
  // ══════════════════════════════════════════════════════════════
  {
    id: "uiux-1", route: "/dashboard", role: "ALL",
    backlog: "UI/UX",
    title: "UI/UX: Toggle Dark Mode dan Light Mode",
    description: "Sistem mendukung dua mode tampilan. Pengalihan terjadi instan tanpa reload halaman.",
    substeps: [
      "Temukan tombol Dark Mode / Light Mode di sidebar bagian bawah",
      "Klik tombol — seluruh tampilan berubah ke mode gelap secara instan",
      "Navigasi ke beberapa halaman: Leads, Forecasting, Laporan",
      "Pastikan semua teks terbaca jelas dalam dark mode",
      "Klik kembali tombol untuk beralih ke Light Mode",
      "Verifikasi pergantian terjadi instan (tanpa refresh halaman)",
    ],
    checkpoint: "Pergantian mode terjadi instan. Semua halaman terbaca jelas di kedua mode.",
    tips: "Preferensi tema tersimpan di browser — tidak berubah saat halaman di-refresh.",
    action: "Buka Dashboard", actionRoute: "/dashboard",
  },
  {
    id: "uiux-2", route: "/dashboard", role: "ALL",
    backlog: "UI/UX",
    title: "UI/UX: Uji responsivitas mobile/tablet",
    description: "Sistem dibangun responsif untuk laptop, tablet, dan mobile.",
    substeps: [
      "Cara 1 (Desktop): tekan F12 → klik ikon device (tablet/phone) di toolbar DevTools",
      "Pilih ukuran Mobile (contoh: iPhone 12) — sidebar berubah jadi tombol menu",
      "Klik tombol menu (hamburger) — drawer navigasi terbuka dari kanan",
      "Pastikan semua menu tersedia di drawer mobile",
      "Cara 2 (HP): buka link sistem langsung dari browser HP Anda",
      "Navigasi beberapa halaman dan amati tampilan mobile",
    ],
    checkpoint: "Tampilan mobile berfungsi dengan drawer navigasi yang lengkap dan terbaca.",
  },

  // ══════════════════════════════════════════════════════════════
  // SELESAI — Kuesioner
  // ══════════════════════════════════════════════════════════════
  {
    id: "finish-1", route: "/uat-guide", role: "ALL",
    backlog: "Selesai",
    title: "Pengujian selesai — Isi Kuesioner UAT",
    description: "Selamat! Anda telah menyelesaikan semua skenario pengujian. Langkah terakhir: isi kuesioner Google Form.",
    substeps: [
      "Klik tombol Isi Kuesioner Google Form di bawah",
      "Google Form terbuka di tab baru",
      "Isi semua 36 pertanyaan dengan jujur berdasarkan pengalaman nyata",
      "Klik Submit / Kirim setelah selesai",
      "Terima kasih atas partisipasi Anda dalam pengujian ini!",
    ],
    checkpoint: "Kuesioner Google Form berhasil diisi dan disubmit.",
    tips: "Jawaban Anda bersifat rahasia dan hanya digunakan untuk keperluan penelitian akademis skripsi.",
    action: "Isi Kuesioner Google Form",
    isExternal: true, externalUrl: GFORM_URL,
  },
]

// Helper: dapatkan steps untuk role tertentu, urut sesuai backlog
export function getStepsForRole(role: UATRole): UATStep[] {
  return ALL_STEPS.filter((s) => s.role === "ALL" || s.role === role)
}