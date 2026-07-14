import { useState, useRef, useEffect } from "react";

export default function FiltersGeneralSalesChannels({
  filters,
  setFilters
}) {
  const CHANNELS = [
    "RKA",
    "Distr trade",
    "Execution",
    "Merch-model SO"
  ];
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const normalizeChannels = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
  };

  const selected = normalizeChannels(filters?.generalSalesChannel);

  const toggleChannel = (channel) => {
    const updated = selected.includes(channel)
      ? selected.filter(c => c !== channel)
      : [...selected, channel];

    setFilters({
      ...filters,
      generalSalesChannel: updated
    });
  };

  const toggleAll = () => {
    const allSelected = selected.length === CHANNELS.length;

    setFilters({
      ...filters,
      generalSalesChannel: allSelected ? [] : [...CHANNELS]
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );
  }, []);

  return (
    <div className="filters__group" ref={wrapperRef}>
      <span className="filters__label">Общий канал продаж:</span>

      <div className={`filters__combo ${open ? "open" : ""}`} onClick={() => setOpen(v => !v)}>
        <span>
          {selected.length ? `Выбрано: ${selected.length}` : "-- Выберите канал --"}</span>
        <span className="filters__combo-arrow"> {open ? "▲" : "▼"} </span>
      </div>
      {open && (
        <div className="filters__combo-list">
          <label className="filters__combo-item">
            <input type="checkbox" checked={selected.length === CHANNELS.length} onChange={toggleAll}/>
            <span>Pick all</span>
          </label>
          
          {CHANNELS.map(channel => (
            <label key={channel} className="filters__combo-item">
              <input type="checkbox" checked={selected.includes(channel)} onChange={() =>toggleChannel(channel)} />
              <span>{channel}</span>
            </label>
          ))}
        </div>
      )}
    </div>

  );
}