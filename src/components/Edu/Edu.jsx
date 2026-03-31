import eduImage from '../../images/./pictures/edu.png';
import './Edu.css';

export default function Edu({ onClose }) {
    const handleClick = () => {
        localStorage.setItem('intMapShowEdu', 'false');
        onClose();
    };

    return (
        <div className="edu__container" onClick={handleClick}>
            <img
                className="edu__image"
                src={eduImage}
                title="Обучение"
                alt="Обучение"
            />
        </div>
    );
}