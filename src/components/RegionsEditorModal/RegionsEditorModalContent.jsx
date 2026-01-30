// RegionsEditorModalContent.jsx
import { useState } from "react";
import "./RegionsEditorModal.css";

export default function RegionsEditorModalContent({ initRegionsData, onChange, onClose }) {
    const [regionsData, setRegionsData] = useState({ ...initRegionsData });
    const [draggedRegion, setDraggedRegion] = useState(null);

    const handleAddRegion = (area) => {
        const name = prompt(`Введите название нового региона для "${area}":`);
        if (!name) return;

        setRegionsData(prev => {
            const updated = {
                ...prev,
                [area]: [...prev[area], name], // новый массив для area
            };
            onChange?.(updated); // прокидываем новый объект
            return updated;
        });
    };

    const handleRemoveRegion = (area, index) => {
        setRegionsData(prev => {
            const updated = {
                ...prev,
                [area]: prev[area].filter((_, i) => i !== index), // новый массив
            };
            onChange?.(updated);
            return updated;
        });
    };

    const handleDragStart = (area, region) => setDraggedRegion({ area, region });
    const handleDrop = (targetArea) => {
        if (!draggedRegion) return;

        setRegionsData(prev => {
            const updated = {
                ...prev,
                [draggedRegion.area]: prev[draggedRegion.area].filter(r => r !== draggedRegion.region),
                [targetArea]: [...prev[targetArea], draggedRegion.region],
            };
            onChange?.(updated);
            return updated;
        });

        setDraggedRegion(null);
    };


    return (
        <div className="regions-editor__overlay" onClick={onClose}>
            <div className="regions-editor__modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="regions-editor__title">Редактор регионов</h3>
                <div className="regions-editor__areas">
                    {Object.entries(regionsData).map(([area, regions]) => (
                        <div key={area} className="regions-editor__area" onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(area)}>
                            <strong className="regions-editor__area-title">{area}</strong>
                            <button className="regions-editor__add" onClick={() => handleAddRegion(area)}>+ Добавить</button>
                            <ul className="regions-editor__list">
                                {regions.map((region, i) => (
                                    <li key={i} className="regions-editor__list-item" draggable onDragStart={() => handleDragStart(area, region)}>
                                        {region}
                                        <button className="regions-editor__remove" onClick={() => handleRemoveRegion(area, i)}>❌</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <button className="regions-editor__close" onClick={onClose}>Закрыть</button>
            </div>
        </div>
    );
}
