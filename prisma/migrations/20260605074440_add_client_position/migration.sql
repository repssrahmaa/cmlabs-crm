/*
  Warnings:

  - You are about to drop the `emails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "emails" DROP CONSTRAINT "emails_activityId_fkey";

-- DropForeignKey
ALTER TABLE "mails" DROP CONSTRAINT "mails_leadId_fkey";

-- DropForeignKey
ALTER TABLE "mails" DROP CONSTRAINT "mails_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "mails" DROP CONSTRAINT "mails_senderId_fkey";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "clientPosition" TEXT;

-- DropTable
DROP TABLE "emails";

-- DropTable
DROP TABLE "mails";

-- DropEnum
DROP TYPE "EmailStatus";

-- DropEnum
DROP TYPE "MailStatus";
