-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN     "adminReadAt" TIMESTAMP(3),
ADD COLUMN     "visitorReadAt" TIMESTAMP(3);
