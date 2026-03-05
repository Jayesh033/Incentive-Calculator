import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TncModal from '../components/TncModal';
import { currency, getMultiplier, parsePayment, formatPaymentInput } from '../utils/helpers';
import { GATE_CONFIG, getTnc, getKey, getEligibilityRequirements, calculateJanTermSM } from '../calculators/janTermSMCalc';
import { fireConfetti } from '../utils/confettiTrigger';
import useCalcBodyStyle from '../utils/useCalcBodyStyle';
import '../assets/styles/jantermsm.css';

export default function JanTermSMPage() {
    const { type } = useParams();
    const navigate = useNavigate();
    const CALCULATOR_TYPE = type === "SM_BFL" ? "SM_BFL" : "SM_BAU";
    const labelMap = { SM_BAU: "SM BAU", SM_BFL: "SM BFL" };
    useCalcBodyStyle();

    const [team, setTeam] = useState('');
    const [tier, setTier] = useState('');
    const [vintage, setVintage] = useState('');
    const [policyCount, setPolicyCount] = useState('');
    const [policies, setPolicies] = useState([]);
    const [results, setResults] = useState({ total: 0, upfront: 0, deferred: 0 });
    const [showTable, setShowTable] = useState(false);
    const [tncOpen, setTncOpen] = useState(false);
    const eligibilityTriggeredRef = useRef(false);
    const rowsGeneratedOnceRef = useRef(false);

    function goBack() {
        const confirmBack = window.confirm("Are you sure you want to go back?\n\nAll entered data will be lost.");
        if (!confirmBack) return;
        navigate('/');
    }

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

        if (rowsGeneratedOnceRef.current) {
            if (!window.confirm("This will reset all previously entered policy details.\n\nDo you want to continue?")) return;
        }
        rowsGeneratedOnceRef.current = true;

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

    const key = getKey(team, tier, vintage);

    function calculate() {
        if (!key) { alert("Please complete Team / Tier / Vintage selection before calculating."); return; }
        if (policies.length === 0) { alert("Generate policy rows first"); return; }

        let missingProduct = false;
        for (let p of policies) { if (!p.product) { missingProduct = true; break; } }
        if (missingProduct) { alert("Select Product for all rows before calculating."); return; }

        const result = calculateJanTermSM(CALCULATOR_TYPE, key, policies);
        if (!result.eligible) {
            alert(`Not Eligible – Minimum ${result.requiredPolicies} term policies required.`);
            setResults({ total: 'NE', upfront: 'NE', deferred: 'NE' });
            return;
        }
        setResults({ total: result.total, upfront: result.upfront, deferred: result.deferred });
    }

    function clearAll() {
        if (!window.confirm("Are you sure you want to clear all values?")) return;
        eligibilityTriggeredRef.current = false;
        rowsGeneratedOnceRef.current = false;
        setTeam(''); setTier(''); setVintage(''); setPolicyCount('');
        setPolicies([]); setShowTable(false);
        setResults({ total: 0, upfront: 0, deferred: 0 });
    }

    // Eligibility
    let termCount = 0;
    let totalAPE = 0;
    policies.forEach(p => { if (p.product && p.product !== "Non-Term") { termCount++; totalAPE += getAPE(p); } });
    const eligReq = key ? getEligibilityRequirements(CALCULATOR_TYPE, key) : { requiredPolicies: 0 };
    const avgAPE = termCount > 0 ? totalAPE / termCount : 0;
    const required = eligReq.requiredPolicies;
    const percent = required > 0 ? Math.min((termCount / required) * 100, 100) : 0;
    const isComplete = termCount >= required && required > 0;

    if (key && isComplete && !eligibilityTriggeredRef.current) {
        eligibilityTriggeredRef.current = true; fireConfetti();
    } else if (key && !isComplete) {
        eligibilityTriggeredRef.current = false;
    }

    function fmt(v) { return v === 'NE' ? 'Not Eligible' : currency(v); }

    function handleVisibility(p) {
        const result = {};
        result.sachetDisabled = p.product !== "Isecure";
        result.paytypeDisabled = p.product !== "Etouch" && p.product !== "Isecure";
        result.ciDisabled = p.product !== "Etouch" && p.product !== "Isecure";
        result.adbDisabled = p.product !== "Etouch" && p.product !== "Isecure";
        result.superwomanDisabled = p.product !== "Etouch";
        result.ekycDisabled = p.product !== "Etouch" && p.product !== "Isecure";
        result.aggDisabled = p.product !== "Etouch" && p.product !== "Isecure";
        return result;
    }

    const eligText = isComplete
        ? `${required} / ${required}  ✅`
        : `${termCount} / ${required}`;

    return (
        <>
            {/* HEADER */}
            <div className="header">
                <button className="back-btn" onClick={goBack}>← Back</button>
                <div className="header-title">
                    Jan'26 Term Incentive Calculator – <span id="typeLabel">{labelMap[CALCULATOR_TYPE]}</span>
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className="main-container">

                {/* LEFT PANEL */}
                <div className="left-panel">

                    {/* Team Selection */}
                    <div className="field">
                        <label>Select Team</label>
                        <select id="teamSelect" value={team} onChange={e => { setTeam(e.target.value); setTier(''); setVintage(''); setResults({ total: 0, upfront: 0, deferred: 0 }); }}>
                            <option value="" disabled hidden>Select</option>
                            <option value="INHOUSE">Inhouse</option>
                            <option value="HRO">HRO</option>
                        </select>
                    </div>

                    {/* Tier (for Inhouse) */}
                    {team === "INHOUSE" && (
                        <div className="field" id="tierField">
                            <label>Select Tier</label>
                            <select id="tierSelect" value={tier} onChange={e => { setTier(e.target.value); setResults({ total: 0, upfront: 0, deferred: 0 }); }}>
                                <option value="" disabled hidden>Select</option>
                                <option value="TIER1">Tier 1</option>
                                <option value="TIER2">Tier 2</option>
                            </select>
                        </div>
                    )}

                    {/* Vintage (for HRO) */}
                    {team === "HRO" && (
                        <div className="field" id="vintageField">
                            <label>Select Vintage</label>
                            <select id="vintageSelect" value={vintage} onChange={e => { setVintage(e.target.value); setResults({ total: 0, upfront: 0, deferred: 0 }); }}>
                                <option value="" disabled hidden>Select</option>
                                <option value="<3">Less than 3 months</option>
                                <option value=">3">More than 3 months</option>
                            </select>
                        </div>
                    )}

                    {/* Policy Count */}
                    <div className="field">
                        <label>No. of Policies Issued</label>
                        <div className="policy-row">
                            <input type="number" id="policyCount" value={policyCount} onChange={e => setPolicyCount(e.target.value)} min="0" max="1000" />
                            <button className="blue-btn" onClick={generateRows}>
                                Click to fill policy details below
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="button-group">
                        <button className="calculate-btn" onClick={calculate}>
                            Calculate Incentive
                        </button>
                        <button className="clear-btn" onClick={clearAll}>
                            Clear All
                        </button>
                    </div>

                </div>

                {/* RIGHT PANEL */}
                <div className="right-panel">

                    <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Click to view Terms &amp; Conditions ---
                        </span>
                        <span id="tncIcon" onClick={() => setTncOpen(true)}
                            style={{
                                cursor: 'pointer', fontWeight: '700',
                                border: '1px solid #ccc', borderRadius: '50%',
                                width: '28px', height: '28px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>i</span>
                    </div>

                    {/* Dashboard Cards */}
                    <div className="card blue">
                        Total Incentive
                        <span id="total">{fmt(results.total)}</span>
                    </div>

                    <div className="card green">
                        Upfront Incentive
                        <span id="upfront">{fmt(results.upfront)}</span>
                    </div>

                    <div className="card yellow">
                        Deferred Incentive
                        <span id="deferred">{fmt(results.deferred)}</span>
                    </div>

                    <div id="atsContainer" className="ats-container">
                        <div id="atsValue">
                            Term Average Ticket Size (ATS): {currency(avgAPE)}
                        </div>
                        <div id="termCountValue">
                            Total Term Policies: {termCount}
                        </div>
                    </div>

                </div>

            </div>

            {/* TABLE SECTION */}
            {showTable && (
                <div className="table-section" id="tableSection">
                    <table id="policyTable">
                        <tbody>
                            <tr>
                                <th>#</th><th>Product</th><th>Sachet</th><th>Pay Type</th><th>Amount</th><th>Frequency</th>
                                <th>APE</th><th>Autopay</th><th>BFL</th><th>CI &gt;25L</th><th>ADB &gt;1Cr</th>
                                <th>Superwoman</th><th>Spouse</th><th>EKYC</th><th>Acc Agg</th>
                            </tr>
                            {policies.map((p, i) => {
                                const vis = handleVisibility(p);
                                return (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <select className="product" value={p.product} onChange={e => updatePolicy(i, 'product', e.target.value)}>
                                                <option value="" disabled hidden>Select</option>
                                                <option>Etouch</option><option>Isecure</option><option>Other Term</option><option>Non-Term</option>
                                            </select>
                                        </td>
                                        <td><select className="sachet" value={p.sachet} disabled={vis.sachetDisabled} onChange={e => updatePolicy(i, 'sachet', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                        <td>
                                            <select className="paytype" value={p.paytype} disabled={vis.paytypeDisabled} onChange={e => updatePolicy(i, 'paytype', e.target.value)}>
                                                <option>Regular Pay</option><option>Limited Pay - 5 years</option><option>Limited Pay - 6 years</option><option>Limited Pay - 10 years</option><option>Limited Pay - 12 years</option><option>Limited Pay - 15 years</option>
                                            </select>
                                        </td>
                                        <td><input type="text" className="amount" value={p.amountDisplay} onChange={e => handleAmountInput(i, e.target.value)} /></td>
                                        <td>
                                            <select className="frequency" value={p.freq} onChange={e => updatePolicy(i, 'freq', e.target.value)}>
                                                <option>Monthly</option><option>Quarterly</option><option>Half Yearly</option><option>Annual</option><option>Single</option>
                                            </select>
                                        </td>
                                        <td className="ape">{currency(getAPE(p))}</td>
                                        <td><select className="autopay" value={p.autopay} onChange={e => updatePolicy(i, 'autopay', e.target.value)}><option>Yes</option><option>No</option></select></td>
                                        <td><select className="bfl" value={p.bfl} onChange={e => updatePolicy(i, 'bfl', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                        <td><select className="ci" value={p.ci} disabled={vis.ciDisabled} onChange={e => updatePolicy(i, 'ci', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                        <td><select className="adb" value={p.adb} disabled={vis.adbDisabled} onChange={e => updatePolicy(i, 'adb', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                        <td><select className="superwoman" value={p.superwoman} disabled={vis.superwomanDisabled} onChange={e => updatePolicy(i, 'superwoman', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                        <td><select className="spouse" value={p.spouse} onChange={e => updatePolicy(i, 'spouse', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                        <td><select className="ekyc" value={p.ekyc} disabled={vis.ekycDisabled} onChange={e => updatePolicy(i, 'ekyc', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                        <td><select className="agg" value={p.agg} disabled={vis.aggDisabled} onChange={e => updatePolicy(i, 'agg', e.target.value)}><option>No</option><option>Yes</option></select></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="row-buttons">
                        <button className="remove-btn" onClick={removePolicy}>− Remove</button>
                        <button className="add-btn" onClick={addPolicy}>+ Add</button>
                    </div>
                </div>
            )}

            {/* STICKY ELIGIBILITY BAR */}
            <div className="sticky-eligibility">
                <div className="sticky-inner">
                    <div className="sticky-text">
                        Eligibility Progress
                        <span id="eligibilityText">{eligText}</span>
                    </div>
                    <div className="sticky-bar-wrapper">
                        <div
                            className={`sticky-bar-fill${isComplete ? ' complete' : ''}`}
                            id="eligibilityBar"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* T&C MODAL */}
            <TncModal isOpen={tncOpen} onClose={() => setTncOpen(false)} html={getTnc(CALCULATOR_TYPE)} />
        </>
    );
}
