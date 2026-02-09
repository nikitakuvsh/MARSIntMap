import React from "react";

export default function FiltersChannels({ filters, setFilters }) {
  const options = ["RADM", "TDM", "DDM"];

  return (
    <div className="filters__group">
      <label className="filters__label">Выберите канал</label>
      <select
        className="filters__select"
        value={filters.mapChannel || ""}
        onChange={(e) => setFilters({ ...filters, mapChannel: e.target.value })}
      >
        <option value="">-.-</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
