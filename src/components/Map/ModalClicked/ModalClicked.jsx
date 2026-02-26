import './ModalClicked.css';

export default function ModalClicked({ onClose, data }) {
  if (!data) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="map-modal--close" onClick={onClose}>X</button>

        <div className="map-modal-content">
          <h2 className="map-modal__title">
            Выбран регион: {data.region}
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
        </div>
      </div>
    </div>
  );
}