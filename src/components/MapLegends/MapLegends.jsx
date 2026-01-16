// MapLegends.jsx
import './MapLegends.css';
import ColorBlock from './ColorBlock';

export default function MapLegends({ distributorLegends = [], hsrLegends = [] }) {
    const legends = [].concat(distributorLegends).concat(hsrLegends);
    if (!legends || !Array.isArray(legends)) return null;

    return (
        <div className={`map-legends ${legends.length > 0 ? '' : 'hidden'}`}>
            <div className="legends__wrapper">
                {legends.map((item, index) => (
                    <ColorBlock
                        key={index}
                        color={item.color}
                        title={item.title}
                        type={hsrLegends.includes(item) ? "hsr" : "distributor"}
                    />
                ))}
            </div>
        </div>
    );
}
