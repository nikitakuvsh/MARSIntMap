import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ZoomToRegion from "./hooks/ZoomToRegion";
import ButtonThemeColor from "../ButtonThemeColor/ButtonThemeColor";
import ButtonLayers from "../ButtonLayers/ButtonLayers";
import MapLegends from "../MapLegends/MapLegends";
import RegionsEditorModal from "../RegionsEditorModal/RegionsEditorModal";
import './Map.css';
import closedEyeIcon from '../../images/icons/closedEye.png';
import openedEyeIcon from '../../images/icons/openedEye.png';
import RegionsEditorModalContent from "../RegionsEditorModal/RegionsEditorModalContent";

export default function MapLeaflet({ selectedRegion, setSelectedRegion, selectedRegionView = [], setSelectedRegionView, excelData = [], mapDataColumn = null, mapDataColumnValues = [], regionsByArea, setRegionsData, filters }) {
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

      if (viewArray.includes(name)) {
        // подсветка активных регионов
        layer.setStyle({
          fillColor: "rgba(6, 255, 6, 0.8)",
          color: "#000",
          weight: 2,
          fillOpacity: 0.7
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

  // Далее в useEffect заменяем
useEffect(() => {
  if (!geoJsonRef.current || !excelData.length) return;

  const colorsGenerated = colorsRef.current;
  const activeRegions = Array.from(new Set(selectedRegionView)); // активные регионы
  const newHsrMarkers = [];

  geoJsonRef.current.eachLayer(layer => {
    const name = layer.feature.properties.shapeName;
    let fillColor = "rgba(0,0,0,0)";
    let weight = 1;
    let fillOpacity = 0;

    // подсветка активных регионов сохраняется
    if (activeRegions.includes(name)) {
      fillColor = "rgba(6, 255, 6, 0.8)";
      weight = 2;
      fillOpacity = 0.7;
    }

    const rows = excelData.filter(r => r.District === name);
    if (rows.length) {
      // Distributor полностью
      if (selectedLayers.includes("DistributorLayer")) {
        const distributorRow = rows.find(r => r.Distributor);
        if (distributorRow) {
          const d = distributorRow.Distributor;
          if (!colorsGenerated[d]) {
            colorsGenerated[d] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6,"0")}`;
          }
          fillColor = colorsGenerated[d];
          weight = 3;
          fillOpacity = 0.7;
        }
      }

      // HSR кружки — фильтруем только если фильтр выбран, иначе все
      if (selectedLayers.includes("HSRLayer")) {
        const hsrRow = rows.find(r => !filters.region?.length || filters.region.includes(r["Region / HSR"]));
        if (hsrRow) {
          const h = hsrRow["Region / HSR"];
          if (!colorsGenerated[h]) {
            colorsGenerated[h] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6,"0")}`;
          }

          const center = layer.getBounds().getCenter();
          newHsrMarkers.push({
            position: [center.lat, center.lng],
            color: colorsGenerated[h],
            radius: 6,
            key: `${name}-${h}`,
          });
        }
      }
    }

    layer.setStyle({ fillColor, color: "#000", weight, fillOpacity });
  });

  setHsrMarkers(newHsrMarkers);

  // Обновляем легенды
  if (selectedLayers.includes("DistributorLayer")) {
    const distributorLegends = excelData
      .map(r => r.Distributor)
      .filter(Boolean)
      .map(d => ({ title: d, color: colorsGenerated[d] }))
      .filter((v,i,a)=>a.findIndex(x=>x.title===v.title)===i);
    setDistributorLegends(distributorLegends);
  } else setDistributorLegends([]);

  if (selectedLayers.includes("HSRLayer")) {
    const hsrLegends = excelData
      .filter(r => !filters.region?.length || filters.region.includes(r["Region / HSR"]))
      .map(r => r["Region / HSR"])
      .filter(Boolean)
      .map(h => ({ title: h, color: colorsGenerated[h] }))
      .filter((v,i,a)=>a.findIndex(x=>x.title===v.title)===i);
    setHSRLegends(hsrLegends);
  } else setHSRLegends([]);

}, [excelData, selectedRegionView, selectedLayers, filters.region]);

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

          {hsrMarkers.map(m => (
            <CircleMarker
              key={m.key}
              center={m.position}
              radius={m.radius * 1.2}
              pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 1, weight: 5 }}
            />
          ))}


          <ButtonThemeColor />
          <ButtonLayers excelData={excelData} distributorLegends={distributorLegends} setDistributorLegends={setDistributorLegends} selectedLayers={selectedLayers} setSelectedLayers={setSelectedLayers} setHSRLegends={setHSRLegends} />
          <MapLegends distributorLegends={distributorLegends} hsrLegends={hsrLegends} />
          <RegionsEditorModal openModal={() => setRegionsEditorModalOpen(prev => !prev)}/>
          <button className="style-map--button" onClick={() => setStyleMap(prev => !prev)} title="Изменить стиль карты"><img src={styleMap ? openedEyeIcon : closedEyeIcon} alt="Глаз" /></button>
        </MapContainer>
          <>
          {regionsEditorModalOpen && <RegionsEditorModalContent initRegionsData={regionsByArea} onChange={setRegionsData} onClose={() => setRegionsEditorModalOpen(false)} />}
          </>
      </>
  );
}
