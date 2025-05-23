/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { NavBar } from "@/components/navbar";
import SearchBar from '@/components/SearchBar';
import { getTransitRouteFromGoogle } from '@/lib/getTransitRoute';
import polyline from '@mapbox/polyline';

type WheelmapPoint = {
  id:number;
  name:string;
  wheelchair:string;
  lat:number;
  lon:number;
};


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function RouteMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const localCoords = useRef<{ start?: [number, number]; end?: [number, number] }>({});
  const routeMarkers = useRef<{ start?: mapboxgl.Marker; end?: mapboxgl.Marker }>({});
  const wheelmapMarkers = useRef<mapboxgl.Marker[]>([]);
  const extraMarkers = useRef<mapboxgl.Marker[]>([]);
  const adaStations = useRef<WheelmapPoint[]>([]);
  const [routeDrawn, setRouteDrawn] = useState(false);
  const [clickMode, setClickMode] = useState<'start' | 'end'>('start');
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');

  const [routeInfo, setRouteInfo] = useState<{
    entryStation?: WheelmapPoint;
    exitStation?: WheelmapPoint;
    duration?: string;
    distance?: string;
    steps?: {
      mode: string;
      duration: string;
      instructions: string;
      line?: string;
    }[];
  } | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.9911, 40.7359],
      zoom: 12,
    });

    map.current.on('load', async () => {
      const query = `
        [out:json][timeout:25];
        area["name"="New York"]["boundary"="administrative"]->.searchArea;
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
        body: `data=${encodeURIComponent(query)}`
      });
    
      const data = await res.json();
    
      type WheelmapPoint = {
        id:number;
        name:string;
        wheelchair:string;
        lat:number;
        lon:number;
      };
      
      const stations: WheelmapPoint[] = data.elements
        .filter((el: any) => el.tags?.name)
        .map((el: any) => ({
          id: el.id,
          name: el.tags.name,
          wheelchair: el.tags.wheelchair,
          lat: el.lat,
          lon: el.lon,
        }));
        
      adaStations.current = stations.filter((station) => station.wheelchair === 'yes');

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
    
      //console.log(`Loaded ${stations.length} subway stations`);
      //console.log(adaStations);
    });
    

    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;

      const reverseGeocode = async (coords: [number, number]) => {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await res.json();
        const name = data.features?.[0]?.place_name || `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`;
        return name;
      };

      if (localCoords.current.start && localCoords.current.end) {
        cleanupRoute();
        localCoords.current = { start: [lng, lat] };
        const marker = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setText(await reverseGeocode([lng, lat])))
          .addTo(map.current!);
        routeMarkers.current.start = marker;
        setStartQuery(await reverseGeocode([lng, lat]));
        setEndQuery('');
        setClickMode('end');
        return;
      }

      if (!localCoords.current.start) {
        localCoords.current.start = [lng, lat];
        const marker = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setText(await reverseGeocode([lng, lat])))
          .addTo(map.current!);
        routeMarkers.current.start = marker;
        setStartQuery(await reverseGeocode([lng, lat]));
        setClickMode('end');
      } else if (!localCoords.current.end) {
        localCoords.current.end = [lng, lat];
        const marker = new mapboxgl.Marker({ color: 'orange' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setText(await reverseGeocode([lng, lat])))
          .addTo(map.current!);
        routeMarkers.current.end = marker;
        setEndQuery(await reverseGeocode([lng, lat]));
        tryDrawRoute(localCoords.current.start, localCoords.current.end);
        setClickMode('start');
      }
    });
  }, []);

  const addMultipleMarkers = async () => {
    if (!map.current) return;

    extraMarkers.current.forEach((m) => m.remove());
    extraMarkers.current = [];

    try {
      const res = await fetch('/locations.json');
      const locations: { name: string; coordinates: [number, number] }[] = await res.json();

      for (const loc of locations) {
        const marker = new mapboxgl.Marker({ color: 'purple' })
          .setLngLat(loc.coordinates)
          .setPopup(new mapboxgl.Popup().setText(loc.name))
          .addTo(map.current!);

        extraMarkers.current.push(marker);
      }
    } catch (err) {
      console.error('Failed to load markers from JSON:', err);
    }
  };

  const setPointFromCoords = (coords: [number, number], role: 'start' | 'end') => {
    if (!map.current) return;

    if (routeMarkers.current[role]) routeMarkers.current[role]!.remove();

    const marker = new mapboxgl.Marker({ color: role === 'start' ? 'blue' : 'orange' })
      .setLngLat(coords)
      .addTo(map.current);

    routeMarkers.current[role] = marker;
    localCoords.current[role] = coords;

    const reverseGeocode = async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      return data.features?.[0]?.place_name || `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`;
    };

    reverseGeocode().then((place) => {
      if (role === 'start') setStartQuery(place);
      else setEndQuery(place);
    });

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


  function findNearestAdaStation(coord: [number, number], stations: WheelmapPoint[]) {
    const [lng, lat] = coord;
  
    let nearest = stations[0];
    let minDist = Number.MAX_VALUE;
  
    for (const station of stations) {
      const d = Math.sqrt(
        Math.pow(station.lat - lat, 2) + Math.pow(station.lon - lng, 2)
      );
      if (d < minDist) {
        minDist = d;
        nearest = station;
      }
    }
  
    return nearest;
  }
  

  const tryDrawRoute = async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    const entryStation = findNearestAdaStation(start, adaStations.current);
    const exitStation = findNearestAdaStation(end, adaStations.current);

    const origin = `${entryStation.lat},${entryStation.lon}`;
    const destination = `${exitStation.lat},${exitStation.lon}`;
    
    
    const route = await getTransitRouteFromGoogle(origin, destination);

    const directionsList = route.steps
      .map((step: { mode: string; line: any; instructions: any; duration: any; }, i: number) => {
        const modeIcon = step.mode === 'WALKING' ? '🚶' : '🚇';
        const line = step.line ? ` (Line ${step.line})` : '';
        return `${modeIcon} Step ${i + 1}: ${step.instructions} – ${step.duration}${line}`;
      })
      .join('\n\n');

      setRouteInfo({
        entryStation,
        exitStation,
        duration: route.duration,
        distance: route.distance,
        steps: route.steps,
      });

    
    // Decode Google's encoded polyline to Mapbox [lng, lat]
    const decoded: [number, number][] = polyline.decode(route.polyline);
    const routeCoordinates: [number, number][] = decoded.map(([lat, lng])  => [lng, lat]);
    

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
    adaStations.current = points;

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

    // Load additional custom markers after route is drawn
    addMultipleMarkers();
  };

  const cleanupRoute = () => {
    if (!map.current) return;

    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');

    Object.values(routeMarkers.current).forEach((m) => m?.remove());
    routeMarkers.current = {};
    wheelmapMarkers.current.forEach((m) => m.remove());
    wheelmapMarkers.current = [];
    extraMarkers.current.forEach((m) => m.remove());
    extraMarkers.current = [];

    localCoords.current = {};
    setRouteDrawn(false);
  };

  return (
    <div className="relative h-screen w-full">
      <SearchBar 
        onSearchSubmit={handleSearchSubmit}
        startQuery={startQuery}
        endQuery={endQuery}
        setStartQuery={setStartQuery}
        setEndQuery={setEndQuery}
      />
      <div ref={mapContainer} className="h-full w-full pt-16" />
        {routeInfo && (
          <div className="absolute top-10 right-4 bg-white dark:bg-black bg-opacity-10 border border-white border-opacity-20 rounded-xl p-4 shadow-lg w-[320px] max-h-[80vh] overflow-y-auto z-50">
            <button
              onClick={() => setRouteInfo(null)}
              className="absolute top-2 right-2 text-black dark:text-white hover:text-red-400 text-xl font-bold"
              aria-label="Close panel"
              >
            ✖
          </button>

          <h2 className="text-lg font-bold mb-2">ADA Route Info</h2>
          <p><strong>From:</strong> {routeInfo.entryStation?.name}</p>
          <p><strong>To:</strong> {routeInfo.exitStation?.name}</p>
          <p><strong>Duration:</strong> {routeInfo.duration}</p>
          <p><strong>Distance:</strong> {routeInfo.distance}</p>
          <hr className="my-2" />
          <h3 className="font-semibold">Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 mt-1">
            {routeInfo.steps?.map((step, i) => (
              <li key={i}>
                <span className="font-medium">
                  {step.mode === 'WALKING' ? '🚶' : '🚇'} {step.instructions}
                </span>
                <br />
                <span className="text-sm text-gray-600">
                  Duration: {step.duration}{step.line ? ` (Line ${step.line})` : ''}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

    </div>
  );
}
