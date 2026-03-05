import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CalculatorHeader({ title }) {
    const navigate = useNavigate();

    function goBack() {
        const confirmBack = window.confirm(
            "Are you sure you want to go back?\n\nAll entered data will be lost."
        );
        if (!confirmBack) return;
        navigate('/');
    }

    return (
        <div className="header">
            <button className="back-btn" onClick={goBack}>← Back</button>
            <div className="header-title">{title}</div>
        </div>
    );
}
