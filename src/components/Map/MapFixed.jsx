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
import ButtonHeatMap from "../ButtonHeatMap/ButtonHeatMap";
import { resolveRegionName } from "./hooks/ResolveRegionName";
import L from "leaflet";
import regionSynonyms from "./RegionsDataSynomys";
import * as turf from "@turf/turf";
import HeatLegends from "./HeatLegends/HeatLegends";
import ModalMessage from "../ModalMessage/ModalMessage";

export default function MapLeaflet({ selectedRegion, setSelectedRegion, selectedRegionView = [], setSelectedRegionView, excelData = [], mapDataColumn = null, mapDataColumnValues = [], regionsByArea, setRegionsData, filters, setHeaderRange, headerRange }) {
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
  const hsrPatterns = {};
  const [visibleGeoData, setVisibleGeoData] = useState(null);
  const geoJsonRef = useRef(null);
  const [styleMap, setStyleMap] = useState(true);
  const colorsRef = useRef({});
  const [hsrMarkers, setHsrMarkers] = useState([]);
  const [regionsEditorModalOpen, setRegionsEditorModalOpen] = useState(false);
  const [modalClickedOpen, setModalClickedOpen] = useState(true);
  const [clickedRegionData, setClickedRegionData] = useState(null);
  const [heatMapOn, setHeatMapOn] = useState(false);
  const [heatLegendValues, setHeatLegendValues] = useState({ min: 0, avg: 0, max: 0 });


  const parseNumber = (val) => {
    if (val === null || val === undefined || val === "") return 0;

    return parseFloat(
      val.toString().replace(/\s/g, '').replace(',', '.')
    ) || 0;
  };

function getChannelAvgsFromData(excelData) {
  if (!excelData?.length) return {};

  // Найдём первую строку, где есть RKA avg (или любая другая колонка с avg)
  const avgRow = excelData.find(row => "RKA avg" in row);
  if (!avgRow) return {};

  const columns = [
    "RKA avg",
    "Non-Skyline avg",
    "Skyline avg",
    "SO NA (w/o Chizhik) avg",
    "SO RKA (execution) avg",
    "Merch-model SO avg",
    "NA Leading avg",
    "RKA Leading avg"
  ];

  const CHANNEL_AVGS = {};

  columns.forEach(col => {
    let val = avgRow[col];
    if (typeof val === "string") {
      val = parseFloat(val.replace(/\s/g, "").replace(",", ".")) || 0;
    }
    CHANNEL_AVGS[col] = val ?? 0;
  });

  return CHANNEL_AVGS;
}

const CHANNEL_AVGS = getChannelAvgsFromData(excelData);

console.log("CHANNEL_AVGS =", CHANNEL_AVGS);
console.log("headerRange", headerRange);

  const getHeatColor = (value, avg) => {
    const ratio = value / avg;

    if (ratio >= 1.5) return "rgba(0,200,0,0.85)";       // высокий — зеленый, насыщенный но не кислотный
    if (ratio >= 1) return "rgba(0,120,255,0.85)";     // средний — приятный синий
    if (ratio >= 0.5) return "rgba(255,200,0,0.85)";     // низкий — мягкий жёлтый
    return "rgba(200,0,0,0.85)";                         // очень низкий — мягкий красный
  };

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
          console.log('COLOR', layer.feature, color);
          const poly = L.polygon(leafletCoords, { fillColor: color, color: color, weight, fillOpacity: 1 }).addTo(layer._map);
          poly.on("click", () => {
            console.log("Клик по кастомному региону 2");
            handleRegionClick(layer.feature);
          })
          if (!layer._tempPolygons) layer._tempPolygons = [];
          layer._tempPolygons.push(poly);
        });
      });
    };

    geoJsonRef.current.eachLayer(layer => {
      const name = layer.feature?.properties?.shapeName;
      if (!name) return;

      const layerRegions = resolveRegionSynonyms(name);
      const rows = excelData.filter(r => {
        const excelRegions = resolveRegionSynonyms(COLUMN_MAP.region(r));
        return excelRegions.some(er => layerRegions.includes(er));
      });

      if (!rows.length) return;
      if (heatMapOn) {
        if (layer._tempPolygons) layer._tempPolygons.forEach(p => p.remove());
      layer._tempPolygons = [];

      if (!layer.feature || !layer.feature.geometry) return;
        const channel = filters.salesChannel || "RKA"; // выбранный канал

        // формируем columnNames для выбранного канала
        let columnNames = [];
          switch (channel) {
            case "Non-Skyline":
              columnNames = ["Non-Skyline"];
              break;
            case "Skyline":
              columnNames = ["Skyline"];
              break;
            case "SO NA (w/o Chizhik)":
              columnNames = ["SO NA (w/o Chizhik)"]
              break;
            case "SO RKA (execution)":
              columnNames = ["SO RKA (execution)"];
              break;
            case "RKA":
              columnNames = ["RKA"];
              break;
            case "Merch-model SO":
              columnNames = ["Merch-model SO"];
              break;
            case "NA Leading":
              columnNames = ["NA Leading"];
              break;
            case "RKA Leading":
              columnNames = ["RKA Leading"];
              break;
            default:
              columnNames = [];
          }

        // totalValue для цвета
        console.log("ROW SAMPLE", rows[0]);
        console.log("VALUE", rows[0]?.["SO NA (w/o Chizhik)"]);
        const totalValue = rows.reduce((sum, r) => {
          const rowSum = columnNames.reduce((s, col) => {
            // const val = parseFloat(r[col]?.toString().replace(/,/g, '')) || 0;
            const val = parseNumber(r[col]);
            return s + val;
          }, 0);
          return sum + rowSum;
        }, 0);

        console.log("total Value = ", totalValue);

        // собираем все ненулевые значения для легенды
        const allValues = rows.flatMap(r =>
          columnNames.map(col => parseNumber(r[col]) || 0)
        ).filter(v => v > 0); // фильтруем нули

        const allValuesGlobal = excelData.flatMap(r=> columnNames.map(col => parseNumber(r[col]))).filter(v => v > 0);

        // если есть ненулевые значения, считаем min/avg/max, иначе 0
        const min = allValuesGlobal.length ? Math.min(...allValuesGlobal) : 0;
        const max = allValuesGlobal.length ? Math.max(...allValuesGlobal) : 0;
        const avg = allValuesGlobal.length ? allValuesGlobal.reduce((s,v) => s + v, 0) / allValuesGlobal.length : 0;

        // передаем в легенду
        setHeatLegendValues({ min, avg, max });

        // цвет для полигона
        const avgKey = channel + " avg";
        const avgChannel = CHANNEL_AVGS[avgKey] || 1;
        if (totalValue > 0) {
          const color = getHeatColor(totalValue, avgChannel);
          drawPolygonFeature(layer, layer.feature, color);
        }
        // иначе ничего не делаем
        return;
      }

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
          const byMapChannel = !filters.mapChannel || managerName.startsWith(filters.mapChannel);
          const byFiltersManager = !filters.manager?.length || filters.manager.includes(managerName);
          return byMapChannel && byFiltersManager;
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

          // Рисуем менеджера
          drawPolygonFeature(layer, managerFeature, managerColors[idx]);

          // === Territory внутри менеджера с фильтрацией ===
          if (selectedLayers.includes("TerritoryLayer")) {
            // Фильтруем строки, чтобы оставить только текущего менеджера и выбранные территории
            const territoryRows = managerRowsFiltered.filter(r => {
              const territoryRaw = COLUMN_MAP.territory(r);
              const territoryName = territoryRaw ? String(territoryRaw) : "";

              const byFiltersTerritory = !filters.territory?.length || filters.territory.includes(territoryName);

              return COLUMN_MAP.manager(r) === m && byFiltersTerritory;
            });

            const territories = [...new Set(territoryRows.map(r => COLUMN_MAP.territory(r)).filter(Boolean))];
            if (!territories.length) return;

            const territoryColors = territories.map(t => {
              if (!colorsGenerated[t])
                colorsGenerated[t] = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
              return colorsGenerated[t];
            });

            console.log('territoryColors = ', territoryColors);

            // Масштабируем Territory сильнее, чем менеджера
            const territoryFeatureScaled = safeScale(managerFeature, 0.8);

            const territoryFeatures = territories.length === 1
              ? [territoryFeatureScaled]
              : drawSplitNReturnFeatures(territoryFeatureScaled, territoryColors);

            territoryFeatures.forEach((feat, tIdx) => {
              const color = territoryColors[tIdx % territoryColors.length];
              drawPolygonFeature(layer, feat, color);
            });
          }
        });

        // Скрываем исходный полигон
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
            const managerRaw = COLUMN_MAP.manager(r);
            const managerName = managerRaw ? String(managerRaw) : "";

            // фильтруем по каналу и выбранным менеджерам
            const byMapChannel = !filters.mapChannel || managerName.startsWith(filters.mapChannel);
            const byFiltersManager = !filters.manager?.length || filters.manager.includes(managerName);
            const territoryRaw = COLUMN_MAP.territory(r);
            const territoryName = territoryRaw ? String(territoryRaw) : "";
            const byFiltersTerritory = selected === "TerritoryLayer"
              ? !filters.territory?.length || filters.territory.includes(territoryName)
              : true;

            return byMapChannel && byFiltersManager && byFiltersTerritory;
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


  }, [excelData, selectedRegionView, selectedLayers, filters.region, filters.hsr, filters.mapChannel, filters.manager, filters.territory, filters.salesChannel, heatMapOn]);

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

  // 🔹 Фильтруем строки по региону и фильтрам
  const rows = excelData.filter(r => {
    const excelRegions = resolveRegionSynonyms(COLUMN_MAP.region(r));
    const regionMatch = excelRegions.some(er => layerRegions.includes(er));
    if (!regionMatch) return false;

    if (filters.mapChannel) {
      const managerName = COLUMN_MAP.manager(r) || "";
      if (!managerName.startsWith(filters.mapChannel)) return false;
    }

    if (filters.hsr?.length && !filters.hsr.includes(COLUMN_MAP.hsr(r))) return false;
    if (filters.manager?.length && !filters.manager.includes(COLUMN_MAP.manager(r))) return false;
    if (filters.territory?.length && !filters.territory.includes(COLUMN_MAP.territory(r))) return false;
    if (filters.distributor?.length && !filters.distributor.includes(COLUMN_MAP.distributor(r))) return false;

    return true;
  });

  // 🔹 Выбираем колонны для выбранного канала
  const channel = filters.salesChannel || "RKA";
  let columnNames = [];
  switch (channel) {
    case "Non-Skyline": columnNames = ["Non-Skyline"]; break;
    case "Skyline": columnNames = ["Skyline"]; break;
    case "SO NA (w/o Chizhik)": columnNames = ["SO NA (w/o Chizhik)"]; break;
    case "SO RKA (execution)": columnNames = ["SO RKA (execution)"]; break;
    case "RKA": columnNames = ["RKA"]; break;
    case "Merch-model SO": columnNames = ["Merch-model SO"]; break;
    case "NA Leading": columnNames = ["NA Leading"]; break;
    case "RKA Leading": columnNames = ["RKA Leading"]; break;
    default: columnNames = [];
  }

  // 🔹 Сумма по выбранным фильтрам
  const total = rows.reduce((sum, r) => {
    return sum + columnNames.reduce((s, col) => s + (parseNumber(r[col]) || 0), 0);
  }, 0);

  // 🔹 Среднее берём из CHANNEL_AVGS
  const avgKey = channel + " avg";
  const avg = CHANNEL_AVGS[avgKey] ?? 0;

  // 🔹 Формируем объект для модалки
  const regionData = {
    region: regionName,
    hsr: [...new Set(rows.map(r => COLUMN_MAP.hsr(r)).filter(Boolean))],
    managers: [...new Set(rows.map(r => COLUMN_MAP.manager(r)).filter(Boolean))],
    territories: [...new Set(rows.map(r => COLUMN_MAP.territory(r)).filter(Boolean))],
    distributors: [...new Set(rows.map(r => COLUMN_MAP.distributor(r)).filter(Boolean))]
  };

  // Добавляем total и avg только если total больше 0
  if (total > 0) {
    regionData.total = total;
    regionData.avg = avg;
  }

  setClickedRegionData(regionData);
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
                      handleRegionClick(feature);
                    }
                  });
                }}
              />
            )}

            <ZoomToRegion geoData={geoData} selectedRegion={selectedRegion} />
          </>
        )}


        <ButtonThemeColor />
        <ButtonHeatMap heatOn={heatMapOn} setHeatOn={() => {setHeatMapOn(prev => !prev); if (!heatMapOn) setModalMessageVisible(true);}} />
        <ButtonLayers excelData={excelData} distributorLegends={distributorLegends} setDistributorLegends={setDistributorLegends} selectedLayers={selectedLayers} setSelectedLayers={setSelectedLayers} setHSRLegends={setHSRLegends} setManagerLegends={setManagerLegends} setTerritoryLegends={setTerritoryLegends} />
        {!heatMapOn && (<MapLegends distributorLegends={distributorLegends} hsrLegends={hsrLegends} managerLegends={managerLegends} territoryLegends={territoryLegends} />)}
        {heatMapOn && (<HeatLegends min={heatLegendValues.min} avg={heatLegendValues.avg} max={heatLegendValues.max} />)}
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
            filters={filters}
          />
        )}
        {modalMessageVisible && (
          <ModalMessage message={'Не забудьте выключить все слои для корректного отображения'} isError={false} onClose={() => setModalMessageVisible(false)} messageError={''} />
        )}
      </>
    </>
  );
}
