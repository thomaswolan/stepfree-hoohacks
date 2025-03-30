
import RouteMap from '@/components/RouteMap'
import Navbar from '@/components/navbar'
//import AccessibleStationsMap from '@/components/AccessibleStationsMap'

export default function Home() {
  return (
    <div className="relative h-screen w-full">
      <Navbar />
      <div className="pt-16 h-full">
        <RouteMap />
        
      </div>
    </div>
  )
}