import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CalculatorHeader from '../components/CalculatorHeader';
import TncModal from '../components/TncModal';
import ProgressBar from '../components/ProgressBar';
import { currency, getMultiplier, parsePayment, formatPaymentInput } from '../utils/helpers';
import { TNC, getProductOptions, getEligibilityRequirements, calculateJanNonTerm } from '../calculators/janNonTermCalc';
import { fireConfetti } from '../utils/confettiTrigger';
import useCalcBodyStyle from '../utils/useCalcBodyStyle';
import '../assets/styles/jannonterm.css';

export default function JanNonTermPage() {
    const { type } = useParams();
    const TYPE = (type === "BAU" || type === "BFL") ? type : "BAU";
    useCalcBodyStyle();

    const [vintage, setVintage] = useState('');
    const [policyCount, setPolicyCount] = useState('');
    const [policies, setPolicies] = useState([]);
    const [results, setResults] = useState({ total: 0, upfront: 0, deferred: 0, perPolicy: [] });
    const [showTable, setShowTable] = useState(false);
    const [tncOpen, setTncOpen] = useState(false);
    const eligibilityTriggeredRef = useRef(false);

    const productOptions = getProductOptions(TYPE);

    function createEmptyPolicy() {
        return { product: '', payment: 0, paymentDisplay: '', freq: 'Monthly', autopay: 'Yes', autopayDisabled: true };
    }

    function generateRows() {
        const count = parseInt(policyCount);
        if (!count || count <= 0) { alert("Enter valid policy count"); return; }
        if (showTable && !window.confirm("This will reset all previously entered policy details.\n\nDo you want to continue?")) return;
        setPolicies(Array.from({ length: count }, () => createEmptyPolicy()));
        setShowTable(true);
        setResults({ total: 0, upfront: 0, deferred: 0, perPolicy: [] });
    }

    function addPolicy() {
        setPolicies(prev => [...prev, createEmptyPolicy()]);
        setPolicyCount(String(policies.length + 1));
        setResults({ total: 0, upfront: 0, deferred: 0, perPolicy: [] });
    }

    function removePolicy() {
        if (policies.length <= 1) { alert("At least 1 policy required."); return; }
        setPolicies(prev => prev.slice(0, -1));
        setPolicyCount(String(policies.length - 1));
        setResults({ total: 0, upfront: 0, deferred: 0, perPolicy: [] });
    }

    function updatePolicy(index, field, value) {
        setPolicies(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            if (field === 'freq') {
                if (value === 'Monthly') { updated[index].autopay = 'Yes'; updated[index].autopayDisabled = true; }
                else { updated[index].autopayDisabled = false; }
            }
            return updated;
        });
    }

    function handlePaymentInput(index, rawValue) {
        const numVal = parsePayment(rawValue);
        const display = formatPaymentInput(rawValue);
        setPolicies(prev => { const u = [...prev]; u[index] = { ...u[index], payment: numVal, paymentDisplay: display }; return u; });
    }

    function getAPE(p) { return p.payment * getMultiplier(p.freq); }

    function calculate() {
        if (!vintage) { alert("Please select Vintage."); return; }
        if (!policyCount || parseInt(policyCount) <= 0) { alert("Please enter number of policies issued."); return; }
        if (policies.length === 0) { alert("Please generate policy rows first."); return; }
        for (let p of policies) { if (!p.product) { alert("Please select Product Type for all rows."); return; } }

        const result = calculateJanNonTerm(vintage, TYPE, policies);
        if (!result.eligible) {
            alert(`❌ Not Eligible\n\nYou need:\n• ₹ ${Math.round(result.apeGap).toLocaleString("en-IN")} more Non-Term APE\n`);
            setResults({ total: 'NE', upfront: 'NE', deferred: 'NE', perPolicy: policies.map(() => 'NE') });
            return;
        }
        setResults({ total: result.total, upfront: result.upfront, deferred: result.deferred, perPolicy: result.perPolicy });
    }

    function clearAll() {
        if (!window.confirm("Are you sure you want to clear all values?\n\nThis action cannot be undone.")) return;
        eligibilityTriggeredRef.current = false;
        setPolicyCount(''); setVintage(''); setPolicies([]); setShowTable(false);
        setResults({ total: 0, upfront: 0, deferred: 0, perPolicy: [] });
    }

    // Eligibility progress
    let totalNonTermAPE = 0;
    policies.forEach(p => { if (p.product && p.product !== "Term") { totalNonTermAPE += getAPE(p); } });
    const eligReq = vintage ? getEligibilityRequirements(vintage, TYPE) : { requiredAPE: 0, requiredPolicies: 0 };

    if (vintage && totalNonTermAPE >= eligReq.requiredAPE && !eligibilityTriggeredRef.current) {
        eligibilityTriggeredRef.current = true; fireConfetti();
    } else if (vintage && totalNonTermAPE < eligReq.requiredAPE) {
        eligibilityTriggeredRef.current = false;
    }

    function fmt(v) { return v === 'NE' ? 'Not Eligible' : currency(v); }

    return (
        <>
            <CalculatorHeader title={`Jan'26 Non-Term Incentive Calculator – ${TYPE}`} />
            <div className="main-container">
                <div className="left-panel">
                    <div className="field">
                        <label>Select Vintage</label>
                        <select value={vintage} onChange={e => setVintage(e.target.value)}>
                            <option value="" disabled hidden>Select</option>
                            <option value="0-3">0-3 months</option>
                            <option value=">3">&gt;3 months</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>No. of Policies Issued</label>
                        <div className="policy-row">
                            <input type="number" value={policyCount} onChange={e => setPolicyCount(e.target.value)} min="0" max="1000" />
                            <button className="blue-btn" onClick={generateRows}>Click to fill policy details below</button>
                        </div>
                    </div>
                    <div className="button-group">
                        <button className="calculate-btn" onClick={calculate}>Calculate Incentive</button>
                        <button className="clear-btn" onClick={clearAll}>Clear All</button>
                    </div>
                </div>
                <div className="right-panel">
                    <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Click to view Terms &amp; Conditions ---</span>
                        <span id="tncIcon" onClick={() => setTncOpen(true)} style={{ cursor: 'pointer', fontWeight: '700', border: '1px solid #ccc', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>i</span>
                    </div>
                    <div className="card blue">Total Incentive<span>{fmt(results.total)}</span></div>
                    <div className="card green">Upfront Incentive<span>{fmt(results.upfront)}</span></div>
                    <div className="card yellow">Deferred Incentive<span>{fmt(results.deferred)}</span></div>
                </div>
            </div>

            {showTable && (
                <div className="table-section">
                    <table id="policyTable">
                        <thead><tr>
                            <th>Policy No.</th><th>Product Type</th><th>Payment Amount</th><th>Frequency</th><th>APE</th><th>Autopay</th><th>Incentive per Policy</th>
                        </tr></thead>
                        <tbody>
                            {policies.map((p, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td><select value={p.product} onChange={e => updatePolicy(i, 'product', e.target.value)}>
                                        <option value="" disabled hidden>Select</option>
                                        {productOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select></td>
                                    <td><input type="text" className="payment" inputMode="numeric" value={p.paymentDisplay} onChange={e => handlePaymentInput(i, e.target.value)} /></td>
                                    <td><select value={p.freq} onChange={e => updatePolicy(i, 'freq', e.target.value)}>
                                        <option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Half Yearly">Half Yearly</option><option value="Annual">Annual</option><option value="Single">Single</option>
                                    </select></td>
                                    <td className="ape">{currency(getAPE(p))}</td>
                                    <td><select value={p.autopay} disabled={p.autopayDisabled} onChange={e => updatePolicy(i, 'autopay', e.target.value)}>
                                        <option value="Yes">Yes</option><option value="No">No</option>
                                    </select></td>
                                    <td className="incentive">{results.perPolicy[i] !== undefined ? fmt(results.perPolicy[i]) : '₹ 0'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="row-buttons">
                        <button className="remove-btn" onClick={removePolicy}>− Remove Policy</button>
                        <button className="add-btn" onClick={addPolicy}>+ Add Policy</button>
                    </div>
                </div>
            )}

            <div className="sticky-eligibility">
                <div className="sticky-inner">
                    <ProgressBar label="Eligibility Progress" current={totalNonTermAPE} required={eligReq.requiredAPE} barId="eligibilityBar" isCurrency={true} />
                </div>
            </div>

            <TncModal isOpen={tncOpen} onClose={() => setTncOpen(false)} html={TNC[TYPE]} />
        </>
    );
}
