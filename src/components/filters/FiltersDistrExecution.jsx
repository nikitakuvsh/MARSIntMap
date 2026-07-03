import React from "react";

export default function FiltersDistrExecution({ filters, setFilters }) {
  const options = ["Distr trade", "Execution"];

  return (
    <div className="filters__group">
      <label className="filters__label">Sales Channel Distr/Execution</label>

      <select
        className="filters__select"
        value={filters.distrExecution || ""}
        onChange={(e) =>
          setFilters({
            ...filters,
            distrExecution: e.target.value,
          })
        }
      >
        <option value="">Все</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}