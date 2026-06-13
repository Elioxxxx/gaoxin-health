-- CreateTable
CREATE TABLE "AiInvocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "schemaName" TEXT,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "inputPreviewJson" TEXT NOT NULL,
    "outputPreviewJson" TEXT,
    "errorMessage" TEXT,
    "promptVersion" TEXT,
    "tokenUsageJson" TEXT,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiInvocation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PreConsultSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT,
    "traceId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "purpose" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "result" TEXT NOT NULL,
    "metadataJson" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AiInvocation_sessionId_idx" ON "AiInvocation"("sessionId");

-- CreateIndex
CREATE INDEX "AiInvocation_provider_model_idx" ON "AiInvocation"("provider", "model");

-- CreateIndex
CREATE INDEX "AiInvocation_task_idx" ON "AiInvocation"("task");

-- CreateIndex
CREATE INDEX "AiInvocation_status_idx" ON "AiInvocation"("status");

-- CreateIndex
CREATE INDEX "AiInvocation_createdAt_idx" ON "AiInvocation"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_traceId_idx" ON "AuditLog"("traceId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_actorRole_idx" ON "AuditLog"("actorRole");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
