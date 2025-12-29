export default function FiltersRegions(){
    return (
        <div className="filters__group">
            <label className="filters__label">Регион:</label>
            <select className="filters__select" title="Выберите регион" id="region-select">
                <option value>-- выбрать регион --</option>
                <option value="Moscow">Moscow</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="Center">Center</option>
                <option value="Siberia">Siberia</option>
                <option value="Far East">Far East</option>
                <option value="Belarus">Belarus</option>
                <option value="Total">Total</option>
            </select> 
        </div>
    );
}