import './ModalClicked.css';
import { useState, useEffect } from 'react';

// Функция для проверки, является ли регион белорусским
const isBelarusRegion = (regionName) => {
  if (!regionName) return false;
  const belarusKeywords = [
    'беларусь', 'брестская', 'витебская', 'гомельская', 
    'гродненская', 'минская', 'могилевская', 'минск'
  ];
  const lowerRegion = regionName.toLowerCase();
  return belarusKeywords.some(keyword => lowerRegion.includes(keyword));
};

// Функция для получения курса BYN к RUB
const getBelarusRate = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/BYN');
    const data = await response.json();
    return data.rates.RUB || 0;
  } catch (error) {
    console.error('Ошибка получения курса BYN:', error);
    try {
      const response = await fetch('https://api.exchangerate.host/latest?base=BYN&symbols=RUB');
      const data = await response.json();
      return data.rates.RUB || 0;
    } catch (fallbackError) {
      console.error('Ошибка запасного API:', fallbackError);
      return 0;
    }
  }
};

export default function ModalClicked({ data = [], filters, onClose }) {
  const [bynRate, setBynRate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Если регион белорусский и есть данные, получаем курс
    if (data?.region && isBelarusRegion(data.region) && data.total != null && data.total > 0) {
      setLoading(true);
      getBelarusRate()
        .then(rate => {
          setBynRate(rate);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [data?.region, data?.total]);

  if (!data) return null;

  const convertedTotal = isBelarusRegion(data.region) && bynRate && data.total != null
    ? data.total * bynRate
    : null;

  return (
    <div className="map-modal-overlay">
      <div className="map-modal-container">
        <button className="map-modal--close" onClick={onClose}>
          ✕
        </button>

        <h2 className="map-modal__title">
          {data.region}
          {isBelarusRegion(data.region) && (
            <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '10px', color: '#666' }}>
              🇧🇾 BYN → RUB
            </span>
          )}
        </h2>

        <p className="map-modal__subtitle">
          <b>HSR:</b> {data.hsr?.join(", ") || "—"}
        </p>

        <p className="map-modal__subtitle">
          <b>Manager:</b> {data.managers?.join(", ") || "—"}
        </p>

        <p className="map-modal__subtitle">
          <b>Territory:</b> {data.territories?.join(", ") || "—"}
        </p>

        <p className="map-modal__subtitle">
          <b>Distributor:</b> {data.distributors?.join(", ") || "—"}
        </p>

        <p className='map-modal__subtitle'>
          <b>Merch Agency:</b> {data.merchAgency?.join(", ") || "—"}
        </p>
        
        <p className='map-modal__subtitle'>
          <b>Количество офисов:</b> {data.countOffices?.reduce((sum, n) => sum + Number(n), 0) || "—"}
        </p>

        <p className='map-modal__subtitle'>
          <b>Количество сотрудников:</b> {data.countEmployees?.reduce((sum, n) => sum + Number(n), 0) || "—"}
        </p>

        <div className="map-modal-stats">
          <span><b>{data.channel || filters.salesChannel || "Канал"}:</b></span>
          
          <span>
            Сумма — {data.total != null ? data.total.toLocaleString("ru-RU") : "0?"}
            {isBelarusRegion(data.region) && (
              <span style={{ color: '#999', fontSize: '12px', marginLeft: '5px' }}>BYN</span>
            )}
          </span>

          {isBelarusRegion(data.region) && (
            <div style={{ marginTop: '4px', color: '#2e7d32', fontWeight: 'bold' }}>
              {loading ? (
                <span style={{ fontSize: '12px', color: '#999' }}>Загрузка курса...</span>
              ) : convertedTotal !== null && convertedTotal > 0 ? (
                <>
                  ≈ {convertedTotal.toLocaleString("ru-RU")} RUB
                  <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666', marginLeft: '5px' }}>
                    (курс: {bynRate?.toFixed(4)} BYN/RUB)
                  </span>
                </>
              ) : bynRate === 0 ? (
                <span style={{ fontSize: '12px', color: '#f44336' }}>
                  ⚠️ Не удалось получить курс
                </span>
              ) : null}
            </div>
          )}

          {filters.generalSalesChannel && data.breakdown && (
            <div style={{ marginTop: "10px", width: '100%' }}>
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