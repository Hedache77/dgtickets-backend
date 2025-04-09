/*
  Warnings:

  - You are about to drop the column `code` on the `Rating` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Rating_code_key";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "Rating_id_key" ON "Rating"("id");
