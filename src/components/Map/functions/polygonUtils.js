import * as turf from "@turf/turf";
import L from "leaflet";

/**
 * Рисует GeoJSON feature как единый слой с цветом
 */
export const drawPolygonFeature = (
  layer,
  feature,
  color,
  onClick,
  opacity = 0.6,
  weight = 1
) => {

  if (!feature?.geometry) return null;

  const map = layer._map;
  if (!map) return null;

  const geoLayer = L.geoJSON(feature, {
    style: {
      fillColor: color,
      fillOpacity: opacity,
      color: color,
      weight
    }
  });

  geoLayer.addTo(map);

  if (onClick) {
    geoLayer.eachLayer(l => {
      l.on("click", onClick);
    });
  }

  layer._tempPolygons = layer._tempPolygons || [];
  layer._tempPolygons.push(geoLayer);

  return geoLayer;
};

/**
 * Делит feature на N горизонтальных частей (turf-based)
 */
export const drawSplitNReturnFeatures = (
  feature,
  parts
) => {

  if (!feature?.geometry?.coordinates?.length) {
    return [];
  }

  const bbox = turf.bbox(feature);

  const [minLng, minLat, maxLng, maxLat] = bbox;

  const latStep = (maxLat - minLat) / parts;

  const result = [];

  for (let i = 0; i < parts; i++) {

    const low = minLat + latStep * i;
    const high = minLat + latStep * (i + 1);

    const clippingPolygon = turf.polygon([[
      [minLng - 10, low],
      [maxLng + 10, low],
      [maxLng + 10, high],
      [minLng - 10, high],
      [minLng - 10, low]
    ]]);

    try {

      const intersected = turf.intersect(
        turf.featureCollection([
          feature,
          clippingPolygon
        ])
      );

      if (intersected) {
        result.push(intersected);
      }

    } catch (e) {
      console.warn("turf intersect error:", e);
    }
  }

  return result;
};