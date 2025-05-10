/*
  Warnings:

  - You are about to drop the column `code` on the `PQR` table. All the data in the column will be lost.
  - Added the required column `answerByUser` to the `PQR` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PQRStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "PQR" DROP COLUMN "code",
ADD COLUMN     "answer" TEXT,
ADD COLUMN     "answerByUser" INTEGER NOT NULL,
ADD COLUMN     "pqrType" "PQRStatus" NOT NULL DEFAULT 'PENDING';
