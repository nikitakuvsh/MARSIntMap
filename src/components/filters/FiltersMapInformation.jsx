import React from "react";

export default function FiltersMapInformation({ filters, setFilters, tableValues }) {
  // Если tableValues ещё пустой, выводим все колонки
  const columns = tableValues ? Object.keys(tableValues) : [];

  return (
    <div className="filters__group">
      <label className="filters__label">Выберите данные для карты</label>
      <select
        className="filters__select"
        value={filters.mapDataColumn || ""}
        onChange={(e) => setFilters({ ...filters, mapDataColumn: e.target.value })}
      >
        <option value="">-.-</option>
        {columns.map(col => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
    </div>
  );
}
