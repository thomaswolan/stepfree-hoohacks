// pages/api/stations.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const overpassUrl = 'https://overpass-api.de/api/interpreter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng || !radius) {
    return res.status(400).json({ error: 'Missing lat, lng, or radius' });
  }

  // Overpass QL query
  const query = `
    [out:json];
    node
      ["railway"="station"]
      ["wheelchair"="yes"]
      (around:${radius}, ${lat}, ${lng});
    out body;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    const data = await response.json();
    res.status(200).json(data.elements); // Just send back the station nodes
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch OSM data', details: err });
  }
}
