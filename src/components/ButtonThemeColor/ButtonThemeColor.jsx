import React from 'react';
import { useState } from 'react';
import './ButtonThemeColor.css';

export default function ButtonThemeColor(){
    const savedTheme = localStorage.getItem('selectedTheme');
    const [pageTheme, setTheme] = useState(savedTheme ? `${savedTheme}` : 'light');
    const [buttonTitle, setButtonTitle] = useState('');
    const body = document.body;
    const html = document.documentElement;
    body.classList.add(pageTheme);
    html.classList.add(pageTheme);

    function ChangeTheme(){
        if (pageTheme == 'light') {
            setTheme('dark-theme');
            setButtonTitle('Сменить тему на светлую');
            body.classList.add('dark-theme');
            html.classList.add('dark-theme')
            localStorage.setItem('selectedTheme', 'dark-theme');
        } else {
            setTheme('light');
            setButtonTitle('Сменить тему на тёмную');
            localStorage.setItem('selectedTheme', 'light');
            body.classList.remove('dark-theme');
            html.classList.remove('dark-theme');
        }
    }

    return (
        <button className="theme-color" id="theme-color" title={buttonTitle} onClick={ChangeTheme}>{pageTheme == 'light' ? '🔆' : '🌙'}</button>
    );
}