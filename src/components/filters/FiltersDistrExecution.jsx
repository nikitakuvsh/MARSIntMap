import React from "react";

export default function FiltersDistrExecution({ filters, setFilters }) {
  const options = ["Distr trade", "Execution", "RKA"];

  return (
    <div className="filters__group">
      <label className="filters__label">
        Sales Channel Distr/Execution
      </label>

      <select
        className="filters__select"
        value={filters.distrExecution || ""}
        onChange={(e) => {
          const distrExecution = e.target.value;

          const channelMap = {
            RKA: ["RKA"],
            Execution: ["Merch-model SO"],
            "Distr trade": ["Distr trade"]
          };

          setFilters({
            ...filters,
            distrExecution,
            generalSalesChannel: channelMap[distrExecution] || []
          });
        }}
      >
        <option value="">Все</option>

        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}