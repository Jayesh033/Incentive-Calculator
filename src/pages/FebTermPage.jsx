import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CalculatorHeader from '../components/CalculatorHeader';
import TncModal from '../components/TncModal';
import ProgressBar from '../components/ProgressBar';
import { currency, getMultiplier, parsePayment, formatPaymentInput } from '../utils/helpers';
import { CONFIG, TNC, getEligibilityRequirements, calculateFebTerm } from '../calculators/febTermCalc';
import { fireConfetti } from '../utils/confettiTrigger';
import useCalcBodyStyle from '../utils/useCalcBodyStyle';
import '../assets/styles/febterm.css';

export default function FebTermPage() {
    const { type } = useParams();
    const TYPE = (type === "BAU" || type === "BFL") ? type : "BFL";
    useCalcBodyStyle();

    const [vintage, setVintage] = useState('');
    const [medical, setMedical] = useState('');
    const [policyCount, setPolicyCount] = useState('');
    const [policies, setPolicies] = useState([]);
    const [results, setResults] = useState({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    const [showTable, setShowTable] = useState(false);
    const [tncOpen, setTncOpen] = useState(false);
    const eligibilityTriggeredRef = useRef(false);

    function createEmptyPolicy() {
        return { product: '', payment: 0, paymentDisplay: '', freq: 'Monthly', rider: 'No', riderApe: 0, riderApeDisplay: '', autopay: 'Yes' };
    }

    function generateRows() {
        const count = parseInt(policyCount);
        if (!count || count <= 0) { alert("Enter valid policy count"); return; }
        if (showTable && !window.confirm("This will reset all previously entered policy details.\n\nDo you want to continue?")) return;
        const newPolicies = Array.from({ length: count }, () => createEmptyPolicy());
        setPolicies(newPolicies);
        setShowTable(true);
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    }

    function addPolicy() {
        setPolicies(prev => [...prev, createEmptyPolicy()]);
        setPolicyCount(String(policies.length + 1));
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    }

    function removePolicy() {
        if (policies.length <= 1) { alert("At least 1 policy required."); return; }
        setPolicies(prev => prev.slice(0, -1));
        setPolicyCount(String(policies.length - 1));
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    }

    function updatePolicy(index, field, value) {
        setPolicies(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            if (field === 'rider' && value === 'No') { updated[index].riderApe = 0; updated[index].riderApeDisplay = ''; }
            return updated;
        });
    }

    function handlePaymentInput(index, rawValue) {
        const numVal = parsePayment(rawValue);
        const display = formatPaymentInput(rawValue);
        setPolicies(prev => { const u = [...prev]; u[index] = { ...u[index], payment: numVal, paymentDisplay: display }; return u; });
    }

    function handleRiderApeInput(index, rawValue) {
        const numVal = parsePayment(rawValue);
        const display = formatPaymentInput(rawValue);
        setPolicies(prev => { const u = [...prev]; u[index] = { ...u[index], riderApe: numVal, riderApeDisplay: display }; return u; });
    }

    function getAPE(p) { return p.payment * getMultiplier(p.freq); }

    function calculate() {
        if (!vintage) { alert("Please select Vintage."); return; }
        if (!policyCount || parseInt(policyCount) <= 0) { alert("Please enter number of policies issued."); return; }
        if (policies.length === 0) { alert("Please click 'Click to fill policy details below' to generate policy rows."); return; }
        for (let p of policies) { if (!p.product) { alert("Please select Product Type for all rows."); return; } }

        const result = calculateFebTerm(vintage, medical, TYPE, policies);
        if (!result.eligible) {
            let msg = "❌ Not Eligible\n\n";
            if (result.policyGap > 0) msg += `You need ${result.policyGap} more Term polic${result.policyGap > 1 ? "ies" : "y"}.\n`;
            if (result.apeGap > 0) msg += `You need ₹ ${result.apeGap.toLocaleString("en-IN")} more Term APE.\n`;
            alert(msg);
            setResults({ total: 'NE', first: 'NE', second: 'NE', thirteenth: 'NE', perPolicy: policies.map(() => 'NE') });
            return;
        }
        setResults({ total: result.total, first: result.first, second: result.second, thirteenth: result.thirteenth, perPolicy: result.perPolicy });
    }

    function clearAll() {
        if (!window.confirm("Are you sure you want to clear all values?\n\nThis action cannot be undone.")) return;
        eligibilityTriggeredRef.current = false;
        setPolicyCount(''); setVintage(''); setMedical(''); setPolicies([]); setShowTable(false);
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    }

    // Eligibility progress
    let termAPE = 0, termPolicies = 0;
    policies.forEach(p => { if (p.product === "Term") { termAPE += getAPE(p); termPolicies++; } });
    const eligReq = vintage ? getEligibilityRequirements(vintage, TYPE) : { requiredAPE: 0, requiredPolicies: 0 };

    if (vintage && termAPE >= eligReq.requiredAPE && termPolicies >= eligReq.requiredPolicies && !eligibilityTriggeredRef.current) {
        eligibilityTriggeredRef.current = true; fireConfetti();
    } else if (vintage && (termAPE < eligReq.requiredAPE || termPolicies < eligReq.requiredPolicies)) {
        eligibilityTriggeredRef.current = false;
    }

    function fmt(v) { return v === 'NE' ? 'Not Eligible' : currency(v); }

    return (
        <>
            <CalculatorHeader title={`Feb'26 Term Incentive Calculator – ${TYPE}`} />
            <div className="main-container">
                <div className="left-panel">
                    <div className="field">
                        <label>Select Vintage</label>
                        <select value={vintage} onChange={e => setVintage(e.target.value)}>
                            <option value="" disabled hidden>Select</option>
                            <option value="0-3">0-3 months</option>
                            <option value="3-6">3-6 months</option>
                            <option value="6+">&gt;6 months</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Medical completion on 75% of term login NOPs within 5 days of payment completion</label>
                        <select value={medical} onChange={e => setMedical(e.target.value)}>
                            <option value="" disabled hidden>Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
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
                    <div className="card green">1st Installment Incentive<span>{fmt(results.first)}</span></div>
                    <div className="card yellow">2nd Installment Incentive<span>{fmt(results.second)}</span></div>
                    <div className="card grey">13th Month Persistency Incentive<span>{fmt(results.thirteenth)}</span></div>
                </div>
            </div>

            {showTable && (
                <div className="table-section">
                    <table id="policyTable">
                        <thead><tr>
                            <th>Policy No.</th><th>Product Type</th><th>Payment Amount</th><th>Frequency</th><th>APE</th><th>Rider</th><th>Rider APE</th><th>Autopay</th><th>Incentive per Policy</th>
                        </tr></thead>
                        <tbody>
                            {policies.map((p, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td><select value={p.product} onChange={e => updatePolicy(i, 'product', e.target.value)}>
                                        <option value="" disabled hidden>Select</option>
                                        <option value="Term">Term</option><option value="Non-Term">Non-Term</option>
                                    </select></td>
                                    <td><input type="text" className="payment" inputMode="numeric" value={p.paymentDisplay} onChange={e => handlePaymentInput(i, e.target.value)} /></td>
                                    <td><select value={p.freq} onChange={e => updatePolicy(i, 'freq', e.target.value)}>
                                        <option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Half Yearly">Half Yearly</option><option value="Annual">Annual</option><option value="Single">Single</option>
                                    </select></td>
                                    <td className="ape">{currency(getAPE(p))}</td>
                                    <td><select value={p.rider} onChange={e => updatePolicy(i, 'rider', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    <td><input type="text" className="riderApe" inputMode="numeric" disabled={p.rider === 'No'} value={p.riderApeDisplay} onChange={e => handleRiderApeInput(i, e.target.value)} /></td>
                                    <td><select value={p.autopay} onChange={e => updatePolicy(i, 'autopay', e.target.value)}><option>Yes</option><option>No</option></select></td>
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
                    <ProgressBar label="Term APE Progress" current={termAPE} required={eligReq.requiredAPE} barId="apeProgressBar" barClass="ape-progress" isCurrency={true} />
                    <ProgressBar label="Policy Count Progress" current={termPolicies} required={eligReq.requiredPolicies} barId="policyProgressBar" barClass="policy-progress" />
                </div>
            </div>

            <TncModal isOpen={tncOpen} onClose={() => setTncOpen(false)} html={TNC[TYPE]} />
        </>
    );
}
