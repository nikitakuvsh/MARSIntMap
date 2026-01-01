import React, { useState } from "react";
import * as XLSX from "xlsx";
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
    };

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      console.log("Excel данные:", jsonData);

      if (onDataLoaded) onDataLoaded(jsonData);
    };
    reader.readAsArrayBuffer(file);
    setShowSuccesMessage(true);
    setIsError(false);
    setModalMessage(`Файл ${file.name} успешно прочитан!`);
  };

  return (
    <div className="filters__button">
      <label className="button--data">
        {fileName || "Выбрать Excel файл"}
        <input type="file" accept=".xlsx, .xls" onChange={handleFile} style={{ display: "none" }}/>
      </label>

      {showSuccesMessage && (
        <ModalMessage message={modalMessage} isError={isError} onClose={() => setShowSuccesMessage(false)} messageError={""} />
       )}
    </div>
  );
}
