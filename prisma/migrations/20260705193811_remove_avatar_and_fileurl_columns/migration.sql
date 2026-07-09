/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "documents" DROP COLUMN "fileUrl";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar";
