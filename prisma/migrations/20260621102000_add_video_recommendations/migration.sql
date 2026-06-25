-- CreateTable
CREATE TABLE "VideoTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VideoContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'EXTERNAL_URL',
    "videoUrl" TEXT,
    "uploadPath" TEXT,
    "coverImageUrl" TEXT,
    "durationSeconds" INTEGER NOT NULL,
    "orientation" TEXT NOT NULL DEFAULT 'AUTO',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isHomeRecommended" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishStartAt" DATETIME,
    "publishEndAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "completionCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VideoInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoInteraction_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoInteraction_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoPlaybackEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "progressSeconds" INTEGER,
    "playbackRate" REAL,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoPlaybackEvent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoPlaybackEvent_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewerName" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoComment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoComment_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoRecommendationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "pagePath" TEXT,
    "matchedTags" TEXT NOT NULL DEFAULT '[]',
    "score" REAL NOT NULL DEFAULT 0,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoRecommendationLog_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoRecommendationLog_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_VideoContentTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_VideoContentTags_A_fkey" FOREIGN KEY ("A") REFERENCES "VideoContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_VideoContentTags_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoTag_name_key" ON "VideoTag"("name");

-- CreateIndex
CREATE INDEX "VideoTag_category_idx" ON "VideoTag"("category");

-- CreateIndex
CREATE INDEX "VideoContent_status_isHomeRecommended_idx" ON "VideoContent"("status", "isHomeRecommended");

-- CreateIndex
CREATE INDEX "VideoContent_isPinned_priority_idx" ON "VideoContent"("isPinned", "priority");

-- CreateIndex
CREATE INDEX "VideoContent_publishedAt_idx" ON "VideoContent"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoInteraction_videoId_residentId_type_key" ON "VideoInteraction"("videoId", "residentId", "type");

-- CreateIndex
CREATE INDEX "VideoInteraction_residentId_type_active_idx" ON "VideoInteraction"("residentId", "type", "active");

-- CreateIndex
CREATE INDEX "VideoInteraction_videoId_type_active_idx" ON "VideoInteraction"("videoId", "type", "active");

-- CreateIndex
CREATE INDEX "VideoPlaybackEvent_videoId_eventType_idx" ON "VideoPlaybackEvent"("videoId", "eventType");

-- CreateIndex
CREATE INDEX "VideoPlaybackEvent_residentId_occurredAt_idx" ON "VideoPlaybackEvent"("residentId", "occurredAt");

-- CreateIndex
CREATE INDEX "VideoComment_videoId_status_idx" ON "VideoComment"("videoId", "status");

-- CreateIndex
CREATE INDEX "VideoComment_residentId_createdAt_idx" ON "VideoComment"("residentId", "createdAt");

-- CreateIndex
CREATE INDEX "VideoRecommendationLog_videoId_idx" ON "VideoRecommendationLog"("videoId");

-- CreateIndex
CREATE INDEX "VideoRecommendationLog_residentId_occurredAt_idx" ON "VideoRecommendationLog"("residentId", "occurredAt");

-- CreateIndex
CREATE INDEX "VideoRecommendationLog_eventName_idx" ON "VideoRecommendationLog"("eventName");

-- CreateIndex
CREATE UNIQUE INDEX "_VideoContentTags_AB_unique" ON "_VideoContentTags"("A", "B");

-- CreateIndex
CREATE INDEX "_VideoContentTags_B_index" ON "_VideoContentTags"("B");
