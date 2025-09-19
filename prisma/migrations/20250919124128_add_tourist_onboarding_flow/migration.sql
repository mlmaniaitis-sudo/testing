-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'CHECKPOINT_STAFF';

-- AlterTable
ALTER TABLE "public"."TouristProfile" ADD COLUMN     "kycDocumentUrl" TEXT,
ADD COLUMN     "verifiedByUserId" TEXT,
ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "kycDocumentType" DROP NOT NULL,
ALTER COLUMN "kycDocumentIdHash" DROP NOT NULL,
ALTER COLUMN "digitalIdQrCode" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL;
