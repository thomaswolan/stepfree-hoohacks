'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Station = {
  name: string;
  wheelchair: 'yes' | 'no' | 'limited' | string;
  lat: number;
  lon: number;
};

export default function AccessibleStationsMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.9776, 40.6845], // Brooklyn center
      zoom: 13,
    });

    const fetchStations = async () => {
      const query = `
        [out:json][timeout:25];
        area["name"="Brooklyn"]["boundary"="administrative"]->.searchArea;
        node
          ["railway"="station"]
          ["station"="subway"]
          ["wheelchair"]
          (area.searchArea);
        out body;
      `;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      const data = await res.json();
      const stations: Station[] = data.elements
        .filter((el: any) => el.tags?.name)
        .map((el: any) => ({
          name: el.tags.name,
          wheelchair: el.tags.wheelchair,
          lat: el.lat,
          lon: el.lon,
        }));

      console.log('Stations loaded:', stations);

      stations.forEach((station) => {
        const el = document.createElement('div');
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor =
          station.wheelchair === 'yes'
            ? 'green'
            : station.wheelchair === 'no'
            ? 'red'
            : 'orange';
        el.style.border = '2px solid white';

        new mapboxgl.Marker(el)
          .setLngLat([station.lon, station.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>${station.name}</strong><br/>Wheelchair: ${station.wheelchair}`
            )
          )
          .addTo(map.current!);
      });
    };

    map.current.on('load', fetchStations);
  }, []);

  return <div ref={mapContainer} className="w-full h-screen" />;
}
