-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "reactions" JSONB NOT NULL DEFAULT '[]';
