import React from 'react';

export default function ProgressBar({ label, current, required, barId, barClass, isCurrency }) {
    const percent = required > 0 ? Math.min((current / required) * 100, 100) : 0;
    const isComplete = current >= required && required > 0;

    let displayText;
    if (required === 0) {
        displayText = isCurrency ? "₹ 0 / ₹ 0" : "0 / 0";
    } else if (isCurrency) {
        displayText = isComplete
            ? `₹ ${Math.round(required).toLocaleString("en-IN")} / ₹ ${Math.round(required).toLocaleString("en-IN")}  ✅`
            : `₹ ${Math.round(current).toLocaleString("en-IN")} / ₹ ${Math.round(required).toLocaleString("en-IN")}`;
    } else {
        displayText = isComplete
            ? `${required} / ${required}  ✅`
            : `${current} / ${required}`;
    }

    return (
        <div className={barClass || ''}>
            <div className="sticky-row">
                <span className="sticky-label"><b>{label}</b></span>
                <span className="sticky-amount">{displayText}</span>
            </div>
            <div className="sticky-bar-wrapper">
                <div
                    className={`sticky-bar-fill${isComplete ? ' complete' : ''}`}
                    id={barId}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
