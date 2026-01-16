import './MapLegends.css';

export default function ColorBlock({ color, title, type = "distributor" }) {
    return (
        <div className="color-block">
            <div
                className="color__rectangle"
                style={{
                    backgroundColor: type === "hsr" ? "#fff" : color,
                    border: `2px solid ${color}`,
                }}
            />
            <span className="color__title">{title}</span>
        </div>
    );
}
