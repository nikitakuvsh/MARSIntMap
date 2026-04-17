import React from "react";

export default function FiltersGeneralSalesChannels({ filters, setFilters }) {
  const options = ["RKA", "Distr trade", "Execution", "Merch-model SO"];

  return (
    <div className="filters__group">
      <label className="filters__label">Выбрать общий канал продаж</label>
      <select
        className="filters__select"
        value={filters.generalSalesChannel || ""}
        onChange={(e) => setFilters({ ...filters, generalSalesChannel: e.target.value })}
      >
        <option value="">-.-</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
