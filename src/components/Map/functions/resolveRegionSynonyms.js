import regionSynonyms from "../RegionsDataSynomys";

export const resolveRegionSynonyms = (region) => {
  if (!region) return [];

  const key = String(region).toLowerCase();

  return regionSynonyms[key] || [region];
};