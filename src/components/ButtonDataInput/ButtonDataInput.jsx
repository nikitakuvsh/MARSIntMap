import React, { useState } from "react";
import { read, utils } from "xlsx";
import ModalMessage from "../ModalMessage/ModalMessage";
import './ButtonDataInput.css';

export default function ButtonDataInput({ onDataLoaded }) {
  const [fileName, setFileName] = useState("");
  const [showSuccesMessage, setShowSuccesMessage] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setIsError(true);
      setModalMessage('Ошибка при чтении файла');
      setShowSuccesMessage(true);
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = read(data, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Считаем JSON без вычисления формул
      const jsonData = utils.sheet_to_json(worksheet, { defval: "", raw: true });

      // Считаем глобальное среднее SellTotal
      const sellTotals = jsonData
        .map(r => parseFloat(r.SellTotal))
        .filter(v => !isNaN(v));
      const globalAvgSell = sellTotals.length
        ? sellTotals.reduce((a, b) => a + b, 0) / sellTotals.length
        : 0;

      // Добавляем avgSell в каждую строку
      const jsonDataWithAvg = jsonData.map(row => ({
        ...row,
        avgSell: parseFloat(row.avgSell) || globalAvgSell
      }));

      console.log("Excel данные с avgSell:", jsonDataWithAvg);

      if (onDataLoaded) onDataLoaded(jsonDataWithAvg);

      setIsError(false);
      setModalMessage(`Файл ${file.name} успешно прочитан!`);
      setShowSuccesMessage(true);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="filters__button">
      <label className="button--data">
        {fileName || "Выбрать Excel файл"}
        <input type="file" accept=".xlsx, .xls" onChange={handleFile} style={{ display: "none" }}/>
      </label>

      {showSuccesMessage && (
        <ModalMessage
          message={modalMessage}
          isError={isError}
          onClose={() => setShowSuccesMessage(false)}
          messageError={""}
        />
      )}
    </div>
  );
}
