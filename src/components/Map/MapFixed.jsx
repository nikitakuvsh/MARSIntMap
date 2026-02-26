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
import ModalClicked from "./ModalClicked/ModalClicked";
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
  const [modalClickedOpen, setModalClickedOpen] = useState(true);
  const [clickedRegionData, setClickedRegionData] = useState(null);

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
          fillColor: "rgba(0,0,0,0)",
          color: "#000",
          weight: 1,
          fillOpacity: 1
        });
      } else {
        // сброс стиля для неактивных
        layer.setStyle({
          fillColor: "rgba(0,0,0,0)",
          color: "#000",
          weight: 0,
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

    const COLUMN_MAP = {
      // Названия регионов/областей
      region: r => pick(
        r,
        "Область",      // новая таблица
        "District",     // старая таблица
        "Регион"        // возможные вариации
      ),

      // Дистрибьюторы
      distributor: r => pick(
        r,
        "Дистр",        // новая таблица
        "Дистр(?)",     // старая таблица
        "Distributor"   // англ. вариант
      ),

      // Верхний уровень (HSR или позиция менеджера)
      hsr: r => pick(
        r,
        "Region / HSR",     // старая таблица
      ),

      // Менеджер/руководитель
      manager: r => pick(
        r,
        "Позиция менеджера",         // старая таблица
        "Manager",
      ),

      // Территория под менеджером
      territory: r => pick(
        r,
        "Позиция сотрудника", // новая таблица
        "Territory",          // старая таблица
        "Территория"          // альтернативное название
      ),

    };

    


    const rowInActiveRegion = r => {
      const excelRegions = resolveRegionSynonyms(COLUMN_MAP.region(r));
      return excelRegions.some(reg => selectedRegionView.includes(reg));
    };

    const safeScale = (feature, factor = 0.85) => {
      if (!feature?.geometry?.coordinates?.length) return null;
      try {
        return turf.transformScale(feature, factor);
      } catch (e) {
        console.warn("safeScale failed:", e, feature);
        return feature;
      }
    };

    const drawPolygonFeature = (layer, feature, color, opacity = 1, weight = 0) => {
      if (!feature || !feature.geometry || !feature.geometry.coordinates) return;

      const coordsArray = feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.type === "MultiPolygon"
          ? feature.geometry.coordinates
          : null;

      if (!coordsArray) return;
      const zero = 0;

      coordsArray.forEach(ringSet => {
        if (!ringSet || !Array.isArray(ringSet)) return;
        ringSet.forEach(ring => {
          if (!ring || !ring.length) return;
          const leafletCoords = ring.map(([lng, lat]) => [lat, lng]);
          const poly = L.polygon(leafletCoords, { fillColor: color, color: "#000000", weight, fillOpacity: 1 }).addTo(layer._map);
          poly.on("click", () => {
            console.log("Клик по кастомному региону 2");
            handleRegionClick(layer.feature);
          })
          if (!layer._tempPolygons) layer._tempPolygons = [];
          layer._tempPolygons.push(poly);
        });
      });
    };



    const drawSplitN = (layer, feature, colors) => {
      const coordsArray =
        feature.geometry.type === "Polygon"
          ? [feature.geometry.coordinates]
          : feature.geometry.coordinates;

      const parts = colors.length;

      coordsArray.forEach(ringSet => {
        ringSet.forEach(ring => {
          if (!ring || !ring.length) return;

          const lats = ring.map(([lng, lat]) => lat);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const step = (maxLat - minLat) / parts;

          for (let i = 0; i < parts; i++) {
            const low = minLat + step * i;
            const high = minLat + step * (i + 1);

            const partPolygon = ring.map(([lng, lat]) => {
              if (lat < low) return [lng, low];
              if (lat > high) return [lng, high];
              return [lng, lat];
            });

            const poly = L.polygon(
              partPolygon.map(([lng, lat]) => [lat, lng]),
              {
                color: "#000",
                weight: 0,
                fillColor: colors[i],
                fillOpacity: 1
              }
            ).addTo(layer._map);

            if (!layer._tempPolygons) layer._tempPolygons = [];
            layer._tempPolygons.push(poly);
          }
        });
      });

      layer.setStyle({ fillOpacity: 0, color: "#000", weight: 1 });
    };


    geoJsonRef.current.eachLayer(layer => {
      const name = layer.feature?.properties?.shapeName;
      if (!name) return;

      const layerRegions = resolveRegionSynonyms(name);
      const rows = excelData.filter(r => {
        const excelRegions = resolveRegionSynonyms(COLUMN_MAP.region(r));
        return excelRegions.some(er => layerRegions.includes(er));
      });

      const isSelected = layerRegions.some(r => selectedRegionView.includes(r));

      // Удаляем старые временные полигоны
      if (layer._tempPolygons) layer._tempPolygons.forEach(p => p.remove());
      layer._tempPolygons = [];

      if (!layer.feature || !layer.feature.geometry) return;

      if (selectedLayers.includes("DistributorLayer") && isSelected) {

        const distributorsRaw = rows
          .map(r => pick(r, "Distributor", "Дистр"))
          .filter(Boolean);

        const distributors = [...new Set(distributorsRaw)];
        if (distributors.length === 0) return;

        // === Цвета ===
        const colors = [];

        distributors.forEach(d => {
          if (!colorsGenerated[d]) {
            colorsGenerated[d] =
              "#" + Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, "0");
          }
          colors.push(colorsGenerated[d]);
        });

        const scaledFeature = safeScale(layer.feature, 1);
        if (!scaledFeature) return;

        // === Один дистрибьютор — просто заливка ===
        if (colors.length === 1) {
          drawPolygonFeature(layer, scaledFeature, colors[0], 1, 1);
          return;
        }

        // === Подготовка координат ===
        let coordsArray = [];

        if (scaledFeature.geometry.type === "Polygon") {
          coordsArray = [scaledFeature.geometry.coordinates];
        } else {
          coordsArray = scaledFeature.geometry.coordinates;
        }

        // === Деление полигона на N горизонтальных частей ===
        coordsArray.forEach(ringSet => {

          ringSet.forEach(ring => {
            if (!ring || ring.length === 0) return;

            const lats = ring.map(point => point[1]);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const step = (maxLat - minLat) / colors.length;

            for (let i = 0; i < colors.length; i++) {

              const low = minLat + step * i;
              const high = minLat + step * (i + 1);

              const partPolygon = ring.map(point => {
                const lng = point[0];
                const lat = point[1];

                if (lat < low) return [lng, low];
                if (lat > high) return [lng, high];
                return [lng, lat];
              });

              const leafletCoords = partPolygon.map(p => [p[1], p[0]]);

              const poly = L.polygon(leafletCoords, {
                color: "#000",
                weight: 0,
                fillColor: colors[i],
                fillOpacity: 1
              }).addTo(layer._map);

              poly.on("click", () => {
                console.log("Клик по кастомному полигону");
                handleRegionClick(layer.feature);
              })

              if (!layer._tempPolygons) {
                layer._tempPolygons = [];
              }

              layer._tempPolygons.push(poly);
            }

          });

        });

        // === Скрываем оригинал ===
        layer.setStyle({
          fillOpacity: 0,
          color: "#000",
          weight: 1
        });
      }




      // === HSRLayer ===
      if (selectedLayers.includes("HSRLayer") && isSelected) {
        const hsrRows = rows.filter(r => !filters.hsr?.length || filters.hsr.includes(COLUMN_MAP.hsr(r)));
        const hsrNames = [...new Set(hsrRows.map(r => COLUMN_MAP.hsr(r)).filter(Boolean))];

        hsrNames.forEach(h => {
          if (!colorsGenerated[h])
            colorsGenerated[h] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

          const scaledFeature = safeScale(layer.feature, 1);
          if (!scaledFeature) return;

          drawPolygonFeature(layer, scaledFeature, colorsGenerated[h], 1, 1);
        });
      }

      // === ManagerLayer + Territory ===
      if (selectedLayers.includes("ManagerLayer") && isSelected) {
        const managerRowsFiltered = rows.filter(r => {
          const managerName = COLUMN_MAP.manager(r);
          if (!managerName) return false;
          return !filters.mapChannel || managerName.startsWith(filters.mapChannel);
        });

        const managers = [...new Set(managerRowsFiltered.map(r => COLUMN_MAP.manager(r)).filter(Boolean))];
        if (!managers.length) return;

        const managerColors = managers.map(m => {
          if (!colorsGenerated[m])
            colorsGenerated[m] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
          return colorsGenerated[m];
        });

        const scaledFeature = safeScale(layer.feature, 0.85);
        if (!scaledFeature) return;

        const drawSplitNReturnFeatures = (feature, colors) => {
          if (!feature?.geometry?.coordinates?.length) return [];

          const coordsArray = feature.geometry.type === "Polygon"
            ? [feature.geometry.coordinates]
            : feature.geometry.coordinates;

          const parts = colors.length;
          const newFeatures = [];

          coordsArray.forEach(ringSet => {
            ringSet.forEach(ring => {
              if (!ring || !ring.length) return;

              const lats = ring.map(([lng, lat]) => lat);
              const minLat = Math.min(...lats);
              const maxLat = Math.max(...lats);
              const step = (maxLat - minLat) / parts;

              // ВАЖНО — зазор между частями (магия)
              const gap = step * 0; // 4% зазора, можно 0.03–0.06 подбирать

              for (let i = 0; i < parts; i++) {
                let low = minLat + step * i + gap;
                let high = minLat + step * (i + 1) - gap;

                const partPolygon = ring.map(([lng, lat]) => {
                  if (lat < low) return [lng, low];
                  if (lat > high) return [lng, high];
                  return [lng, lat];
                });

                newFeatures.push({
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [partPolygon]
                  },
                  properties: {}
                });
              }
            });
          });

          return newFeatures;
        };


        // Делим на N менеджеров
        const managerFeatures = managers.length === 1
          ? [scaledFeature]
          : drawSplitNReturnFeatures(scaledFeature, managerColors);

        managers.forEach((m, idx) => {
          const managerFeature = managerFeatures[idx];
          if (!managerFeature) return;

          drawPolygonFeature(layer, managerFeature, managerColors[idx]);

          // === Territory внутри менеджера ===
          if (selectedLayers.includes("TerritoryLayer")) {
            const territoryRows = managerRowsFiltered.filter(r => COLUMN_MAP.manager(r) === m);
            const territories = [...new Set(territoryRows.map(r => COLUMN_MAP.territory(r)).filter(Boolean))];
            if (!territories.length) return;

            const territoryColors = territories.map(t => {
              if (!colorsGenerated[t])
                colorsGenerated[t] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
              return colorsGenerated[t];
            });

            // Масштабируем Territory сильнее, 0.7
            const territoryFeatureScaled = safeScale(managerFeature, 0.8);

            const territoryFeatures = territories.length === 1
              ? [territoryFeatureScaled]
              : drawSplitNReturnFeatures(territoryFeatureScaled, territoryColors);

            territoryFeatures.forEach((feat, tIdx) => {
              drawPolygonFeature(layer, feat, territoryColors[tIdx]);
            });
          }
        });

        layer.setStyle({ fillOpacity: 0, color: "#000", weight: 1 });
      }


      // Прозрачный стиль для остальных
      if (!selectedLayers.some(sl => ["DistributorLayer", "HSRLayer", "ManagerLayer"].includes(sl)) || !isSelected) {
        layer.setStyle({ fillOpacity: 0, color: "#000", weight: 1 });
      }
    });

    setHsrMarkers(newHsrMarkers);

    // ===== Легенды =====
    const generateLegends = (key, selected, setLegends) => {
      if (!selectedLayers.includes(selected)) { setLegends([]); return; }

      const legends = excelData
        .filter(rowInActiveRegion)
        .filter(r => {
          if (selected === "HSRLayer") {
            return !filters.hsr?.length || filters.hsr.includes(COLUMN_MAP.hsr(r));
          }
          if (selected === "ManagerLayer" || selected === "TerritoryLayer") {
            const managerName = COLUMN_MAP.manager(r);
            if (!managerName) return false;
            // фильтруем по выбранному каналу
            if (filters.mapChannel) {
              return managerName.startsWith(filters.mapChannel);
            }
            return true;
          }
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
        // убираем повторяющиеся значения
        .filter((v, i, a) => a.findIndex(x => x === v) === i)
        .map(title => ({ title, color: colorsGenerated[title] }));

      setLegends(legends);
    };

    // Вызовы
    generateLegends("Distributor", "DistributorLayer", setDistributorLegends);
    generateLegends("Region / HSR", "HSRLayer", setHSRLegends);
    generateLegends("Manager", "ManagerLayer", setManagerLegends);
    generateLegends("Territory", "TerritoryLayer", setTerritoryLegends);


  }, [excelData, selectedRegionView, selectedLayers, filters.region, filters.hsr, filters.mapChannel]);

   const COLUMN_MAP = {
      // Названия регионов/областей
      region: r => pick(
        r,
        "Область",      // новая таблица
        "District",     // старая таблица
        "Регион"        // возможные вариации
      ),

      // Дистрибьюторы
      distributor: r => pick(
        r,
        "Дистр",        // новая таблица
        "Дистр(?)",     // старая таблица
        "Distributor"   // англ. вариант
      ),

      // Верхний уровень (HSR или позиция менеджера)
      hsr: r => pick(
        r,
        "Region / HSR",     // старая таблица
      ),

      // Менеджер/руководитель
      manager: r => pick(
        r,
        "Позиция менеджера",         // старая таблица
        "Manager",
      ),

      // Территория под менеджером
      territory: r => pick(
        r,
        "Позиция сотрудника", // новая таблица
        "Territory",          // старая таблица
        "Территория"          // альтернативное название
      ),

    };

const handleRegionClick = (feature) => {
  const regionName = feature.properties.shapeName;
  const layerRegions = resolveRegionSynonyms(regionName);

  const rows = excelData.filter(r => {
    const excelRegions = resolveRegionSynonyms(COLUMN_MAP.region(r));

    const regionMatch = excelRegions.some(er =>
      layerRegions.includes(er)
    );

    if (!regionMatch) return false;

    // 👇 фильтр по каналу
    if (filters.mapChannel) {
      const managerName = COLUMN_MAP.manager(r) || "";
      return managerName.startsWith(filters.mapChannel);
    }

    return true;
  });

  setClickedRegionData({
    region: regionName,
    hsr: [...new Set(rows.map(r => COLUMN_MAP.hsr(r)).filter(Boolean))],
    managers: [...new Set(rows.map(r => COLUMN_MAP.manager(r)).filter(Boolean))],
    territories: [...new Set(rows.map(r => COLUMN_MAP.territory(r)).filter(Boolean))],
    distributors: [...new Set(rows.map(r => COLUMN_MAP.distributor(r)).filter(Boolean))]
  });

  setModalClickedOpen(true);
};


  return (
    <>
      <MapContainer center={[61, 105]} zoom={3} style={{ height: "100vh", width: "100%" }} className="map">
        {styleMap && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}

        {geoData && (
          <>
            {visibleGeoData && (
              <GeoJSON
                key={JSON.stringify(regionsByArea)}
                ref={geoJsonRef}
                data={visibleGeoData}
                onEachFeature={(feature, layer) => {
                  const name = feature.properties.shapeName;

                  layer.bindTooltip(name);

                  layer.on({
                    click: (e) => {
                      console.log("Клик по региону:", name);
                      handleRegionClick(feature); // твоя функция
                    }
                  });
                }}
              />
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
        {modalClickedOpen && (
          <ModalClicked
            onClose={() => setModalClickedOpen(false)}
            data={clickedRegionData}
          />
        )}
      </>
    </>
  );
}
