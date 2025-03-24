-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
