import prisma from '../config/prisma.js';

export const createGeofence = async (req, res) => {
  const { jurisdictionId } = req.user;
  const { name, area, riskScore, description } = req.body;

  if (!name || !area || riskScore == null) {
    return res.status(400).json({ error: 'Missing required fields: name, area, riskScore.' });
  }

  if (!jurisdictionId) {
    return res.status(403).json({ error: 'User is not assigned to a jurisdiction.' });
  }

  try {
    const newGeofence = await prisma.geofence.create({
      data: {
        name,
        area: {
          raw: `ST_GeomFromText('${area}', 4326)`,
        },
        riskScore,
        description,
        jurisdictionId: jurisdictionId, // Associate with the officer's jurisdiction
      },
    });

    res.status(201).json({
      message: 'Geofence created successfully.',
      geofence: newGeofence,
    });
  } catch (error) {
    console.error('Failed to create geofence:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
