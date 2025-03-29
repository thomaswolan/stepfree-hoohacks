"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getWheelchairRoute } from '@/lib/getWheelchairRoute';
import { fetchWheelmapData } from '@/lib/fetchWheelmapData';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function RouteMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const localCoords = useRef<[number, number][]>([]);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [routeDrawn, setRouteDrawn] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-77.0369, 38.9072],
      zoom: 12,
    });

    const currentMap = map.current;

    currentMap.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      localCoords.current.push([lng, lat]);

      if (localCoords.current.length === 2) {
        const [start, end] = localCoords.current;

        const routeData = await getWheelchairRoute(start, end);
        console.log("Route data:", routeData);

        if (!routeData.features || routeData.features.length === 0) {
          console.error("No route found or invalid data:", routeData);
          localCoords.current = [];
          return;
        }

        const routeCoordinates = routeData.features[0].geometry.coordinates;

        if (currentMap.getLayer('route')) currentMap.removeLayer('route');
        if (currentMap.getSource('route')) currentMap.removeSource('route');

        currentMap.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          },
        });

        currentMap.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#007bff',
            'line-width': 5,
          },
        });

        if (routeCoordinates.length > 0) {
          const lngs = routeCoordinates.map((coord: [number, number]) => coord[0]);
          const lats = routeCoordinates.map((coord: [number, number]) => coord[1]);
          
          const bbox = `${Math.min(...lngs)},${Math.min(...lats)},${Math.max(...lngs)},${Math.max(...lats)}`;

          const accessibilityPoints = await fetchWheelmapData(bbox);

          markers.current.forEach((m) => m.remove());
          markers.current = [];

          accessibilityPoints.forEach((point: any) => {
            const marker = new mapboxgl.Marker({
              color: point.wheelchair === 'yes' ? 'green' : 'red',
            })
              .setLngLat([point.lon, point.lat])
              .setPopup(new mapboxgl.Popup().setText(point.name))
              .addTo(currentMap);

            markers.current.push(marker);
          });
        }

        setRouteDrawn(true);
        localCoords.current = [];
      }
    });
  }, []);

  const handleClearRoute = () => {
    if (!map.current) return;

    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');

    markers.current.forEach((m) => m.remove());
    markers.current = [];

    localCoords.current = [];
    setRouteDrawn(false);
  };

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}
