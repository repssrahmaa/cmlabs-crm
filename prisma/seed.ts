import { PrismaClient, ActivityType, LeadStatus, LeadPriority } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const SALT_ROUNDS = 10
const DEFAULT_PASSWORD = "Demo123!"

// ── Helper: hash password ──────────────────────────────────────
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

async function main() {
  console.log("🌱 Starting RBAC seed...")
  console.log("━".repeat(50))

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD)

  // ────────────────────────────────────────────────────────────
  // 1. USERS — one per role
  // ────────────────────────────────────────────────────────────
  console.log("\n👤 Seeding users...")

  const Admin = await prisma.user.upsert({
    where:  { email: "admin@cmlabs.co" },
    update: {
      name:     "Admin",
      password: hashedPassword,
      role:     "ADMIN",
      isActive: true,
    },
    create: {
      name:     "Admin",
      email:    "admin@cmlabs.co",
      password: hashedPassword,
      role:     "ADMIN",
      phone:    "081100000001",
      isActive: true,
    },
  })
  console.log(`  ✓ ADMIN    → ${Admin.email}`)

  const executive = await prisma.user.upsert({
    where:  { email: "executive@cmlabs.co" },
    update: {
      name:     "Executive User",
      password: hashedPassword,
      role:     "EXECUTIVE",
      isActive: true,
    },
    create: {
      name:     "Executive User",
      email:    "executive@cmlabs.co",
      password: hashedPassword,
      role:     "EXECUTIVE",
      phone:    "081100000002",
      isActive: true,
    },
  })
  console.log(`  ✓ EXECUTIVE      → ${executive.email}`)

  const salesManager = await prisma.user.upsert({
    where:  { email: "sales_mgr@cmlabs.co" },
    update: {
      name:     "Sales Manager",
      password: hashedPassword,
      role:     "SALES_MANAGER",
      isActive: true,
    },
    create: {
      name:     "Sales Manager",
      email:    "sales_mgr@cmlabs.co",
      password: hashedPassword,
      role:     "SALES_MANAGER",
      phone:    "081100000003",
      isActive: true,
    },
  })
  console.log(`  ✓ SALES_MANAGER  → ${salesManager.email}`)

  const accountExecutive = await prisma.user.upsert({
    where:  { email: "ae@cmlabs.co" },
    update: {
      name:     "Account Executive",
      password: hashedPassword,
      role:     "ACCOUNT_EXECUTIVE",
      isActive: true,
    },
    create: {
      name:     "Account Executive",
      email:    "ae@cmlabs.co",
      password: hashedPassword,
      role:     "ACCOUNT_EXECUTIVE",
      phone:    "081100000004",
      isActive: true,
    },
  })
  console.log(`  ✓ ACCOUNT_EXECUTIVE → ${accountExecutive.email}`)

  // ────────────────────────────────────────────────────────────
  // 2. LEADS — 3 leads dengan assignment berbeda
  // ────────────────────────────────────────────────────────────
  console.log("\n📋 Seeding leads...")

  // Lead 1: Assigned ke Account Executive
  const leadAssignedToAE = await prisma.lead.upsert({
    where: {
      // Upsert berdasarkan kombinasi unik — gunakan title + createdById
      id: (await prisma.lead.findFirst({
        where: {
          title:       "SEO Project - PT Digital Maju",
          createdById: accountExecutive.id,
        },
        select: { id: true },
      }))?.id ?? "seed-lead-ae-001",
    },
    update: {
      title:         "SEO Project - PT Digital Maju",
      clientName:    "Budi Santoso",
      clientEmail:   "budi@digitalmaju.co.id",
      clientPhone:   "082100001111",
      clientCompany: "PT Digital Maju",
      status:        LeadStatus.APPROACH,
      priority:      LeadPriority.HIGH,
      value:         35000000,
      source:        "Website",
      description:   "Klien tertarik paket SEO premium 6 bulan",
      assignedToId:  accountExecutive.id,
      createdById:   accountExecutive.id,
    },
    create: {
      title:         "SEO Project - PT Digital Maju",
      clientName:    "Budi Santoso",
      clientEmail:   "budi@digitalmaju.co.id",
      clientPhone:   "082100001111",
      clientCompany: "PT Digital Maju",
      status:        LeadStatus.DECK_REQUEST,
      priority:      LeadPriority.HIGH,
      value:         35000000,
      source:        "Website",
      description:   "Klien tertarik paket SEO premium 6 bulan",
      assignedToId:  accountExecutive.id,
      createdById:   accountExecutive.id,
    },
  })
  console.log(`  ✓ Lead (AE)      → "${leadAssignedToAE.title}"`)

  // Lead 2: Assigned ke Sales Manager
  const leadAssignedToSM = await prisma.lead.upsert({
    where: {
      id: (await prisma.lead.findFirst({
        where: {
          title:       "Google Ads Campaign - CV Sukses Selalu",
          createdById: salesManager.id,
        },
        select: { id: true },
      }))?.id ?? "seed-lead-sm-001",
    },
    update: {
      title:         "Google Ads Campaign - CV Sukses Selalu",
      clientName:    "Ratna Dewi",
      clientEmail:   "ratna@suksesselalu.com",
      clientPhone:   "083200002222",
      clientCompany: "CV Sukses Selalu",
      status:        LeadStatus.MEETING,
      priority:      LeadPriority.HIGH,
      value:         18000000,
      source:        "Referral",
      description:   "Butuh campaign Google Ads untuk produk baru",
      assignedToId:  salesManager.id,
      createdById:   salesManager.id,
    },
    create: {
      title:         "Google Ads Campaign - CV Sukses Selalu",
      clientName:    "Ratna Dewi",
      clientEmail:   "ratna@suksesselalu.com",
      clientPhone:   "083200002222",
      clientCompany: "CV Sukses Selalu",
      status:        LeadStatus.MEETING,
      priority:      LeadPriority.HIGH,
      value:         18000000,
      source:        "Referral",
      description:   "Butuh campaign Google Ads untuk produk baru",
      assignedToId:  salesManager.id,
      createdById:   salesManager.id,
    },
  })
  console.log(`  ✓ Lead (SM)      → "${leadAssignedToSM.title}"`)

  // Lead 3: Unassigned — dibuat Admin
  const leadUnassigned = await prisma.lead.upsert({
    where: {
      id: (await prisma.lead.findFirst({
        where: {
          title:       "Content Writing Package - Startup Inovatif",
          createdById: Admin.id,
        },
        select: { id: true },
      }))?.id ?? "seed-lead-unassigned-001",
    },
    update: {
      title:         "Content Writing Package - Startup Inovatif",
      clientName:    "Ahmad Fauzi",
      clientEmail:   "ahmad@startupino.id",
      clientPhone:   "084300003333",
      clientCompany: "Startup Inovatif",
      status:        LeadStatus.APPROACH,
      priority:      LeadPriority.MEDIUM,
      value:         8500000,
      source:        "Cold Call",
      description:   "Belum ada PIC — menunggu assignment dari manager",
      assignedToId:  null,
      createdById:   Admin.id,
    },
    create: {
      title:         "Content Writing Package - Startup Inovatif",
      clientName:    "Ahmad Fauzi",
      clientEmail:   "ahmad@startupino.id",
      clientPhone:   "084300003333",
      clientCompany: "Startup Inovatif",
      status:        LeadStatus.APPROACH,
      priority:      LeadPriority.MEDIUM,
      value:         8500000,
      source:        "Cold Call",
      description:   "Belum ada PIC — menunggu assignment dari manager",
      assignedToId:  null,
      createdById:   Admin.id,
    },
  })
  console.log(`  ✓ Lead (none)    → "${leadUnassigned.title}"`)

  // ────────────────────────────────────────────────────────────
  // 3. ACTIVITIES — 2 aktivitas pada lead milik AE
  // ────────────────────────────────────────────────────────────
  console.log("\n📅 Seeding activities...")

  // Cek apakah aktivitas sudah ada sebelum create
  const existingNote = await prisma.activity.findFirst({
    where: {
      leadId: leadAssignedToAE.id,
      type:   ActivityType.INTERNAL_NOTE,
      userId: accountExecutive.id,
      title:  "Catatan awal — klien butuh revisi harga",
    },
  })

  if (!existingNote) {
    await prisma.activity.create({
      data: {
        type:        ActivityType.INTERNAL_NOTE,
        title:       "Catatan awal — klien butuh revisi harga",
        content:     "Klien PT Digital Maju meminta diskon 15%. Perlu didiskusikan dengan Sales Manager sebelum konfirmasi.",
        isDone:      true,
        leadId:      leadAssignedToAE.id,
        userId:      accountExecutive.id,
        metadata:    {
          important: true,
          tags:      ["negosiasi", "diskon"],
        },
      },
    })
    console.log("  ✓ Activity 1     → INTERNAL_NOTE (AE)")
  } else {
    console.log("  ↻ Activity 1     → sudah ada, skip")
  }

  const existingCall = await prisma.activity.findFirst({
    where: {
      leadId: leadAssignedToAE.id,
      type:   ActivityType.CALL,
      userId: accountExecutive.id,
      title:  "Follow-up call setelah proposal dikirim",
    },
  })

  if (!existingCall) {
    await prisma.activity.create({
      data: {
        type:        ActivityType.CALL,
        title:       "Follow-up call setelah proposal dikirim",
        content:     "Klien sudah membaca proposal. Jadwal meeting online minggu depan untuk demo.",
        description: "Durasi call: 20 menit. Klien antusias.",
        isDone:      false,
        dueDate:     new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 hari ke depan
        leadId:      leadAssignedToAE.id,
        userId:      accountExecutive.id,
        metadata:    {
          duration:  20,
          outcome:   "positive",
          nextStep:  "Demo online",
        },
      },
    })
    console.log("  ✓ Activity 2     → CALL (AE)")
  } else {
    console.log("  ↻ Activity 2     → sudah ada, skip")
  }

  // ────────────────────────────────────────────────────────────
  // 4. SUMMARY
  // ────────────────────────────────────────────────────────────
  const counts = {
    users:      await prisma.user.count(),
    leads:      await prisma.lead.count(),
    activities: await prisma.activity.count(),
  }

  console.log("\n" + "━".repeat(50))
  console.log("✅ Seed selesai!\n")
  console.log("📊 Database summary:")
  console.log(`   Users      : ${counts.users}`)
  console.log(`   Leads      : ${counts.leads}`)
  console.log(`   Activities : ${counts.activities}`)
  console.log("\n🔑 Test credentials:")
  console.log("   ┌─────────────────────────────┬──────────────────┬───────────────────┐")
  console.log("   │ Email                       │ Password         │ Role              │")
  console.log("   ├─────────────────────────────┼──────────────────┼───────────────────┤")
  console.log("   │ admin@cmlabs.co       │ Demo123!        │ ADMIN       │")
  console.log("   │ executive@cmlabs.co         │ Demo123!        │ EXECUTIVE         │")
  console.log("   │ sales_mgr@cmlabs.co         │ Demo123!        │ SALES_MANAGER     │")
  console.log("   │ ae@cmlabs.co                │ Demo123!        │ ACCOUNT_EXECUTIVE │")
  console.log("   └─────────────────────────────┴──────────────────┴───────────────────┘")
}


main()
  .catch((err) => {
    console.error("\n❌ Seed error:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })