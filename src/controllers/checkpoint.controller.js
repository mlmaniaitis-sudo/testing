import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'tourist-kyc-documents' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export const registerStaff = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, passwordHash, role: 'CHECKPOINT_STAFF' },
    });
    res.status(201).json({ message: 'Checkpoint staff registered.', userId: newUser.id });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Email already in use.' });
    res.status(500).json({ error: 'Could not register staff.' });
  }
};

export const submitKycForTourist = async (req, res) => {
  const staffUser = req.user;
  const { touristId } = req.body;
  const documentFile = req.file;

  if (!touristId || !documentFile) {
    return res.status(400).json({ error: 'touristId and a document image are required.' });
  }

  try {
    const touristProfile = await prisma.touristProfile.findUnique({ where: { userId: touristId } });
    if (!touristProfile) return res.status(404).json({ error: 'Tourist profile not found.' });
    if (touristProfile.kycVerificationStatus) return res.status(400).json({ error: 'This tourist has already been verified.' });

    const uploadResult = await uploadToCloudinary(documentFile.buffer);
    const mockTxHash = `MOCK_TX_${crypto.randomBytes(16).toString('hex')}`;

    await prisma.touristProfile.update({
      where: { userId: touristId },
      data: {
        kycVerificationStatus: true,
        kycBlockchainHash: mockTxHash,
        verifiedByUserId: staffUser.userId,
        kycDocumentUrl: uploadResult.secure_url,
      },
    });

    res.status(200).json({
      message: `KYC for tourist ${touristId} submitted successfully.`,
      imageUrl: uploadResult.secure_url,
      kycBlockchainHash: mockTxHash,
    });
  } catch (error) {
    console.error('KYC submission failed:', error);
    res.status(500).json({ error: 'Failed to complete KYC submission.' });
  }
};