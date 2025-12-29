import React, { useState } from "react";
import Map from "./components/Map/Map";
import FiltersDiv from "./components/filters/FiltersDiv";
import Table from "./components/Table/Table";
import './styles.css';  

function App() {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionView, setSelectedRegionView] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [filters, setFilters] = useState({
      region: "",
      hsr: "",
      manager: "",
      distributor: ""
  });
  const [tableValues, setTableValues] = useState('');

  return (
    <div className="app">
      <div className='page__content'>
          <Map
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedRegionView={selectedRegionView}
            excelData={excelData}
            mapDataColumn={filters.mapDataColumn}
            mapDataColumnValues={filters.mapDataColumn ? tableValues[filters.mapDataColumn] : []}
          />
          <FiltersDiv onSelectRegion={setSelectedRegion} setSelectedRegion={setSelectedRegion} setSelectedRegionView={setSelectedRegionView} excelData={excelData} setExcelData={setExcelData} filters={filters} setFilters={setFilters} tableValues={tableValues} />
      </div>
      <div className="table__content">
        <Table excelData={excelData} filters={filters} setTableValues={setTableValues}></Table>
      </div>
    </div>
  );
}

export default App;
