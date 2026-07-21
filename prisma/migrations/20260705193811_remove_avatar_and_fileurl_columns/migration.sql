/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `documents` table.
  - You are about to drop the column `avatar` on the `users` table.

*/

ALTER TABLE "documents"
DROP COLUMN IF EXISTS "fileUrl";

ALTER TABLE "users"
DROP COLUMN IF EXISTS "avatar";