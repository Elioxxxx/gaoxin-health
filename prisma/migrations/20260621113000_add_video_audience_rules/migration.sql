-- AlterTable
ALTER TABLE "VideoContent" ADD COLUMN "audienceTags" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "VideoContent" ADD COLUMN "audienceMatchMode" TEXT NOT NULL DEFAULT 'NONE';
