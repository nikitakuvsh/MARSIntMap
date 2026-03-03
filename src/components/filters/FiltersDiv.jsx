import React, { useState } from "react";
import ButtonDataInput from "../ButtonDataInput/ButtonDataInput";
import FiltersSearch from "./FiltersSearch";
import FiltersPosition from "./FiltersPosition";
import FiltersRegions from "./FiltersRegions";
import FiltersManagers from "./FiltersManagers";
import FiltersMapInformation from "./FiltersMapInformation";
import FiltersSheets from "./FiltersSheets";
import FiltersChannels from "./FiltersChannels";
import FiltersSalesChannels from "./FiltersSalesChannels";
import './FiltersDiv.css';

export default function FiltersDiv({ onSelectRegion, setSelectedRegion, setSelectedRegionView, excelData, setExcelData, filters, setFilters, tableValues, regionsByArea, sheetNames, setSheetNames, activeSheet, setActiveSheet, workbook, setWorkbook, headerRange }){

    const filteredData = excelData.filter((row) => {
        return (
            (!filters.region || row["Region / HSR"] === filters.region) &&
            (!filters.hsr || row["Region / HSR"] === filters.hsr) &&
            (!filters.manager || row["Manager"] === filters.manager) &&
            (!filters.distributor || row["Distributor"] == filters.distributor)
        );
    });

    return (
        <div className="filters">
            <ButtonDataInput onDataLoaded={setExcelData} sheetNames={sheetNames} setSheetNames={setSheetNames} activeSheet={activeSheet} setActiveSheet={setActiveSheet} workbook={workbook} setWorkbook={setWorkbook} headerRange={headerRange} />
            <h2 className="filters__title">Фильтры</h2>
            {sheetNames.length === 0 && (<FiltersSearch onSelectRegion={onSelectRegion} />)}
            {sheetNames.length != 0 && (
                <>
                    <FiltersSheets sheetNames={sheetNames} activeSheet={activeSheet} setSheetNames={setSheetNames} setActiveSheet={setActiveSheet} workbook={workbook} setWorkbook={setWorkbook} />
                    <FiltersSearch onSelectRegion={onSelectRegion}/>
                    <FiltersRegions regionsByArea={regionsByArea} setSelectedRegionView={setSelectedRegionView} />
                    <FiltersChannels filters={filters} setFilters={setFilters} />
                    <FiltersSalesChannels filters={filters} setFilters={setFilters} />
                    <FiltersPosition excelData={excelData} filters={filters} setFilters={setFilters} setSelectedRegionView={setSelectedRegionView} />
                    <FiltersManagers excelData={excelData} filter={filters} setFilters={setFilters} />
                    <FiltersMapInformation filters={filters} setFilters={setFilters} tableValues={tableValues} />    
                </>
            )}
        </div>
    );
}