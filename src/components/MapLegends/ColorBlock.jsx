import './MapLegends.css';

export default function ColorBlock({ color, title, type = "distributor" }) {
    return (
        <div className="color-block">
            <div
                className="color__rectangle"
                style={{
                    backgroundColor: color,
                    border: `2px solid ${color}`,
                    borderRadius: type === "hsr" ? '50%' : '',
                    width: type === "hsr" ? '20px' : '',
                    height: type === "hsr" ? '20px' : '',
                }}
            />
            <span className="color__title">{title}</span>
        </div>
    );
}
