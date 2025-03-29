// components/Navbar.tsx
export default function Navbar() {
    return (
      <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">StepFree</h1>
          <div className="space-x-4">
            <a href="/">Home</a>
            <a href="/map">Map</a>
            <a href="/journal">Journal</a>
          </div>
        </div>
      </nav>
    )
  }