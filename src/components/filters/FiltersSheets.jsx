import { useState, useRef, useEffect } from "react";
import { utils } from "xlsx";

const LS_KEY = "active_excel_sheet";

export default function FiltersSheets({ sheetNames = [], activeSheet, setActiveSheet, workbook }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const safeLoadSheet = (name) => {
        if (!workbook?.Sheets?.[name]) return;
        const jsonData = utils.sheet_to_json(workbook.Sheets[name], { defval: "", raw: true });
        console.log(`Данные листа "${name}":`, jsonData);
    };

    const handleSelectSheet = (name) => {
        if (!name) return;
        setActiveSheet(name);
        localStorage.setItem(LS_KEY, name);
        setOpen(false);
        safeLoadSheet(name);
    };

    useEffect(() => {
        const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!sheetNames.length) return;
        const saved = localStorage.getItem(LS_KEY);
        if (saved && sheetNames.includes(saved)) { setActiveSheet(saved); safeLoadSheet(saved); return; }
        if (activeSheet && sheetNames.includes(activeSheet)) return;
        const first = sheetNames[0];
        if (first) { setActiveSheet(first); localStorage.setItem(LS_KEY, first); safeLoadSheet(first); }
    }, [sheetNames]);

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
