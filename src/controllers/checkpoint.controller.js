import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Registers a new checkpoint staff member.
 */
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
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    res.status(500).json({ error: 'Could not register staff.' });
  }
};

/**
 * Handles KYC submission for a tourist by an authenticated checkpoint staff member.
 */
export const submitKycForTourist = async (req, res) => {
  const staffUser = req.user;
  const { touristId } = req.body;
  const documentImage = req.file;

  if (!touristId || !documentImage) {
    return res.status(400).json({ error: 'touristId and a document image are required.' });
  }

  try {
    const touristProfile = await prisma.touristProfile.findUnique({ where: { userId: touristId } });
    if (!touristProfile) {
      return res.status(404).json({ error: 'Tourist profile not found.' });
    }
    if (touristProfile.kycVerificationStatus) {
      return res.status(400).json({ error: 'This tourist has already been verified.' });
    }

    const verifiedDocNumber = `VERIFIED_${Date.now()}`;
    const proofString = `${touristId}-${verifiedDocNumber}-${new Date().toISOString()}`;
    const proofHash = '0x' + crypto.createHash('sha256').update(proofString).digest('hex');
    const mockTxHash = `MOCK_TX_${crypto.randomBytes(16).toString('hex')}`;

    await prisma.touristProfile.update({
      where: { userId: touristId },
      data: {
        kycVerificationStatus: true,
        kycBlockchainHash: mockTxHash,
        verifiedByUserId: staffUser.userId,
        kycDocumentUrl: documentImage.path, // Secure URL from Cloudinary
      },
    });

    res.status(200).json({
      message: `KYC for tourist ${touristId} submitted and verified successfully.`,
      imageUrl: documentImage.path,
      kycBlockchainHash: mockTxHash,
    });

  } catch (error) {
    console.error('KYC submission failed:', error);
    res.status(500).json({ error: 'Failed to complete KYC submission process.' });
  }
};