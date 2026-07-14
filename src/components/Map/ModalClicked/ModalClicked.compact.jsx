import './ModalClicked.css';
import { useEffect, useMemo, useState } from 'react';

const isBelarusRegion = (regionName) => {
  if (!regionName) return false;
  const keywords = ['беларусь','брестская','витебская','гомельская','гродненская','минская','могилевская','минск'];
  const lower = regionName.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
};

const formatDisplayValue = (value, fallback = '—') => {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) {
    const filtered = value.filter(Boolean);
    return filtered.length ? filtered.join(', ') : fallback;
  }
  return String(value);
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  return Number(String(value).replace(/\s/g, '').replace(',', '.')) || 0;
};

const getBelarusRate = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/BYN');
    const data = await response.json();
    return data.rates.RUB || 0;
  } catch {
    try {
      const response = await fetch('https://api.exchangerate.host/latest?base=BYN&symbols=RUB');
      const data = await response.json();
      return data.rates.RUB || 0;
    } catch {
      return 0;
    }
  }
};

export default function ModalClicked({ data = null, filters, onClose }) {
  const [bynRate, setBynRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedChannels = useMemo(() => {
    const value = filters?.generalSalesChannel;
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  }, [filters?.generalSalesChannel]);

  const calculated = useMemo(() => {
    if (!data?.rows) return { total: data?.total || 0, breakdown: data?.breakdown || {} };

    const columns = [];
    selectedChannels.forEach((channel) => {
      switch (channel) {
        case 'RKA': columns.push('RKA'); break;
        case 'Distr trade': columns.push('Non-Skyline', 'Skyline'); break;
        case 'Execution': columns.push('SO NA (w/o Chizhik)', 'SO RKA (execution)'); break;
        case 'Merch-model SO': columns.push('Merch-model SO'); break;
        case 'NA Leading': columns.push('NA Leading'); break;
        case 'RKA Leading': columns.push('RKA Leading'); break;
      }
    });

    const breakdown = {};
    columns.forEach((column) => {
      breakdown[column] = data.rows.reduce((sum, row) => sum + parseNumber(row[column]), 0);
    });

    return {
      total: Object.values(breakdown).reduce((sum, value) => sum + value, 0),
      breakdown,
    };
  }, [data?.rows, selectedChannels]);

  const isBelarus = useMemo(() => isBelarusRegion(data?.region), [data?.region]);

  useEffect(() => {
    if (!isBelarus || calculated.total <= 0) {
      setBynRate(null);
      return;
    }
    setLoading(true);
    getBelarusRate().then(setBynRate).finally(() => setLoading(false));
  }, [isBelarus, calculated.total]);

  if (!data) return null;

  const convertedTotal = isBelarus && bynRate ? calculated.total * bynRate : null;
  const channelTitle = selectedChannels.length ? selectedChannels.join(' + ') : filters?.salesChannel || 'Канал';

  return (
    <div className="map-modal-overlay">
      <div className="map-modal-container">
        <button className="map-modal--close" onClick={onClose}>✕</button>
        <h2 className="map-modal__title">
          {data.region}
          {isBelarus && <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>🇧🇾 BYN → RUB</span>}
        </h2>

        <p className="map-modal__subtitle"><b>HSR:</b> {formatDisplayValue(data.hsr)}</p>
        <p className="map-modal__subtitle"><b>Manager:</b> {formatDisplayValue(data.managers)}</p>
        <p className="map-modal__subtitle"><b>Territory:</b> {formatDisplayValue(data.territories)}</p>
        <p className="map-modal__subtitle"><b>Distributor:</b> {formatDisplayValue(data.distributors)}</p>
        <p className="map-modal__subtitle"><b>Merch Agency:</b> {formatDisplayValue(data.merchAgency)}</p>
        <p className="map-modal__subtitle"><b>Количество офисов:</b> {data.countOffices?.length ? data.countOffices.reduce((sum, n) => sum + Number(n || 0), 0) : '—'}</p>
        <p className="map-modal__subtitle"><b>Количество сотрудников:</b> {data.countEmployees?.length ? data.countEmployees.reduce((sum, n) => sum + Number(n || 0), 0) : '—'}</p>

        <div className="map-modal-stats">
          <b>{channelTitle}</b>
          <div>
            Сумма — {calculated.total.toLocaleString('ru-RU')}
            {isBelarus && <span style={{ marginLeft: '5px', color: '#999' }}>BYN</span>}
          </div>
          {isBelarus && (
            <div style={{ marginTop: '5px', color: '#2e7d32', fontWeight: 'bold' }}>
              {loading ? 'Загрузка курса...' : convertedTotal ? <>
                ≈ {convertedTotal.toLocaleString('ru-RU')} RUB
                <span style={{ marginLeft: '5px', fontSize: '11px', color: '#666' }}>(курс {bynRate?.toFixed(4)})</span>
              </> : null}
            </div>
          )}
          {Object.keys(calculated.breakdown).length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <b>Детализация:</b>
              {Object.entries(calculated.breakdown).map(([key, value]) => (
                <div key={key}>{key} — {value.toLocaleString('ru-RU')}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
