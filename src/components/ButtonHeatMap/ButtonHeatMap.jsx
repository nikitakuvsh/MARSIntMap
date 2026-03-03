import './ButtonHeatMap.css';
import heatOnIcon from '../../images/icons/heatOn.png';
import heatOffIcon from '../../images/icons/heatOff.png';

export default function ButtonHeatMap({ heatOn, setHeatOn }) {
  return (
    <button className='button--heat' onClick={() => setHeatOn(prev => !prev)}>
      <img
        className='heat__icon'
        src={heatOn ? heatOnIcon : heatOffIcon}
        alt='toggle heat map'
        title={`${heatOn ? 'Отключить отображение тепловой карты' : 'Включить отображение тепловой карты'}`}
      />
    </button>
  );
}