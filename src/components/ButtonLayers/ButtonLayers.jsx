import './ButtonLayers.css';
import layersIcon from '../../images/icons/layers.png';
import { useState, useRef } from 'react';

export default function ButtonLayers({
    excelData = [],
    selectedLayers,
    setSelectedLayers,
    setDistributorLegends,
    setHSRLegends,
}) {
    const [listView, setListView] = useState(false);
    const colorsGenerated = useRef({});

    // Универсальный ИЛИ по колонкам
    const pick = (row, ...keys) => {
        for (const k of keys) {
            const v = row[k];
            if (v !== undefined && v !== null && String(v).trim() !== "") {
                return v;
            }
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

                const distributors = [
                    ...new Set(
                        excelData
                            .map(r => pick(r, "Distributor", "Дистр"))
                            .filter(Boolean)
                    )
                ];

                console.log("[Layers] Найдены дистрибьюторы:", distributors);

                distributors.forEach(d => {
                    if (!colorsGenerated.current[d]) {
                        colorsGenerated.current[d] =
                            `#${Math.floor(Math.random() * 0xffffff)
                                .toString(16)
                                .padStart(6, '0')}`;
                    }
                });

                setDistributorLegends(
                    distributors.map(d => ({
                        title: d,
                        color: colorsGenerated.current[d]
                    }))
                );

            } else {
                setDistributorLegends([]);
            }
        }

        // ---------- HSR ----------
        if (layer === 'HSRLayer') {
            if (!isEnabled) {

                const hsrs = [
                    ...new Set(
                        excelData
                            .map(r => pick(r, "Region / HSR", "Позиция менеджера"))
                            .filter(h => h && h !== "0")
                    )
                ];

                console.log("[Layers] Найдены HSR / позиции:", hsrs);

                hsrs.forEach(hsr => {
                    if (!colorsGenerated.current[hsr]) {
                        colorsGenerated.current[hsr] =
                            `#${Math.floor(Math.random() * 0xffffff)
                                .toString(16)
                                .padStart(6, '0')}`;
                    }
                });

                setHSRLegends(
                    hsrs.map(hsr => ({
                        title: hsr,
                        color: colorsGenerated.current[hsr]
                    }))
                );

            } else {
                setHSRLegends([]);
            }
        }
    };

    return (
        <>
            <button
                className="button-layers"
                title="layers"
                onClick={() => setListView(v => !v)}
            >
                <img
                    className="button-layers__icon"
                    alt="layers"
                    src={layersIcon}
                />
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
