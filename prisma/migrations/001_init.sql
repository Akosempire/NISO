-- prisma/migrations/001_init.sql
-- Initial NISO database schema

-- ROLES
CREATE TABLE "Role" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "permissions" JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX "Role_name_idx" ON "Role"("name");

-- REGIONS
CREATE TABLE "Region" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "code" TEXT NOT NULL UNIQUE,
  "headquartersId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Region_headquartersId_idx" ON "Region"("headquartersId");

-- USERS
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "fullName" TEXT,
  "phoneNumber" TEXT,
  "roleId" TEXT NOT NULL,
  "regionId" TEXT,
  "stationId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastLogin" TIMESTAMP(3),
  CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "User_roleId_idx" ON "User"("roleId");
CREATE INDEX "User_regionId_idx" ON "User"("regionId");
CREATE INDEX "User_email_idx" ON "User"("email");

-- STATIONS
CREATE TABLE "Station" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "regionId" TEXT NOT NULL,
  "location" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Station_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE("name", "regionId")
);

CREATE INDEX "Station_regionId_idx" ON "Station"("regionId");

-- Add stationId to User (after Station table created)
ALTER TABLE "User" ADD CONSTRAINT "User_stationId_fkey" 
FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_stationId_idx" ON "User"("stationId");

-- TEMPLATES
CREATE TABLE "Template" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "stationId" TEXT NOT NULL,
  "fields" JSONB NOT NULL DEFAULT '[]',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3),
  CONSTRAINT "Template_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE("name", "stationId")
);

CREATE INDEX "Template_stationId_idx" ON "Template"("stationId");

-- EQUIPMENT
CREATE TABLE "Equipment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "stationId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "templateId" TEXT,
  "scadaTag" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Equipment_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Equipment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE("name", "stationId")
);

CREATE INDEX "Equipment_stationId_idx" ON "Equipment"("stationId");
CREATE INDEX "Equipment_templateId_idx" ON "Equipment"("templateId");

-- FORMULAS
CREATE TABLE "Formula" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "expression" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "activatedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Formula_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Formula_templateId_isActive_idx" ON "Formula"("templateId", "isActive");
CREATE INDEX "Formula_activatedAt_idx" ON "Formula"("activatedAt");

-- READINGS (CORE DATA)
CREATE TABLE "Reading" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "equipmentId" TEXT NOT NULL,
  "stationId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "hour" INTEGER NOT NULL,
  "rawInput" TEXT,
  "numericValue" NUMERIC(10,2),
  "codeReference" TEXT,
  "valueType" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP(3),
  "sealedAt" TIMESTAMP(3),
  "formulaId" TEXT,
  CONSTRAINT "Reading_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Reading_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Reading_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Reading_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE("equipmentId", "date", "hour")
);

CREATE INDEX "Reading_equipmentId_date_idx" ON "Reading"("equipmentId", "date");
CREATE INDEX "Reading_stationId_date_idx" ON "Reading"("stationId", "date");
CREATE INDEX "Reading_createdById_idx" ON "Reading"("createdById");
CREATE INDEX "Reading_sealedAt_idx" ON "Reading"("sealedAt");

-- SLA_ENTRIES
CREATE TABLE "SLAEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "stationId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "hour" INTEGER NOT NULL,
  "forecastMw" NUMERIC(10,2) NOT NULL,
  "meterReadingKwh" NUMERIC(15,2),
  "actualMw" NUMERIC(10,2),
  "differenceMw" NUMERIC(10,2),
  "remarks" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "sealedAt" TIMESTAMP(3),
  CONSTRAINT "SLAEntry_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SLAEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE("stationId", "date", "hour")
);

CREATE INDEX "SLAEntry_stationId_date_idx" ON "SLAEntry"("stationId", "date");
CREATE INDEX "SLAEntry_approvedAt_idx" ON "SLAEntry"("approvedAt");

-- INTERRUPTIONS
CREATE TABLE "Interruption" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "equipmentId" TEXT NOT NULL,
  "tripTime" TIMESTAMP(3) NOT NULL,
  "restorationTime" TIMESTAMP(3),
  "causeCode" TEXT NOT NULL,
  "durationSeconds" INTEGER,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "Interruption_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Interruption_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Interruption_equipmentId_tripTime_idx" ON "Interruption"("equipmentId", "tripTime");
CREATE INDEX "Interruption_status_idx" ON "Interruption"("status");
CREATE INDEX "Interruption_createdAt_idx" ON "Interruption"("createdAt");

-- INSPECTIONS
CREATE TABLE "Inspection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "equipmentId" TEXT NOT NULL,
  "inspectionDate" TIMESTAMP(3) NOT NULL,
  "typeId" TEXT NOT NULL,
  "inspectorId" TEXT NOT NULL,
  "findings" JSONB,
  "photos" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  CONSTRAINT "Inspection_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Inspection_equipmentId_inspectionDate_idx" ON "Inspection"("equipmentId", "inspectionDate");
CREATE INDEX "Inspection_inspectorId_idx" ON "Inspection"("inspectorId");
CREATE INDEX "Inspection_approvedAt_idx" ON "Inspection"("approvedAt");

-- REPORTS
CREATE TABLE "Report" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "generatedById" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dateRangeStart" TIMESTAMP(3) NOT NULL,
  "dateRangeEnd" TIMESTAMP(3) NOT NULL,
  "filters" JSONB,
  "dataUrl" TEXT,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Report_generatedAt_idx" ON "Report"("generatedAt");
CREATE INDEX "Report_expiresAt_idx" ON "Report"("expiresAt");

-- AUDIT_LOGS
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "stationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "AuditLog_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");
CREATE INDEX "AuditLog_stationId_createdAt_idx" ON "AuditLog"("stationId", "createdAt");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- SHARING_GRANTS
CREATE TABLE "SharingGrant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "grantorId" TEXT NOT NULL,
  "granteeId" TEXT,
  "granteeEmail" TEXT,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "scope" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "SharingGrant_grantorId_fkey" FOREIGN KEY ("grantorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SharingGrant_granteeId_fkey" FOREIGN KEY ("granteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "SharingGrant_granteeId_createdAt_idx" ON "SharingGrant"("granteeId", "createdAt");
CREATE INDEX "SharingGrant_grantorId_createdAt_idx" ON "SharingGrant"("grantorId", "createdAt");

-- PARAMETERS
CREATE TABLE "Parameter" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "unit" TEXT,
  "type" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Parameter_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Parameter_equipmentId_idx" ON "Parameter"("equipmentId");
