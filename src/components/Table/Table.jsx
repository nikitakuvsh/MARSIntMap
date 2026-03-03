import React, { useMemo, useEffect } from "react";
import "./Table.css";
import regionSynonyms from "../Map/RegionsDataSynomys";

export default function Table({
  excelData = [],
  filters = {},
  setTableValues,
  selectedRegionView = []
}) {

  /* ================================
     🔹 Функция для синонимов
  ================================= */
  const resolveRegionSynonyms = (region) => {
    if (!region) return [];
    const key = String(region).toLowerCase();
    return regionSynonyms[key] || [region];
  };

  /* ================================
     🔹 Парсер чисел
  ================================= */
  const parseNumber = (value) => {
    if (!value || value === "-") return 0;
    return Number(String(value).replace(/\s/g, "").replace(",", ".")) || 0;
  };

  /* ================================
     🔹 Подготовка разрешённых регионов
  ================================= */
  const allowedRegions = useMemo(() => {
    if (!selectedRegionView?.length) return null;

    const resolved = selectedRegionView.flatMap(region =>
      resolveRegionSynonyms(region)
    );

    console.log("selectedRegionView:", selectedRegionView);
    console.log("allowedRegions (resolved синонимы):", resolved);

    return resolved;
  }, [selectedRegionView]);

  /* ================================
     🔹 Фильтрация данных
  ================================= */
  /* ================================
   🔹 Фильтрация данных
================================ */
const filteredData = useMemo(() => {
  return excelData.filter(row => {

    // Фильтры из панели
    if (filters.region?.length &&
        !filters.region.includes(row["Region / HSR"])) {
      return false;
    }

    if (filters.manager?.length &&
        !filters.manager.includes(row["Manager"])) {
      return false;
    }

    if (filters.territory?.length &&
        !filters.territory.includes(row["Territory"])) {
      return false;
    }

    if (filters.distributor?.length &&
        !filters.distributor.includes(row["Distributor"])) {
      return false;
    }

    // 🔹 Фильтр по выбранным регионам карты с учётом синонимов
    if (allowedRegions) {
      const rowDistrict = row["District"];
      const rowResolved = resolveRegionSynonyms(rowDistrict);
      const matches = rowResolved.some(d => allowedRegions.includes(d));

      if (!matches) return false;
    }

    return true;
  });
}, [excelData, filters, allowedRegions]);

  /* ================================
     🔹 Подсчёт каналов
  ================================= */
  const calculateChannelTotal = (data, channel) => {
    if (!data.length) return 0;

    let columnNames = [];

    switch (channel) {
      case "Не Skyline":
        columnNames = ["Grocery Tier 1-2", "SPT Tier 1-2", "E-com Tier 1-2"];
        break;
      case "Skyline":
        columnNames = [
            "Grocery Tier 3", 
            "Other SS", 
            "Other SPT", 
            "Other E-com", 
            "BTC", 
            "Опт"
        ];
        break;
      case "Конкретная территория":
        columnNames = [
          "Продажи 5-ka (SO)",
          "Продажи Magnit (SO)",
          "Продажи прочих NA c SO (без Чижика!)",
          "Продажи Чижик по SO",
          "Продажи RKA c SO",
          "Продажи в Merch-model (covered)",
          "# of 5-ka offices",
          "# of Magnit offices"
        ];
        break;
      case "лидирование в регионе":
        columnNames = [
          "Продажи 5-ka (SO) l",
          "Продажи Magnit (SO) l",
          "Продажи прочих NA c SO"
        ];
        break;

      case "RKADM":
        columnNames = [
            "Продажи RKA Tier 1-2",
            "Продажи прочих RKA",
            "5ка (Калининград)",
            "Metro (Калининград)",
            "Зооопторг"
        ];
        break;
      default:
        return 0;
    }

    return data.reduce((total, row) => {
      const rowSum = columnNames.reduce((sum, col) => {
        if (!Object.prototype.hasOwnProperty.call(row, col)) return sum;
        return sum + parseNumber(row[col]);
      }, 0);

      return total + rowSum;
    }, 0);
  };

  /* ================================
     🔹 Итоговые значения
  ================================= */
  const totals = useMemo(() => {
    return {
      "RKADM млн.": calculateChannelTotal(filteredData, "RKADM") / 1_000_000,
      "Не Skyline млн.": calculateChannelTotal(filteredData, "Не Skyline") / 1_000_000,
      "Skyline млн.": calculateChannelTotal(filteredData, "Skyline") / 1_000_000,
      "Конкретная территория млн.": calculateChannelTotal(filteredData, "Конкретная территория") / 1_000_000,
      "лидирование в регионе млн.": calculateChannelTotal(filteredData, "лидирование в регионе") / 1_000_000
    };
  }, [filteredData]);

  /* ================================
     🔹 Передача наружу
  ================================= */
  useEffect(() => {
    if (setTableValues) setTableValues(totals);
  }, [totals, setTableValues]);

  const channelsToShow = filters.salesChannel ? [filters.salesChannel] : Object.keys(totals);

  /* ================================
     🔹 Render
  ================================= */
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            {channelsToShow.map(channel => <th key={channel}>{channel}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {channelsToShow.map(channel => (
              <td key={channel}>{totals[channel]?.toLocaleString("ru-RU")}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}