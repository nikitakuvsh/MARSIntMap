import { useState, useRef, useEffect } from "react";

const REGIONS = [
    "Moscow",
    "North",
    "South",
    "Center",
    "Siberia",
    "Far East",
    "Belarus",
];

export default function FiltersRegions({ regionsByArea, setSelectedRegionView }) {
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const toggleRegion = (region) => {
        const next = selectedRegions.includes(region)
            ? selectedRegions.filter(r => r !== region)
            : [...selectedRegions, region];

        setSelectedRegions(next);

        const areas = next.flatMap(r => regionsByArea[r] || []);
        setSelectedRegionView([...new Set(areas)]);
    };

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleAll = () => {
        const allSelected = selectedRegions.length === REGIONS.length;

        const next = allSelected ? [] : [...REGIONS];
        setSelectedRegions(next);

        const areas = next.flatMap(r => regionsByArea[r] || []);
        setSelectedRegionView([...new Set(areas)]);
    };


    return (
        <div className="filters__group" ref={wrapperRef}>
            <span className="filters__label">Регион:</span>

            <div
                className={`filters__combo ${open ? "open" : ""}`}
                onClick={() => setOpen(v => !v)}
            >
                <span>
                    {selectedRegions.length
                        ? `Выбрано: ${selectedRegions.length}`
                        : "-- Выберите регион --"}
                </span>

                <span className="filters__combo-arrow">
                    {open ? "▲" : "▼"}
                </span>
            </div>

            {open && (
                <div className="filters__combo-list">
                    <label className="filters__combo-item">
                        <input
                            type="checkbox"
                            checked={selectedRegions.length === REGIONS.length}
                            onChange={toggleAll}
                        />
                        Pick all
                    </label>

                    {REGIONS.map(region => (
                        <label key={region} className="filters__combo-item">
                            <input
                                type="checkbox"
                                checked={selectedRegions.includes(region)}
                                onChange={() => toggleRegion(region)}
                            />
                            {region}
                        </label>
                    ))}
                </div>
            )}

        </div>
    );
}
