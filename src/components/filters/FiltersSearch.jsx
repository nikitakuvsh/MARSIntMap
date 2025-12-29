import { useEffect, useRef, useState } from "react";
import regionsByArea from "../Map/RegionsData";

export default function FiltersSearch({ onSelectRegion }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const itemRefs = useRef([]);

    const regions = [...new Set(Object.values(regionsByArea).flat())];

    const filtered = regions.filter(r =>
        r.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
            itemRefs.current[activeIndex].scrollIntoView({
                block: "nearest",
                behavior: "smooth"
            });
        }
    }, [activeIndex]);

    const clear = () => {
        setQuery("");
        setOpen(false);
        setActiveIndex(-1);
        onSelectRegion?.(null);
    };

    const selectActive = () => {
        if (activeIndex >= 0 && activeIndex < filtered.length) {
            const region = filtered[activeIndex];
            setQuery(region);
            setOpen(false);
            setActiveIndex(-1);
            onSelectRegion(region);
        }
    };

    return (
        <div className="filters__group" ref={wrapperRef}>
            <label className="filters__label">Поиск региона</label>

            <div className="filters__search-wrapper">
                <input
                    className="filters__input filters__input_search"
                    value={query}
                    placeholder="Введите регион"
                    onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
                    onFocus={() => query && setOpen(true)}
                    onKeyDown={e => {
                        if (e.key === "Tab" && open) {
                            e.preventDefault();
                            setActiveIndex(prev => (prev + 1) % filtered.length);
                        }
                        if (e.key === "Enter") {
                            e.preventDefault();
                            selectActive();
                        }
                    }}
                />

                <button type="button" className="search-button" onClick={query ? clear : undefined}>
                    {query ? (
                        <svg viewBox="0 0 24 24" className="submit-button">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" className="submit-button">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                            <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    )}
                </button>
            </div>

            {open && filtered.length > 0 && (
                <ul className="filters__select">
                    {filtered.map((region, index) => (
                        <li
                            key={region}
                            ref={el => itemRefs.current[index] = el}
                            className={index === activeIndex ? "active" : ""}
                            onClick={() => { setQuery(region); setOpen(false); setActiveIndex(-1); onSelectRegion(region); }}>
                            {region}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
