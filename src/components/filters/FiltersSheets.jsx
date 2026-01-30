import { useState, useRef, useEffect } from "react";
import { utils } from "xlsx";

export default function FiltersSheets({ sheetNames, activeSheet, setActiveSheet, workbook }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const handleSelectSheet = (name) => {
        setActiveSheet(name);
        setOpen(false);
        if (!workbook || !workbook.Sheets?.[name]) return;
        const worksheet = workbook.Sheets[name];
        const jsonData = utils.sheet_to_json(worksheet, { defval: "", raw: true });
        console.log(`Данные листа "${name}":`, jsonData);
    };

    useEffect(() => {
        const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="filters__group" ref={wrapperRef}>
            <span className="filters__label">Листы Excel:</span>
            <div className={`filters__combo ${open ? "open" : ""}`} onClick={() => setOpen(v => !v)}>
                <span>{activeSheet || "-- Выберите лист --"}</span>
                <span className="filters__combo-arrow">{open ? "▲" : "▼"}</span>
            </div>
            {open && <div className="filters__combo-list">{sheetNames.map(name => <label key={name} className="filters__combo-item"><input type="radio" name="activeSheet" checked={activeSheet === name} onChange={() => handleSelectSheet(name)} />{name}</label>)}</div>}
        </div>
    );
}
