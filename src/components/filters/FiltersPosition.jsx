import React, { useState, useEffect } from "react";

export default function FiltersPosition({ excelData = [], filters, setFilters, setSelectedRegionView }) {
    const [showDistrictFilter, setShowDistrictFilter] = useState(false);
    const [districtsForHSR, setDistrictsForHSR] = useState([]);

    // Уникальные HSR (Region / HSR)
    const hsrList = Array.from(
        new Set(excelData.map((row) => row["Region / HSR"]).filter(Boolean))
    );

    // Слежение за выбором HSR
    useEffect(() => {
        if (!filters.region) {
            setShowDistrictFilter(false);
            setDistrictsForHSR([]);
            return;
        }

        // Получаем все District для выбранного HSR
        const districts = excelData
            .filter((row) => row["Region / HSR"] === filters.region)
            .map((row) => row["District"]);

        const uniqueDistricts = Array.from(new Set(districts));
        console.log(uniqueDistricts);

        if (uniqueDistricts.length === 1) {
            console.log("Выбран HSR с уникальным District:", uniqueDistricts[0], uniqueDistricts);
            setSelectedRegionView(uniqueDistricts[0]);
            setShowDistrictFilter(false);
            setDistrictsForHSR([]);
            // Сохраняем выбранный район автоматически
            setFilters({ ...filters, district: uniqueDistricts[0] });
        } else {
            setShowDistrictFilter(true);
            setSelectedRegionView("");
            setDistrictsForHSR(uniqueDistricts);
            // Если в filters.district что-то было, сбросим
            setFilters({ ...filters, district: "" });
        }
    }, [filters.region, excelData]);

    return (
        <div className="filters__group">
            <label className="filters__label">Выбор HSR</label>
            <select
                className="filters__select"
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            >
                <option value="">-.-</option>
                {hsrList.map((hsr) => (
                    <option key={hsr} value={hsr}>
                        {hsr}
                    </option>
                ))}
            </select>

            {showDistrictFilter && (
                <div style={{ marginTop: "10px" }}>
                    <label className="filters__label">Выбор District</label>
                    <select
                        className="filters__select"
                        value={filters.district || ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilters({ ...filters, district: val });

                            if (val === "Total") {
                                // Подсвечиваем все District текущего HSR
                                setSelectedRegionView([...districtsForHSR]);
                            } else {
                                setSelectedRegionView(val); // один выбранный район
                            }
                        }}
                    >
                        <option value="">-.-</option>
                        <option value="Total">Total</option>
                        {districtsForHSR.map((dist) => (
                            <option key={dist} value={dist}>
                                {dist}
                            </option>
                        ))}
                    </select>

                </div>
            )}
        </div>
    );
}
