import React, { useState } from "react";
import ButtonDataInput from "../ButtonDataInput/ButtonDataInput";
import FiltersSearch from "./FiltersSearch";
import FiltersPosition from "./FiltersPosition";
import FiltersRegions from "./FiltersRegions";
import FiltersManagers from "./FiltersManagers";
import FiltersMapInformation from "./FiltersMapInformation";
import './FiltersDiv.css';

export default function FiltersDiv({ onSelectRegion, setSelectedRegion, setSelectedRegionView, excelData, setExcelData, filters, setFilters, tableValues }){

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
            <ButtonDataInput onDataLoaded={setExcelData} />
            <h2 className="filters__title">Фильтры</h2>
            <FiltersSearch onSelectRegion={onSelectRegion}/>
            <FiltersRegions />
            <FiltersPosition excelData={excelData} filters={filters} setFilters={setFilters} setSelectedRegionView={setSelectedRegionView} />
            <FiltersManagers excelData={excelData} filter={filters} setFilters={setFilters} />
            <FiltersMapInformation filters={filters} setFilters={setFilters} tableValues={tableValues} />
        </div>
    );
}