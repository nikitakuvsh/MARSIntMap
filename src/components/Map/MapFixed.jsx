import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ZoomToRegion from "./hooks/ZoomToRegion";
import ButtonThemeColor from "../ButtonThemeColor/ButtonThemeColor";
import ButtonLayers from "../ButtonLayers/ButtonLayers";
import ButtonBug from "../ButtonBug/ButtonBug";
import MapLegends from "../MapLegends/MapLegends";
import RegionsEditorModal from "../RegionsEditorModal/RegionsEditorModal";
import './Map.css';
import closedEyeIcon from '../../images/icons/closedEye.png';
import openedEyeIcon from '../../images/icons/openedEye.png';
import RegionsEditorModalContent from "../RegionsEditorModal/RegionsEditorModalContent";
import { resolveRegionName } from "./hooks/ResolveRegionName";
import L from "leaflet";
import regionSynonyms from "./RegionsDataSynomys";
import * as turf from "@turf/turf";

export default function MapLeaflet({ selectedRegion, setSelectedRegion, selectedRegionView = [], setSelectedRegionView, excelData = [], mapDataColumn = null, mapDataColumnValues = [], regionsByArea, setRegionsData, filters, setHeaderRange }) {
  const [geoData, setGeoData] = useState(null);
  const redColor = "rgba(255, 0, 0, 0.82)";
  const greenColor = "rgba(6, 255, 6, 0.8)";
  const yellowColor = "rgba(242, 231, 0, 0.82)";
  const [backgroundColor, setBackgroundColor] = useState(greenColor);
  const [activeRegions, setActiveRegions] = useState([]);
  const activeRegionsRef = useRef([]);
  const [modalMessageVisible, setModalMessageVisible] = useState(false);
  activeRegionsRef.current = activeRegions;
  const [distributorLegends, setDistributorLegends] = useState([]);
  const [hsrLegends, setHSRLegends] = useState([]);
  const [managerLegends, setManagerLegends] = useState([]);
  const [territoryLegends, setTerritoryLegends] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [avgSell, setAvgSell] = useState(0);
  const hsrPatterns = {};
  const [visibleGeoData, setVisibleGeoData] = useState(null);
  const geoJsonRef = useRef(null);
  const [styleMap, setStyleMap] = useState(true);
  const colorsRef = useRef({});
  const [hsrMarkers, setHsrMarkers] = useState([]);
  const [regionsEditorModalOpen, setRegionsEditorModalOpen] = useState(false);

  console.log("[render] selectedRegion =", selectedRegion);

  useEffect(() => {
    fetch("/geo.geojson")
      .then(r => r.json())
      .then(data => {
        console.log("[GeoJSON] loaded", data.features.length);
        setGeoData(data);
      });
  }, []);
  useEffect(() => {
    if (!geoData || !regionsByArea) return;

    // Составляем плоский массив всех активных регионов
    const allRegions = Object.values(regionsByArea).flat();

    // Создаём полностью новый объект geoData, клонируя features
    const filteredFeatures = geoData.features
      .filter(f => allRegions.includes(f.properties?.shapeName))
      .map(f => ({ ...f })); // клонируем каждый feature, чтобы ссылка изменилась

    setVisibleGeoData({
      ...geoData,
      features: filteredFeatures
    });
  }, [geoData, regionsByArea, selectedRegionView]);


  useEffect(() => {
    if (!geoJsonRef.current) return;

    const viewArray = Array.isArray(selectedRegionView) ? selectedRegionView : [];

    geoJsonRef.current.eachLayer(layer => {
      const name = layer.feature.properties.shapeName;
      // ❗ если регион не активен — сбрасываем стиль и выходим
      if (!selectedRegionView.includes(name)) {
        layer.setStyle({
          fillColor: "rgba(0,0,0,0)",
          color: "#000",
          weight: 1,
          fillOpacity: 0
        });
        return;
      }

      if (viewArray.includes(name)) {
        // подсветка активных регионов
        layer.setStyle({
          fillColor: "rgba(6, 255, 6, 0.8)",
          color: "#000",
          weight: 2,
          fillOpacity: 1
        });
      } else {
        // сброс стиля для неактивных
        layer.setStyle({
          fillColor: "rgba(0,0,0,0)",
          color: "#000",
          weight: 1,
          fillOpacity: 0
        });
      }
    });
  }, [selectedRegionView, regionsByArea]);

  // В начале компонента добавляем
  // 🔹 сохраняем цвета между рендерами

  const pick = (row, ...keys) => {
    for (const k of keys) {
      const v = row[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return v;
      }
    }
    return null;
  };

  const resolveRegionSynonyms = (region) => {
    if (!region) return []; // если region пустой, возвращаем пустой массив
    const key = String(region).toLowerCase();
    return regionSynonyms[key] || [region]; // если синонимов нет — возвращаем сам регион
  };

  function cutBand(polygon, startLat, endLat) {
  const bbox = turf.bbox(polygon);
  const [minLng, , maxLng] = bbox;

  const band = turf.polygon([[
    [minLng - 5, startLat],
    [maxLng + 5, startLat],
    [maxLng + 5, endLat],
    [minLng - 5, endLat],
    [minLng - 5, startLat],
  ]]);

  const inside = turf.intersect(turf.featureCollection([polygon, band]));
  const outside = turf.difference(turf.featureCollection([polygon, band]));

  return { inside, outside };
}


function sliceFeatureByLat(geometry, startLat, endLat) {
  const polygon = turf.feature(geometry);
  const bbox = turf.bbox(polygon);
  const [minLng, , maxLng] = bbox;

  const band = turf.polygon([[
    [minLng - 5, startLat],
    [maxLng + 5, startLat],
    [maxLng + 5, endLat],
    [minLng - 5, endLat],
    [minLng - 5, startLat],
  ]]);

  // ❗ ВАЖНО: intersect теперь через FeatureCollection
  const intersection = turf.intersect(
    turf.featureCollection([polygon, band])
  );

  if (!intersection) return [];

  if (intersection.geometry.type === "MultiPolygon") {
    return intersection.geometry.coordinates.map(coords =>
      turf.polygon(coords)
    );
  }

  return [intersection];
}



  useEffect(() => {
    if (!geoJsonRef.current || !excelData.length) return;
  
    const colorsGenerated = colorsRef.current;
    const newHsrMarkers = [];
  
    const flattenLatLngs = (latlngs) => {
      if (!latlngs) return [];
      return latlngs.flatMap(p => Array.isArray(p) ? flattenLatLngs(p) : p);
    };
  
    // Унифицированный маппинг столбцов
    const COLUMN_MAP = {
      region: r => r["Область"] || r["District"] || r["Регион"] || "",
      distributor: r => r["Distributor"] || r["Дистр"] || "",
      hsr: r => r["Region / HSR"] || r["Позиция менеджера"] || "",
      manager: r => r["Manager"] || r["Менеджер"] || "",
      territory: r => r["Territory"] || r["Территория"] || "",
    };
  
    const rowInActiveRegion = r => {
      const excelRegions = resolveRegionSynonyms(COLUMN_MAP.region(r));
      return excelRegions.some(reg => selectedRegionView.includes(reg));
    };
  
    geoJsonRef.current.eachLayer(layer => {
      const name = layer.feature?.properties?.shapeName;
      if (!name) return;
  
      const layerRegions = resolveRegionSynonyms(name);
  
      // Строки Excel для текущего региона
      const rows = excelData.filter(r => {
        const excelRegions = resolveRegionSynonyms(COLUMN_MAP.region(r));
        return excelRegions.some(er => layerRegions.includes(er));
      });
  
      const isSelected = layerRegions.some(r => selectedRegionView.includes(r));
  
      // Удаляем старые временные полигоны
      if (layer._tempPolygons) {
        layer._tempPolygons.forEach(p => p.remove());
      }
      layer._tempPolygons = [];
  
      const flatPolygon = flattenLatLngs(layer.getLatLngs());
      if (!flatPolygon.length) return;
  
      const lats = flatPolygon.map(p => p.lat).filter(lat => typeof lat === "number");
      const lngs = flatPolygon.map(p => p.lng).filter(lng => typeof lng === "number");
      if (!lats.length || !lngs.length) return;
  
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
  
      if (rows.length && selectedLayers.includes("DistributorLayer") && isSelected) {
        const distributors = [...new Set(rows.map(r => pick(r, "Distributor", "Дистр")).filter(Boolean))];
        if (distributors.length) {
          const [d1, d2] = distributors;
  
          if (!colorsGenerated[d1]) colorsGenerated[d1] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
          if (d2 && !colorsGenerated[d2]) colorsGenerated[d2] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
  
          const latlngsNested = layer.getLatLngs();
          const latlngs = Array.isArray(latlngsNested[0]) ? latlngsNested[0] : latlngsNested;
          if (!latlngs || !latlngs.length) return;
  
          if (distributors.length === 1) {
            // Один дистрибьютор — обычная заливка
            layer.setStyle({ fillColor: colorsGenerated[d1], color: "#000", weight: 1, fillOpacity: 0.7 });
          } else {
            // Больше одного — делим по средней линии
            const latitudes = latlngs.map(p => p.lat).filter(lat => lat != null);
            if (!latitudes.length) return;
  
            const midLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
  
            const upperPolygon = latlngs.map(p => ({ lat: p.lat >= midLat ? p.lat : midLat, lng: p.lng }));
            const lowerPolygon = latlngs.map(p => ({ lat: p.lat < midLat ? p.lat : midLat, lng: p.lng }));
  
            // Рисуем только если регион выбран
            const upper = L.polygon(upperPolygon, { color: "#000", fillColor: colorsGenerated[d1], weight: 0, fillOpacity: 0.7 }).addTo(layer._map);
            const lower = L.polygon(lowerPolygon, { color: "#000", fillColor: colorsGenerated[d2], weight: 0, fillOpacity: 0.7 }).addTo(layer._map);
  
            layer._tempPolygons = [upper, lower];
            layer.setStyle({ fillOpacity: 0, color: "#000", weight: 1 });
          }
        }
      } else {
        // Регион не выбран или нет дистрибьюторов — прозрачный
        layer.setStyle({ color: "#000", weight: 1, fillOpacity: 0 });
      }
  
      // ===== HSRLayer =====
      if (selectedLayers.includes("HSRLayer") && isSelected) {
        const hsrRows = rows.filter(r =>
          !filters.hsr?.length || filters.hsr.includes(COLUMN_MAP.hsr(r))
        );
  
        const hsrNames = [...new Set(hsrRows.map(r => COLUMN_MAP.hsr(r)).filter(Boolean))];
  
        if (!hsrNames.length) {
          layer.setStyle({ fillOpacity: 0 });
        } else {
          hsrNames.forEach(h => {
            if (!colorsGenerated[h])
              colorsGenerated[h] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
  
            layer.setStyle({
              color: "#000",
              fillColor: colorsGenerated[h],
              weight: 1,
              fillOpacity: 1,
            });
          });
        }
      }
if (selectedLayers.includes("ManagerLayer") && isSelected) {
  let remainder = turf.feature(layer.feature.geometry);

  const managerRows = rows.filter(r => COLUMN_MAP.manager(r));
  const managers = [...new Set(managerRows.map(r => COLUMN_MAP.manager(r)))];
  if (!managers.length) return;

  const regionBbox = turf.bbox(layer.feature);
  const [minLng, minLat, maxLng, maxLat] = regionBbox;

  const containerPadding = 0.5; // padding от границ HSR
  const containerMinLat = minLat + containerPadding;
  const containerMaxLat = maxLat - containerPadding;
  const containerMinLng = minLng + containerPadding;
  const containerMaxLng = maxLng - containerPadding;

  const managerHeight = (containerMaxLat - containerMinLat) / managers.length;

  managers.forEach((m, idx) => {
    if (!colorsGenerated[m])
      colorsGenerated[m] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

    const startLat = containerMinLat + idx * managerHeight;
    const endLat = startLat + managerHeight;

    const managerBand = turf.polygon([[
      [containerMinLng, startLat],
      [containerMaxLng, startLat],
      [containerMaxLng, endLat],
      [containerMinLng, endLat],
      [containerMinLng, startLat]
    ]]);

    const insideManager = turf.intersect(turf.featureCollection([remainder, managerBand]));
    if (!insideManager) return;

    remainder = turf.difference(turf.featureCollection([remainder, managerBand])); // остаток

    // Рисуем Manager
    insideManager.geometry.coordinates.forEach(ring => {
      const leafletCoords = ring.map(([lng, lat]) => [lat, lng]);
      const poly = L.polygon(leafletCoords, {
        fillColor: colorsGenerated[m],
        color: "#000",
        weight: 1,
        fillOpacity: 1
      }).addTo(layer._map);
      layer._tempPolygons.push(poly);
    });

    // Territory внутри Manager
    // Territory внутри Manager
if (selectedLayers.includes("TerritoryLayer")) {
  const territoryRows = managerRows.filter(r => COLUMN_MAP.manager(r) === m);
  const territories = [...new Set(territoryRows.map(r => COLUMN_MAP.territory(r)).filter(Boolean))];
  if (!territories.length) return;

  const managerPaddingInner = 0.045; // padding от границ Manager
  const [mMinLng, mMinLat, mMaxLng, mMaxLat] = turf.bbox(insideManager);

  // создаем внутренний контейнер с паддингом
  const containerMinLat = mMinLat + managerPaddingInner;
  const containerMaxLat = mMaxLat - managerPaddingInner;
  const containerMinLng = mMinLng + managerPaddingInner;
  const containerMaxLng = mMaxLng - managerPaddingInner;

  const territoryHeight = (containerMaxLat - containerMinLat) / territories.length;

  territories.forEach((t, tIdx) => {
    if (!colorsGenerated[t])
      colorsGenerated[t] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

    const startLat = containerMinLat + tIdx * territoryHeight;
    const endLat = startLat + territoryHeight;

    const terrBand = turf.polygon([[
      [containerMinLng, startLat],
      [containerMaxLng, startLat],
      [containerMaxLng, endLat],
      [containerMinLng, endLat],
      [containerMinLng, startLat]
    ]]);

    const terrInside = turf.intersect(turf.featureCollection([insideManager, terrBand]));
    if (!terrInside) return;

    terrInside.geometry.coordinates.forEach(ring => {
      const leafletCoords = ring.map(([lng, lat]) => [lat, lng]);
      const poly = L.polygon(leafletCoords, {
        fillColor: colorsGenerated[t],
        color: "#000",
        weight: 0,
        fillOpacity: 1
      }).addTo(layer._map);
      layer._tempPolygons.push(poly);
    });
  });
}

  });
}

  });
  
    setHsrMarkers(newHsrMarkers);
  
    // ===== Легенды =====
    const generateLegends = (key, selected, setLegends) => {
      if (!selectedLayers.includes(selected)) { setLegends([]); return; }
  
      const legends = excelData
        .filter(rowInActiveRegion)
        .filter(r => {
          if (selected === "HSRLayer") return !filters.region?.length || filters.region.includes(COLUMN_MAP.hsr(r));
          if (selected === "ManagerLayer") return !filters.region?.length || filters.region.includes(COLUMN_MAP.manager(r));
          return true;
        })
        .map(r => {
          if (key === "Distributor") return COLUMN_MAP.distributor(r);
          if (key === "Region / HSR") return COLUMN_MAP.hsr(r);
          if (key === "Manager") return COLUMN_MAP.manager(r);
          if (key === "Territory") return COLUMN_MAP.territory(r);
          return null;
        })
        .filter(Boolean)
        .map(title => ({ title, color: colorsGenerated[title] }))
        .filter((v, i, a) => a.findIndex(x => x.title === v.title) === i);
  
      setLegends(legends);
    };
  
    generateLegends("Distributor", "DistributorLayer", setDistributorLegends);
    generateLegends("Region / HSR", "HSRLayer", setHSRLegends);
    generateLegends("Manager", "ManagerLayer", setManagerLegends);
    generateLegends("Territory", "TerritoryLayer", setTerritoryLegends);
  
  }, [excelData, selectedRegionView, selectedLayers, filters.region, filters.hsr]);
  

  return (
    <>
      <MapContainer center={[61, 105]} zoom={3} style={{ height: "100vh", width: "100%" }} className="map">
        {styleMap && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}

        {geoData && (
          <>
            {visibleGeoData && (
              <GeoJSON key={JSON.stringify(regionsByArea)} ref={geoJsonRef} data={visibleGeoData} onEachFeature={(f, l) => { const name = f.properties.shapeName; l.bindTooltip(name); }} />
            )}

            <ZoomToRegion geoData={geoData} selectedRegion={selectedRegion} />
          </>
        )}


        <ButtonThemeColor />
        <ButtonLayers excelData={excelData} distributorLegends={distributorLegends} setDistributorLegends={setDistributorLegends} selectedLayers={selectedLayers} setSelectedLayers={setSelectedLayers} setHSRLegends={setHSRLegends} setManagerLegends={setManagerLegends} setTerritoryLegends={setTerritoryLegends} />
        <MapLegends distributorLegends={distributorLegends} hsrLegends={hsrLegends} managerLegends={managerLegends} territoryLegends={territoryLegends} />
        <RegionsEditorModal openModal={() => setRegionsEditorModalOpen(prev => !prev)} />
        <ButtonBug setHeaderRange={setHeaderRange} />
        <button className="style-map--button" onClick={() => setStyleMap(prev => !prev)} title="Изменить стиль карты"><img src={styleMap ? openedEyeIcon : closedEyeIcon} alt="Глаз" /></button>
      </MapContainer>
      <>
        {regionsEditorModalOpen && <RegionsEditorModalContent initRegionsData={regionsByArea} onChange={setRegionsData} onClose={() => setRegionsEditorModalOpen(false)} />}
      </>
    </>
  );
}
