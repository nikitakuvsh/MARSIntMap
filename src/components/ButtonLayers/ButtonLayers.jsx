import './ButtonLayers.css';
import layersIcon from '../../images/icons/layers.png';
import { useState } from 'react';

export default function ButtonLayers({
    excelData = [],
    selectedLayers,
    setSelectedLayers,
    setDistributorLegends,
    setHSRLegends,
}) {
    const [listView, setListView] = useState(false);
    const colorsGenerated = useState({})[0]; // сохраняем цвета навсегда

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
                    ...new Set(excelData.map(r => r.Distributor).filter(Boolean))
                ];

                // Генерируем цвет только для новых дистрибьюторов
                distributors.forEach(d => {
                    if (!colorsGenerated[d]) {
                        colorsGenerated[d] =
                            `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
                    }
                });

                const legends = distributors.map(d => ({
                    title: d,
                    color: colorsGenerated[d]
                }));

                setDistributorLegends(legends);
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
                            .map(r => r["Region / HSR"])
                            .filter(h => h && h !== "0")
                    )
                ];

                hsrs.forEach(hsr => {
                    if (!colorsGenerated[hsr]) {
                        colorsGenerated[hsr] =
                            `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
                    }
                });

                const legends = hsrs.map(hsr => ({
                    title: hsr,
                    color: colorsGenerated[hsr]
                }));

                setHSRLegends(legends);
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
