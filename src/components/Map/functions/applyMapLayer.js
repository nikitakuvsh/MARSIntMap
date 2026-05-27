import { COLUMN_MAP } from "./columnMap";
import { CHANNEL_GROUPS } from "./channelGroups";
import { resolveRegionSynonyms } from "./resolveRegionSynonyms";

const getColor = (entity, colorsGenerated) => {
  if (!entity) return null;

  if (!colorsGenerated[entity]) {
    colorsGenerated[entity] =
      "#" + Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
  }

  return colorsGenerated[entity];
};

export const applyMapLayers = ({
  geoJsonRef,
  excelData,
  selectedRegionView,
  selectedLayers,
  filters,
  colorsGenerated,
  handleRegionClick
}) => {

  const geoLayer = geoJsonRef.current;

  if (!geoLayer || !excelData?.length) return;

  geoLayer.eachLayer(layer => {

    const feature = layer.feature;
    if (!feature?.properties) return;

    const name = feature.properties.shapeName;
    if (!name) return;

    const layerRegions = resolveRegionSynonyms(name);

    const rows = excelData.filter(r => {

      const regionValue = COLUMN_MAP.region?.(r);
      if (!regionValue) return false;

      const excelRegions = resolveRegionSynonyms(regionValue);

      const regionMatch = excelRegions.some(er =>
        layerRegions.includes(er)
      );

      if (!regionMatch) return false;

      const managerName = COLUMN_MAP.manager?.(r) || "";

      const allowedChannels =
        CHANNEL_GROUPS[filters.mapChannel] ||
        [filters.mapChannel];

      const byChannel =
        !filters.mapChannel ||
        allowedChannels.some(ch =>
          managerName.startsWith(ch)
        );

      return byChannel;
    });

    if (!rows.length) {
      layer.setStyle({
        fillColor: "#ccc",
        fillOpacity: 0.2,
        color: "#666",
        weight: 1
      });
      return;
    }

    const isSelected =
      selectedRegionView?.length === 0 ||
      layerRegions.some(r =>
        selectedRegionView.includes(r)
      );

    if (!isSelected) {
      layer.setStyle({
        fillColor: "#eee",
        fillOpacity: 0.1,
        color: "#999",
        weight: 1
      });
      return;
    }

    const drawBy = (layerKey, getter, filterKey) => {

      if (!selectedLayers?.includes(layerKey)) return false;

      const values = rows
        .map(getter)
        .filter(Boolean);

      if (!values.length) return false;

      const unique = [...new Set(values)];

      const color = getColor(unique[0], colorsGenerated);

      layer.setStyle({
        fillColor: color,
        fillOpacity: 0.6,
        color: "#333",
        weight: 1
      });

      return true;
    };

    const territory = drawBy("Territory", COLUMN_MAP.territory, "territory");
    if (territory) return;

    const manager = drawBy("Manager", COLUMN_MAP.manager, "manager");
    if (manager) return;

    drawBy("HSR", COLUMN_MAP.hsr, "hsr");

  });
};