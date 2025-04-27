/*
  Warnings:

  - You are about to drop the column `code` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `orderDate` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `serviceData` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "code",
DROP COLUMN "orderDate",
DROP COLUMN "serviceData",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ALTER COLUMN "priority" DROP DEFAULT;

-- CreateTable
CREATE TABLE "TicketStatusHistory" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "oldStatus" "TicketStatus" NOT NULL,
    "newStatus" "TicketStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TicketStatusHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicketStatusHistory" ADD CONSTRAINT "TicketStatusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketStatusHistory" ADD CONSTRAINT "TicketStatusHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
