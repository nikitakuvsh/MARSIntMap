import { useMemo, useState } from "react";
import "./ColorsModal.css";

const TABS = [
  { key: "hsr", label: "HSR" },
  { key: "managers", label: "Manager" },
  { key: "territories", label: "Territory" },
  { key: "distributors", label: "Distributors" },
  { key: "merchAgencies", label: "Merch agency"}
];

export default function ColorsModal({
  open,
  onClose,
  colors,
  regions = [],
  hsr = [],
  managers = [],
  territories = [],
  distributors = [],
  merchAgency = [],
  onChangeColor,
}) {
  const [activeTab, setActiveTab] = useState("hsr");
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    switch (activeTab) {
      case "regions":
        return regions;

      case "hsr":
        return hsr;

      case "managers":
        return managers;

      case "territories":
        return territories;

      case "distributors":
        return distributors;

      case "merchAgencies":
        return merchAgency

      default:
        return [];
    }
  }, [
    activeTab,
    regions,
    hsr,
    managers,
    territories,
    distributors,
    merchAgency
  ]);

  const normalizedData = useMemo(() => {
    return [...new Set(
      data
        .filter(v => v !== null && v !== undefined)
        .map(v => String(v).trim())
        .filter(Boolean)
    )];
  }, [data]);

  const filteredItems = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return normalizedData;
    }

    return normalizedData.filter(item =>
      item.toLowerCase().includes(searchValue)
    );
  }, [normalizedData, search]);

  if (!open) return null;

  return (
    <div
      className="colors-modal-overlay"
      onClick={onClose}
    >
      <div
        className="colors-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="colors-modal-header">
          <h2>Настройка цветов</h2>

          <button
            className="colors-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="colors-modal-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`colors-tab ${
                activeTab === tab.key
                  ? "colors-tab-active"
                  : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="colors-modal-search">
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="colors-modal-list">
          {filteredItems.map(item => {
            const name = String(item);

            return (
              <div
                key={`${activeTab}-${name}`}
                className="color-row"
              >
                <span
                  className="color-row-title"
                  title={name}
                >
                  {name}
                </span>

                <input
                  type="color"
                  value={
                    colors?.[activeTab]?.[name] ??
                    "#cccccc"
                  }
                  onChange={(e) =>
                    onChangeColor(
                      activeTab,
                      name,
                      e.target.value
                    )
                  }
                />
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="empty-colors">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}