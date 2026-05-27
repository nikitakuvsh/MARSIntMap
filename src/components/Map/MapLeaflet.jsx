import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./Map.css";

import ZoomToRegion from "./hooks/ZoomToRegion";

import ButtonThemeColor from "../ButtonThemeColor/ButtonThemeColor";
import ButtonLayers from "../ButtonLayers/ButtonLayers";
import ButtonBug from "../ButtonBug/ButtonBug";

import MapLegends from "../MapLegends/MapLegends";

import RegionsEditorModal from "../RegionsEditorModal/RegionsEditorModal";
import RegionsEditorModalContent from "../RegionsEditorModal/RegionsEditorModalContent";

import ModalClicked from "./ModalClicked/ModalClicked";

import openedEyeIcon from "../../images/icons/openedEye.png";
import closedEyeIcon from "../../images/icons/closedEye.png";

import { resolveRegionSynonyms } from "./functions/resolveRegionSynonyms";
import { applyMapLayers } from "./functions/applyMapLayer";
import { handleRegionClick } from "./functions/handleRegionClick";
import { generateLegends } from "./functions/generateLegends";

export default function MapLeaflet({
  selectedRegion,
  setSelectedRegion,
  selectedRegionView = [],
  setSelectedRegionView,
  excelData = [],
  regionsByArea,
  setRegionsData,
  filters,
  setHeaderRange,
}) {

  const [geoData, setGeoData] = useState(null);
  const [visibleGeoData, setVisibleGeoData] = useState(null);

  const [selectedLayers, setSelectedLayers] = useState([]);

  const [styleMap, setStyleMap] = useState(true);

  const [regionsEditorModalOpen, setRegionsEditorModalOpen] = useState(false);

  const [modalClickedOpen, setModalClickedOpen] = useState(false);
  const [clickedRegionData, setClickedRegionData] = useState(null);

  const [hsrLegends, setHSRLegends] = useState([]);
  const [managerLegends, setManagerLegends] = useState([]);
  const [territoryLegends, setTerritoryLegends] = useState([]);

  const geoJsonRef = useRef(null);
  const colorsRef = useRef({});

  // =========================
  // LOAD GEO DATA
  // =========================
  useEffect(() => {
    fetch("/geo.geojson")
      .then(r => r.json())
      .then(data => setGeoData(data));
  }, []);

  // =========================
  // FILTER REGIONS
  // =========================
  useEffect(() => {

    if (!geoData || !regionsByArea) return;

    const allRegions = Object.values(regionsByArea).flat();

    const filteredFeatures = geoData.features.filter(f =>
      allRegions.includes(f.properties?.shapeName)
    );

    setVisibleGeoData({
      ...geoData,
      features: filteredFeatures
    });

  }, [geoData, regionsByArea]);

  // =========================
  // APPLY COLORS (MAIN FIX POINT)
  // =========================
  useEffect(() => {

    if (!geoJsonRef.current) return;
    if (!visibleGeoData) return;

    applyMapLayers({
      geoJsonRef,
      excelData,
      selectedRegionView,
      selectedLayers,
      filters,
      colorsGenerated: colorsRef.current,
      handleRegionClick: feature =>
        handleRegionClick({
          feature,
          excelData,
          filters,
          setClickedRegionData,
          setModalClickedOpen
        })
    });

  }, [
    excelData,
    selectedRegionView,
    selectedLayers,
    filters,
    visibleGeoData
  ]);

  // =========================
  // LEGENDS
  // =========================
  useEffect(() => {

    const rowInActiveRegion = r => {
      const excelRegions = resolveRegionSynonyms(r["Область"]);
      return excelRegions.some(reg =>
        selectedRegionView.includes(reg)
      );
    };

    setHSRLegends(generateLegends({
      excelData,
      selectedLayers,
      selected: "HSRLayer",
      key: "HSR",
      filters,
      colorsGenerated: colorsRef.current,
      rowInActiveRegion
    }));

    setManagerLegends(generateLegends({
      excelData,
      selectedLayers,
      selected: "ManagerLayer",
      key: "Manager",
      filters,
      colorsGenerated: colorsRef.current,
      rowInActiveRegion
    }));

    setTerritoryLegends(generateLegends({
      excelData,
      selectedLayers,
      selected: "TerritoryLayer",
      key: "Territory",
      filters,
      colorsGenerated: colorsRef.current,
      rowInActiveRegion
    }));

  }, [
    excelData,
    selectedLayers,
    selectedRegionView,
    filters
  ]);

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <MapContainer
        center={[61, 105]}
        zoom={3}
        style={{ height: "100vh", width: "100%" }}
        className="map"
      >

        {styleMap && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}

        {geoData && visibleGeoData && (
          <GeoJSON
            key={JSON.stringify(regionsByArea)}
            ref={geoJsonRef}
            data={visibleGeoData}
            style={() => ({
              fillColor: "#d9d9d9",
              fillOpacity: 0.3,
              color: "#333",
              weight: 1
            })}
            onEachFeature={(feature, layer) => {

              const name = feature?.properties?.shapeName;

              layer.bindTooltip(name);

              layer.on("click", () => {
                handleRegionClick({
                  feature,
                  excelData,
                  filters,
                  setClickedRegionData,
                  setModalClickedOpen
                });
              });

            }}
          />
        )}

        <ZoomToRegion
          geoData={geoData}
          selectedRegion={selectedRegion}
        />

        <ButtonThemeColor />

        <ButtonLayers
          excelData={excelData}
          selectedLayers={selectedLayers}
          setSelectedLayers={setSelectedLayers}
          setHSRLegends={setHSRLegends}
          setManagerLegends={setManagerLegends}
          setTerritoryLegends={setTerritoryLegends}
        />

        <MapLegends
          hsrLegends={hsrLegends}
          managerLegends={managerLegends}
          territoryLegends={territoryLegends}
        />

        <RegionsEditorModal
          openModal={() =>
            setRegionsEditorModalOpen(prev => !prev)
          }
        />

        <ButtonBug setHeaderRange={setHeaderRange} />

        <button
          className="style-map--button"
          onClick={() => setStyleMap(prev => !prev)}
        >
          <img
            src={styleMap ? openedEyeIcon : closedEyeIcon}
            alt="toggle"
          />
        </button>

      </MapContainer>

      {regionsEditorModalOpen && (
        <RegionsEditorModalContent
          initRegionsData={regionsByArea}
          onChange={setRegionsData}
          onClose={() => setRegionsEditorModalOpen(false)}
        />
      )}

      {modalClickedOpen && (
        <ModalClicked
          onClose={() => setModalClickedOpen(false)}
          data={clickedRegionData}
          filters={filters}
        />
      )}
    </>
  );
}