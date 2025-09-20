import prisma from '../config/prisma.js';

/**
 * Receives a GPS location update from a tourist's app and checks for geofence breaches.
 */
export const updateLocation = async (req, res) => {
  const { userId } = req.user;
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const wktPoint = `POINT(${longitude} ${latitude})`;

    // Use a Prisma raw query to leverage PostGIS's ST_Contains function.
    // This finds all geofences that contain the tourist's current location.
    const containingGeofences = await prisma.$queryRaw`
      SELECT id, name, "riskScore", "jurisdictionId"
      FROM "Geofence"
      WHERE ST_Contains(area, ST_SetSRID(ST_GeomFromText(${wktPoint}), 4326));
    `;

    // If the tourist is in a risky area, create an incident.
    if (containingGeofences.length > 0) {
      const touristProfile = await prisma.touristProfile.findUnique({ where: { userId } });

      for (const geofence of containingGeofences) {
        // Here you could add logic to prevent spamming incidents for the same geofence entry.
        // For now, we'll create one for each entry into a high-risk zone.
        if (geofence.riskScore >= 7.0) { // Example risk threshold
            await prisma.incident.create({
                data: {
                  touristProfileId: touristProfile.id,
                  location: { raw: `ST_GeomFromText('${wktPoint}', 4326)` },
                  timestamp: new Date(),
                  anomalyType: 'GEOFENCE_ENTRY',
                  details: {
                    message: `Tourist entered high-risk zone: ${geofence.name}`,
                    geofenceId: geofence.id,
                  },
                  jurisdictionId: geofence.jurisdictionId,
                },
            });
        }
      }
    }

    res.status(200).json({ message: 'Location updated successfully.' });
  } catch (error) {
    console.error('Location update failed:', error);
    res.status(500).json({ error: 'Failed to process location update.' });
  }
};

/**
 * Creates a high-priority incident when a tourist presses the panic button.
 */
export const triggerPanic = async (req, res) => {
    const { userId } = req.user;
    const { latitude, longitude, message } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Latitude and longitude are required for a panic alert.' });
    }

    try {
        const wktPoint = `POINT(${longitude} ${latitude})`;
        const touristProfile = await prisma.touristProfile.findUnique({ where: { userId } });

        // Find which jurisdiction the panic signal originated from.
        const jurisdictionResult = await prisma.$queryRaw`
            SELECT id FROM "Jurisdiction"
            WHERE ST_Contains(boundary, ST_SetSRID(ST_GeomFromText(${wktPoint}), 4326))
            LIMIT 1;
        `;

        if (!jurisdictionResult || jurisdictionResult.length === 0) {
            return res.status(400).json({ error: 'Could not determine jurisdiction for this location.' });
        }

        await prisma.incident.create({
            data: {
                touristProfileId: touristProfile.id,
                location: { raw: `ST_GeomFromText('${wktPoint}', 4326)` },
                timestamp: new Date(),
                anomalyType: 'PANIC_BUTTON',
                status: 'REPORTED', // The initial status for all new incidents
                details: { message: message || 'Panic button activated by tourist!' },
                jurisdictionId: jurisdictionResult[0].id,
            }
        });

        res.status(201).json({ message: 'Panic signal received. Authorities have been notified.' });
    } catch (error) {
        console.error('Panic trigger failed:', error);
        res.status(500).json({ error: 'Failed to process panic signal.' });
    }
};

