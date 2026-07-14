import { useState } from 'react';
import './MapLegends.css';
import ColorBlock from './ColorBlock';

export default function MapLegends({ distributorLegends = [], hsrLegends = [], managerLegends = [], territoryLegends = [], merchAgencyLegends = [] }) {
    const [showAll, setShowAll] = useState(false);
    // объединяем все легенды
    const legends = [...distributorLegends, ...hsrLegends, ...managerLegends, ...territoryLegends, ...merchAgencyLegends];
    if (!legends || !Array.isArray(legends) || legends.length === 0) return null;

    const isHSR = (item) => hsrLegends.some(h => h.title === item.title);
    const isManager = (item) => managerLegends.some(m => m.title === item.title);
    const isTerritory = (item) => territoryLegends.some(t => t.title === item.title);
    const isMerchAgency = (item) => merchAgencyLegends.some(m => m.title === item.title);
    const showButton = legends.length > 10;

    return (
        <div className={`map-legends ${legends.length > 0 ? '' : 'hidden'}`}>
            {showButton
                ? <button className="legends__toggle-btn" onClick={() => setShowAll(v => !v)} style={{ display: showAll ? 'none' : '' }}>
                    {showAll ? 'Скрыть обозначения' : 'Показать все обозначения'}
                  </button>
                : <div className="legends__wrapper legends__wrapper--flex">
                    {legends.map((item, index) =>
                        <ColorBlock
                            key={index}
                            color={item.color}
                            title={item.title}
                            type={isHSR(item) ? "hsr" : isManager(item) ? "manager" : isTerritory(item) ? "territory" : isMerchAgency(item) ? "merchAgency" : "distributor"}
                        />
                    )}
                  </div>
            }
            {showAll && showButton && (
                <div className="legends__wrapper legends__wrapper--flex" onClick={() => { if (showAll) setShowAll(false); }}>
                    {legends.map((item, index) =>
                        <ColorBlock
                            key={index}
                            color={item.color}
                            title={item.title}
                            type={isHSR(item) ? "hsr" : isManager(item) ? "manager" : isTerritory(item) ? "territory" : isMerchAgency(item) ? "merchAgency" : "distributor"}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
