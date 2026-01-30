import React, { useState, useEffect } from "react";
import { read, utils } from "xlsx";
import ModalMessage from "../ModalMessage/ModalMessage";
import "./ButtonDataInput.css";

export default function ButtonDataInput({
  onDataLoaded,
  workbook,
  setWorkbook,
  sheetNames,
  setSheetNames,
  activeSheet,
  setActiveSheet
}) {
  const [fileName, setFileName] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const wb = read(evt.target.result, { type: "array" });

        if (!wb?.SheetNames?.length) {
          throw new Error("В Excel нет листов");
        }

        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setActiveSheet(wb.SheetNames[0]);

        setIsError(false);
        setModalMessage(`Файл «${file.name}» успешно загружен`);
      } catch (err) {
        console.error("Excel parse error:", err);
        setIsError(true);
        setModalMessage("Не удалось прочитать Excel файл");
      } finally {
        setShowMessage(true);
      }
    };

    reader.onerror = () => {
      setIsError(true);
      setModalMessage("Ошибка чтения файла");
      setShowMessage(true);
    };

    reader.readAsArrayBuffer(file);
  };

  const processSheet = (wb, sheetName) => {
    if (!wb || !sheetName || !wb.Sheets[sheetName]) return;

    const worksheet = wb.Sheets[sheetName];

    const jsonData = utils.sheet_to_json(worksheet, {
      defval: "",
      raw: true
    });

    const sellTotals = jsonData
      .map((row) => Number(row.SellTotal))
      .filter((v) => !Number.isNaN(v));

    const globalAvgSell = sellTotals.length
      ? sellTotals.reduce((a, b) => a + b, 0) / sellTotals.length
      : 0;

    const result = jsonData.map((row) => ({
      ...row,
      avgSell: Number(row.avgSell) || globalAvgSell
    }));

    onDataLoaded?.(result);
  };

  useEffect(() => {
    if (workbook && activeSheet) {
      processSheet(workbook, activeSheet);
    }
  }, [workbook, activeSheet]);

  return (
    <div className="filters__button">
      <label className="button--data">
        {fileName || "Выбрать Excel файл"}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          hidden
        />
      </label>

      {showMessage && (
        <ModalMessage
          message={modalMessage}
          isError={isError}
          onClose={() => setShowMessage(false)}
          messageError=""
        />
      )}
    </div>
  );
}
