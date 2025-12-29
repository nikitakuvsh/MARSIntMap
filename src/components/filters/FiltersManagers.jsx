import React, { useEffect, useState } from "react";

export default function FiltersManagers({ excelData = [], filter, setFilters }) {
  const [managersForHSR, setManagersForHSR] = useState([]);
  const [territoriesForManager, setTerritoriesForManager] = useState([]);
  const [distributorsForTerritory, setDistributorsForTerritory] = useState([]);

  // ===== MANAGER =====
  useEffect(() => {
    if (!filter.region) {
      setManagersForHSR([]);
      setTerritoriesForManager([]);
      setDistributorsForTerritory([]);
      setFilters({ ...filter, manager: "", territory: "", distributor: "" });
      return;
    }

    const managers = [
      ...new Set(
        excelData
          .filter(row => row["Region / HSR"] === filter.region)
          .map(row => row["Manager"])
          .filter(Boolean)
      ),
    ];

    setManagersForHSR(managers);

    if (managers.length === 1) {
      setFilters(f => ({ ...f, manager: managers[0] }));
    }
  }, [filter.region, excelData]);

  // ===== TERRITORY =====
  useEffect(() => {
    if (!filter.manager) return;

    const isAllManagers = filter.manager === "Total";

    const territories = [
      ...new Set(
        excelData
          .filter(row =>
            isAllManagers
              ? row["Region / HSR"] === filter.region
              : row["Manager"] === filter.manager
          )
          .map(row => row["Territory"])
          .filter(Boolean)
      ),
    ];

    setTerritoriesForManager(territories);

    if (territories.length === 1) {
      setFilters(f => ({ ...f, territory: territories[0] }));
    }
  }, [filter.manager, filter.region, excelData]);

  // ===== DISTRIBUTOR =====
  useEffect(() => {
    if (!filter.territory) return;

    const isAllManagers = filter.manager === "Total";
    const isAllTerritories = filter.territory === "Total";

    const distributors = [
      ...new Set(
        excelData
          .filter(row => {
            if (!isAllManagers && row["Manager"] !== filter.manager) return false;
            if (!isAllTerritories && row["Territory"] !== filter.territory) return false;
            return true;
          })
          .map(row => row["Distributor"])
          .filter(Boolean)
      ),
    ];

    setDistributorsForTerritory(distributors);

    if (distributors.length === 1) {
      setFilters(f => ({ ...f, distributor: distributors[0] }));
    }
  }, [filter.manager, filter.territory, excelData]);

  return (
    <>
      {/* MANAGER */}
      {managersForHSR.length > 0 && (
        <div className="filters__group">
          <label className="filters__label">Выбор Manager</label>
          <select
            className="filters__select"
            value={filter.manager || ""}
            onChange={(e) =>
              setFilters({
                ...filter,
                manager: e.target.value,
                territory: "",
                distributor: "",
              })
            }
          >
            <option value="">-.-</option>
            {managersForHSR.length > 1 && <option value="Total">Total</option>}
            {managersForHSR.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      {/* TERRITORY */}
      {territoriesForManager.length > 0 && (
        <div className="filters__group">
          <label className="filters__label">Выбор Territory</label>
          <select
            className="filters__select"
            value={filter.territory || ""}
            onChange={(e) =>
              setFilters({
                ...filter,
                territory: e.target.value,
                distributor: "",
              })
            }
          >
            <option value="">-.-</option>
            {territoriesForManager.length > 1 && <option value="Total">Total</option>}
            {territoriesForManager.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* DISTRIBUTOR */}
      {distributorsForTerritory.length > 0 && (
        <div className="filters__group">
          <label className="filters__label">Выбор Distributor</label>
          <select
            className="filters__select"
            value={filter.distributor || ""}
            onChange={(e) =>
              setFilters({ ...filter, distributor: e.target.value })
            }
          >
            <option value="">-.-</option>
            {distributorsForTerritory.length > 1 && <option value="Total">Total</option>}
            {distributorsForTerritory.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
