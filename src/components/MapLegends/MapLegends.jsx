import { useState } from 'react';
import './MapLegends.css';
import ColorBlock from './ColorBlock';

export default function MapLegends({ distributorLegends = [], hsrLegends = [] }) {
    const [showAll, setShowAll] = useState(false);
    const legends = [...distributorLegends, ...hsrLegends];
    if (!legends || !Array.isArray(legends) || legends.length === 0) return null;

    const isHSR = (item) => hsrLegends.includes(item);
    const showButton = legends.length > 10;

    return (
        <div className={`map-legends ${legends.length > 0 ? '' : 'hidden'}`}>
            {showButton
                ? <button className="legends__toggle-btn" onClick={() => setShowAll(v => !v)} style={{display: showAll ? 'none' : ''}}>
                    {showAll ? 'Скрыть обозначения' : 'Показать все обозначения'}
                  </button>
                : <div className="legends__wrapper legends__wrapper--flex">
                    {legends.map((item, index) =>
                        <ColorBlock key={index} color={item.color} title={item.title} type={isHSR(item) ? "hsr" : "distributor"} />
                    )}
                  </div>
            }
            {showAll && showButton && (
                <div className="legends__wrapper legends__wrapper--flex" onClick={() => { if (showAll) setShowAll(false); }}>
                    {legends.map((item, index) =>
                        <ColorBlock key={index} color={item.color} title={item.title} type={isHSR(item) ? "hsr" : "distributor"} />
                    )}
                </div>
            )}
        </div>
    );
}
