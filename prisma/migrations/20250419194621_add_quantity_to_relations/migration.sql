/*
  Warnings:

  - You are about to drop the `_HeadquarterToMedicine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TicketMedicine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_HeadquarterToMedicine" DROP CONSTRAINT "_HeadquarterToMedicine_A_fkey";

-- DropForeignKey
ALTER TABLE "_HeadquarterToMedicine" DROP CONSTRAINT "_HeadquarterToMedicine_B_fkey";

-- DropForeignKey
ALTER TABLE "_TicketMedicine" DROP CONSTRAINT "_TicketMedicine_A_fkey";

-- DropForeignKey
ALTER TABLE "_TicketMedicine" DROP CONSTRAINT "_TicketMedicine_B_fkey";

-- DropTable
DROP TABLE "_HeadquarterToMedicine";

-- DropTable
DROP TABLE "_TicketMedicine";

-- CreateTable
CREATE TABLE "HeadquarterToMedicine" (
    "id" SERIAL NOT NULL,
    "headquarterId" INTEGER NOT NULL,
    "medicineId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "HeadquarterToMedicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMedicine" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "medicineId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TicketMedicine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeadquarterToMedicine_headquarterId_medicineId_key" ON "HeadquarterToMedicine"("headquarterId", "medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketMedicine_ticketId_medicineId_key" ON "TicketMedicine"("ticketId", "medicineId");

-- AddForeignKey
ALTER TABLE "HeadquarterToMedicine" ADD CONSTRAINT "HeadquarterToMedicine_headquarterId_fkey" FOREIGN KEY ("headquarterId") REFERENCES "Headquarter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeadquarterToMedicine" ADD CONSTRAINT "HeadquarterToMedicine_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine_Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMedicine" ADD CONSTRAINT "TicketMedicine_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMedicine" ADD CONSTRAINT "TicketMedicine_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine_Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
