import './ButtonLayers.css';
import layersIcon from '../../images/icons/layers.png';
import { useState, useRef } from 'react';

export default function ButtonLayers({
    excelData = [],
    selectedLayers,
    setSelectedLayers,
    setDistributorLegends,
    setHSRLegends,
    setManagerLegends,
    setTerritoryLegends, // новый проп
}) {
    const [listView, setListView] = useState(false);
    const colorsGenerated = useRef({});

    const pick = (row, ...keys) => {
        for (const k of keys) {
            const v = row[k];
            if (v !== undefined && v !== null && String(v).trim() !== "") return v;
        }
        return null;
    };

    const toggleLayer = (layer) => {
        const isEnabled = selectedLayers.includes(layer);
        const next = isEnabled
            ? selectedLayers.filter(l => l !== layer)
            : [...selectedLayers, layer];

        setSelectedLayers(next);

        // ---------- DISTRIBUTOR ----------
        if (layer === 'DistributorLayer') {
            if (!isEnabled) {
                const distributors = [...new Set(excelData.map(r => pick(r, "Distributor", "Дистр")).filter(Boolean))];
                distributors.forEach(d => {
                    if (!colorsGenerated.current[d]) {
                        colorsGenerated.current[d] =
                            `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
                    }
                });
                setDistributorLegends(distributors.map(d => ({ title: d, color: colorsGenerated.current[d] })));
            } else setDistributorLegends([]);
        }

        // ---------- HSR ----------
        if (layer === 'HSRLayer') {
            if (!isEnabled) {
                const hsrs = [...new Set(
                    excelData.map(r => pick(r, "Region / HSR", "Позиция менеджера")).filter(Boolean)
                )];
                hsrs.forEach(hsr => {
                    if (!colorsGenerated.current[hsr]) {
                        colorsGenerated.current[hsr] =
                            `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
                    }
                });
                setHSRLegends(hsrs.map(h => ({ title: h, color: colorsGenerated.current[h] })));
            } else setHSRLegends([]);
        }

        // ---------- MANAGER ----------
        if (layer === 'ManagerLayer') {
            if (!isEnabled) {
                const managers = [...new Set(excelData.map(r => pick(r, "Manager", "Менеджер")).filter(Boolean))];
                managers.forEach(m => {
                    if (!colorsGenerated.current[m]) {
                        colorsGenerated.current[m] =
                            `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
                    }
                });
                setManagerLegends(managers.map(m => ({ title: m, color: colorsGenerated.current[m] })));
            } else setManagerLegends([]);
        }

        // ---------- TERRITORY ----------
        if (layer === 'TerritoryLayer') {
            if (!isEnabled) {
                // Получаем все уникальные Territory
                const territories = [...new Set(excelData.map(r => pick(r, "Territory", "Территория")).filter(Boolean))];

                territories.forEach(t => {
                    if (!colorsGenerated.current[t]) {
                        colorsGenerated.current[t] =
                            `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
                    }
                });

                setTerritoryLegends(territories.map(t => ({ title: t, color: colorsGenerated.current[t] })));
            } else setTerritoryLegends([]);
        }
    };

    return (
        <>
            <button
                className="button-layers"
                title="layers"
                onClick={() => setListView(v => !v)}
            >
                <img className="button-layers__icon" alt="layers" src={layersIcon} />
            </button>

            {listView && (
                <div className="layers__list">
                    <label className="layers__li">
                        <input
                            type="checkbox"
                            checked={selectedLayers.includes('HSRLayer')}
                            onChange={() => toggleLayer('HSRLayer')}
                        />
                        HSR слой
                    </label>

                    <label className="layers__li">
                        <input
                            type="checkbox"
                            checked={selectedLayers.includes('ManagerLayer')}
                            onChange={() => toggleLayer('ManagerLayer')}
                        />
                        Manager слой
                    </label>

                    <label className="layers__li">
                        <input
                            type="checkbox"
                            checked={selectedLayers.includes('TerritoryLayer')}
                            onChange={() => toggleLayer('TerritoryLayer')}
                        />
                        Territory слой
                    </label>

                    <label className="layers__li">
                        <input
                            type="checkbox"
                            checked={selectedLayers.includes('DistributorLayer')}
                            onChange={() => toggleLayer('DistributorLayer')}
                        />
                        Distr слой
                    </label>
                </div>
            )}
        </>
    );
}
