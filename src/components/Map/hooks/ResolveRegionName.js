import regionsByArea from "../RegionsData";
import regionSynonyms from "../RegionsDataSynomys";

// ---------------------
// Нормализация текста
// ---------------------
const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[-—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ---------------------
// Основная функция резолва
// ---------------------
export const resolveRegionName = (excelValue) => {
  const n = normalize(excelValue);

  // 1. Синонимы
  if (regionSynonyms[n]) return regionSynonyms[n];

  // 2. Частичное совпадение с официальными
  for (const areas of Object.values(regionsByArea)) {
    for (const official of areas) {
      if (normalize(official).includes(n)) return [official];
    }
  }

  

  // 3. Если ничего не найдено — вернуть оригинал как fallback
  return [excelValue];
};
