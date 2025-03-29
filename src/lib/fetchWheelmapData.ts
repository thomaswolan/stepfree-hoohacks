export async function fetchWheelmapData(bbox: string) {
    const res = await fetch(`https://wheelmap.org/api/nodes?bbox=${bbox}`);
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const data = await res.json();
    return data.nodes;
  }
  
