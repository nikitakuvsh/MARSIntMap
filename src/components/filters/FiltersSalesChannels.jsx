import React from "react";

export default function FiltersSalesChannels({ filters, setFilters }) {
  const options = ["RKADM", "Не Skyline", "Skyline", "Конкретная территория", "лидирование в регионе"];

  return (
    <div className="filters__group">
      <label className="filters__label">Выберите канал продаж</label>
      <select
        className="filters__select"
        value={filters.salesChannel || ""}
        onChange={(e) => setFilters({ ...filters, salesChannel: e.target.value })}
      >
        <option value="">-.-</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
