/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/transit-route.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { origin, destination } = req.query;

  const apiKey = process.env.GOOGLE_MAPS_KEY;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=transit&transit_mode=subway&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err: any) {
    console.error('Google Directions API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
