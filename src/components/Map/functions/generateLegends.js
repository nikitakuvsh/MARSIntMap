import { COLUMN_MAP } from "./columnMap";
import { CHANNEL_GROUPS } from "./channelGroups";

export const generateLegends = ({
  excelData,
  selectedLayers,
  selected,
  key,
  filters,
  colorsGenerated,
  rowInActiveRegion
}) => {
  if (!selectedLayers.includes(selected)) {
    return [];
  }

  return excelData
    .filter(rowInActiveRegion)
    .filter(r => {
      const managerName = COLUMN_MAP.manager(r) || "";

      const allowedChannels =
        CHANNEL_GROUPS[filters.mapChannel] || [filters.mapChannel];

      const byMapChannel =
        !filters.mapChannel ||
        allowedChannels.some(ch => managerName.startsWith(ch));

      const byFiltersManager =
        !filters.manager?.length ||
        filters.manager.includes(managerName);

      const territoryName = COLUMN_MAP.territory(r) || "";

      const byFiltersTerritory =
        selected === "TerritoryLayer"
          ? !filters.territory?.length ||
          filters.territory.includes(territoryName)
          : true;

      return (
        byMapChannel &&
        byFiltersManager &&
        byFiltersTerritory
      );
    })
    .map(r => {
      if (key === "HSR") return COLUMN_MAP.hsr(r);
      if (key === "Manager") return COLUMN_MAP.manager(r);
      if (key === "Territory") return COLUMN_MAP.territory(r);

      return null;
    })
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex(x => x === v) === i)
    .map(title => ({
      title,
      color: colorsGenerated[title]
    }));
};