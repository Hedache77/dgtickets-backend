-- DropIndex
DROP INDEX "Ticket_code_key";

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
