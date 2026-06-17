import React, { useEffect, useState } from "react";

export default function FiltersPosition({
    excelData = [],
    filters,
    setFilters,
    setSelectedRegionView
}) {
    const [districtsForHSR, setDistrictsForHSR] = useState([]);

    const hsrList = Array.from(
        new Set(excelData.map(row => row["Region / HSR"] || row["Регион"]).filter(Boolean))
    );

    // обновляем список District при смене HSR
    useEffect(() => {
        if (!filters.region?.length) {
            setDistrictsForHSR([]);
            setSelectedRegionView([]);
            return;
        }

        const districts = excelData
            .filter(row => filters.region.includes(row["Region / HSR"]))
            .map(row => row["District"]);

        const unique = [...new Set(districts)];
        setDistrictsForHSR(unique);

        // если выбранные district больше не существуют — чистим
        const validSelected = filters.district?.filter(d => unique.includes(d)) || [];
        setFilters({ ...filters, district: validSelected });
        setSelectedRegionView(validSelected);

    }, [filters.region]);

    const toggleHSR = (value) => {
        const updated = filters.hsr.includes(value)
            ? filters.hsr.filter(v => v !== value)
            : [...filters.hsr, value];

        setFilters({ ...filters, hsr: updated });
        // НЕ трогаем selectedRegionView
    };


    const toggleDistrict = (value) => {
        const updated = filters.district.includes(value)
            ? filters.district.filter(v => v !== value)
            : [...filters.district, value];

        setFilters({ ...filters, district: updated });
        setSelectedRegionView(updated);
    };

    return (
        <div className="filters__group">

            <label className="filters__label">HSR</label>
            <div className="checkbox-list">
                {hsrList.map(hsr => (
                    <label key={hsr} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={filters.hsr.includes(hsr)}
                            onChange={() => toggleHSR(hsr)}
                        />
                        {hsr}
                    </label>
                ))}
            </div>


            {districtsForHSR.length > 0 && (
                <>
                    <label className="filters__label">District</label>
                    <div className="checkbox-list">
                        {districtsForHSR.map(dist => (
                            <label key={dist} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={filters.district.includes(dist)}
                                    onChange={() => toggleDistrict(dist)}
                                />
                                {dist}
                            </label>
                        ))}
                    </div>
                </>
            )}

        </div>
    );
}
