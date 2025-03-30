/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/getTransitRoute.ts

export async function getTransitRouteFromGoogle(origin: string, destination: string) {
    const url = `/api/transit-route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  
    const res = await fetch(url);
    const data = await res.json();
  
    if (data.status !== 'OK') throw new Error(data.error_message || 'No route found');
  
    const route = data.routes[0];
    const overviewPolyline = route.overview_polyline.points;
  
    const steps = route.legs[0].steps.map((step: any) => ({
      mode: step.travel_mode,
      duration: step.duration.text,
      instructions: step.html_instructions,
      line: step.transit_details?.line?.short_name,
    }));
  
    return {
      polyline: overviewPolyline,
      steps,
      duration: route.legs[0].duration.text,
      distance: route.legs[0].distance.text,
    };
  }
  