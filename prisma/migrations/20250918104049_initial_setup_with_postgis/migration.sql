-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('TOURIST', 'POLICE', 'CENTRAL_AUTHORITY');

-- CreateEnum
CREATE TYPE "public"."IncidentStatus" AS ENUM ('REPORTED', 'INVESTIGATING', 'CONFIRMED', 'DISMISSED', 'RESOLVED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jurisdictionId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Jurisdiction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boundary" geometry(Polygon, 4326) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Jurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TouristProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "kycDocumentType" TEXT NOT NULL,
    "kycDocumentIdHash" TEXT NOT NULL,
    "kycVerificationStatus" BOOLEAN NOT NULL DEFAULT false,
    "kycBlockchainHash" TEXT,
    "digitalIdQrCode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TouristProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmergencyContact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "touristProfileId" TEXT NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trip" (
    "id" TEXT NOT NULL,
    "touristProfileId" TEXT NOT NULL,
    "itineraryDetails" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Geofence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" geometry(Polygon, 4326) NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "jurisdictionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Geofence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Incident" (
    "id" TEXT NOT NULL,
    "touristProfileId" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "anomalyType" TEXT NOT NULL,
    "status" "public"."IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "details" JSONB NOT NULL,
    "evidenceBlockchainHash" TEXT,
    "jurisdictionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HeatmapData" (
    "id" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "safetyScore" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeatmapData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TouristProfile_userId_key" ON "public"."TouristProfile"("userId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "public"."Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Jurisdiction" ADD CONSTRAINT "Jurisdiction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Jurisdiction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."TouristProfile" ADD CONSTRAINT "TouristProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmergencyContact" ADD CONSTRAINT "EmergencyContact_touristProfileId_fkey" FOREIGN KEY ("touristProfileId") REFERENCES "public"."TouristProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trip" ADD CONSTRAINT "Trip_touristProfileId_fkey" FOREIGN KEY ("touristProfileId") REFERENCES "public"."TouristProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Geofence" ADD CONSTRAINT "Geofence_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "public"."Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_touristProfileId_fkey" FOREIGN KEY ("touristProfileId") REFERENCES "public"."TouristProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "public"."Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
