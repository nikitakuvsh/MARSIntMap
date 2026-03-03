// HeatLegends.jsx
import './HeatLegends.css';

export default function HeatLegends({ min = 0, avg = 0, max = 1000000, steps = 5 }) {
  const stepValue = (max - min) / steps;
  const labels = Array.from({ length: steps + 1 }, (_, i) => Math.round(min + stepValue * i));

  return (
    <div className="heat-legends">
      <div className="heat-gradient" />
      <div className="heat-labels">
        {labels.map((v, idx) => (
          <span 
            key={idx} 
            className={`heat-label ${v === Math.round(avg) ? 'avg-label' : ''}`}
          >
            {v.toLocaleString()}
          </span>
        ))}
      </div>
    </div>
  );
}