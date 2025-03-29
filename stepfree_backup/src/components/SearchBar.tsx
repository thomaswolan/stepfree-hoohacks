'use client';

import { useState } from 'react';

interface Props {
  onSearchSubmit: (values: { start?: string; end?: string }) => void;
}

export default function SearchBar({ onSearchSubmit }: Props) {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');

  const handleSubmit = () => {
    const values: { start?: string; end?: string } = {};
    if (startQuery.trim()) values.start = startQuery.trim();
    if (endQuery.trim()) values.end = endQuery.trim();
    onSearchSubmit(values);
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-white p-4 rounded shadow-md w-[300px] space-y-3">
      <div>
        <label className="text-sm font-medium">Start Location</label>
        <input
          type="text"
          value={startQuery}
          onChange={(e) => setStartQuery(e.target.value)}
          placeholder="Search start..."
          className="w-full px-3 py-2 text-sm border rounded mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">End Location</label>
        <input
          type="text"
          value={endQuery}
          onChange={(e) => setEndQuery(e.target.value)}
          placeholder="Search destination..."
          className="w-full px-3 py-2 text-sm border rounded mt-1"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white text-sm px-3 py-2 rounded hover:bg-blue-600"
      >
        Go
      </button>
    </div>
  );
}
