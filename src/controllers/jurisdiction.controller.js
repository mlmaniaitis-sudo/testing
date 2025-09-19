import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

export const createJurisdictionAndUser = async (req, res) => {
  const { jurisdictionName, userEmail, userPassword, boundary } = req.body;

  if (!jurisdictionName || !userEmail || !userPassword || !boundary) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userPassword, salt);

    const { newJurisdiction, newUser } = await prisma.$transaction(async (tx) => {
      const newJurisdiction = await tx.jurisdiction.create({
        data: {
          name: jurisdictionName,
          boundary: {
            raw: `ST_GeomFromText('${boundary}', 4326)`,
          },
        },
      });

      const newUser = await tx.user.create({
        data: {
          email: userEmail,
          passwordHash: passwordHash,
          role: 'POLICE',
          jurisdictionId: newJurisdiction.id,
        },
      });

      return { newJurisdiction, newUser };
    });

    res.status(201).json({
      message: 'Jurisdiction and police user created successfully.',
      jurisdictionId: newJurisdiction.id,
      userId: newUser.id,
    });
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    console.error('Failed to create jurisdiction:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
