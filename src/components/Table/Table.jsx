import React, { useMemo, useEffect } from "react";
import "./Table.css";

export default function Table({ excelData = [], filters, setTableValues }) {
    const INFO_COLUMNS = [
        "# of distr offices",
        "# of RKA offices",
        "Merch agency",
        "# of 5-ka offices",
        "# of Magnit offices",
    ];

    const SALES_COLUMNS = [
        "Продажи RKA Tier 1-2",
        "Продажи прочих RKA SL",
        "Продажи прочих SL каналов",
        "Продажи 5-ka generalist",
        "Продажи Magnit generalist",
        "Продажи прочих NA c SO generalist",
        "Продажи Lenta generalist",
        "Продажи Merch-model",
    ];

    const allColumns = [...INFO_COLUMNS, ...SALES_COLUMNS];

    // =======================
    // Фильтрация строк
    // =======================
    const filteredRows = useMemo(() => {
        return excelData.filter((row) => {
            const checkFilter = (filterValue, cellValue) => {
                if (!filterValue || filterValue === "Total") return true;
                if (Array.isArray(filterValue)) return filterValue.includes(cellValue);
                return filterValue === cellValue;
            };

            return (
                checkFilter(filters.district, row["District"]) &&
                checkFilter(filters.manager, row["Manager"]) &&
                checkFilter(filters.distributor, row["Distributor"]) &&
                checkFilter(filters.territory, row["Territory"])
            );
        });
    }, [excelData, filters]);

    // =======================
    // Передача значений таблицы наверх
    // =======================
    useEffect(() => {
        if (!excelData.length) return;

        const values = {};
        allColumns.forEach(col => {
            values[col] = filteredRows.map(row => {
                const val = row[col];
                return val === null || val === undefined || val === "" ? "—" : val;
            });
        });

        setTableValues && setTableValues(values);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [excelData, filters]);

    // =======================
    // Остальная логика таблицы без изменений
    // =======================
    const calculateColumns = (rows, columns) => {
        const isTotalSelected = Object.values(filters).some(f => f === "Total" || f === "");
        const result = {};

        columns.forEach(col => {
            if (!rows.length) {
                result[col] = "—";
            } else if (isTotalSelected) {
                const sum = rows.reduce((acc, row) => {
                    const val = row[col];
                    if (typeof val === "number") return acc + val;
                    return acc;
                }, 0);
                result[col] = sum || "—";
            } else {
                const val = rows[0][col];
                result[col] = val === null || val === undefined || val === "" ? "—" : val;
            }
        });

        return result;
    };

    const infoData = useMemo(() => calculateColumns(filteredRows, INFO_COLUMNS), [filteredRows, filters]);
    const salesData = useMemo(() => calculateColumns(filteredRows, SALES_COLUMNS), [filteredRows, filters]);

    if (!filteredRows.length) return <div className="table__empty">Нет данных для выбранных фильтров</div>;

    const mid = Math.ceil(SALES_COLUMNS.length / 2);
    const salesPart1 = SALES_COLUMNS.slice(0, mid);
    const salesPart2 = SALES_COLUMNS.slice(mid);

    return (
        <div className="table">
            {/* INFO */}
            <div className="table__block">
                <h3 className="table__title">Общая информация</h3>
                <table className="table__table">
                    <thead>
                        <tr className="table__row">
                            {INFO_COLUMNS.map((col) => <th key={col} className="table__th">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="table__row">
                            {INFO_COLUMNS.map((col) => <td key={col} className="table__td">{infoData[col]}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* SALES — PART 1 */}
            <div className="table__block">
                <h3 className="table__title">Продажи</h3>
                <table className="table__table">
                    <thead>
                        <tr className="table__row">
                            {salesPart1.map((col) => <th key={col} className="table__th">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="table__row">
                            {salesPart1.map((col) => <td key={col} className="table__td">{salesData[col]}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* SALES — PART 2 */}
            <div className="table__block">
                <h3 className="table__title">Продажи</h3>
                <table className="table__table">
                    <thead>
                        <tr className="table__row">
                            {salesPart2.map((col) => <th key={col} className="table__th">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="table__row">
                            {salesPart2.map((col) => <td key={col} className="table__td">{salesData[col]}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
