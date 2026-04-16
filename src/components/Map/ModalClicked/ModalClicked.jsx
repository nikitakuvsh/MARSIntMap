import './ModalClicked.css';

export default function ModalClicked({ data = [], filters, onClose }) {
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
          <span><b>{data.channel || filters.salesChannel || "Канал"}:</b></span>
          <span>Сумма — {data.total != null ? data.total.toLocaleString("ru-RU") : "???"}</span>
          <span>Среднее — {data.avg != null ? data.avg.toLocaleString("ru-RU") : "???"}</span>

          {/* 👇 НОВОЕ */}
          {filters.generalSalesChannel && data.breakdown && (
            <div style={{ marginTop: "10px" }}>
              <b>Детализация:</b>
              {Object.entries(data.breakdown).map(([key, value]) => (
                <div key={key}>
                  {key} — {value.toLocaleString("ru-RU")}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}