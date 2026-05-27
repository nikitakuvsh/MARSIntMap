import React, { useEffect, useState, useMemo } from "react";

export default function FiltersManagers({ excelData = [], filter = {}, setFilters }) {
  const [managersForHSR, setManagersForHSR] = useState([]);
  const [territoriesForManager, setTerritoriesForManager] = useState([]);
  const [distributorsForTerritory, setDistributorsForTerritory] = useState([]);

  // Мемоизируем безопасный фильтр, чтобы ссылка не менялась каждый рендер
  const safeFilter = useMemo(() => ({
    region: Array.isArray(filter.region) ? filter.region : [],
    manager: Array.isArray(filter.manager) ? filter.manager : [],
    territory: Array.isArray(filter.territory) ? filter.territory : [],
    distributor: Array.isArray(filter.distributor) ? filter.distributor : []
  }), [filter]);

  // ===== MANAGERS =====
  useEffect(() => {
    const managers = [
      ...new Set(
        excelData
          .filter(row => !safeFilter.region.length || safeFilter.region.includes(row["Region / HSR"]))
          .map(row => row["Manager", "Позиция менеджера"])
          .filter(Boolean)
      )
    ];

    setManagersForHSR(managers);

    // Обновляем фильтр только если есть изменения
    setFilters(prev => {
      const newManagers = (prev.manager || []).filter(m => managers.includes(m));
      if (JSON.stringify(newManagers) !== JSON.stringify(prev.manager)) {
        return { ...prev, manager: newManagers };
      }
      return prev;
    });
  }, [excelData, safeFilter.region, setFilters]);

 // ===== TERRITORY =====
useEffect(() => {
  // Фильтруем по выбранным регионам (region), а не по менеджеру
  const territories = [
    ...new Set(
      excelData
        .filter(row => !safeFilter.region.length || safeFilter.region.includes(row["Region / HSR"]))
        // Если менеджер выбран — фильтруем по нему, иначе берем все
        .filter(row => !safeFilter.manager.length || safeFilter.manager.includes(row["Manager"]))
        .map(row => row["Territory"])
        .filter(Boolean)
    )
  ];

  setTerritoriesForManager(territories);

  setFilters(prev => {
    const newTerritories = (prev.territory || []).filter(t => territories.includes(t));
    if (JSON.stringify(newTerritories) !== JSON.stringify(prev.territory)) {
      return { ...prev, territory: newTerritories };
    }
    return prev;
  });

  // Если менеджер не выбран, territory всё равно показываем
}, [excelData, safeFilter.manager, safeFilter.region, setFilters]);

  // ===== DISTRIBUTOR =====
useEffect(() => {
  const distributors = [
    ...new Set(
      excelData
        // фильтруем по выбранным регионам
        .filter(row => !safeFilter.region.length || safeFilter.region.includes(row["Region / HSR"]))
        // фильтруем по выбранным территориям, если они выбраны
        .filter(row => !safeFilter.territory.length || safeFilter.territory.includes(row["Territory"]))
        .map(row => row["Distributor", "Дистр"])
        .filter(Boolean)
    )
  ];

  setDistributorsForTerritory(distributors);

  setFilters(prev => {
    const newDistributors = (prev.distributor || []).filter(d => distributors.includes(d));
    if (JSON.stringify(newDistributors) !== JSON.stringify(prev.distributor)) {
      return { ...prev, distributor: newDistributors };
    }
    return prev;
  });
}, [excelData, safeFilter.territory, safeFilter.region, setFilters]);

  // ===== Toggle чекбоксов =====
  const toggleValue = (key, value) => {
    const current = Array.isArray(filter[key]) ? filter[key] : [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    setFilters({ ...filter, [key]: updated });
  };

  return (
    <>
      <div className="filters__group">
        <label className="filters__label">Manager</label>
        <div className="checkbox-list">
          {managersForHSR.map(m => (
            <label key={m} className="checkbox-item">
              <input
                type="checkbox"
                checked={(filter.manager || []).includes(m)}
                onChange={() => toggleValue("manager", m)}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div className="filters__group">
        <label className="filters__label">Territory</label>
        <div className="checkbox-list">
          {territoriesForManager.map(t => (
            <label key={t} className="checkbox-item">
              <input
                type="checkbox"
                checked={(filter.territory || []).includes(t)}
                onChange={() => toggleValue("territory", t)}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="filters__group">
        <label className="filters__label">Distributor</label>
        <div className="checkbox-list">
          {distributorsForTerritory.map(d => (
            <label key={d} className="checkbox-item">
              <input
                type="checkbox"
                checked={(filter.distributor || []).includes(d)}
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