import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import qrcode from 'qrcode';

/**
 * Handles the initial registration of a tourist user.
 */
export const registerTourist = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'TOURIST',
        touristProfile: {
          create: {}, // Creates an empty TouristProfile
        },
      },
    });

    res.status(201).json({ message: 'Tourist registered successfully. Please log in.' });
  } catch (error) {
    console.error('Tourist registration failed:', error);
    res.status(500).json({ error: 'Could not register tourist.' });
  }
};

/**
 * Fetches the profile for the currently logged-in tourist.
 */
export const getMyProfile = async (req, res) => {
  const { userId } = req.user;
  try {
    const profile = await prisma.touristProfile.findUnique({
      where: { userId },
      include: { emergencyContacts: true, trips: true },
    });
    if (!profile) {
      return res.status(404).json({ error: 'Tourist profile not found.' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve profile.' });
  }
};

/**
 * Updates the basic information for the logged-in tourist.
 */
export const updateMyProfile = async (req, res) => {
  const { userId } = req.user;
  const { fullName, phoneNumber } = req.body;
  try {
    const updatedProfile = await prisma.touristProfile.update({
      where: { userId },
      data: { fullName, phoneNumber },
    });
    res.status(200).json({ message: 'Profile updated successfully.', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: 'Could not update profile.' });
  }
};

/**
 * Adds an emergency contact for the logged-in tourist.
 */
export const addEmergencyContact = async (req, res) => {
    const { userId } = req.user;
    const { name, phoneNumber, relationship } = req.body;

    if (!name || !phoneNumber || !relationship) {
        return res.status(400).json({ error: 'Name, phoneNumber, and relationship are required.' });
    }

    try {
        const profile = await prisma.touristProfile.findUnique({ where: { userId }, select: { id: true } });
        if (!profile) {
            return res.status(404).json({ error: 'Tourist profile not found.' });
        }

        const newContact = await prisma.emergencyContact.create({
            data: {
                name,
                phoneNumber,
                relationship,
                touristProfileId: profile.id,
            }
        });

        res.status(201).json({ message: 'Emergency contact added.', contact: newContact });
    } catch (error) {
        console.error('Failed to add emergency contact:', error);
        res.status(500).json({ error: 'Could not add emergency contact.' });
    }
};

/**
 * Creates a new trip for the logged-in tourist.
 */
export const createTrip = async (req, res) => {
    const { userId } = req.user;
    const { itineraryDetails, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required.' });
    }

    try {
        const profile = await prisma.touristProfile.findUnique({ where: { userId }, select: { id: true } });
        if (!profile) {
            return res.status(404).json({ error: 'Tourist profile not found.' });
        }

        const newTrip = await prisma.trip.create({
            data: {
                itineraryDetails,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                touristProfileId: profile.id,
            }
        });

        res.status(201).json({ message: 'Trip created successfully.', trip: newTrip });
    } catch (error) {
        console.error('Failed to create trip:', error);
        res.status(500).json({ error: 'Could not create trip.' });
    }
};

/**
 * Generates or retrieves the Digital ID QR Code for the logged-in tourist.
 */
export const getDigitalId = async (req, res) => {
  const { userId } = req.user;
  try {
    const profile = await prisma.touristProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Tourist profile not found.' });
    }

    if (profile.digitalIdQrCode) {
      return res.status(200).json({ qrCodeUrl: profile.digitalIdQrCode });
    }

    const qrCodeData = JSON.stringify({
      userId: profile.userId,
      fullName: profile.fullName || 'N/A',
      verified: profile.kycVerificationStatus,
    });

    const qrCodeUrl = await qrcode.toDataURL(qrCodeData);

    await prisma.touristProfile.update({
      where: { userId },
      data: { digitalIdQrCode: qrCodeUrl },
    });

    res.status(200).json({ qrCodeUrl: qrCodeUrl });
  } catch (error) {
    console.error('Failed to generate Digital ID:', error);
    res.status(500).json({ error: 'Could not generate Digital ID.' });
  }
};

