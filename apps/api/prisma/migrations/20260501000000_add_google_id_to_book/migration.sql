-- AlterTable
ALTER TABLE "Book" ADD COLUMN "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleId_key" ON "Book"("googleId");
