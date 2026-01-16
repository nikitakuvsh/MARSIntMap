import React, { useEffect, useRef, useState } from "react";
import ButtonThemeColor from "../ButtonThemeColor/ButtonThemeColor";
import ButtonLayers from "../ButtonLayers/ButtonLayers";
import MapLegends from "../MapLegends/MapLegends";
import ModalMessage from "../ModalMessage/ModalMessage";
import RegionsEditorModal from "../RegionsEditorModal/RegionsEditorModal";
import "./Map.css";
import { type } from "@testing-library/user-event/dist/type";

export default function Map({ selectedRegion, setSelectedRegion, selectedRegionView = [], setSelectedRegionView, excelData = [], mapDataColumn = null, mapDataColumnValues = [], regionsByArea, setRegionsData }) {
    const mapRef = useRef(null);
    const regionsRef = useRef({});
    const redColor = "rgba(255, 0, 0, 0.82)";
    const greenColor = "rgba(6, 255, 6, 0.8)";
    const yellowColor = "rgba(242, 231, 0, 0.82)";
    const [backgroundColor, setBackgroundColor] = useState(greenColor);
    const [activeRegions, setActiveRegions] = useState([]);
    const activeRegionsRef = useRef([]);
    const [modalMessageVisible, setModalMessageVisible] = useState(false);
    activeRegionsRef.current = activeRegions; // реф всегда хранит актуальный массив
    const [distributorLegends, setDistributorLegends] = useState([]);
    const [hsrLegends, setHSRLegends] = useState([]);
    const [selectedLayers, setSelectedLayers] = useState([]);
    const mapInitialized = useRef(false);
    const [avgSell, setAvgSell] = useState(0);
    const hsrPatterns = {};

    function getHSRPattern(hsr, color) {
        if (hsrPatterns[hsr]) return hsrPatterns[hsr];

        const canvas = document.createElement("canvas");
        canvas.width = 8;
        canvas.height = 8;

        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(8, 0);
        ctx.stroke();

        const pattern = ctx.createPattern(canvas, "repeat");
        hsrPatterns[hsr] = pattern;
        return pattern;
    }


    useEffect(() => {
        if (!window.ymaps || mapInitialized.current) return;

        window.ymaps.ready(async () => {
            // Создаём карту один раз
            const map = new window.ymaps.Map(mapRef.current, {
                center: [55.75, 37.6],
                zoom: 6,
                controls: ["zoomControl", "typeSelector", "fullscreenControl"],
            });

            mapRef.current._map = map;
            mapInitialized.current = true;

            const regions = regionsRef.current;

            // Загружаем границы стран
            const [ru, by, ua] = await Promise.all([
                window.ymaps.borders.load("RU", { lang: "ru", quality: 3 }),
                window.ymaps.borders.load("BY", { lang: "ru", quality: 3 }),
                window.ymaps.borders.load("UA", { lang: "ru", quality: 3 }),
            ]);

            const allBorders = [...ru.features, ...by.features, ...ua.features];


            // Функция для обновления регионов на карте
            const updateRegions = (regionsData) => {
                const allRegions = Object.values(regionsData).flat();

                // Удаляем старые регионы
                Object.keys(regions).forEach(regionName => {
                    if (!allRegions.includes(regionName)) {
                        map.geoObjects.remove(regions[regionName]);
                        delete regions[regionName];
                    }
                });

                // Добавляем новые регионы
                allBorders.forEach(feature => {
                    const featureName = feature.properties.name;

                    // Находим совпадение с нашим массивом по частичному совпадению
                    const matchedRegion = allRegions.find(r => featureName.toLowerCase().includes(r.toLowerCase()));
                    if (!matchedRegion) return; // если нет совпадения, пропускаем

                    if (regions[matchedRegion]) return; // уже создан

                    const polygon = new window.ymaps.GeoObject(feature, {
                        fillColor: "rgba(0,0,0,0)",
                        strokeColor: "rgba(0,0,0,0.5)",
                        strokeWidth: 1,
                    });

                    // polygon.events
                    //     .add("mouseenter", () => {
                    //         // Меняем только толщину границы для наведения, цвет оставляем текущий
                    //         polygon.options.set({
                    //             strokeWidth: polygon.options.get("strokeWidth") + 1, // визуальный hover
                    //         });
                    //     })
                    //     .add("mouseleave", () => {
                    //         // При уходе мыши возвращаем только к базовым значениям, если регион не активен и не дистрибьютор
                    //         if (!activeRegionsRef.current.includes(matchedRegion) && !polygon._isDistributor) {
                    //             polygon.options.set({
                    //                 strokeColor: polygon._baseStrokeColor || "rgba(0,0,0,0.5)",
                    //                 strokeWidth: polygon._baseStrokeWidth || 1,
                    //                 fillColor: polygon._baseFillColor || "rgba(0,0,0,0)",
                    //             });
                    //         }
                    //     })
                    //     .add("click", () => {
                    //         setActiveRegions(prev => {
                    //             if (prev.includes(matchedRegion)) {
                    //                 polygon.options.set({
                    //                     fillColor: polygon._baseFillColor || "rgba(0,0,0,0)",
                    //                     strokeColor: polygon._baseStrokeColor || "rgba(0,0,0,0.5)",
                    //                     strokeWidth: polygon._baseStrokeWidth || 1,
                    //                 });
                    //                 return prev.filter(r => r !== matchedRegion);
                    //             } else {
                    //                 polygon.options.set({
                    //                     fillColor: backgroundColor,
                    //                     strokeColor: "#000",
                    //                     strokeWidth: 3,
                    //                 });
                    //                 return [...prev, matchedRegion];
                    //             }
                    //         });
                    //     });

                    // // Сохраняем базовые стили, чтобы потом их не перезаписывать
                    // polygon._baseFillColor = "rgba(0,0,0,0)";
                    // polygon._baseStrokeColor = "rgba(0,0,0,0.5)";
                    // polygon._baseStrokeWidth = 1;

                    regions[matchedRegion] = polygon;
                    map.geoObjects.add(polygon);
                });
            };


            // Первый рендер
            updateRegions(regionsByArea);

            // Подписка на изменения regionsByArea
            const unsubscribe = () => {
                // Можно здесь ничего не делать, просто для чистоты
            };

            // Сохраняем функцию для повторного обновления при изменении
            window.updateMapRegions = updateRegions;
            return unsubscribe;
        });
    }, []);

    useEffect(() => {
        const map = mapRef.current?._map;
        if (!map) return;

        const regions = regionsRef.current;
        const allRegions = Object.values(regionsByArea).flat();

        // Сброс старых регионов, которых нет в новом массиве
        Object.keys(regions).forEach(regionName => {
            if (!allRegions.includes(regionName)) {
                map.geoObjects.remove(regions[regionName]);
                delete regions[regionName];
            }
        });

        // Добавляем новые регионы, которых раньше не было
        Promise.all([
            window.ymaps.borders.load("RU", { lang: "ru", quality: 3 }),
            window.ymaps.borders.load("BY", { lang: "ru", quality: 3 }),
            window.ymaps.borders.load("UA", { lang: "ru", quality: 3 }),
        ]).then(([ru, by, ua]) => {
            const allBorders = [...ru.features, ...by.features, ...ua.features];

            allBorders.forEach(feature => {
                const regionName = feature.properties.name;
                if (!allRegions.includes(regionName)) return;
                if (regions[regionName]) return; // уже создан

                const polygon = new window.ymaps.GeoObject(feature, {
                    fillColor: "rgba(0,0,0,0)",
                    strokeColor: "rgba(0,0,0,0.5)",
                    strokeWidth: 1,
                });

                regions[regionName] = polygon;
                map.geoObjects.add(polygon);
            });
        });
    }, [regionsByArea]);


    // Навигация на выбранный регион
    useEffect(() => {
        const map = mapRef.current?._map;
        if (!map || !selectedRegion) return;

        const polygon = regionsRef.current[selectedRegion];
        if (!polygon) {
            console.warn("Регион не найден:", selectedRegion);
            return;
        }

        map.setBounds(polygon.geometry.getBounds(), {
            checkZoomRange: true,
            duration: 500,
        });

        setSelectedRegion("");
    }, [selectedRegion, setSelectedRegion]);

    // Внутри Map.jsx, на уровне компонента
    const colorsGenerated = useRef({}); // сохраняем цвета дистрибьюторов на весь жизненный цикл компонента

    useEffect(() => {
        const map = mapRef.current?._map;
        if (!map) return;

        const regions = regionsRef.current;
        const viewArray = Array.isArray(selectedRegionView) ? selectedRegionView : [];

        // 1. Сброс всех регионов и цифр
        Object.values(regions).forEach(polygon => {
            polygon.options.set({
                fillColor: "rgba(0,0,0,0)",
                strokeColor: "rgba(0,0,0,0.5)",
                strokeWidth: 1,
            });
            polygon._isDistributor = false;

            if (polygon._numberPlacemark) {
                map.geoObjects.remove(polygon._numberPlacemark);
                polygon._numberPlacemark = null;
            }
        });

        // 2. Подсветка активных регионов и цифр
        const regionValues = {};
        if (excelData && mapDataColumn && mapDataColumnValues) {
            viewArray.forEach((regionName, index) => {
                const val = mapDataColumnValues[index];
                regionValues[regionName] =
                    val !== null && val !== undefined && val !== "" && !isNaN(parseFloat(val))
                        ? parseFloat(val)
                        : "—";
            });
        }

        // 2. Подсветка активных регионов и цифр с учетом среднего по области
        const sellTotals = [];

        // Сначала собираем все SellTotal для активных регионов
        viewArray.forEach(regionName => {
            // Берём все строки для этого региона
            const rows = excelData.filter(r => r.District === regionName && r.SellTotal);
            rows.forEach(row => {
                const sellTotal = parseFloat(String(row.SellTotal).replace(",", "."));
                if (!isNaN(sellTotal)) sellTotals.push(sellTotal);
            });
        });

        excelData.forEach(row => {
            setAvgSell(row.avgSell);
        });

        // Далее для каждого региона подсвечиваем по его сумме или средней
        // 1. Сначала собираем средние значения по каждому региону
        const regionAverages = {};
        viewArray.forEach(regionName => {
            const rows = excelData.filter(r => r.District === regionName && r.SellTotal);
            if (!rows.length) return;

            const avgRegionSell =
                rows.reduce((sum, row) => {
                    const val = parseFloat(String(row.SellTotal).replace(",", "."));
                    return sum + (isNaN(val) ? 0 : val);
                }, 0) / rows.length;

            regionAverages[regionName] = avgRegionSell;
        });

        // 2. Определяем глобальный минимум и максимум
        const allValues = Object.values(regionAverages);
        const minSell = Math.min(...allValues);
        const maxSell = Math.max(...allValues);

        function getHeatColor(avgRegionSell, avgSell) {
            if (!avgSell || isNaN(avgRegionSell)) return 'rgba(128,128,128,0.8)';
        
            const ratio = avgRegionSell / avgSell;
            const clamped = Math.min(Math.max(ratio, 0), 2);
        
            let r, g;
        
            if (clamped <= 1) {
                // Красный (1 → среднее)
                r = 255;
                g = Math.round(255 * clamped); // 0 → 255
            } else {
                // Зеленый (1 → 2)
                r = Math.round(255 * (2 - clamped)); // 1 → 0
                g = 255;
            }
        
            return `rgba(${r},${g},0,0.8)`;
        }
        
        


       // 4. Присваиваем цвета регионам, сравнивая с avgSell из таблицы
       viewArray.forEach(regionName => {
        const polygon = regions[regionName];
        if (!polygon) return;
    
        // Все строки этого региона, независимо от других выбранных областей
        const rows = excelData.filter(r => r.District === regionName && r.SellTotal);
        if (!rows.length) {
            regionValues[regionName] = "—";
            polygon.options.set({ fillColor: 'rgba(128,128,128,0.8)', strokeColor: "#000", strokeWidth: 1 });
            return;
        }
    
        // Среднее для региона, фиксированное
        const avgRegionSell =
            rows.reduce((sum, row) => {
                const val = parseFloat(String(row.SellTotal).replace(",", "."));
                return sum + (isNaN(val) ? 0 : val);
            }, 0) / rows.length;
    
        regionValues[regionName] = avgRegionSell;
    

        polygon.options.set({
            fillColor: getHeatColor(avgRegionSell, parseFloat(avgSell)), // avgSell берём из таблицы
            strokeColor: "#000",
            strokeWidth: 1,
        });
    
    
            const bounds = polygon.geometry.getBounds();
            if (!bounds) return;
            const center = window.ymaps.util.bounds.getCenter(bounds);

            const numberPlacemark = new window.ymaps.Placemark(
                center,
                { iconContent: regionValues[regionName] ?? avgRegionSell ?? "—" },
                {
                    iconLayout: "default#imageWithContent",
                    iconImageHref:
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z/D/PwAHggJ/PXGXgQAAAABJRU5ErkJggg==",
                    iconImageSize: [1, 1],
                    iconContentSize: [80, 80],
                    iconContentOffset: [-40, -40],
                    iconContentLayout: window.ymaps.templateLayoutFactory.createClass(`
                <div style="
                    font-size:28px;
                    color:#2c2c2c;
                    font-weight:bold;
                    text-align:center;
                    line-height:80px;">
                    $[properties.iconContent]
                </div>
            `),
                }
            );
            map.geoObjects.add(numberPlacemark);
            polygon._numberPlacemark = numberPlacemark;
        });


        // 3. Подсветка дистрибьюторов только если слой включён
        if (selectedLayers?.includes("DistributorLayer")) {
            const activeDistributorLegends = [];
            const addedDistributors = new Set();

            excelData.forEach(row => {
                if (!row.Distributor || row.Distributor === "0") return; // пропускаем пустых и нулевых
                if (!viewArray.includes(row.District)) return;

                const polygon = regions[row.District];
                if (!polygon) return;

                // Цвет хранится в ref, генерируем только один раз
                if (!colorsGenerated.current[row.Distributor]) {
                    colorsGenerated.current[row.Distributor] = `#${Math.floor(Math.random() * 0xffffff)
                        .toString(16)
                        .padStart(6, "0")}`;
                }
                const color = colorsGenerated.current[row.Distributor];

                polygon.options.set({
                    fillColor: color,
                    strokeColor: "#000",
                    strokeWidth: 3,
                });
                polygon._isDistributor = true;

                if (!addedDistributors.has(row.Distributor)) {
                    addedDistributors.add(row.Distributor);
                    activeDistributorLegends.push({ title: row.Distributor, color });
                }
            });

            setDistributorLegends(activeDistributorLegends);
        }

        // 4. Подсветка HSR только если слой включён
        if (selectedLayers.includes("HSRLayer")) {
            const activeHSRLegends = {};
            let dashOffset = 0;

            excelData.forEach(row => {
                const hsr = row["Region / HSR"];
                const district = row.District;

                if (!hsr || !district) return;
                if (district.includes("?")) return;

                // проверяем, что регион активный
                if (!viewArray.includes(district)) return;

                const polygon = regions[district];
                if (!polygon) return;

                // Генерим цвет HSR
                if (!colorsGenerated.current[hsr]) {
                    colorsGenerated.current[hsr] =
                        `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
                }
                const hsrColor = colorsGenerated.current[hsr];

                // Заливка: если слой Distributor включён, берём цвет дистрибьютора, иначе стандартный полупрозрачный
                let fillColor = hexToRgba("#00ff00", 0.15); // стандартный полупрозрачный зелёный
                if (selectedLayers.includes("DistributorLayer")) {
                    const distributorRow = excelData.find(r => r.District === district && r.Distributor);
                    if (distributorRow) {
                        if (!colorsGenerated.current[distributorRow.Distributor]) {
                            colorsGenerated.current[distributorRow.Distributor] =
                                `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
                        }
                        fillColor = hexToRgba(colorsGenerated.current[distributorRow.Distributor], 0.9);
                    }
                }

                // Обводка: цвет HSR, если слой включён, иначе стандартный серый
                const strokeColor = hsrColor;

                polygon.options.set({
                    fillColor,
                    strokeColor,
                    strokeWidth: 4,
                });

                polygon._hsr = hsr;
                activeHSRLegends[hsr] = { color: hsrColor };

                dashOffset += 4;
            });

            setHSRLegends(
                Object.entries(activeHSRLegends).map(([title, data]) => ({
                    title,
                    color: data.color
                }))
            );
        }


        setActiveRegions(viewArray);
    }, [
        selectedRegionView,
        excelData,
        mapDataColumn,
        mapDataColumnValues,
        backgroundColor,
        selectedLayers,
    ]);

    function hexToRgba(hex, alpha = 0.3) {
        const c = hex.replace("#", "");
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }


    return (
        <div className="map" id="map" ref={mapRef}>
            <ButtonThemeColor />
            <ButtonLayers excelData={excelData} distributorLegends={distributorLegends} setDistributorLegends={setDistributorLegends} selectedLayers={selectedLayers} setSelectedLayers={setSelectedLayers} setHSRLegends={setHSRLegends} />
            <MapLegends distributorLegends={distributorLegends} hsrLegends={hsrLegends} />
            <RegionsEditorModal initRegionsData={regionsByArea} onChange={setRegionsData} />
            {modalMessageVisible && (
                <ModalMessage message={'Ошибка при загрузке Карты. Проблема с интернетом?'} isError={true} onClose={() => setModalMessageVisible(false)} />
            )}
        </div>
    );
}
