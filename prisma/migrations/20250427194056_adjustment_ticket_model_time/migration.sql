/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "completedAt",
DROP COLUMN "startedAt",
ADD COLUMN     "pendingTimeInSeconds" INTEGER,
ADD COLUMN     "processingTimeInSeconds" INTEGER;
