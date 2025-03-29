export async function fetchWheelmapData(bbox: string) {
    const res = await fetch(`https://wheelmap.org/api/nodes?bbox=${bbox}`, {
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_WHEELMAP_TOKEN}`,
      },
    });
  
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const data = await res.json();
    return data.nodes;
  }