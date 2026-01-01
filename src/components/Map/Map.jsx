import React, { useEffect, useRef, useState } from "react";
import ButtonThemeColor from "../ButtonThemeColor/ButtonThemeColor";
import regionsByArea from "./RegionsData";
import ModalMessage from "../ModalMessage/ModalMessage";
import "./Map.css";

export default function Map({ selectedRegion, setSelectedRegion, selectedRegionView = [], setSelectedRegionView, excelData = [], mapDataColumn = null, mapDataColumnValues = [] }) {
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

    useEffect(() => {
        if (!window.ymaps || mapRef.current?._map) {
            setTimeout(() => setModalMessageVisible(true), 5000);
            return;
        };

        window.ymaps.ready(() => {
            const map = new window.ymaps.Map(mapRef.current, {
                center: [55.75, 37.6],
                zoom: 6,
                controls: ["zoomControl", "typeSelector", "fullscreenControl"],
            });

            mapRef.current._map = map;
            const regions = regionsRef.current;
            const allRegions = Object.values(regionsByArea).flat();

            Promise.all([
                window.ymaps.borders.load("RU", { lang: "ru", quality: 3 }),
                window.ymaps.borders.load("BY", { lang: "ru", quality: 3 }),
                window.ymaps.borders.load("UA", { lang: "ru", quality: 3 }),
            ]).then(([ru, by, ua]) => {
                const allBorders = [...ru.features, ...by.features, ...ua.features];

                allBorders.forEach((feature) => {
                    const regionName = feature.properties.name;
                    if (!allRegions.includes(regionName)) return;

                    const polygon = new window.ymaps.GeoObject(feature, {
                        fillColor: "rgba(0,0,0,0)",
                        strokeColor: "rgba(0,0,0,0.5)",
                        strokeWidth: 1,
                    });

                    regions[regionName] = polygon;

                    polygon.events
                        .add("mouseenter", () => {
                            polygon.options.set({
                                strokeColor: "#000",    
                                strokeWidth: 3,
                            });
                        })
                        .add("mouseleave", () => {
                            if (!activeRegionsRef.current.includes(regionName)) {
                                polygon.options.set({
                                    fillColor: "rgba(0,0,0,0)",
                                    strokeColor: "rgba(0,0,0,0.5)",
                                    strokeWidth: 1,
                                });
                            }
                        })
                        .add("click", () => {
                            setActiveRegions((prev) => {
                                if (prev.includes(regionName)) {
                                    polygon.options.set({
                                        fillColor: "rgba(0,0,0,0)",
                                        strokeColor: "rgba(0,0,0,0.5)",
                                        strokeWidth: 1,
                                    });
                                    return prev.filter((r) => r !== regionName);
                                } else {
                                    polygon.options.set({
                                        fillColor: backgroundColor,
                                        strokeColor: "#000",
                                        strokeWidth: 3,
                                    });
                                    return [...prev, regionName];
                                }
                            });
                        });

                    map.geoObjects.add(polygon);
                });
            });
        });
    }, [backgroundColor]); // убрал activeRegions из зависимостей

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

    // Подсветка через фильтр
    useEffect(() => {
        const map = mapRef.current?._map;
        if (!map || !selectedRegionView) return;

        const regions = regionsRef.current;
        const viewArray = Array.isArray(selectedRegionView) ? selectedRegionView : [];

        // Собираем данные для выбранной колонки
        const regionValues = {};
        if (excelData && mapDataColumn && mapDataColumnValues) {
            viewArray.forEach((regionName, index) => {
                const val = mapDataColumnValues[index];

                // Проверка на пустое значение
                let numberValue = "—";
                if (val !== null && val !== undefined && val !== "") {
                    const parsed = parseFloat(val);
                    numberValue = isNaN(parsed) ? "—" : parsed;
                }

                regionValues[regionName] = numberValue;
            });
        }

        Object.keys(regions).forEach((regionName) => {
            const polygon = regions[regionName];
            if (!polygon) return;

            if (selectedRegionView.includes(regionName)) {
                // Подсветка региона
                polygon.options.set({
                    fillColor: backgroundColor,
                    strokeColor: "#000",
                    strokeWidth: 3,
                });

                const bounds = polygon.geometry.getBounds();
                if (!bounds) return;
                const center = window.ymaps.util.bounds.getCenter(bounds);

                const numberValue = regionValues[regionName] ?? "—";

                // Создаём или обновляем Placemark
                if (polygon._numberPlacemark) {
                    polygon._numberPlacemark.properties.set('iconContent', numberValue);
                } else {
                    const numberPlacemark = new window.ymaps.Placemark(
                        center,
                        { iconContent: numberValue },
                        {
                            iconLayout: 'default#imageWithContent',
                            iconImageHref: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z/D/PwAHggJ/PXGXgQAAAABJRU5ErkJggg==',
                            iconImageSize: [1, 1],
                            iconContentSize: [80, 80],
                            iconContentOffset: [-40, -40],
                            iconContentLayout: window.ymaps.templateLayoutFactory.createClass(
                                `<div style="
                                font-size:28px;
                                color:#2c2c2c;
                                font-weight:bold;
                                text-align:center;
                                line-height:80px;">
                                $[properties.iconContent]
                            </div>`
                            )
                        }
                    );
                    map.geoObjects.add(numberPlacemark);
                    polygon._numberPlacemark = numberPlacemark;
                }
            } else {
                // Сброс цвета и Placemark
                polygon.options.set({
                    fillColor: "rgba(0,0,0,0)",
                    strokeColor: "rgba(0,0,0,0.5)",
                    strokeWidth: 1,
                });

                if (polygon._numberPlacemark) {
                    map.geoObjects.remove(polygon._numberPlacemark);
                    polygon._numberPlacemark = null;
                }
            }
        });

        setActiveRegions(selectedRegionView);
    }, [selectedRegionView, backgroundColor, excelData, mapDataColumn, mapDataColumnValues]);

    return (
        <div className="map" id="map" ref={mapRef}>
            <ButtonThemeColor />
            {modalMessageVisible && (
                <ModalMessage message={'Ошибка при загрузке Карты. Проблема с интернетом?'} isError={true} onClose={() => setModalMessageVisible(false)} />
            )}
        </div>
    );
}
