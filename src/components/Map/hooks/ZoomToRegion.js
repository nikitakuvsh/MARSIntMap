import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function ZoomToRegion({ geoData, selectedRegion }) {
  const map = useMap();

  useEffect(() => {
    if (!geoData || !selectedRegion) {
      console.log("[Zoom] no data or no selectedRegion");
      return;
    }

    const feature = geoData.features.find(
      f => f.properties?.shapeName?.trim() === selectedRegion.trim()
    );

    if (!feature) {
      console.log("[Zoom] region not found:", selectedRegion);
      return;
    }

    console.log("[Zoom] zoom to:", selectedRegion);

    const layer = L.geoJSON(feature);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true
      });
    }
  }, [geoData, selectedRegion, map]);

  return null;
}
