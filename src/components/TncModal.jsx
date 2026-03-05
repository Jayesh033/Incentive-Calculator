import React from 'react';

export default function TncModal({ isOpen, onClose, html }) {
    if (!isOpen) return null;

    return (
        <div className="tnc-overlay" style={{ display: 'block' }} onClick={(e) => {
            if (e.target.className === 'tnc-overlay') onClose();
        }}>
            <div className="tnc-box">
                <div className="tnc-header">
                    <h3>Terms &amp; Conditions</h3>
                    <span className="tnc-close" onClick={onClose}>✕</span>
                </div>
                <div className="tnc-body" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </div>
    );
}
