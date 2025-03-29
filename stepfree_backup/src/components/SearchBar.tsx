'use client';

import { useState, useEffect } from 'react';

interface Props {
  onSearchSubmit: (values: { start?: string; end?: string }) => void;
  startQuery: string;
  endQuery: string;
  setStartQuery: React.Dispatch<React.SetStateAction<string>>;
  setEndQuery: React.Dispatch<React.SetStateAction<string>>;
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

export default function SearchBar({ onSearchSubmit }: Props) {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<Suggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Suggestion[]>([]);
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);

  const fetchSuggestions = async (query: string, field: 'start' | 'end') => {
    if (!query) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=ip&autocomplete=true&access_token=${accessToken}`
    );
    const data = await res.json();
    if (!data.features) return;

    const suggestions = data.features.map((f: any) => ({
      place_name: f.place_name,
      center: f.center,
    }));

    if (field === 'start') setStartSuggestions(suggestions);
    else setEndSuggestions(suggestions);
  };

  const handleSuggestionClick = (suggestion: Suggestion, field: 'start' | 'end') => {
    if (field === 'start') {
      setStartQuery(suggestion.place_name);
      setStartSuggestions([]);
    } else {
      setEndQuery(suggestion.place_name);
      setEndSuggestions([]);
    }
  };

  const handleSubmit = () => {
    const values: { start?: string; end?: string } = {};
    if (startQuery.trim()) values.start = startQuery.trim();
    if (endQuery.trim()) values.end = endQuery.trim();
    onSearchSubmit(values);
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-white p-4 rounded shadow-md w-[300px] space-y-3">
      <div className="relative">
        <label className="text-sm font-medium">Start Location</label>
        <input
          type="text"
          value={startQuery}
          onChange={(e) => {
            setStartQuery(e.target.value);
            fetchSuggestions(e.target.value, 'start');
          }}
          onFocus={() => setActiveField('start')}
          placeholder="Search start..."
          className="w-full px-3 py-2 text-sm border rounded mt-1"
        />
        {activeField === 'start' && startSuggestions.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto z-50">
            {startSuggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(s, 'start')}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <label className="text-sm font-medium">End Location</label>
        <input
          type="text"
          value={endQuery}
          onChange={(e) => {
            setEndQuery(e.target.value);
            fetchSuggestions(e.target.value, 'end');
          }}
          onFocus={() => setActiveField('end')}
          placeholder="Search destination..."
          className="w-full px-3 py-2 text-sm border rounded mt-1"
        />
        {activeField === 'end' && endSuggestions.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto z-50">
            {endSuggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(s, 'end')}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
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
