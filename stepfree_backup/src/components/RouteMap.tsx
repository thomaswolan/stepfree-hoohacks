// lib/getWheelchairRoute.ts (replaced with Mapbox walking route)
'use client';
export async function getRouteViaMapbox(
  start: [number, number],
  end: [number, number]
) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${accessToken}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || !data.routes || data.routes.length === 0) {
    throw new Error(`Mapbox route fetch failed: ${res.status}`);
  }

  return data.routes[0].geometry; // GeoJSON LineString
}


import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getWheelchairRoute } from '@/lib/getWheelchairRoute';
import { fetchWheelmapData } from '@/lib/fetchWheelmapData';
import Navbar from '@/components/navbar';
import SearchBar from '@/components/SearchBar';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function RouteMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const localCoords = useRef<{ start?: [number, number]; end?: [number, number] }>({});
  const routeMarkers = useRef<{ start?: mapboxgl.Marker; end?: mapboxgl.Marker }>({});
  const wheelmapMarkers = useRef<mapboxgl.Marker[]>([]);
  const [routeDrawn, setRouteDrawn] = useState(false);
  const [clickMode, setClickMode] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-77.0369, 38.9072],
      zoom: 12,
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      if (localCoords.current.start && localCoords.current.end) {
        cleanupRoute();
        localCoords.current = { start: [lng, lat] };
        const marker = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        routeMarkers.current.start = marker;
        setClickMode('end');
        return;
      }

      if (!localCoords.current.start) {
        localCoords.current.start = [lng, lat];
        const marker = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        routeMarkers.current.start = marker;
        setClickMode('end');
      } else if (!localCoords.current.end) {
        localCoords.current.end = [lng, lat];
        const marker = new mapboxgl.Marker({ color: 'orange' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        routeMarkers.current.end = marker;
        tryDrawRoute(localCoords.current.start, localCoords.current.end);
        setClickMode('start');
      }
    });
  }, []);

  const setPointFromCoords = (coords: [number, number], role: 'start' | 'end') => {
    if (!map.current) return;

    if (routeMarkers.current[role]) routeMarkers.current[role]!.remove();

    const marker = new mapboxgl.Marker({ color: role === 'start' ? 'blue' : 'orange' })
      .setLngLat(coords)
      .addTo(map.current);

    routeMarkers.current[role] = marker;
    localCoords.current[role] = coords;

    if (localCoords.current.start && localCoords.current.end) {
      tryDrawRoute(localCoords.current.start, localCoords.current.end);
    }
  };

  const handleSearchSubmit = async (values: { start?: string; end?: string }) => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const coords: { start?: [number, number]; end?: [number, number] } = {};

    for (const role of ['start', 'end'] as const) {
      const query = values[role];
      if (query) {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}`
        );
        const data = await res.json();
        const first = data.features?.[0];
        if (first) {
          coords[role] = first.center as [number, number];
        } else {
          alert(`Could not find ${role} location.`);
          return;
        }
      }
    }

    cleanupRoute();

    if (coords.start) setPointFromCoords(coords.start, 'start');
    if (coords.end) setPointFromCoords(coords.end, 'end');

    if (coords.start && !coords.end) map.current?.flyTo({ center: coords.start, zoom: 14 });
    if (coords.end && !coords.start) map.current?.flyTo({ center: coords.end, zoom: 14 });
  };

  const tryDrawRoute = async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    const geometry = await getRouteViaMapbox(start, end);
    const routeCoordinates: [number, number][] = geometry.coordinates;

    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');

    map.current.addSource('route', {
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

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#007bff',
        'line-width': 5,
      },
    });

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(start);
    bounds.extend(end);
    map.current.fitBounds(bounds, { padding: 100 });

    wheelmapMarkers.current.forEach((m) => m.remove());
    wheelmapMarkers.current = [];

    const lngs = routeCoordinates.map((coord: [number, number]) => coord[0]);
    const lats = routeCoordinates.map((coord: [number, number]) => coord[1]);
    const bbox = `${Math.min(...lngs)},${Math.min(...lats)},${Math.max(...lngs)},${Math.max(...lats)}`;
    const points = await fetchWheelmapData(bbox);

    points.forEach((point: any) => {
      const marker = new mapboxgl.Marker({
        color: point.wheelchair === 'yes' ? 'green' : 'red',
      })
        .setLngLat([point.lon, point.lat])
        .setPopup(new mapboxgl.Popup().setText(point.name))
        .addTo(map.current!);

      wheelmapMarkers.current.push(marker);
    });

    setRouteDrawn(true);
  };

  const cleanupRoute = () => {
    if (!map.current) return;

    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');

    Object.values(routeMarkers.current).forEach((m) => m?.remove());
    routeMarkers.current = {};
    wheelmapMarkers.current.forEach((m) => m.remove());
    wheelmapMarkers.current = [];

    localCoords.current = {};
    setRouteDrawn(false);
  };

  return (
    <div className="relative h-screen w-full">
      <Navbar onClearRoute={cleanupRoute} showClearButton={routeDrawn} />
      <SearchBar onSearchSubmit={handleSearchSubmit} />
      <div ref={mapContainer} className="h-full w-full pt-16" />
    </div>
  );
}
