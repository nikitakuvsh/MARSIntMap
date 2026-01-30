import React, { useState } from "react";
import Map from "./components/Map/YandexMap";
import FiltersDiv from "./components/filters/FiltersDiv";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";
import regionsByArea from "./components/Map/RegionsData";
import MapFixed from "./components/Map/MapFixed";
import './styles.css';  

function App() {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionView, setSelectedRegionView] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [filters, setFilters] = useState({
      region: [],
      hsr: [],
      manager: [],
      distributor: []
  });
  const [tableValues, setTableValues] = useState('');
  const [loadingState, setLoadingState] = useState(true);
  const [regionsData, setRegionsData] = useState(() => ({ ...regionsByArea }));
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");


  return (
    <div className={`app ${loadingState ? 'pointer--none' : ''}`}>
      <Loading loadingState={loadingState} stopLoading={() => setLoadingState(false)} />
      <div className='page__content'>
          <MapFixed
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedRegionView={selectedRegionView}
            excelData={excelData}
            mapDataColumn={filters.mapDataColumn}
            mapDataColumnValues={filters.mapDataColumn ? tableValues[filters.mapDataColumn] : []}
            regionsByArea={regionsData}
            setRegionsData={setRegionsData}
            filters={filters}
          />
          <FiltersDiv 
            onSelectRegion={setSelectedRegion} 
            setSelectedRegion={setSelectedRegion} 
            setSelectedRegionView={setSelectedRegionView} 
            excelData={excelData} 
            setExcelData={setExcelData} 
            filters={filters} 
            setFilters={setFilters} 
            tableValues={tableValues}
            regionsByArea={regionsData}
            workbook={workbook} 
            setWorkbook={setWorkbook} 
            sheetNames={sheetNames}
            setSheetNames={setSheetNames}
            activeSheet={activeSheet}
            setActiveSheet={setActiveSheet}
            />
      </div>
      <div className="table__content">
        <Table excelData={excelData} filters={filters} setTableValues={setTableValues} />
      </div>
    </div>
  );
}

export default App;
