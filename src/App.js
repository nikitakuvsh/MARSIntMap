import React, { useState } from "react";
import Map from "./components/Map/YandexMap";
import FiltersDiv from "./components/filters/FiltersDiv";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";
import regionsByArea from "./components/Map/RegionsData";
import MapFixed from "./components/Map/MapFixed";
import MapLeaflet from "./components/Map/MapFixed";
import Edu from "./components/Edu/Edu";
import './styles.css';

function App() {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionView, setSelectedRegionView] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [filters, setFilters] = useState({
    mapChannel: "",
    generalSalesChannel: "",
    salesChannel: "",
    region: [],
    hsr: [],
    manager: [],
    territory: [],
    distributor: []
  });
  const [tableValues, setTableValues] = useState('');
  const [loadingState, setLoadingState] = useState(true);
  const [regionsData, setRegionsData] = useState(() => ({ ...regionsByArea }));
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [headerRange, setHeaderRange] = useState(0);
  const [showEdu, setShowEdu] = useState(localStorage.getItem('intMapShowEdu') !== 'false');


  return (
    <div className={`app ${loadingState ? 'pointer--none' : ''}`}>
      <Loading loadingState={loadingState} stopLoading={() => setLoadingState(false)} />
      {showEdu && <Edu onClose={() => setShowEdu(false)} />}

      <div className='page__content'>
        {!showEdu && (
          <>
            
            <MapLeaflet
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedRegionView={selectedRegionView}
              setSelectedRegionView={setSelectedRegionView}
              excelData={excelData}
              regionsByArea={regionsData}
              setRegionsData={setRegionsData}
              filters={filters}
              setHeaderRange={setHeaderRange}
              headerRange={headerRange}
              showEdu={showEdu}
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
              headerRange={headerRange}
            />
          </>
        )}
      </div>
      {/* <div className="table__content">
        {!showEdu && <Table excelData={excelData} filters={filters} setTableValues={setTableValues} selectedRegionView={selectedRegionView} />}
      </div> */}
    </div>
  );
}

export default App;
