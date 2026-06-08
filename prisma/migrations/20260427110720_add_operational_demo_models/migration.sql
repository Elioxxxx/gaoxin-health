-- AlterTable
ALTER TABLE "ResidentProfile" ADD COLUMN "caseKey" TEXT;
ALTER TABLE "ResidentProfile" ADD COLUMN "caseSummary" TEXT;
ALTER TABLE "ResidentProfile" ADD COLUMN "primaryScenario" TEXT;

-- CreateTable
CREATE TABLE "DoctorHealthProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summaryTitle" TEXT NOT NULL,
    "onePageSummary" TEXT NOT NULL,
    "majorProblemsJson" TEXT NOT NULL,
    "currentVisitRelevanceJson" TEXT NOT NULL,
    "riskFocusItemsJson" TEXT NOT NULL,
    "medicationSafetyJson" TEXT NOT NULL,
    "allergyAndContraindicationsJson" TEXT NOT NULL,
    "labTrendHighlightsJson" TEXT NOT NULL,
    "imagingHighlightsJson" TEXT NOT NULL,
    "chronicDiseaseStatusJson" TEXT NOT NULL,
    "lifestyleFactorsJson" TEXT NOT NULL,
    "publicHealthFollowUpJson" TEXT NOT NULL,
    "dataQualityNotesJson" TEXT NOT NULL,
    "sourceRecordsJson" TEXT NOT NULL,
    "doctorChecklistJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DoctorHealthProfile_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskFocusItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorHealthProfileId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidenceJson" TEXT NOT NULL,
    "suggestedDoctorAction" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiskFocusItem_doctorHealthProfileId_fkey" FOREIGN KEY ("doctorHealthProfileId") REFERENCES "DoctorHealthProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserActionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "content" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadataJson" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserActionEvent_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntentInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "intentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "evidenceEventsJson" TEXT NOT NULL,
    "suggestedReceiverType" TEXT NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IntentInsight_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "intentInsightId" TEXT,
    "receiverType" TEXT NOT NULL,
    "receiverInstitutionId" TEXT,
    "receiverDepartmentId" TEXT,
    "leadType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceLead_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "ResidentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceLead_intentInsightId_fkey" FOREIGN KEY ("intentInsightId") REFERENCES "IntentInsight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServiceLead_receiverInstitutionId_fkey" FOREIGN KEY ("receiverInstitutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServiceLead_receiverDepartmentId_fkey" FOREIGN KEY ("receiverDepartmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceLeadId" TEXT NOT NULL,
    "operatorRole" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadFeedback_serviceLeadId_fkey" FOREIGN KEY ("serviceLeadId") REFERENCES "ServiceLead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DoctorHealthProfile_residentId_idx" ON "DoctorHealthProfile"("residentId");

-- CreateIndex
CREATE INDEX "DoctorHealthProfile_generatedAt_idx" ON "DoctorHealthProfile"("generatedAt");

-- CreateIndex
CREATE INDEX "RiskFocusItem_doctorHealthProfileId_idx" ON "RiskFocusItem"("doctorHealthProfileId");

-- CreateIndex
CREATE INDEX "RiskFocusItem_category_idx" ON "RiskFocusItem"("category");

-- CreateIndex
CREATE INDEX "RiskFocusItem_priority_idx" ON "RiskFocusItem"("priority");

-- CreateIndex
CREATE INDEX "UserActionEvent_residentId_occurredAt_idx" ON "UserActionEvent"("residentId", "occurredAt");

-- CreateIndex
CREATE INDEX "UserActionEvent_eventType_idx" ON "UserActionEvent"("eventType");

-- CreateIndex
CREATE INDEX "UserActionEvent_targetType_targetId_idx" ON "UserActionEvent"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "IntentInsight_residentId_idx" ON "IntentInsight"("residentId");

-- CreateIndex
CREATE INDEX "IntentInsight_intentType_idx" ON "IntentInsight"("intentType");

-- CreateIndex
CREATE INDEX "IntentInsight_priority_status_idx" ON "IntentInsight"("priority", "status");

-- CreateIndex
CREATE INDEX "IntentInsight_suggestedReceiverType_idx" ON "IntentInsight"("suggestedReceiverType");

-- CreateIndex
CREATE INDEX "ServiceLead_residentId_idx" ON "ServiceLead"("residentId");

-- CreateIndex
CREATE INDEX "ServiceLead_intentInsightId_idx" ON "ServiceLead"("intentInsightId");

-- CreateIndex
CREATE INDEX "ServiceLead_receiverType_status_idx" ON "ServiceLead"("receiverType", "status");

-- CreateIndex
CREATE INDEX "ServiceLead_receiverInstitutionId_idx" ON "ServiceLead"("receiverInstitutionId");

-- CreateIndex
CREATE INDEX "ServiceLead_receiverDepartmentId_idx" ON "ServiceLead"("receiverDepartmentId");

-- CreateIndex
CREATE INDEX "ServiceLead_leadType_idx" ON "ServiceLead"("leadType");

-- CreateIndex
CREATE INDEX "ServiceLead_priority_idx" ON "ServiceLead"("priority");

-- CreateIndex
CREATE INDEX "LeadFeedback_serviceLeadId_idx" ON "LeadFeedback"("serviceLeadId");

-- CreateIndex
CREATE INDEX "LeadFeedback_feedbackType_idx" ON "LeadFeedback"("feedbackType");

-- CreateIndex
CREATE INDEX "ResidentProfile_caseKey_idx" ON "ResidentProfile"("caseKey");
