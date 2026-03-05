import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CalculatorHeader from '../components/CalculatorHeader';
import TncModal from '../components/TncModal';
import ProgressBar from '../components/ProgressBar';
import { currency, getMultiplier, parsePayment, formatPaymentInput } from '../utils/helpers';
import { GATE_CONFIG, getTnc, getEligibilityRequirements, calculateJanTermOutsource } from '../calculators/janTermOutsourceCalc';
import { fireConfetti } from '../utils/confettiTrigger';
import useCalcBodyStyle from '../utils/useCalcBodyStyle';
import '../assets/styles/jantermoutsource.css';

export default function JanTermOutsourcePage() {
    const { type } = useParams();
    const CALCULATOR_TYPE = type === "OUTSOURCE_BFL" ? "OUTSOURCE_BFL" : "OUTSOURCE_BAU";
    const labelMap = { OUTSOURCE_BAU: "Outsource BAU", OUTSOURCE_BFL: "Outsource BFL" };
    useCalcBodyStyle();

    const [vintage, setVintage] = useState('');
    const [policyCount, setPolicyCount] = useState('');
    const [policies, setPolicies] = useState([]);
    const [results, setResults] = useState({ total: 0, upfront: 0, deferred: 0 });
    const [showTable, setShowTable] = useState(false);
    const [tncOpen, setTncOpen] = useState(false);
    const eligibilityTriggeredRef = useRef(false);

    const showBflColumn = CALCULATOR_TYPE !== "OUTSOURCE_BFL";

    function createEmptyPolicy() {
        return {
            product: '', sachet: 'No', paytype: 'Regular Pay', amount: 0, amountDisplay: '',
            freq: 'Monthly', autopay: 'Yes', bfl: 'No', ci: 'No', adb: 'No',
            superwoman: 'No', spouse: 'No', ekyc: 'No', agg: 'No'
        };
    }

    function generateRows() {
        const count = parseInt(policyCount);
        if (!count || count <= 0) { alert("Enter valid policy count"); return; }
        if (showTable && !window.confirm("This will reset all previously entered policy details.\n\nDo you want to continue?")) return;
        setPolicies(Array.from({ length: count }, () => createEmptyPolicy()));
        setShowTable(true);
        setResults({ total: 0, upfront: 0, deferred: 0 });
    }

    function addPolicy() {
        setPolicies(prev => [...prev, createEmptyPolicy()]);
        setPolicyCount(String(policies.length + 1));
        setResults({ total: 0, upfront: 0, deferred: 0 });
    }

    function removePolicy() {
        if (policies.length <= 1) { alert("Minimum 1 policy required"); return; }
        setPolicies(prev => prev.slice(0, -1));
        setPolicyCount(String(policies.length - 1));
        setResults({ total: 0, upfront: 0, deferred: 0 });
    }

    function updatePolicy(index, field, value) {
        setPolicies(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }

    function handleAmountInput(index, rawValue) {
        const numVal = parsePayment(rawValue);
        const display = formatPaymentInput(rawValue);
        setPolicies(prev => { const u = [...prev]; u[index] = { ...u[index], amount: numVal, amountDisplay: display }; return u; });
    }

    function getAPE(p) { return p.amount * getMultiplier(p.freq); }

    function calculate() {
        if (!vintage) { alert("Please complete Team / Tier / Vintage selection before calculating."); return; }
        if (policies.length === 0) { alert("Generate policy rows first"); return; }
        for (let p of policies) { if (!p.product) { alert("Select Product for all rows before calculating."); return; } }

        const result = calculateJanTermOutsource(CALCULATOR_TYPE, vintage, policies);
        if (!result.eligible) {
            alert(`Not Eligible – You need minimum ${result.requiredPolicies} term policies for ${vintage} vintage.`);
            setResults({ total: 'NE', upfront: 'NE', deferred: 'NE' });
            return;
        }
        setResults({ total: result.total, upfront: result.upfront, deferred: result.deferred });
    }

    function clearAll() {
        if (!window.confirm("Are you sure you want to clear all values?")) return;
        eligibilityTriggeredRef.current = false;
        setVintage(''); setPolicyCount(''); setPolicies([]); setShowTable(false);
        setResults({ total: 0, upfront: 0, deferred: 0 });
    }

    // Eligibility
    let termCount = 0, totalAPE = 0;
    policies.forEach(p => { if (p.product && p.product !== "Non-Term") { termCount++; totalAPE += getAPE(p); } });
    const eligReq = vintage ? getEligibilityRequirements(CALCULATOR_TYPE, vintage) : { requiredPolicies: 0 };
    const avgAPE = termCount > 0 ? totalAPE / termCount : 0;

    if (vintage && termCount >= eligReq.requiredPolicies && eligReq.requiredPolicies > 0 && !eligibilityTriggeredRef.current) {
        eligibilityTriggeredRef.current = true; fireConfetti();
    } else if (vintage && termCount < eligReq.requiredPolicies) {
        eligibilityTriggeredRef.current = false;
    }

    function fmt(v) { return v === 'NE' ? 'Not Eligible' : currency(v); }

    function isDisabled(p, field) {
        if (p.product === "Non-Term") return true;
        if (field === 'sachet' && p.product !== "Isecure") return true;
        if (field === 'paytype' && p.product !== "Etouch" && p.product !== "Isecure") return true;
        if ((field === 'ci' || field === 'adb') && p.product !== "Etouch" && p.product !== "Isecure") return true;
        if (field === 'superwoman' && p.product !== "Etouch") return true;
        if ((field === 'ekyc' || field === 'agg') && p.product !== "Etouch" && p.product !== "Isecure") return true;
        return false;
    }

    return (
        <>
            <CalculatorHeader title={`Jan'26 Term Incentive Calculator – ${labelMap[CALCULATOR_TYPE]}`} />
            <div className="main-container">
                <div className="left-panel">
                    <div className="field">
                        <label>Select Vintage</label>
                        <select value={vintage} onChange={e => { setVintage(e.target.value); setResults({ total: 0, upfront: 0, deferred: 0 }); }}>
                            <option value="" disabled hidden>Select</option>
                            <option value="0-3">0-3 months</option>
                            <option value="3-6">3-6 months</option>
                            <option value=">6">&gt;6 months</option>
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
                    <div className="ats-container">
                        <div>Term Average Ticket Size (ATS): {currency(avgAPE)}</div>
                        <div>Total Term Policies: {termCount}</div>
                    </div>
                </div>
            </div>

            {showTable && (
                <div className="table-section">
                    <table id="policyTable">
                        <thead><tr>
                            <th>#</th><th>Product</th><th>Sachet</th><th>Pay Type</th><th>Amount</th><th>Frequency</th>
                            <th>APE</th><th>Autopay</th>
                            {showBflColumn && <th>BFL</th>}
                            <th>CI &gt;25L</th><th>ADB &gt;1Cr</th>
                            <th>Superwoman</th><th>Spouse</th><th>EKYC</th><th>Acc Agg</th>
                        </tr></thead>
                        <tbody>
                            {policies.map((p, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td><select value={p.product} onChange={e => updatePolicy(i, 'product', e.target.value)}>
                                        <option value="" disabled hidden>Select</option>
                                        <option>Etouch</option><option>Isecure</option><option>Other Term</option><option>Non-Term</option>
                                    </select></td>
                                    <td><select value={p.sachet} disabled={isDisabled(p, 'sachet')} onChange={e => updatePolicy(i, 'sachet', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    <td><select value={p.paytype} disabled={isDisabled(p, 'paytype')} onChange={e => updatePolicy(i, 'paytype', e.target.value)}>
                                        <option>Regular Pay</option><option>Limited Pay - 5 years</option><option>Limited Pay - 6 years</option><option>Limited Pay - 10 years</option><option>Limited Pay - 12 years</option><option>Limited Pay - 15 years</option>
                                    </select></td>
                                    <td><input type="text" disabled={p.product === 'Non-Term'} value={p.amountDisplay} onChange={e => handleAmountInput(i, e.target.value)} /></td>
                                    <td><select value={p.freq} disabled={p.product === 'Non-Term'} onChange={e => updatePolicy(i, 'freq', e.target.value)}>
                                        <option>Monthly</option><option>Quarterly</option><option>Half Yearly</option><option>Annual</option><option>Single</option>
                                    </select></td>
                                    <td className="ape">{currency(getAPE(p))}</td>
                                    <td><select value={p.autopay} disabled={p.product === 'Non-Term'} onChange={e => updatePolicy(i, 'autopay', e.target.value)}><option>Yes</option><option>No</option></select></td>
                                    {showBflColumn && <td><select value={p.bfl} disabled={p.product === 'Non-Term'} onChange={e => updatePolicy(i, 'bfl', e.target.value)}><option>No</option><option>Yes</option></select></td>}
                                    <td><select value={p.ci} disabled={isDisabled(p, 'ci')} onChange={e => updatePolicy(i, 'ci', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    <td><select value={p.adb} disabled={isDisabled(p, 'adb')} onChange={e => updatePolicy(i, 'adb', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    <td><select value={p.superwoman} disabled={isDisabled(p, 'superwoman')} onChange={e => updatePolicy(i, 'superwoman', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    <td><select value={p.spouse} disabled={p.product === 'Non-Term'} onChange={e => updatePolicy(i, 'spouse', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    <td><select value={p.ekyc} disabled={isDisabled(p, 'ekyc')} onChange={e => updatePolicy(i, 'ekyc', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    <td><select value={p.agg} disabled={isDisabled(p, 'agg')} onChange={e => updatePolicy(i, 'agg', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="row-buttons">
                        <button className="remove-btn" onClick={removePolicy}>− Remove</button>
                        <button className="add-btn" onClick={addPolicy}>+ Add</button>
                    </div>
                </div>
            )}

            <div className="sticky-eligibility">
                <div className="sticky-inner">
                    <ProgressBar label="Eligibility Progress" current={termCount} required={eligReq.requiredPolicies} barId="eligibilityBar" />
                </div>
            </div>

            <TncModal isOpen={tncOpen} onClose={() => setTncOpen(false)} html={getTnc(CALCULATOR_TYPE)} />
        </>
    );
}
