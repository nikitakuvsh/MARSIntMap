import './ModalClicked.css';

export default function ModalClicked({ data, filters, onClose }) {
  if (!data) return null;

  return (
    <div className="map-modal-overlay">
      <div className="map-modal-container">
        <button className="map-modal--close" onClick={onClose}>
          ✕
        </button>

        <h2 className="map-modal__title">
          {data.region}
        </h2>

        <p className="map-modal__subtitle">
          <b>HSR:</b> {data.hsr.join(", ") || "—"}
        </p>

        <p className="map-modal__subtitle">
          <b>Manager:</b> {data.managers.join(", ") || "—"}
        </p>

        <p className="map-modal__subtitle">
          <b>Territory:</b> {data.territories.join(", ") || "—"}
        </p>

        <p className="map-modal__subtitle">
          <b>Distributor:</b> {data.distributors.join(", ") || "—"}
        </p>

        <div className="map-modal-stats">
          <span><b>{filters.salesChannel || "Канал"}:</b></span>
          <span>Сумма — {data.total.toLocaleString("ru-RU")}</span>
          <span>Среднее — {data.avg.toLocaleString("ru-RU")}</span>
        </div>
      </div>
    </div>
  );
}