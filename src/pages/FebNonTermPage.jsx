import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CalculatorHeader from '../components/CalculatorHeader';
import TncModal from '../components/TncModal';
import ProgressBar from '../components/ProgressBar';
import { currency, getMultiplier, parsePayment, formatPaymentInput } from '../utils/helpers';
import { CONFIG, TNC, getProductOptions, getEligibilityRequirements, calculateFebNonTerm, checkGate } from '../calculators/febNonTermCalc';
import { fireConfetti } from '../utils/confettiTrigger';
import useCalcBodyStyle from '../utils/useCalcBodyStyle';
import '../assets/styles/febnonterm.css';

export default function FebNonTermPage() {
    const { type } = useParams();
    const TYPE = (type === "BAU" || type === "BFL") ? type : "BAU";
    useCalcBodyStyle();

    const [vintage, setVintage] = useState('');
    const [policyCount, setPolicyCount] = useState('');
    const [policies, setPolicies] = useState([]);
    const [results, setResults] = useState({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    const [showTable, setShowTable] = useState(false);
    const [tncOpen, setTncOpen] = useState(false);
    const [eligibilityStatus, setEligibilityStatus] = useState('');
    const eligibilityTriggeredRef = useRef(false);

    const productOptions = getProductOptions(TYPE);

    function createEmptyPolicy() {
        return {
            product: '', supreme: 'No', payment: 0, paymentDisplay: '',
            freq: 'Monthly', rider: 'No', riderApe: 0, riderApeDisplay: '',
            autopay: 'Yes', autopayDisabled: true
        };
    }

    function generateRows() {
        const count = parseInt(policyCount);
        if (!count || count <= 0) {
            alert("Enter valid policy count");
            return;
        }

        if (showTable) {
            if (!window.confirm("This will reset all previously entered policy details.\n\nDo you want to continue?")) return;
        }

        const newPolicies = [];
        for (let i = 0; i < count; i++) {
            newPolicies.push(createEmptyPolicy());
        }
        setPolicies(newPolicies);
        setShowTable(true);
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
        setEligibilityStatus('');
    }

    function addPolicy() {
        setPolicies(prev => [...prev, createEmptyPolicy()]);
        setPolicyCount(String(policies.length + 1));
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    }

    function removePolicy() {
        if (policies.length <= 1) {
            alert("At least 1 policy required.");
            return;
        }
        setPolicies(prev => prev.slice(0, -1));
        setPolicyCount(String(policies.length - 1));
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
    }

    function updatePolicy(index, field, value) {
        setPolicies(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };

            // Handle autopay lock for monthly
            if (field === 'freq') {
                if (value === 'Monthly') {
                    updated[index].autopay = 'Yes';
                    updated[index].autopayDisabled = true;
                } else {
                    updated[index].autopayDisabled = false;
                }
            }

            // Handle rider disable
            if (field === 'rider' && value === 'No') {
                updated[index].riderApe = 0;
                updated[index].riderApeDisplay = '';
            }

            return updated;
        });
    }

    function handlePaymentInput(index, rawValue) {
        const numVal = parsePayment(rawValue);
        const display = formatPaymentInput(rawValue);
        setPolicies(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], payment: numVal, paymentDisplay: display };
            return updated;
        });
    }

    function handleRiderApeInput(index, rawValue) {
        const numVal = parsePayment(rawValue);
        const display = formatPaymentInput(rawValue);
        setPolicies(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], riderApe: numVal, riderApeDisplay: display };
            return updated;
        });
    }

    function getAPE(policy) {
        return policy.payment * getMultiplier(policy.freq);
    }

    function calculate() {
        if (!vintage) { alert("Please select Vintage."); return; }
        if (!policyCount || parseInt(policyCount) <= 0) { alert("Please enter number of policies issued."); return; }
        if (policies.length === 0) { alert("Please click 'Click to fill policy details below' to generate policy rows."); return; }

        // Validate all rows have product selected
        for (let i = 0; i < policies.length; i++) {
            if (!policies[i].product) {
                alert("Please select Product Type for all rows.");
                return;
            }
        }

        const result = calculateFebNonTerm(vintage, TYPE, policies);

        if (!result.eligible) {
            let message = "❌ Not Eligible\n\nYou need:\n";
            if (result.policyGap > 0) {
                message += `• ${result.policyGap} more Non-Term Polic${result.policyGap > 1 ? "ies" : "y"}\n`;
            }
            if (result.apeGap > 0) {
                message += `• ₹ ${result.apeGap.toLocaleString("en-IN")} more Non-Term APE\n`;
            }
            alert(message);

            setResults({
                total: 'Not Eligible',
                first: 'Not Eligible',
                second: 'Not Eligible',
                thirteenth: 'Not Eligible',
                perPolicy: policies.map(() => 'Not Eligible')
            });
            return;
        }

        setResults({
            total: result.total,
            first: result.first,
            second: result.second,
            thirteenth: result.thirteenth,
            perPolicy: result.perPolicy
        });
    }

    function clearAll() {
        if (!window.confirm("Are you sure you want to clear all values?\n\nThis action cannot be undone.")) return;
        eligibilityTriggeredRef.current = false;
        setPolicyCount('');
        setVintage('');
        setPolicies([]);
        setShowTable(false);
        setResults({ total: 0, first: 0, second: 0, thirteenth: 0, perPolicy: [] });
        setEligibilityStatus('');
    }

    // Compute eligibility progress
    let totalNonTermAPE = 0;
    let totalNonTermPolicies = 0;
    policies.forEach(p => {
        if (p.product && p.product !== "Term") {
            totalNonTermAPE += getAPE(p);
            totalNonTermPolicies++;
        }
    });

    const eligReq = vintage ? getEligibilityRequirements(vintage, TYPE) : { requiredAPE: 0, requiredPolicies: 0 };

    // Confetti check
    if (vintage) {
        const eligible = TYPE === "BAU"
            ? totalNonTermAPE >= eligReq.requiredAPE
            : (totalNonTermAPE >= eligReq.requiredAPE && totalNonTermPolicies >= eligReq.requiredPolicies);

        if (eligible && !eligibilityTriggeredRef.current) {
            eligibilityTriggeredRef.current = true;
            fireConfetti();
        } else if (!eligible) {
            eligibilityTriggeredRef.current = false;
        }
    }

    function formatResult(val) {
        if (typeof val === 'string') return val;
        return currency(val);
    }

    return (
        <>
            <CalculatorHeader title={`Feb'26 Non-Term Incentive Calculator – ${TYPE}`} />

            <div className="main-container">
                {/* LEFT PANEL */}
                <div className="left-panel">
                    <div className="field">
                        <label>Select Vintage</label>
                        <select value={vintage} onChange={e => setVintage(e.target.value)} required>
                            <option value="" disabled hidden>Select</option>
                            <option value="0-3">0-3 months</option>
                            <option value=">3">&gt;3 months</option>
                        </select>
                    </div>

                    <div className="field">
                        <label>No. of Policies Issued</label>
                        <div className="policy-row">
                            <input
                                type="number"
                                value={policyCount}
                                onChange={e => setPolicyCount(e.target.value)}
                                min="0" max="1000"
                            />
                            <button className="blue-btn" onClick={generateRows}>
                                Click to fill policy details below
                            </button>
                        </div>
                    </div>

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
                    <div id="eligibilityStatus" style={{ marginBottom: '-10px' }}></div>

                    <div style={{ textAlign: 'right', marginBottom: '0px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Click to view Terms &amp; Conditions ---
                        </span>
                        <span
                            id="tncIcon"
                            onClick={() => setTncOpen(true)}
                            style={{
                                cursor: 'pointer', fontWeight: '700',
                                border: '1px solid #ccc', borderRadius: '50%',
                                width: '28px', height: '28px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >i</span>
                    </div>

                    <div className="card blue">
                        Total Incentive
                        <span>{formatResult(results.total)}</span>
                    </div>
                    <div className="card green">
                        1st Installment Incentive
                        <span>{formatResult(results.first)}</span>
                    </div>
                    <div className="card yellow">
                        2nd Installment Incentive
                        <span>{formatResult(results.second)}</span>
                    </div>
                    <div className="card grey">
                        13th Month Persistency Incentive
                        <span>{formatResult(results.thirteenth)}</span>
                    </div>
                </div>
            </div>

            {/* POLICY TABLE */}
            {showTable && (
                <div className="table-section">
                    <table id="policyTable">
                        <thead>
                            <tr>
                                <th>Policy No.</th>
                                <th>Product Type</th>
                                <th>Supreme</th>
                                <th>Payment Amount</th>
                                <th>Frequency</th>
                                <th>APE</th>
                                <th>Rider</th>
                                <th>Rider APE</th>
                                <th>Autopay</th>
                                <th>Incentive per Policy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((p, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <select className="product" value={p.product} onChange={e => updatePolicy(i, 'product', e.target.value)}>
                                            <option value="" disabled hidden>Select</option>
                                            {productOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="supreme" value={p.supreme} onChange={e => updatePolicy(i, 'supreme', e.target.value)}>
                                            <option>No</option>
                                            <option>Yes</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text" className="payment" inputMode="numeric"
                                            value={p.paymentDisplay}
                                            onChange={e => handlePaymentInput(i, e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <select className="frequency" value={p.freq} onChange={e => updatePolicy(i, 'freq', e.target.value)}>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Half Yearly">Half Yearly</option>
                                            <option value="Annual">Annual</option>
                                            <option value="Single">Single</option>
                                        </select>
                                    </td>
                                    <td className="ape">{currency(getAPE(p))}</td>
                                    <td>
                                        <select className="rider" value={p.rider} onChange={e => updatePolicy(i, 'rider', e.target.value)}>
                                            <option>No</option>
                                            <option>Yes</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text" className="riderApe" inputMode="numeric"
                                            disabled={p.rider === 'No'}
                                            value={p.riderApeDisplay}
                                            onChange={e => handleRiderApeInput(i, e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="autopay" value={p.autopay}
                                            disabled={p.autopayDisabled}
                                            onChange={e => updatePolicy(i, 'autopay', e.target.value)}
                                        >
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </td>
                                    <td className="incentive">
                                        {results.perPolicy[i] !== undefined
                                            ? formatResult(results.perPolicy[i])
                                            : '₹ 0'}
                                    </td>
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

            {/* STICKY ELIGIBILITY BAR */}
            <div className="sticky-eligibility">
                <div className="sticky-inner">
                    <ProgressBar
                        label="APE Progress"
                        current={totalNonTermAPE}
                        required={eligReq.requiredAPE}
                        barId="apeProgressBar"
                        barClass="ape-progress"
                        isCurrency={true}
                    />
                    {TYPE === "BFL" && (
                        <ProgressBar
                            label="Policies"
                            current={totalNonTermPolicies}
                            required={eligReq.requiredPolicies}
                            barId="policyProgressBar"
                            barClass="policy-progress"
                        />
                    )}
                </div>
            </div>

            <TncModal isOpen={tncOpen} onClose={() => setTncOpen(false)} html={TNC[TYPE]} />
        </>
    );
}
