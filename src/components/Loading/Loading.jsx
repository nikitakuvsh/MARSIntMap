import { useEffect } from "react";
import './Loading.css';

export default function Loading({ loadingState, stopLoading }) {

    useEffect(() => {
        if (!loadingState) return;

        setTimeout(() => {
            stopLoading();
        }, 5000)
    })

    return (
        <>
            {loadingState && (
                <div className="loading">
                    <div className="loader" />
                    <p className="loader__text">Загрузка...</p>
                </div>
            )}
        </>
    );
}