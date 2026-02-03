import "./RegionsEditorModal.css";

export default function RegionsEditorModal({ openModal}) {

    return (
        <div className="regions-editor">
            <button className="regions-editor__button" onClick={openModal} title="Редактор регионов">🛠</button>
        </div>
    );
}
