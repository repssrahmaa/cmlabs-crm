/**
 * ============================================================
 *  UAT SEEDER — CRM CMLABS
 *  Role: Admin | Node.js + PostgreSQL (pg)
 * ============================================================
 *
 *  CARA PAKAI:
 *  1. Copy file ini ke root project CRM kamu
 *  2. Isi DATABASE_URL di .env atau langsung di baris connectionString bawah
 *  3. Jalankan: node seed-uat.js
 *  4. Selesai — semua data UAT langsung masuk ke DB
 *
 *  AMAN DIJALANKAN BERULANG:
 *  Script ini cek duplikasi via email/title sebelum insert,
 *  jadi tidak akan error kalau dijalankan lebih dari sekali.
 * ============================================================
 */

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// ─── KONEKSI DATABASE ────────────────────────────────────────
// Neon cloud PostgreSQL — SSL wajib diaktifkan
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ─── HELPER ──────────────────────────────────────────────────
function cuid() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(10).toString("base64url").slice(0, 14);
  return `c${timestamp}${random}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function weeksAgo(n) {
  return daysAgo(n * 7);
}

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

// ─── LOG HELPER ──────────────────────────────────────────────
const log = {
  info:    (msg) => console.log(`\x1b[36m[INFO]\x1b[0m  ${msg}`),
  success: (msg) => console.log(`\x1b[32m[OK]\x1b[0m    ${msg}`),
  skip:    (msg) => console.log(`\x1b[33m[SKIP]\x1b[0m  ${msg}`),
  section: (msg) => console.log(`\n\x1b[1m\x1b[35m━━━ ${msg} ━━━\x1b[0m`),
  done:    (msg) => console.log(`\x1b[32m\x1b[1m${msg}\x1b[0m`),
};

// ═══════════════════════════════════════════════════════════════
//  MAIN SEEDER
// ═══════════════════════════════════════════════════════════════
async function seed() {
  const client = await pool.connect();

  try {
    console.log("\n\x1b[1m╔══════════════════════════════════════════╗\x1b[0m");
    console.log("\x1b[1m║     UAT SEEDER — CRM CMLABS             ║\x1b[0m");
    console.log("\x1b[1m╚══════════════════════════════════════════╝\x1b[0m");

    // ──────────────────────────────────────────
    // 1. USERS
    // ──────────────────────────────────────────
    log.section("STEP 1 — USERS");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const hashedSales    = await bcrypt.hash("Sales@123", 10);
    const hashedExec     = await bcrypt.hash("Exec@123",  10);

    const usersData = [
      {
        name:  "Admin UAT",
        email: "admin.uat@cmlabs.co",
        password: hashedPassword,
        role:  "ADMIN",
        phone: "081111111111",
      },
      {
        name:  "Budi Santoso",
        email: "budi.sm@cmlabs.co",
        password: hashedSales,
        role:  "SALES_MANAGER",
        phone: "081222222222",
      },
      {
        name:  "Citra Dewi",
        email: "citra.ae@cmlabs.co",
        password: hashedSales,
        role:  "ACCOUNT_EXECUTIVE",
        phone: "081333333333",
      },
      {
        name:  "Dian Pratama",
        email: "dian.ex@cmlabs.co",
        password: hashedExec,
        role:  "EXECUTIVE",
        phone: "081444444444",
      },
    ];

    const userIds = {};

    for (const u of usersData) {
      const existing = await client.query(
        `SELECT id FROM users WHERE email = $1`, [u.email]
      );
      if (existing.rows.length > 0) {
        userIds[u.email] = existing.rows[0].id;
        log.skip(`User sudah ada: ${u.name} (${u.email})`);
        continue;
      }
      const id = cuid();
      await client.query(
        `INSERT INTO users (id, name, email, password, role, phone, "isActive", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5::\"Role\",$6,true,NOW(),NOW())`,
        [id, u.name, u.email, u.password, u.role, u.phone]
      );
      userIds[u.email] = id;
      log.success(`User dibuat: ${u.name} — role: ${u.role}`);
    }

    const adminId  = userIds["admin.uat@cmlabs.co"];
    const budiId   = userIds["budi.sm@cmlabs.co"];
    const citraId  = userIds["citra.ae@cmlabs.co"];

    // ──────────────────────────────────────────
    // 2. LEADS
    // ──────────────────────────────────────────
    log.section("STEP 2 — LEADS (22 data)");

    /**
     * Field mapping ke schema Prisma:
     * title         → judul lead
     * clientName    → nama klien
     * clientEmail   → email klien
     * clientPhone   → telepon klien
     * clientCompany → perusahaan klien
     * value         → nilai deal (Rp)
     * priority      → LOW | MEDIUM | HIGH
     * source        → Website | Referral | Cold Call
     * status        → stage kanban
     * assignedToId  → PIC (budi/citra)
     * createdById   → admin
     */
    const leadsData = [
      // ── APPROACH (4 leads) ──────────────────
      {
        title:         "Implementasi CRM untuk Distribusi Produk",
        clientName:    "Andi Kurniawan",
        clientJob:     "Direktur Operasional",
        clientEmail:   "andi.k@ptmajubersama.co.id",
        clientPhone:   "081234567801",
        clientCompany: "PT Maju Bersama",
        value:         18500000,
        priority:      "HIGH",
        source:        "Website",
        status:        "APPROACH",
        assignedToId:  citraId,
        createdAt:     daysAgo(5),
      },
      {
        title:         "Penawaran Jasa SEO untuk Brand Baru",
        clientName:    "Sari Wulandari",
        clientJob:     "Marketing Manager",
        clientEmail:   "sari@cvkaryaabadi.com",
        clientPhone:   "081234567802",
        clientCompany: "CV Karya Abadi",
        value:         9000000,
        priority:      "MEDIUM",
        source:        "Referral",
        status:        "APPROACH",
        assignedToId:  citraId,
        createdAt:     daysAgo(4),
      },
      {
        title:         "Konsultasi Digital Marketing Terpadu",
        clientName:    "Rudi Hartono",
        clientJob:     "CEO",
        clientEmail:   "rudi@ptsinarsejahtera.co.id",
        clientPhone:   "081234567803",
        clientCompany: "PT Sinar Sejahtera",
        value:         22000000,
        priority:      "HIGH",
        source:        "Cold Call",
        status:        "APPROACH",
        assignedToId:  budiId,
        createdAt:     daysAgo(3),
      },
      {
        title:         "[UAT] Lead Demo Drag-Drop Kanban",
        clientName:    "Andi Wijaya",
        clientJob:     "General Manager",
        clientEmail:   "andi@demouatcmlabs.com",
        clientPhone:   "081234567890",
        clientCompany: "PT Demo UAT Cmlabs",
        value:         25000000,
        priority:      "HIGH",
        source:        "Website",
        status:        "APPROACH",
        assignedToId:  adminId,
        createdAt:     daysAgo(2),
        description:   "Lead khusus untuk demonstrasi drag-and-drop saat sesi UAT. Pindahkan lead ini ke stage COLD_LEAD.",
      },

      // ── COLD_LEAD (4 leads) ─────────────────
      {
        title:         "Optimasi Performa Website E-Commerce",
        clientName:    "Dewi Rahayu",
        clientJob:     "Head of IT",
        clientEmail:   "dewi@pttekno.co.id",
        clientPhone:   "081234567804",
        clientCompany: "PT Teknologi Nusantara",
        value:         15000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "COLD_LEAD",
        assignedToId:  citraId,
        createdAt:     daysAgo(12),
      },
      {
        title:         "Pengembangan Strategi Konten B2B",
        clientName:    "Fajar Nugroho",
        clientJob:     "Brand Manager",
        clientEmail:   "fajar@cvdigital.com",
        clientPhone:   "081234567805",
        clientCompany: "CV Digital Solusi",
        value:         11000000,
        priority:      "LOW",
        source:        "Cold Call",
        status:        "COLD_LEAD",
        assignedToId:  budiId,
        createdAt:     daysAgo(14),
      },
      {
        title:         "Paket Branding & Social Media Management",
        clientName:    "Hendra Setiawan",
        clientJob:     "Owner",
        clientEmail:   "hendra@ptinovasi.co.id",
        clientPhone:   "081234567806",
        clientCompany: "PT Inovasi Indonesia",
        value:         13500000,
        priority:      "MEDIUM",
        source:        "Referral",
        status:        "COLD_LEAD",
        assignedToId:  citraId,
        createdAt:     daysAgo(16),
      },
      {
        title:         "Layanan PPC & Google Ads Management",
        clientName:    "Ira Susanti",
        clientJob:     "Marketing Director",
        clientEmail:   "ira@udmakmur.co.id",
        clientPhone:   "081234567807",
        clientCompany: "UD Makmur Jaya",
        value:         8500000,
        priority:      "LOW",
        source:        "Website",
        status:        "COLD_LEAD",
        assignedToId:  budiId,
        createdAt:     daysAgo(18),
      },

      // ── NEEDS_IDENTIFIED (4 leads) ──────────
      {
        title:         "Solusi CRM & Automasi Sales Pipeline",
        clientName:    "Joko Purnomo",
        clientJob:     "Sales Director",
        clientEmail:   "joko@ptglobal.co.id",
        clientPhone:   "081234567808",
        clientCompany: "PT Global Mandiri",
        value:         35000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "NEEDS_IDENTIFIED",
        assignedToId:  budiId,
        createdAt:     monthsAgo(1),
      },
      {
        title:         "Revamp Website & SEO Audit Menyeluruh",
        clientName:    "Kartika Sari",
        clientJob:     "Digital Marketing Manager",
        clientEmail:   "kartika@cvsukses.com",
        clientPhone:   "081234567809",
        clientCompany: "CV Sukses Jaya",
        value:         12000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "NEEDS_IDENTIFIED",
        assignedToId:  citraId,
        createdAt:     monthsAgo(1),
      },
      {
        title:         "Pemasangan Sistem Tracking & Analytics",
        clientName:    "Lukman Hakim",
        clientJob:     "CTO",
        clientEmail:   "lukman@ptprima.co.id",
        clientPhone:   "081234567810",
        clientCompany: "PT Prima Utama",
        value:         19000000,
        priority:      "HIGH",
        source:        "Cold Call",
        status:        "NEEDS_IDENTIFIED",
        assignedToId:  budiId,
        createdAt:     monthsAgo(1),
      },
      {
        title:         "Konsultasi Strategi Ekspansi Digital",
        clientName:    "Maya Putri",
        clientJob:     "Business Development",
        clientEmail:   "maya@ptartha.co.id",
        clientPhone:   "081234567811",
        clientCompany: "PT Artha Graha",
        value:         27000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "NEEDS_IDENTIFIED",
        assignedToId:  citraId,
        createdAt:     monthsAgo(1),
      },

      // ── DECK_REQUEST (3 leads) ──────────────
      {
        title:         "Proposal Paket Digital Marketing Enterprise",
        clientName:    "Nando Pratama",
        clientJob:     "VP Marketing",
        clientEmail:   "nando@ptdimensi.co.id",
        clientPhone:   "081234567812",
        clientCompany: "PT Dimensi Baru",
        value:         45000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DECK_REQUEST",
        assignedToId:  budiId,
        createdAt:     monthsAgo(2),
      },
      {
        title:         "Penawaran SEO + Content Strategy 6 Bulan",
        clientName:    "Olivia Kusuma",
        clientJob:     "Marketing Manager",
        clientEmail:   "olivia@cvmitra.com",
        clientPhone:   "081234567813",
        clientCompany: "CV Mitra Sejati",
        value:         18000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "DECK_REQUEST",
        assignedToId:  citraId,
        createdAt:     monthsAgo(2),
      },
      {
        title:         "Paket Full Service Digital Agency",
        clientName:    "Pandu Wirawan",
        clientJob:     "COO",
        clientEmail:   "pandu@ptcahaya.co.id",
        clientPhone:   "081234567814",
        clientCompany: "PT Cahaya Timur",
        value:         30000000,
        priority:      "HIGH",
        source:        "Cold Call",
        status:        "DECK_REQUEST",
        assignedToId:  budiId,
        createdAt:     monthsAgo(2),
      },

      // ── MEETING (3 leads) ───────────────────
      {
        title:         "[UAT] Lead Rekam Aktivitas — Timeline Demo",
        clientName:    "Qori Handayani",
        clientJob:     "Head of Growth",
        clientEmail:   "qori@ptbintang.co.id",
        clientPhone:   "081234567815",
        clientCompany: "PT Bintang Selatan",
        value:         40000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "MEETING",
        assignedToId:  citraId,
        createdAt:     monthsAgo(2),
        description:   "Lead khusus untuk demonstrasi Timeline Activity saat sesi UAT. Sudah ada 5 riwayat aktivitas.",
      },
      {
        title:         "Diskusi Lanjutan Paket Performance Marketing",
        clientName:    "Rizal Fauzi",
        clientJob:     "CMO",
        clientEmail:   "rizal@cvkaryamuda.com",
        clientPhone:   "081234567816",
        clientCompany: "CV Karya Muda",
        value:         23000000,
        priority:      "MEDIUM",
        source:        "Referral",
        status:        "MEETING",
        assignedToId:  budiId,
        createdAt:     monthsAgo(2),
      },
      {
        title:         "Presentasi Proposal Integrasi Marketing Tech",
        clientName:    "Sinta Maharani",
        clientJob:     "IT Manager",
        clientEmail:   "sinta@ptomega.co.id",
        clientPhone:   "081234567817",
        clientCompany: "PT Omega Perkasa",
        value:         55000000,
        priority:      "HIGH",
        source:        "Website",
        status:        "MEETING",
        assignedToId:  citraId,
        createdAt:     monthsAgo(2),
      },

      // ── DEAL (2 leads) ──────────────────────
      {
        title:         "Kontrak Tahunan SEO & Content Marketing",
        clientName:    "Tono Hidayat",
        clientJob:     "CEO",
        clientEmail:   "tono@ptsurya.co.id",
        clientPhone:   "081234567818",
        clientCompany: "PT Surya Cemerlang",
        value:         60000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     monthsAgo(3),
        closedAt:      daysAgo(30),
      },
      {
        title:         "Paket Social Media Ads 6 Bulan",
        clientName:    "Umi Kalsum",
        clientJob:     "Brand Manager",
        clientEmail:   "umi@cvandalan.com",
        clientPhone:   "081234567819",
        clientCompany: "CV Andalan Jaya",
        value:         28000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     monthsAgo(3),
        closedAt:      daysAgo(25),
      },

      // ── RECYCLE (2 leads) ───────────────────
      {
        title:         "Penawaran Paket SEO — Tidak Dilanjutkan",
        clientName:    "Vino Santoso",
        clientJob:     "Marketing Staff",
        clientEmail:   "vino@ptdelta.co.id",
        clientPhone:   "081234567820",
        clientCompany: "PT Delta Fortuna",
        value:         7000000,
        priority:      "LOW",
        source:        "Cold Call",
        status:        "RECYCLE",
        assignedToId:  budiId,
        createdAt:     monthsAgo(3),
      },
      {
        title:         "Konsultasi Digital — Budget Tidak Sesuai",
        clientName:    "Wulan Permata",
        clientJob:     "Owner",
        clientEmail:   "wulan@cvnusantara.com",
        clientPhone:   "081234567821",
        clientCompany: "CV Nusantara Raya",
        value:         5000000,
        priority:      "LOW",
        source:        "Website",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     monthsAgo(3),
      },

      // ═══════════════════════════════════════════
      // DATA HISTORIS — untuk uji fitur filter
      // Tersebar di tahun 2022, 2023, 2024
      // ═══════════════════════════════════════════

      // ── 2022 Q1 ─────────────────────────────
      {
        title:         "[2022-Q1] Proyek SEO Jangka Panjang",
        clientName:    "Agus Firmansyah",
        clientJob:     "CEO",
        clientEmail:   "agus@ptmegautama.co.id",
        clientPhone:   "081298760001",
        clientCompany: "PT Mega Utama",
        value:         45000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2022-01-15"),
        closedAt:      new Date("2022-03-10"),
      },
      {
        title:         "[2022-Q1] Konsultasi Branding Startup",
        clientName:    "Bella Aulia",
        clientJob:     "Co-Founder",
        clientEmail:   "bella@startupnusantara.com",
        clientPhone:   "081298760002",
        clientCompany: "Startup Nusantara",
        value:         18000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2022-02-20"),
      },
      {
        title:         "[2022-Q1] Penawaran Google Ads Management",
        clientName:    "Chandra Wijaya",
        clientJob:     "Marketing Manager",
        clientEmail:   "chandra@cvberkahjaya.com",
        clientPhone:   "081298760003",
        clientCompany: "CV Berkah Jaya",
        value:         12000000,
        priority:      "MEDIUM",
        source:        "Cold Call",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2022-03-05"),
        closedAt:      new Date("2022-04-01"),
      },

      // ── 2022 Q2 ─────────────────────────────
      {
        title:         "[2022-Q2] Paket Social Media Full Service",
        clientName:    "Dedi Kurniawan",
        clientJob:     "Brand Manager",
        clientEmail:   "dedi@ptharmoni.co.id",
        clientPhone:   "081298760004",
        clientCompany: "PT Harmoni Abadi",
        value:         30000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2022-04-18"),
        closedAt:      new Date("2022-06-25"),
      },
      {
        title:         "[2022-Q2] Website Revamp & UI/UX",
        clientName:    "Eka Putranto",
        clientJob:     "IT Director",
        clientEmail:   "eka@ptlogistik.co.id",
        clientPhone:   "081298760005",
        clientCompany: "PT Logistik Prima",
        value:         22000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2022-05-10"),
      },

      // ── 2022 Q3 ─────────────────────────────
      {
        title:         "[2022-Q3] Strategi Konten & SEO Teknikal",
        clientName:    "Fitri Handayani",
        clientJob:     "Digital Manager",
        clientEmail:   "fitri@ptkemang.co.id",
        clientPhone:   "081298760006",
        clientCompany: "PT Kemang Digital",
        value:         28000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2022-07-08"),
        closedAt:      new Date("2022-08-30"),
      },
      {
        title:         "[2022-Q3] Penawaran PPC & Retargeting",
        clientName:    "Gilang Permana",
        clientJob:     "Marketing Lead",
        clientEmail:   "gilang@cvsumberdaya.com",
        clientPhone:   "081298760007",
        clientCompany: "CV Sumber Daya",
        value:         9500000,
        priority:      "LOW",
        source:        "Cold Call",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2022-08-14"),
      },

      // ── 2022 Q4 ─────────────────────────────
      {
        title:         "[2022-Q4] Paket Digital Marketing Tahunan",
        clientName:    "Hani Setiawati",
        clientJob:     "CMO",
        clientEmail:   "hani@ptpangandaran.co.id",
        clientPhone:   "081298760008",
        clientCompany: "PT Pangandaran Group",
        value:         80000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2022-10-03"),
        closedAt:      new Date("2022-11-20"),
      },
      {
        title:         "[2022-Q4] Optimasi Landing Page & CRO",
        clientName:    "Irwan Prasetyo",
        clientJob:     "Growth Manager",
        clientEmail:   "irwan@cvgrowthid.com",
        clientPhone:   "081298760009",
        clientCompany: "CV Growth Indonesia",
        value:         15000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2022-11-07"),
        closedAt:      new Date("2022-12-15"),
      },

      // ── 2023 Q1 ─────────────────────────────
      {
        title:         "[2023-Q1] Kontrak SEO Retail E-Commerce",
        clientName:    "Jaya Kusuma",
        clientJob:     "CEO",
        clientEmail:   "jaya@ptretailindo.co.id",
        clientPhone:   "081298760010",
        clientCompany: "PT Retail Indo",
        value:         55000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2023-01-09"),
        closedAt:      new Date("2023-02-28"),
      },
      {
        title:         "[2023-Q1] Penawaran Email Marketing Automation",
        clientName:    "Kartini Lestari",
        clientJob:     "CRM Manager",
        clientEmail:   "kartini@ptedutech.co.id",
        clientPhone:   "081298760011",
        clientCompany: "PT Edutech Indonesia",
        value:         16000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2023-02-14"),
      },
      {
        title:         "[2023-Q1] Setup Google Analytics & Tag Manager",
        clientName:    "Lukito Pramana",
        clientJob:     "Head of Data",
        clientEmail:   "lukito@cvanalyticsid.com",
        clientPhone:   "081298760012",
        clientCompany: "CV Analytics Indonesia",
        value:         8000000,
        priority:      "LOW",
        source:        "Cold Call",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2023-03-01"),
        closedAt:      new Date("2023-03-25"),
      },

      // ── 2023 Q2 ─────────────────────────────
      {
        title:         "[2023-Q2] Paket Influencer & Content Creator",
        clientName:    "Mira Anggraini",
        clientJob:     "Brand Director",
        clientEmail:   "mira@ptfashionindo.co.id",
        clientPhone:   "081298760013",
        clientCompany: "PT Fashion Indonesia",
        value:         42000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2023-04-05"),
        closedAt:      new Date("2023-06-10"),
      },
      {
        title:         "[2023-Q2] Audit SEO & Competitor Analysis",
        clientName:    "Nanang Subagyo",
        clientJob:     "Marketing Manager",
        clientEmail:   "nanang@cvproptech.com",
        clientPhone:   "081298760014",
        clientCompany: "CV PropTech Indonesia",
        value:         11000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2023-05-20"),
      },

      // ── 2023 Q3 ─────────────────────────────
      {
        title:         "[2023-Q3] Integrasi CRM & Marketing Automation",
        clientName:    "Oktavia Sari",
        clientJob:     "VP Sales",
        clientEmail:   "oktavia@ptfintech.co.id",
        clientPhone:   "081298760015",
        clientCompany: "PT Fintech Solusi",
        value:         65000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2023-07-11"),
        closedAt:      new Date("2023-09-05"),
      },
      {
        title:         "[2023-Q3] Pembuatan Video Iklan & Produksi Konten",
        clientName:    "Putra Ramadhan",
        clientJob:     "Creative Director",
        clientEmail:   "putra@cvkreatifid.com",
        clientPhone:   "081298760016",
        clientCompany: "CV Kreatif Indonesia",
        value:         25000000,
        priority:      "MEDIUM",
        source:        "Cold Call",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2023-08-03"),
        closedAt:      new Date("2023-09-20"),
      },

      // ── 2023 Q4 ─────────────────────────────
      {
        title:         "[2023-Q4] Paket Enterprise Digital 12 Bulan",
        clientName:    "Qisya Rahmawati",
        clientJob:     "CEO",
        clientEmail:   "qisya@ptenterprisegroup.co.id",
        clientPhone:   "081298760017",
        clientCompany: "PT Enterprise Group",
        value:         120000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2023-10-02"),
        closedAt:      new Date("2023-11-15"),
      },
      {
        title:         "[2023-Q4] Strategi Marketplace & Tokopedia Ads",
        clientName:    "Rizky Aditya",
        clientJob:     "E-Commerce Manager",
        clientEmail:   "rizky@cvmarketplace.com",
        clientPhone:   "081298760018",
        clientCompany: "CV Marketplace Sukses",
        value:         19000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2023-11-08"),
        closedAt:      new Date("2023-12-20"),
      },
      {
        title:         "[2023-Q4] Penawaran TikTok Ads Campaign",
        clientName:    "Susi Andriani",
        clientJob:     "Social Media Manager",
        clientEmail:   "susi@cvsocialmedia.com",
        clientPhone:   "081298760019",
        clientCompany: "CV Social Media Pro",
        value:         7500000,
        priority:      "LOW",
        source:        "Cold Call",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2023-12-01"),
      },

      // ── 2024 Q1 ─────────────────────────────
      {
        title:         "[2024-Q1] Kontrak SEO & Content 6 Bulan",
        clientName:    "Taufik Hidayat",
        clientJob:     "Marketing Director",
        clientEmail:   "taufik@ptproperty.co.id",
        clientPhone:   "081298760020",
        clientCompany: "PT Property Nusantara",
        value:         48000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2024-01-08"),
        closedAt:      new Date("2024-02-20"),
      },
      {
        title:         "[2024-Q1] Penawaran Paket Startup Booster",
        clientName:    "Ulfah Nadhira",
        clientJob:     "Founder",
        clientEmail:   "ulfah@startuphealthtech.com",
        clientPhone:   "081298760021",
        clientCompany: "Startup HealthTech ID",
        value:         14000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2024-02-14"),
      },
      {
        title:         "[2024-Q1] Setup Tracking & Reporting Dashboard",
        clientName:    "Victor Santoso",
        clientJob:     "Data Analyst",
        clientEmail:   "victor@cvdatadriven.com",
        clientPhone:   "081298760022",
        clientCompany: "CV Data Driven",
        value:         10000000,
        priority:      "LOW",
        source:        "Cold Call",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2024-03-05"),
        closedAt:      new Date("2024-03-28"),
      },

      // ── 2024 Q2 ─────────────────────────────
      {
        title:         "[2024-Q2] Full Funnel Digital Marketing",
        clientName:    "Wahyu Nugroho",
        clientJob:     "CMO",
        clientEmail:   "wahyu@ptlogistikplus.co.id",
        clientPhone:   "081298760023",
        clientCompany: "PT Logistik Plus",
        value:         70000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2024-04-10"),
        closedAt:      new Date("2024-06-05"),
      },
      {
        title:         "[2024-Q2] Revamp Strategi Media Sosial",
        clientName:    "Xena Puspita",
        clientJob:     "Brand Manager",
        clientEmail:   "xena@cvagrotech.com",
        clientPhone:   "081298760024",
        clientCompany: "CV Agrotech Mandiri",
        value:         17000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2024-05-15"),
      },

      // ── 2024 Q3 ─────────────────────────────
      {
        title:         "[2024-Q3] Paket SEM & Display Ads 3 Bulan",
        clientName:    "Yoga Pratama",
        clientJob:     "Digital Marketing Lead",
        clientEmail:   "yoga@ptmotorindo.co.id",
        clientPhone:   "081298760025",
        clientCompany: "PT Motor Indo",
        value:         33000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2024-07-01"),
        closedAt:      new Date("2024-08-22"),
      },
      {
        title:         "[2024-Q3] Konsultasi Strategi Growth Hacking",
        clientName:    "Zahra Kamila",
        clientJob:     "Growth Manager",
        clientEmail:   "zahra@cvgrowthlab.com",
        clientPhone:   "081298760026",
        clientCompany: "CV Growth Lab",
        value:         13000000,
        priority:      "MEDIUM",
        source:        "Cold Call",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2024-08-09"),
        closedAt:      new Date("2024-09-15"),
      },

      // ── 2024 Q4 ─────────────────────────────
      {
        title:         "[2024-Q4] Kontrak Enterprise Full Package",
        clientName:    "Arif Budiman",
        clientJob:     "CEO",
        clientEmail:   "arif@ptmegacorp.co.id",
        clientPhone:   "081298760027",
        clientCompany: "PT Mega Corp",
        value:         150000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2024-10-07"),
        closedAt:      new Date("2024-11-30"),
      },
      {
        title:         "[2024-Q4] Paket SEO + Ads Akhir Tahun",
        clientName:    "Bintari Kusuma",
        clientJob:     "Marketing Manager",
        clientEmail:   "bintari@cvholiday.com",
        clientPhone:   "081298760028",
        clientCompany: "CV Holiday Promo",
        value:         21000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2024-11-04"),
        closedAt:      new Date("2024-12-10"),
      },
      {
        title:         "[2024-Q4] Penawaran Konten Video Akhir Tahun",
        clientName:    "Cakra Wibowo",
        clientJob:     "Creative Head",
        clientEmail:   "cakra@cvkreasi.com",
        clientPhone:   "081298760029",
        clientCompany: "CV Kreasi Digital",
        value:         9000000,
        priority:      "LOW",
        source:        "Cold Call",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2024-12-03"),
      },

      // ── 2025 (per kuartal sampai sekarang) ──
      {
        title:         "[2025-Q1] Kontrak SEO Perusahaan Manufaktur",
        clientName:    "Dian Nurhayati",
        clientJob:     "VP Marketing",
        clientEmail:   "dian@ptmanufaktur.co.id",
        clientPhone:   "081298760030",
        clientCompany: "PT Manufaktur Jaya",
        value:         55000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2025-01-13"),
        closedAt:      new Date("2025-02-28"),
      },
      {
        title:         "[2025-Q1] Penawaran Performance Marketing FMCG",
        clientName:    "Endra Setiawan",
        clientJob:     "Brand Manager",
        clientEmail:   "endra@ptfmcg.co.id",
        clientPhone:   "081298760031",
        clientCompany: "PT FMCG Nusantara",
        value:         38000000,
        priority:      "HIGH",
        source:        "Cold Call",
        status:        "RECYCLE",
        assignedToId:  citraId,
        createdAt:     new Date("2025-02-10"),
      },
      {
        title:         "[2025-Q2] Paket Digital Full Service UMKM",
        clientName:    "Febri Yanto",
        clientJob:     "Owner",
        clientEmail:   "febri@umkmnaik.com",
        clientPhone:   "081298760032",
        clientCompany: "UMKM Naik Kelas",
        value:         12000000,
        priority:      "MEDIUM",
        source:        "Website",
        status:        "DEAL",
        assignedToId:  citraId,
        createdAt:     new Date("2025-04-02"),
        closedAt:      new Date("2025-05-10"),
      },
      {
        title:         "[2025-Q2] Strategi Omnichannel Marketing",
        clientName:    "Gina Marlina",
        clientJob:     "CMO",
        clientEmail:   "gina@ptyankee.co.id",
        clientPhone:   "081298760033",
        clientCompany: "PT Yankee Global",
        value:         90000000,
        priority:      "HIGH",
        source:        "Referral",
        status:        "DEAL",
        assignedToId:  budiId,
        createdAt:     new Date("2025-05-05"),
        closedAt:      new Date("2025-06-20"),
      },
    ];

    const leadIds = {};

    for (const lead of leadsData) {
      const existing = await client.query(
        `SELECT id FROM leads WHERE title = $1`, [lead.title]
      );
      if (existing.rows.length > 0) {
        leadIds[lead.title] = existing.rows[0].id;
        log.skip(`Lead sudah ada: "${lead.title}"`);
        continue;
      }

      const id = cuid();
      await client.query(
        `INSERT INTO leads (
          id, title, "clientName", "clientEmail", "clientPhone", "clientCompany",
          status, priority, value, description, source,
          "assignedToId", "createdById", "closedAt", "createdAt", "updatedAt"
        ) VALUES (
          $1,$2,$3,$4,$5,$6,
          $7::\"LeadStatus\",$8::\"LeadPriority\",$9,$10,$11,
          $12,$13,$14,$15,$15
        )`,
        [
          id,
          lead.title,
          lead.clientName,
          lead.clientEmail,
          lead.clientPhone,
          lead.clientCompany,
          lead.status,
          lead.priority,
          lead.value,
          lead.description || `Klien: ${lead.clientName} — ${lead.clientJob} di ${lead.clientCompany}`,
          lead.source,
          lead.assignedToId,
          adminId,
          lead.closedAt || null,
          lead.createdAt,
        ]
      );
      leadIds[lead.title] = id;
      log.success(`Lead dibuat: "${lead.title}" → ${lead.status}`);
    }

    // ──────────────────────────────────────────
    // 3. ACTIVITIES (Timeline untuk lead UAT)
    // ──────────────────────────────────────────
    log.section("STEP 3 — ACTIVITIES (Timeline Demo)");

    const timelineLeadId = leadIds["[UAT] Lead Rekam Aktivitas — Timeline Demo"];

    if (!timelineLeadId) {
      log.skip("Lead timeline tidak ditemukan, skip activities.");
    } else {
      const activities = [
        {
          type:        "EMAIL_SENT",
          title:       "Email Perkenalan Produk CRM",
          content:     "Mengirim email perkenalan layanan CRM dan Digital Marketing CMLABS kepada Qori Handayani.",
          description: "Email pertama dikirim sebagai first touch. Menjelaskan value proposition CMLABS secara singkat.",
          isDone:      true,
          createdAt:   weeksAgo(3),
          userId:      citraId,
        },
        {
          type:        "CALL",
          title:       "Follow-up Call — Lead Tertarik Demo",
          content:     "Telepon follow-up setelah email pertama. Lead menyatakan tertarik dan meminta demo produk.",
          description: "Durasi 15 menit. Lead bertanya soal fitur reporting dan integrasi dengan tools yang sudah dipakai.",
          isDone:      true,
          createdAt:   weeksAgo(2),
          userId:      citraId,
        },
        {
          type:        "MEETING",
          title:       "Demo Produk via Zoom",
          content:     "Presentasi dan demo sistem CRM CMLABS secara online. Klien antusias, terutama fitur Kanban dan Forecasting.",
          description: "Meeting berlangsung 45 menit. Dihadiri 3 orang dari sisi klien. Hasilnya positif, klien minta proposal.",
          isDone:      true,
          createdAt:   daysAgo(10),
          userId:      budiId,
        },
        {
          type:        "EMAIL_SENT",
          title:       "Kirim Proposal Harga & Penawaran Resmi",
          content:     "Mengirimkan dokumen proposal resmi beserta rincian harga paket enterprise kepada Qori Handayani.",
          description: "Proposal dikirim dalam format PDF. Nilai deal Rp 40.000.000 untuk paket Full Service 12 bulan.",
          isDone:      true,
          createdAt:   daysAgo(7),
          userId:      citraId,
        },
        {
          type:        "NOTE",
          title:       "Klien Minta Revisi Harga — Negosiasi Lanjut",
          content:     "Klien menghubungi via WhatsApp dan meminta revisi harga. Budget mereka sekitar Rp 35jt. Negosiasi masih berlanjut.",
          description: "Perlu diskusi internal dengan Sales Manager sebelum memberikan counter-offer ke klien.",
          isDone:      false,
          createdAt:   daysAgo(3),
          userId:      citraId,
        },
      ];

      for (const act of activities) {
        const existAct = await client.query(
          `SELECT id FROM activities WHERE title = $1 AND "leadId" = $2`,
          [act.title, timelineLeadId]
        );
        if (existAct.rows.length > 0) {
          log.skip(`Activity sudah ada: "${act.title}"`);
          continue;
        }
        const id = cuid();
        await client.query(
          `INSERT INTO activities (
            id, type, title, content, description, "isDone",
            "leadId", "userId", "createdAt", "updatedAt"
          ) VALUES (
            $1,$2::\"ActivityType\",$3,$4,$5,$6,$7,$8,$9,$9
          )`,
          [
            id,
            act.type,
            act.title,
            act.content,
            act.description,
            act.isDone,
            timelineLeadId,
            act.userId,
            act.createdAt,
          ]
        );
        log.success(`Activity dibuat: [${act.type}] "${act.title}"`);
      }
    }

    // ──────────────────────────────────────────
    // 4. ACTIVITIES TAMBAHAN (leads lain agar
    //    Dashboard Analytics ada data aktivitas)
    // ──────────────────────────────────────────
    log.section("STEP 4 — ACTIVITIES TAMBAHAN (Dashboard Analytics)");

    const extraActivities = [
      {
        leadTitle:   "Kontrak Tahunan SEO & Content Marketing",
        type:        "MEETING",
        title:       "Kick-off Meeting Kontrak Tahunan",
        content:     "Meeting perdana setelah kontrak ditandatangani. Membahas roadmap 3 bulan pertama.",
        userId:      budiId,
        createdAt:   daysAgo(28),
        isDone:      true,
      },
      {
        leadTitle:   "Paket Social Media Ads 6 Bulan",
        type:        "CALL",
        title:       "Call Konfirmasi Tanda Tangan Kontrak",
        content:     "Klien konfirmasi akan menandatangani kontrak minggu depan. Perlu disiapkan dokumen SPK.",
        userId:      citraId,
        createdAt:   daysAgo(22),
        isDone:      true,
      },
      {
        leadTitle:   "Solusi CRM & Automasi Sales Pipeline",
        type:        "TASK",
        title:       "Siapkan Demo Environment CRM",
        content:     "Persiapkan demo environment khusus untuk presentasi ke PT Global Mandiri.",
        userId:      budiId,
        createdAt:   daysAgo(15),
        isDone:      true,
      },
      {
        leadTitle:   "Proposal Paket Digital Marketing Enterprise",
        type:        "EMAIL_SENT",
        title:       "Kirim Draft Proposal Enterprise",
        content:     "Draft proposal dikirim untuk review internal klien sebelum presentasi final.",
        userId:      budiId,
        createdAt:   daysAgo(20),
        isDone:      true,
      },
      {
        leadTitle:   "Diskusi Lanjutan Paket Performance Marketing",
        type:        "MEETING",
        title:       "Presentasi ROI Projection",
        content:     "Mempresentasikan proyeksi ROI dari paket Performance Marketing selama 6 bulan.",
        userId:      budiId,
        createdAt:   daysAgo(8),
        isDone:      true,
      },
    ];

    for (const act of extraActivities) {
      const leadId = leadIds[act.leadTitle];
      if (!leadId) {
        log.skip(`Lead tidak ditemukan untuk activity: "${act.title}"`);
        continue;
      }
      const existAct = await client.query(
        `SELECT id FROM activities WHERE title = $1 AND "leadId" = $2`,
        [act.title, leadId]
      );
      if (existAct.rows.length > 0) {
        log.skip(`Activity sudah ada: "${act.title}"`);
        continue;
      }
      const id = cuid();
      await client.query(
        `INSERT INTO activities (
          id, type, title, content, "isDone",
          "leadId", "userId", "createdAt", "updatedAt"
        ) VALUES (
          $1,$2::\"ActivityType\",$3,$4,$5,$6,$7,$8,$8
        )`,
        [id, act.type, act.title, act.content, act.isDone, leadId, act.userId, act.createdAt]
      );
      log.success(`Activity dibuat: [${act.type}] "${act.title}"`);
    }

    // ──────────────────────────────────────────
    // RINGKASAN AKHIR
    // ──────────────────────────────────────────
    const totalUsers   = await client.query(`SELECT COUNT(*) FROM users`);
    const totalLeads   = await client.query(`SELECT COUNT(*) FROM leads`);
    const totalActs    = await client.query(`SELECT COUNT(*) FROM activities`);

    console.log("\n\x1b[1m╔══════════════════════════════════════════╗\x1b[0m");
    log.done(`║  ✅  SEEDER SELESAI TANPA ERROR          ║`);
    console.log("\x1b[1m╠══════════════════════════════════════════╣\x1b[0m");
    log.done(`║  👤  Total Users    : ${String(totalUsers.rows[0].count).padEnd(18)}║`);
    log.done(`║  📋  Total Leads    : ${String(totalLeads.rows[0].count).padEnd(18)}║`);
    log.done(`║  📅  Total Activity : ${String(totalActs.rows[0].count).padEnd(18)}║`);
    console.log("\x1b[1m╠══════════════════════════════════════════╣\x1b[0m");
    console.log("\x1b[1m║  AKUN LOGIN UAT:                         ║\x1b[0m");
    console.log("\x1b[1m║  admin.uat@cmlabs.co  → Admin@123        ║\x1b[0m");
    console.log("\x1b[1m║  budi.sm@cmlabs.co    → Sales@123        ║\x1b[0m");
    console.log("\x1b[1m║  citra.ae@cmlabs.co   → Sales@123        ║\x1b[0m");
    console.log("\x1b[1m║  dian.ex@cmlabs.co    → Exec@123         ║\x1b[0m");
    console.log("\x1b[1m╚══════════════════════════════════════════╝\x1b[0m\n");

  } catch (err) {
    console.error("\n\x1b[31m[ERROR]\x1b[0m Seeder gagal:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();