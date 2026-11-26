import MapScreen from "@/components/map/MapScreen";
import { isDemoMode } from "@/lib/db/places";

export default function HomePage() {
  return <MapScreen demo={isDemoMode()} />;
}
