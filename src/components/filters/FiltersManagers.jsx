import React, { useEffect, useState } from "react";

export default function FiltersManagers({ excelData = [], filter, setFilters }) {
    const [managersForHSR, setManagersForHSR] = useState([]);
    const [territoriesForManager, setTerritoriesForManager] = useState([]);
    const [distributorsForTerritory, setDistributorsForTerritory] = useState([]);
    const safeFilter = {
    region: filter.region || [],
    manager: filter.manager || [],
    territory: filter.territory || [],
    distributor: filter.distributor || []
    };
    
    


    // ===== MANAGERS =====
    useEffect(() => {
        if (!safeFilter.region.length) {
            setManagersForHSR([]);
            setTerritoriesForManager([]);
            setDistributorsForTerritory([]);
            setFilters({ ...filter, manager: [], territory: [], distributor: [] });
            return;
        }

        const managers = [
            ...new Set(
                excelData
                    .filter(row => filter.region.includes(row["Region / HSR"]))
                    .map(row => row["Manager"])
                    .filter(Boolean)
            ),
        ];

        setManagersForHSR(managers);

        setFilters(f => ({
            ...f,
            manager: f.manager.filter(m => managers.includes(m)),
        }));
    }, [filter.region]);

    // ===== TERRITORY =====
    useEffect(() => {
        if (!safeFilter.manager.length) {
            setTerritoriesForManager([]);
            setDistributorsForTerritory([]);
            return;
        }

        const territories = [
            ...new Set(
                excelData
                    .filter(row => filter.manager.includes(row["Manager"]))
                    .map(row => row["Territory"])
                    .filter(Boolean)
            ),
        ];

        setTerritoriesForManager(territories);

        setFilters(f => ({
            ...f,
            territory: f.territory.filter(t => territories.includes(t)),
        }));
    }, [filter.manager]);

    // ===== DISTRIBUTOR =====
    useEffect(() => {
        if (!safeFilter.territory.length) {
            setDistributorsForTerritory([]);
            return;
        }

        const distributors = [
            ...new Set(
                excelData
                    .filter(row => filter.territory.includes(row["Territory"]))
                    .map(row => row["Distributor"])
                    .filter(Boolean)
            ),
        ];

        setDistributorsForTerritory(distributors);

        setFilters(f => ({
            ...f,
            distributor: f.distributor.filter(d => distributors.includes(d)),
        }));
    }, [filter.territory]);

    const toggleValue = (key, value) => {
        const updated = filter[key].includes(value)
            ? filter[key].filter(v => v !== value)
            : [...filter[key], value];

        setFilters({ ...filter, [key]: updated });
    };

    return (
        <>
            {/* MANAGER */}
            <div className="filters__group">
                <label className="filters__label">Manager</label>
                <div className="checkbox-list">
                    {managersForHSR.map(m => (
                        <label key={m} className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={filter.manager.includes(m)}
                                onChange={() => toggleValue("manager", m)}
                            />
                            {m}
                        </label>
                    ))}
                </div>
            </div>

            {/* TERRITORY */}
            <div className="filters__group">
                <label className="filters__label">Territory</label>
                <div className="checkbox-list">
                    {territoriesForManager.map(t => (
                        <label key={t} className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={filter.territory.includes(t)}
                                onChange={() => toggleValue("territory", t)}
                            />
                            {t}
                        </label>
                    ))}
                </div>
            </div>

            {/* DISTRIBUTOR */}
            <div className="filters__group">
                <label className="filters__label">Distributor</label>
                <div className="checkbox-list">
                    {distributorsForTerritory.map(d => (
                        <label key={d} className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={filter.distributor.includes(d)}
                                onChange={() => toggleValue("distributor", d)}
                            />
                            {d}
                        </label>
                    ))}
                </div>
            </div>
        </>
    );
}
