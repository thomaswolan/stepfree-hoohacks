'use client'

type Props = {
  onClearRoute?: () => void
  showClearButton?: boolean
}

export default function Navbar({ onClearRoute, showClearButton }: Props) {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">StepFree</h1>
        <div className="space-x-4 flex items-center">
          <a href="/" className="text-sm text-blue-500 hover:underline">Signup</a>
          <a href="/journal" className="text-sm text-blue-500 hover:underline">Sign in</a>
          <a href="/map" className="text-sm text-blue-500 hover:underline">Map</a>
          {showClearButton && onClearRoute && (
            <button
              onClick={onClearRoute}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Clear Route
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
