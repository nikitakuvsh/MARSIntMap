import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ZoomToRegion from "./ZoomToRegion";
import ButtonThemeColor from "../ButtonThemeColor/ButtonThemeColor";
import ButtonLayers from "../ButtonLayers/ButtonLayers";
import MapLegends from "../MapLegends/MapLegends";
import RegionsEditorModal from "../RegionsEditorModal/RegionsEditorModal";
import './Map.css';
import closedEyeIcon from '../../images/icons/closedEye.png';
import openedEyeIcon from '../../images/icons/openedEye.png';

export default function MapLeaflet({ selectedRegion, setSelectedRegion, selectedRegionView = [], setSelectedRegionView, excelData = [], mapDataColumn = null, mapDataColumnValues = [], regionsByArea, setRegionsData }) {
  const [geoData, setGeoData] = useState(null);
  const redColor = "rgba(255, 0, 0, 0.82)";
  const greenColor = "rgba(6, 255, 6, 0.8)";
  const yellowColor = "rgba(242, 231, 0, 0.82)";
  const [backgroundColor, setBackgroundColor] = useState(greenColor);
  const [activeRegions, setActiveRegions] = useState([]);
  const activeRegionsRef = useRef([]);
  const [modalMessageVisible, setModalMessageVisible] = useState(false);
  activeRegionsRef.current = activeRegions; // реф всегда хранит актуальный массив
  const [distributorLegends, setDistributorLegends] = useState([]);
  const [hsrLegends, setHSRLegends] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [avgSell, setAvgSell] = useState(0);
  const hsrPatterns = {};
  const [visibleGeoData, setVisibleGeoData] = useState(null);
  const geoJsonRef = useRef(null);
  const [styleMap, setStyleMap] = useState(false);


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

    console.log("[Leaflet regions sync] start");

    // плоский список регионов, как у тебя было
    const allRegions = Object.values(regionsByArea).flat();

    console.log("[Leaflet regions sync] active regions:", allRegions);

    const filteredFeatures = geoData.features.filter(f => {
      const name = f.properties?.shapeName;
      return allRegions.includes(name);
    });

    console.log(
      "[Leaflet regions sync] filtered:",
      filteredFeatures.length
    );

    setVisibleGeoData({
      ...geoData,
      features: filteredFeatures
    });
  }, [geoData, regionsByArea]);

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
  }, [selectedRegionView]);




  return (
    <MapContainer
      center={[61, 105]}
      zoom={3}
      style={{ height: "100vh", width: "100%" }}
      className="map"
    >
      {styleMap && (
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      )}

      {geoData && (
        <>
          {visibleGeoData && (
            <GeoJSON
              ref={geoJsonRef}
              data={visibleGeoData}
              onEachFeature={(f, l) => {
                const name = f.properties.shapeName;
                l.bindTooltip(name);
              }}
            />
          )}


          <ZoomToRegion
            geoData={geoData}
            selectedRegion={selectedRegion}
          />
        </>
      )}
      <ButtonThemeColor />
      <ButtonLayers excelData={excelData} distributorLegends={distributorLegends} setDistributorLegends={setDistributorLegends} selectedLayers={selectedLayers} setSelectedLayers={setSelectedLayers} setHSRLegends={setHSRLegends} />
      <MapLegends distributorLegends={distributorLegends} hsrLegends={hsrLegends} />
      <RegionsEditorModal initRegionsData={regionsByArea} onChange={setRegionsData} />
      <button className="style-map--button" onClick={() => setStyleMap(prev => !prev)} title="Изменить стиль карты"><img src={styleMap ? openedEyeIcon : closedEyeIcon} alt="Глаз" /></button>
    </MapContainer>
  );
}
