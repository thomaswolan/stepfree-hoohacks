// src/components/ClearRouteButton.tsx
'use client'

type Props = {
  onClick: () => void
}

export default function ClearRouteButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-100 z-50"
    >
      Clear Route
    </button>
  )
}
