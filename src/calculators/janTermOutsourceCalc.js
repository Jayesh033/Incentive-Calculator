/* ================= JAN TERM OUTSOURCE CALCULATOR ================= */
/* Business logic copied verbatim from jantermoutsource.js */

import { currency, getMultiplier } from '../utils/helpers';

export const GATE_CONFIG = {
    OUTSOURCE_BAU: { "0-3": 3, "3-6": 5, ">6": 7 },
    OUTSOURCE_BFL: { "0-3": 2, "3-6": 3, ">6": 5 }
};

export const TERM_SLABS = {
    "0-3": { 3: 3000, 4: 4000, 5: 5000, 6: 6100, 7: 7300, 8: 8700, 9: 10100, 10: 11700, 11: 13500, 12: 15500, 13: 17700, 14: 20100, 15: 22500, 16: 25100, 17: 27100, 18: 29100, 19: 31100, 20: 33100, 21: 35100, 22: 37100, 23: 39100, 24: 41100, 25: 43100, 26: 45100, 27: 47100, 28: 49100, 29: 51100, 30: 53100, 31: 55100, 32: 57100, 33: 59100, 34: 61100, 35: 63100, 36: 65100, 37: 67100, 38: 69100, 39: 71100, 40: 73100, 41: 75100, 42: 77100, 43: 79100, 44: 81100, 45: 83100, 46: 85100, 47: 87100, 48: 89100, 49: 91100, 50: 93100 },
    "3-6": { 5: 5000, 6: 6100, 7: 7300, 8: 8700, 9: 10100, 10: 11700, 11: 13500, 12: 15500, 13: 17700, 14: 20100, 15: 22500, 16: 25100, 17: 27700, 18: 29700, 19: 31700, 20: 33700, 21: 35700, 22: 37700, 23: 39700, 24: 41700, 25: 43700, 26: 45700, 27: 47700, 28: 49700, 29: 51700, 30: 53700, 31: 55700, 32: 57700, 33: 59700, 34: 61700, 35: 63700, 36: 65700, 37: 67700, 38: 69700, 39: 71700, 40: 73700, 41: 75700, 42: 77700, 43: 79700, 44: 81700, 45: 83700, 46: 85700, 47: 87700, 48: 89700, 49: 91700, 50: 93700, 51: 95700, 52: 97700 },
    ">6": { 7: 7000, 8: 8100, 9: 9300, 10: 10700, 11: 12100, 12: 13700, 13: 15500, 14: 17500, 15: 19700, 16: 22100, 17: 24100, 18: 26100, 19: 28100, 20: 30100, 21: 32100, 22: 34100, 23: 36100, 24: 38100, 25: 40100, 26: 42100, 27: 44100, 28: 46100, 29: 48100, 30: 50100, 31: 52100, 32: 54100, 33: 56100, 34: 58100, 35: 60100, 36: 62100, 37: 64100, 38: 66100, 39: 68100, 40: 70100, 41: 72100, 42: 74100, 43: 76100, 44: 78100, 45: 80100, 46: 82100, 47: 84100, 48: 86100, 49: 88100, 50: 90100, 51: 92100, 52: 94100, 53: 96100, 54: 98100 }
};

export const TERM_SLABS_BFL = {
    "0-3": { 2: 2000, 3: 3000, 4: 4000, 5: 5200, 6: 6400, 7: 7600, 8: 9000, 9: 10500, 10: 12200, 11: 14000, 12: 16000, 13: 18200, 14: 20600, 15: 23000, 16: 25000, 17: 27000, 18: 29000, 19: 31000, 20: 33000, 21: 35000, 22: 37000, 23: 39000, 24: 41000, 25: 43000, 26: 45000, 27: 47000, 28: 49000, 29: 51000, 30: 53000, 31: 55000, 32: 57000, 33: 59000, 34: 61000, 35: 63000, 36: 65000, 37: 67000, 38: 69000, 39: 71000, 40: 73000, 41: 75000, 42: 77000, 43: 79000, 44: 81000, 45: 83000, 46: 85000, 47: 87000, 48: 89000, 49: 91000, 50: 93000 },
    "3-6": { 3: 3000, 4: 4000, 5: 5200, 6: 6400, 7: 7600, 8: 9000, 9: 10500, 10: 12200, 11: 14000, 12: 16000, 13: 18200, 14: 20600, 15: 23000, 16: 25000, 17: 27000, 18: 29000, 19: 31000, 20: 33000, 21: 35000, 22: 37000, 23: 39000, 24: 41000, 25: 43000, 26: 45000, 27: 47000, 28: 49000, 29: 51000, 30: 53000, 31: 55000, 32: 57000, 33: 59000, 34: 61000, 35: 63000, 36: 65000, 37: 67000, 38: 69000, 39: 71000, 40: 73000, 41: 75000, 42: 77000, 43: 79000, 44: 81000, 45: 83000, 46: 85000, 47: 87000, 48: 89000, 49: 91000, 50: 93000, 51: 95000 },
    ">6": { 5: 5000, 6: 6000, 7: 7200, 8: 8400, 9: 9600, 10: 11000, 11: 12500, 12: 14200, 13: 16000, 14: 18000, 15: 20200, 16: 22600, 17: 25000, 18: 27000, 19: 29000, 20: 31000, 21: 33000, 22: 35000, 23: 37000, 24: 39000, 25: 41000, 26: 43000, 27: 45000, 28: 47000, 29: 49000, 30: 51000, 31: 53000, 32: 55000, 33: 57000, 34: 59000, 35: 61000, 36: 63000, 37: 65000, 38: 67000, 39: 69000, 40: 71000, 41: 73000, 42: 75000, 43: 77000, 44: 79000, 45: 81000, 46: 83000, 47: 85000, 48: 87000, 49: 89000, 50: 91000, 51: 93000, 52: 95000, 53: 97000 }
};

export function getTnc(calculatorType) {
    const gate = GATE_CONFIG[calculatorType];
    return `
        <ul style="font-size:14px; line-height:1.6;">
            <li class="tnc-warning">
                The incentive amount displayed is indicative only.
                Final payout is subject to management approval.
            </li>
            <li>
                Gate Criteria:<br>
                0–3 months → Minimum ${gate["0-3"]} Term policies<br>
                3–6 months → Minimum ${gate["3-6"]} Term policies<br>
                >6 months → Minimum ${gate[">6"]} Term policies
            </li>
            <li>Login Period is 1st Jan to 31st Jan'26 & Issuance period is 1st Jan'26 to 28th Feb'26</li>
            <li>FYLP on monthly policies is mandatory. In case FYLP is not received within 2 months of policy issuance date, per NOP amount will be clawed back</li>
            <li>Incentives on all monthly I-secure policies will be paid once FYLP of 3 months is received</li>
            <li>Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP</li>
            <li>For any policy to be counted as Spouse case, husband/wife's issued policy/case to be with BALIC within last 2 months</li>
        </ul>
    `;
}

export function lookupSlab(calculatorType, vintage, count) {
    let slabs = calculatorType === "OUTSOURCE_BFL" ? TERM_SLABS_BFL : TERM_SLABS;

    const slab = slabs[vintage];
    if (!slab) return 0;

    const keys = Object.keys(slab).map(Number).sort((a, b) => a - b);
    if (count < keys[0]) return 0;

    let applicable = keys[0];
    for (let k of keys) {
        if (count >= k) applicable = k;
    }
    return slab[applicable];
}

export function getEligibilityRequirements(calculatorType, vintage) {
    const required = GATE_CONFIG[calculatorType]?.[vintage];
    return { requiredPolicies: required || 0 };
}

export function calculateJanTermOutsource(calculatorType, vintage, policies) {
    let termCount = 0;
    let termExCount = 0;
    let additionalTotal = 0;
    let additionalExTotal = 0;
    let totalAPE = 0;
    let ekycEligible = true;
    let ekycRelevantCount = 0;

    policies.forEach(data => {
        const ape = data.amount * getMultiplier(data.freq);

        if (data.product !== "Non-Term") {
            termCount++;
            totalAPE += ape;
            if (!(data.product === "Isecure" && data.freq === "Monthly")) {
                termExCount++;
            }
        }

        if (data.product === "Etouch" || data.product === "Isecure") {
            ekycRelevantCount++;
            if (data.ekyc === "No") ekycEligible = false;
        }

        let add = 0;
        if (data.product === "Non-Term") add += 2000;
        if (data.product === "Etouch" && data.freq === "Annual") add += 1000;
        if (data.product === "Isecure" && data.freq === "Annual") add += 1500;
        if (data.product === "Etouch" && data.freq === "Monthly" && data.autopay === "No") add -= 1400;
        if (data.product === "Isecure" && data.freq === "Monthly" && data.autopay === "No") add -= 2000;
        if (data.spouse === "Yes") add += 500;
        if (data.bfl === "Yes") add += 500;
        if (data.superwoman === "Yes") add += 1000;
        if (data.sachet === "Yes") add += 1000;
        if ((data.product === "Etouch" || data.product === "Isecure") && data.agg === "Yes") add += 500;

        if (data.product !== "Non-Term") {
            if (data.paytype.includes("5 years") || data.paytype.includes("6 years")) add += 3000;
            if (data.paytype.includes("10 years")) add += 2000;
            if (data.paytype.includes("12 years")) add += 1250;
            if (data.paytype.includes("15 years")) add += 1000;
        }

        if (data.ci === "Yes") add += 1000;
        if (data.adb === "Yes") add += 500;

        additionalTotal += add;

        // Additional excluding monthly isecure
        let eligibleForEx =
            data.product === "Etouch" ||
            data.product === "Other Term" ||
            (data.product === "Isecure" && data.freq !== "Monthly") ||
            data.product === "Non-Term";

        if (eligibleForEx) {
            let addEx = 0;
            if (data.product === "Non-Term") addEx += 2000;
            if (data.product === "Etouch" && data.freq === "Annual") addEx += 1000;
            if (data.product === "Isecure" && data.freq === "Annual") addEx += 1500;
            if (data.product === "Etouch" && data.freq === "Monthly" && data.autopay === "No") addEx -= 1400;
            if (data.spouse === "Yes") addEx += 500;
            if (data.bfl === "Yes") addEx += 500;
            if (data.superwoman === "Yes") addEx += 1000;
            if (data.sachet === "Yes") addEx += 1000;
            if ((data.product === "Etouch" || (data.product === "Isecure" && data.freq !== "Monthly")) && data.agg === "Yes")
                addEx += 500;

            if (data.product !== "Non-Term") {
                if (data.paytype.includes("5 years") || data.paytype.includes("6 years")) addEx += 3000;
                if (data.paytype.includes("10 years")) addEx += 2000;
                if (data.paytype.includes("12 years")) addEx += 1250;
                if (data.paytype.includes("15 years")) addEx += 1000;
            }

            if (data.ci === "Yes") addEx += 1000;
            if (data.adb === "Yes") addEx += 500;

            additionalExTotal += addEx;
        }
    });

    // Gate check
    const required = GATE_CONFIG[calculatorType]?.[vintage];
    if (!required || termCount < required) {
        return {
            eligible: false,
            requiredPolicies: required || 0,
            termCount,
            total: 0, upfront: 0, deferred: 0
        };
    }

    const termTotal = lookupSlab(calculatorType, vintage, termCount);

    let termEx;
    if (termExCount < GATE_CONFIG[calculatorType][vintage]) {
        termEx = 1000 * termExCount;
    } else {
        termEx = lookupSlab(calculatorType, vintage, termExCount);
    }

    const ekycBonus = (ekycRelevantCount > 0 && ekycEligible) ? 2000 : 0;
    additionalTotal += ekycBonus;
    additionalExTotal += ekycBonus;

    const avgAPE = termCount > 0 ? totalAPE / termCount : 0;
    let multiplier = 1;

    if (calculatorType === "OUTSOURCE_BFL") {
        if (avgAPE <= 20000) multiplier = 1;
        else if (avgAPE <= 25000) multiplier = 1.1;
        else if (avgAPE <= 40000) multiplier = 1.25;
        else multiplier = 1.4;
    } else {
        if (avgAPE < 15000) multiplier = 0.5;
        else if (avgAPE <= 18300) multiplier = 0.7;
        else if (avgAPE <= 20000) multiplier = 1;
        else if (avgAPE <= 25000) multiplier = 1.1;
        else if (avgAPE <= 40000) multiplier = 1.25;
        else multiplier = 1.4;
    }

    const total = (termTotal + additionalTotal) * multiplier;
    const upfront = (termEx + additionalExTotal) * multiplier;
    const deferred = total - upfront;

    return {
        eligible: true,
        requiredPolicies: required,
        termCount,
        total,
        upfront,
        deferred
    };
}
