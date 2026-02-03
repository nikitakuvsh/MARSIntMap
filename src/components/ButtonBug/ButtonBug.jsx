import { useEffect, useState } from "react";
import bugIconLight from '../../images/icons/bug-light.svg';
import bugIconDark from '../../images/icons/bug-dark.svg';
import './ButtonBug.css';

export default function ButtonBug({ setHeaderRange }) {
  const [isDark, setIsDark] = useState(
    document.body.classList.contains('dark-theme')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark-theme'));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    const value = prompt(
      "С какой строки начинается header?\n(Введите число, например: 2)"
    );

    if (value === null) return;

    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed < 1) {
      alert("Нужно ввести положительное число 🙂");
      return;
    }

    setHeaderRange(parsed - 1);
  };

  const imageSrc = isDark ? bugIconDark : bugIconLight;

  return (
    <button className="button-bug" onClick={handleClick}>
      <img
        className="button-bug__icon"
        src={imageSrc}
        alt="bug"
        title="Проблемы с отображением?"
      />
    </button>
  );
}
