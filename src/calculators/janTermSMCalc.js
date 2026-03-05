/* ================= JAN TERM SM CALCULATOR ================= */
/* Business logic copied verbatim from jantermsm.js */

import { currency, getMultiplier } from '../utils/helpers';

export const GATE_CONFIG = {
    SM_BAU: {
        TIER1: 6,
        TIER2: 7,
        HRO_LT3: 5,
        HRO_GT3: 6
    },
    SM_BFL: {
        TIER1: 4,
        TIER2: 5,
        HRO_LT3: 3,
        HRO_GT3: 4
    }
};

export const TERM_SLABS_SM_BAU = {
    TIER1: { 6: 6000, 7: 7100, 8: 8300, 9: 9700, 10: 11100, 11: 12700, 12: 14500, 13: 16500, 14: 18700, 15: 21100, 16: 23500, 17: 26100, 18: 28700, 19: 30700, 20: 32700, 21: 34700, 22: 36700, 23: 38700, 24: 40700, 25: 42700, 26: 44700, 27: 46700, 28: 48700, 29: 50700, 30: 52700, 31: 54700, 32: 56700, 33: 58700, 34: 60700, 35: 62700, 36: 64700, 37: 66700, 38: 68700, 39: 70700, 40: 72700, 41: 74700, 42: 76700, 43: 78700, 44: 80700, 45: 82700, 46: 84700, 47: 86700, 48: 88700, 49: 90700, 50: 92700, 51: 94700 },
    TIER2: { 7: 7000, 8: 8100, 9: 9300, 10: 10700, 11: 12100, 12: 13700, 13: 15500, 14: 17500, 15: 19700, 16: 22100, 17: 24500, 18: 27100, 19: 29700, 20: 31700, 21: 33700, 22: 35700, 23: 37700, 24: 39700, 25: 41700, 26: 43700, 27: 45700, 28: 47700, 29: 49700, 30: 51700, 31: 53700, 32: 55700, 33: 57700, 34: 59700, 35: 61700, 36: 63700, 37: 65700, 38: 67700, 39: 69700, 40: 71700, 41: 73700, 42: 75700, 43: 77700, 44: 79700, 45: 81700, 46: 83700, 47: 85700, 48: 87700, 49: 89700, 50: 91700, 51: 93700, 52: 95700 },
    HRO_LT3: { 5: 5000, 6: 6100, 7: 7300, 8: 8700, 9: 10100, 10: 11700, 11: 13500, 12: 15500, 13: 17700, 14: 20100, 15: 22500, 16: 25100, 17: 27700, 18: 29700, 19: 31700, 20: 33700, 21: 35700, 22: 37700, 23: 39700, 24: 41700, 25: 43700, 26: 45700, 27: 47700, 28: 49700, 29: 51700, 30: 53700, 31: 55700, 32: 57700, 33: 59700, 34: 61700, 35: 63700, 36: 65700, 37: 67700, 38: 69700, 39: 71700, 40: 73700, 41: 75700, 42: 77700, 43: 79700, 44: 81700, 45: 83700, 46: 85700, 47: 87700, 48: 89700, 49: 91700, 50: 93700 }
};

export const TERM_SLABS_SM_BFL = {
    TIER1: { 4: 4000, 5: 5000, 6: 6200, 7: 7400, 8: 8600, 9: 10000, 10: 11500, 11: 13200, 12: 15000, 13: 17000, 14: 19200, 15: 21600, 16: 24000, 17: 26000, 18: 28000, 19: 30000, 20: 32000, 21: 34000, 22: 36000, 23: 38000, 24: 40000, 25: 42000, 26: 44000, 27: 46000, 28: 48000, 29: 50000, 30: 52000, 31: 54000, 32: 56000, 33: 58000, 34: 60000, 35: 62000, 36: 64000, 37: 66000, 38: 68000, 39: 70000, 40: 72000, 41: 74000, 42: 76000, 43: 78000, 44: 80000, 45: 82000, 46: 84000, 47: 86000, 48: 88000, 49: 90000, 50: 92000, 51: 94000 },
    TIER2: { 5: 5000, 6: 6000, 7: 7200, 8: 8400, 9: 9600, 10: 11000, 11: 12500, 12: 14200, 13: 16000, 14: 18000, 15: 20200, 16: 22600, 17: 25000, 18: 27000, 19: 29000, 20: 31000, 21: 33000, 22: 35000, 23: 37000, 24: 39000, 25: 41000, 26: 43000, 27: 45000, 28: 47000, 29: 49000, 30: 51000, 31: 53000, 32: 55000, 33: 57000, 34: 59000, 35: 61000, 36: 63000, 37: 65000, 38: 67000, 39: 69000, 40: 71000, 41: 73000, 42: 75000, 43: 77000, 44: 79000, 45: 81000, 46: 83000, 47: 85000, 48: 87000, 49: 89000, 50: 91000, 51: 93000, 52: 95000 },
    HRO_LT3: { 3: 3000, 4: 4000, 5: 5200, 6: 6400, 7: 7600, 8: 9000, 9: 10500, 10: 12200, 11: 14000, 12: 16000, 13: 18200, 14: 20600, 15: 23000, 16: 25000, 17: 27000, 18: 29000, 19: 31000, 20: 33000, 21: 35000, 22: 37000, 23: 39000, 24: 41000, 25: 43000, 26: 45000, 27: 47000, 28: 49000, 29: 51000, 30: 53000, 31: 55000, 32: 57000, 33: 59000, 34: 61000, 35: 63000, 36: 65000, 37: 67000, 38: 69000, 39: 71000, 40: 73000, 41: 75000, 42: 77000, 43: 79000, 44: 81000, 45: 83000, 46: 85000, 47: 87000, 48: 89000, 49: 91000, 50: 93000 }
};

export const TNC_SM_BAU = `
    <ul>
        <li class="tnc-warning">
            The incentive amount displayed is indicative only.
            Final payout is subject to management approval.
        </li>
        <li id="dynamicGateText">
            <strong>Gate Criteria – SM BAU:</strong><br>
            Tier 1 → Minimum 6 Term policies<br>
            Tier 2 → Minimum 7 Term policies<br>
            HRO (&lt;3 months) → Minimum 5 Term policies<br>
        </li>
        <li>Login Period is 1st Jan to 31st Jan'26 & Issuance period is 1st Jan'26 to 28th Feb'26</li>
        <li>FYLP on monthly policies is mandatory. In case FYLP is not received within 2 months of policy issuance date, per NOP amount will be clawed back</li>
        <li>Incentives on all monthly I-secure policies will be paid once FYLP of 3 months is received</li>
        <li>HRO Greater than 3 months vintage will be counted in Tier 1 SM category</li>
        <li>Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP</li>
        <li>For any policy to be counted as Spouse case, husband/wife's issued policy/case to be with BALIC within last 2 months</li>
    </ul>
`;

export const TNC_SM_BFL = `
    <ul>
        <li class="tnc-warning">
            The incentive amount displayed is indicative only.
            Final payout is subject to management approval.
        </li>
        <li id="dynamicGateText">
            <strong>Gate Criteria – SM BFL:</strong><br>
            Tier 1 → Minimum 4 Term policies<br>
            Tier 2 → Minimum 5 Term policies<br>
            HRO (&lt;3 months) → Minimum 3 Term policies<br>
        </li>
        <li>Login Period is 1st Jan to 31st Jan'26 & Issuance period is 1st Jan'26 to 28th Feb'26</li>
        <li>FYLP on monthly policies is mandatory. In case FYLP is not received within 2 months of policy issuance date, per NOP amount will be clawed back</li>
        <li>Incentives on all monthly I-secure policies will be paid once FYLP of 3 months is received</li>
        <li>HRO Greater than 3 months vintage will be counted in Tier 1 SM category</li>
        <li>Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP</li>
        <li>For any policy to be counted as Spouse case, husband/wife's issued policy/case to be with BALIC within last 2 months</li>
    </ul>
`;

export function getTnc(calculatorType) {
    return calculatorType === "SM_BFL" ? TNC_SM_BFL : TNC_SM_BAU;
}

export function getKey(team, tier, vintage) {
    if (team === "INHOUSE") {
        return tier || null;
    }
    if (team === "HRO") {
        if (!vintage) return null;
        return vintage === "<3" ? "HRO_LT3" : "HRO_GT3";
    }
    return null;
}

export function lookupSlab(calculatorType, key, count) {
    const slabs = calculatorType === "SM_BFL"
        ? TERM_SLABS_SM_BFL
        : TERM_SLABS_SM_BAU;

    if (key === "HRO_GT3") key = "TIER1";

    const slab = slabs[key];
    if (!slab) return 0;

    const keys = Object.keys(slab).map(Number).sort((a, b) => a - b);

    if (count < keys[0]) return 0;

    let applicable = keys[0];
    for (let k of keys) {
        if (count >= k) applicable = k;
    }

    return slab[applicable];
}

export function getEligibilityRequirements(calculatorType, key) {
    const required = GATE_CONFIG[calculatorType]?.[key];
    return { requiredPolicies: required || 0 };
}

export function calculateJanTermSM(calculatorType, key, policies) {
    let termCount = 0;
    let termExCount = 0;
    let additionalTotal = 0;
    let additionalExTotal = 0;
    let totalAPE = 0;
    let ekycEligible = true;
    let ekycRelevantCount = 0;

    policies.forEach(data => {
        const ape = data.amount * getMultiplier(data.freq);

        // Term count
        if (data.product !== "Non-Term") {
            termCount++;
            totalAPE += ape;
            if (!(data.product === "Isecure" && data.freq === "Monthly")) {
                termExCount++;
            }
        }

        // EKYC check
        if (data.product === "Etouch" || data.product === "Isecure") {
            ekycRelevantCount++;
            if (data.ekyc === "No") ekycEligible = false;
        }

        // Additional total
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

        if (data.product === "Etouch" || data.product === "Isecure") {
            if (data.paytype.includes("15 years")) add += 1000;
            else if (data.paytype.includes("12 years")) add += 1250;
            else if (data.paytype.includes("10 years")) add += 2000;
            else if (data.paytype.includes("6 years") || data.paytype.includes("5 years")) add += 3000;
        }

        if (data.ci === "Yes") add += 1000;
        if (data.adb === "Yes") add += 500;

        additionalTotal += add;

        // Additional excluding monthly isecure
        const eligibleForEx =
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

            if (data.product === "Etouch" || data.product === "Isecure") {
                if (data.paytype.includes("15 years")) addEx += 1000;
                else if (data.paytype.includes("12 years")) addEx += 1250;
                else if (data.paytype.includes("10 years")) addEx += 2000;
                else if (data.paytype.includes("6 years") || data.paytype.includes("5 years")) addEx += 3000;
            }

            if (data.ci === "Yes") addEx += 1000;
            if (data.adb === "Yes") addEx += 500;

            additionalExTotal += addEx;
        }
    });

    // Gate check
    const required = GATE_CONFIG[calculatorType]?.[key];
    if (!required || termCount < required) {
        return {
            eligible: false,
            requiredPolicies: required || 0,
            termCount,
            total: 0, upfront: 0, deferred: 0
        };
    }

    // Term incentives
    const termTotal = lookupSlab(calculatorType, key, termCount);
    let termEx;
    if (termExCount < required) {
        termEx = 1000 * termExCount;
    } else {
        termEx = lookupSlab(calculatorType, key, termExCount);
    }

    // EKYC bonus
    const ekycBonus = (ekycRelevantCount > 0 && ekycEligible) ? 2000 : 0;
    additionalTotal += ekycBonus;
    additionalExTotal += ekycBonus;

    // ATS multiplier
    const avgAPE = termCount > 0 ? totalAPE / termCount : 0;
    let multiplier = 1;

    if (calculatorType === "SM_BFL") {
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
