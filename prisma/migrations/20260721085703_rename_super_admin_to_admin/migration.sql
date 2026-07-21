-- Rename enum lama
ALTER TYPE "Role" RENAME TO "Role_old";

-- Buat enum baru
CREATE TYPE "Role" AS ENUM (
    'ADMIN',
    'EXECUTIVE',
    'SALES_MANAGER',
    'ACCOUNT_EXECUTIVE'
);

-- Hapus default lama
ALTER TABLE "users"
ALTER COLUMN "role" DROP DEFAULT;

-- Konversi data
ALTER TABLE "users"
ALTER COLUMN "role"
TYPE "Role"
USING (
    CASE
        WHEN role::text = 'ADMIN' THEN 'ADMIN'
        WHEN role::text = 'VIEWER' THEN 'ACCOUNT_EXECUTIVE'
        ELSE role::text
    END
)::"Role";

-- Pasang default baru
ALTER TABLE "users"
ALTER COLUMN "role"
SET DEFAULT 'ACCOUNT_EXECUTIVE';

-- Hapus enum lama
DROP TYPE "Role_old";