import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

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

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'TOURIST',
        touristProfile: {
          create: {}, // Creates an empty TouristProfile
        },
      },
    });

    res.status(201).json({
      message: 'Tourist registered successfully. Please log in.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Tourist registration failed:', error);
    res.status(500).json({ error: 'Could not register tourist.' });
  }
};

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