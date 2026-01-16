import React, { useState } from "react";
import Map from "./components/Map/Map";
import FiltersDiv from "./components/filters/FiltersDiv";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";
import regionsByArea from "./components/Map/RegionsData";
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


  return (
    <div className={`app ${loadingState ? 'pointer--none' : ''}`}>
      <Loading loadingState={loadingState} stopLoading={() => setLoadingState(false)} />
      <div className='page__content'>
          <Map
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedRegionView={selectedRegionView}
            excelData={excelData}
            mapDataColumn={filters.mapDataColumn}
            mapDataColumnValues={filters.mapDataColumn ? tableValues[filters.mapDataColumn] : []}
            regionsByArea={regionsData}
            setRegionsData={setRegionsData}
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
            regionsByArea={regionsData} />
      </div>
      <div className="table__content">
        <Table excelData={excelData} filters={filters} setTableValues={setTableValues}></Table>
      </div>
    </div>
  );
}

export default App;
