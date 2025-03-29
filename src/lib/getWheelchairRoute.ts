// /lib/getWheelchairRoute.ts
export async function getWheelchairRoute(
    start: [number, number],
    end: [number, number]
  ) {
    const res = await fetch(
      "https://api.openrouteservice.org/v2/directions/wheelchair/geojson",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.NEXT_PUBLIC_ORS_TOKEN!,
        },
        body: JSON.stringify({
          coordinates: [start, end],
        }),
      }
    );
  
    if (!res.ok) {
      throw new Error(`ORS API error: ${res.status} ${res.statusText}`);
    }
  
    const data = await res.json();
    return data; // data.features will exist
  }
  