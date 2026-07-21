-- Migration: update_role_enum
-- Safely maps existing roles to new roles without losing data

-- ── Step 1: Add temporary column ──────────────────────────────
ALTER TABLE "users" ADD COLUMN "role_new" TEXT;

-- ── Step 2: Map existing data to new roles ─────────────────────
UPDATE "users" SET "role_new" = 'ADMIN'       WHERE "role"::TEXT = 'ADMIN';
UPDATE "users" SET "role_new" = 'SALES_MANAGER'     WHERE "role"::TEXT = 'MANAGER';
UPDATE "users" SET "role_new" = 'ACCOUNT_EXECUTIVE' WHERE "role"::TEXT = 'SALES';
UPDATE "users" SET "role_new" = 'ACCOUNT_EXECUTIVE' WHERE "role"::TEXT = 'MARKETING';

-- Fallback: kalau ada role yang tidak terpetakan
UPDATE "users" SET "role_new" = 'ACCOUNT_EXECUTIVE' WHERE "role_new" IS NULL;

-- ── Step 3: Drop old enum dependency ──────────────────────────
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;

-- ── Step 4: Drop old enum ──────────────────────────────────────
DROP TYPE IF EXISTS "Role";

-- ── Step 5: Create new enum ────────────────────────────────────
CREATE TYPE "Role" AS ENUM (
  'ADMIN',
  'EXECUTIVE',
  'SALES_MANAGER',
  'ACCOUNT_EXECUTIVE'
);

-- ── Step 6: Copy data from temp column ke role column ──────────
UPDATE "users" SET "role" = "role_new";

-- ── Step 7: Convert column back to enum type ──────────────────
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "Role"
  USING "role"::"Role";

-- ── Step 8: Restore default value dengan enum baru ────────────
ALTER TABLE "users"
  ALTER COLUMN "role" SET DEFAULT 'ACCOUNT_EXECUTIVE'::"Role";

-- ── Step 9: Drop temporary column ─────────────────────────────
ALTER TABLE "users" DROP COLUMN "role_new";

-- ── Step 10: Add NOT NULL constraint ──────────────────────────
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;