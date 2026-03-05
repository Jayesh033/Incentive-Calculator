/* ================= FEB NON-TERM CALCULATOR ================= */
/* Business logic copied verbatim from febnonterm.js */

import { currency, getMultiplier, parsePayment } from '../utils/helpers';

export const CONFIG = {
    BAU: {
        installment: {
            monthly: 0.4,
            quarterly: 0.4,
            half: 0.8,
            annual: 0.8,
            single: 1
        }
    },
    BFL: {
        installment: {
            monthly: 0.4,
            quarterly: 0.4,
            half: 0.8,
            annual: 0.8,
            single: 1
        }
    }
};

export const TNC = {
    BAU: `
        <ul style="font-size:14px; line-height:1.6;">
            <li class="tnc-warning">
                 Please note: The incentive amount displayed is indicative only.
                 The final payout will be subject to management approval and discretion
            </li>
            <li> Gate Criteria : <br> Vintage 0-3 months : 3,00,000 min. issued Non-Term APE <br> Vintage >3 months : 5,00,000 min. issued Non-Term APE <br> </li>
            <li> Login Period is 1st Feb to 28th Feb'26 & Issuance period is 1st Feb'26 to 12th Mar'26 </li>
            <li> Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP </li>
            <li> Payout structure: 80% payout on Annual cases on Issuance and 20% on receiving 13th month persistency. For non-annual cases, payout will be released in 3 installments : 40% on receiving 2 months FYLP and next 40% on receiving next 3 months FYLP  and remaining 20% on receiving 13th month persistency </li>
            <li> Policies with PPT- 5 yrs & PT- 5 yrs will not be considered for any payout </li>
            <li> Autopay on monthly issued NOPs is mandatory. Non-autopay monthly mode policy will not be considered for incentive calculation </li>
        </ul>
    `,
    BFL: `
        <ul style="font-size:14px; line-height:1.6;">
            <li class="tnc-warning">
                 Please note: The incentive amount displayed is indicative only.
                 The final payout will be subject to management approval and discretion
            </li>
            <li> Gate Criteria : <br> Vintage 0-3 months : 3 Issued Non-Term NOPs and 1,00,000 Issued Non-Term APE <br> Vintage >3 months : 4 Issued Non-Term NOPs and 1,50,000 Issued Non-Term APE <br> </li>
            <li> Login Period is 1st Feb to 28th Feb'26 & Issuance period is 1st Feb'26 to 12th Mar'26 </li>
            <li> Only policies with first touch/source as BFL will be considered for incentives. Only policies logged and issued under Agent code 59L will be apllicable for incentives </li>
            <li> Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP </li>
            <li> Payout structure: 80% payout on Annual cases on Issuance and 20% on receiving 13th month persistency. For non-annual cases, payout will be released in 3 installments : 40% on receiving 2 months FYLP and next 40% on receiving next 3 months FYLP  and remaining 20% on receiving 13th month persistency </li>
            <li> Policies with PPT- 5 yrs & PT- 5 yrs will not be considered for any payout </li>
            <li> Autopay on monthly issued NOPs is mandatory. Non-autopay monthly mode policy will not be considered for incentive calculation </li>
        </ul>
    `
};

export function getProductOptions(type) {
    const options = [
        { value: "ULIP", label: "ULIP" },
        { value: "Savings", label: "Savings" },
        { value: "Term", label: "Term" }
    ];
    if (type === "BAU") {
        options.splice(1, 0, { value: "GBS", label: "GBS" });
    }
    return options;
}

export function getEligibilityRequirements(vintage, type) {
    if (type === "BAU") {
        return {
            requiredAPE: vintage === "0-3" ? 300000 : 500000,
            requiredPolicies: 0
        };
    } else {
        return {
            requiredAPE: vintage === "0-3" ? 100000 : 150000,
            requiredPolicies: vintage === "0-3" ? 3 : 4
        };
    }
}

export function checkGate(vintage, type, totalNonTermAPE, nonTermPolicyCount) {
    if (type === "BAU") {
        let requiredAPE = vintage === "0-3" ? 300000 : 500000;
        if (totalNonTermAPE < requiredAPE) {
            return { eligible: false, policyGap: 0, apeGap: requiredAPE - totalNonTermAPE };
        }
    } else {
        let minPolicies = vintage === "0-3" ? 3 : 4;
        let minAPE = vintage === "0-3" ? 100000 : 150000;
        let policyGap = nonTermPolicyCount < minPolicies ? minPolicies - nonTermPolicyCount : 0;
        let apeGap = totalNonTermAPE < minAPE ? minAPE - totalNonTermAPE : 0;
        if (policyGap > 0 || apeGap > 0) {
            return { eligible: false, policyGap, apeGap };
        }
    }
    return { eligible: true, policyGap: 0, apeGap: 0 };
}

export function getUlipPercent(vintage, type, totalULIPAPE) {
    let ulipPercent = 0;

    if (type === "BAU") {
        if (vintage === "0-3") {
            if (totalULIPAPE >= 300000 && totalULIPAPE <= 600000) ulipPercent = 0.02;
            else if (totalULIPAPE >= 600001 && totalULIPAPE <= 1000000) ulipPercent = 0.04;
            else if (totalULIPAPE >= 1000001) ulipPercent = 0.07;
        } else {
            if (totalULIPAPE >= 500000 && totalULIPAPE <= 700000) ulipPercent = 0.02;
            else if (totalULIPAPE >= 700001 && totalULIPAPE <= 1200000) ulipPercent = 0.04;
            else if (totalULIPAPE >= 1200001) ulipPercent = 0.07;
        }
    } else {
        if (vintage === "0-3") {
            if (totalULIPAPE >= 100000 && totalULIPAPE <= 250000) ulipPercent = 0.025;
            else if (totalULIPAPE >= 250001 && totalULIPAPE <= 500000) ulipPercent = 0.045;
            else if (totalULIPAPE >= 500001 && totalULIPAPE <= 1000000) ulipPercent = 0.055;
            else if (totalULIPAPE >= 1000001 && totalULIPAPE <= 2000000) ulipPercent = 0.075;
            else if (totalULIPAPE >= 2000001) ulipPercent = 0.10;
        } else {
            if (totalULIPAPE >= 150000 && totalULIPAPE <= 300000) ulipPercent = 0.025;
            else if (totalULIPAPE >= 300001 && totalULIPAPE <= 500000) ulipPercent = 0.045;
            else if (totalULIPAPE >= 500001 && totalULIPAPE <= 1000000) ulipPercent = 0.055;
            else if (totalULIPAPE >= 1000001 && totalULIPAPE <= 1500000) ulipPercent = 0.07;
            else if (totalULIPAPE >= 1500001 && totalULIPAPE <= 2000000) ulipPercent = 0.085;
            else if (totalULIPAPE >= 2000001) ulipPercent = 0.10;
        }
    }

    return ulipPercent;
}

export function calculateFebNonTerm(vintage, type, policies) {
    const ACTIVE = CONFIG[type];

    let totalNonTermAPE = 0;
    let totalULIPAPE = 0;
    let nonTermPolicyCount = 0;

    let rowData = [];

    policies.forEach(data => {
        const ape = data.payment * getMultiplier(data.freq);

        if (data.product !== "Term") {
            totalNonTermAPE += ape;
            nonTermPolicyCount++;
        }
        if (data.product === "ULIP") {
            totalULIPAPE += ape;
        }

        rowData.push({ ...data, ape });
    });

    // Gate check
    const gateResult = checkGate(vintage, type, totalNonTermAPE, nonTermPolicyCount);
    if (!gateResult.eligible) {
        return {
            eligible: false,
            policyGap: gateResult.policyGap,
            apeGap: gateResult.apeGap,
            total: 0, first: 0, second: 0, thirteenth: 0,
            perPolicy: policies.map(() => 0)
        };
    }

    // ULIP slab
    const ulipPercent = getUlipPercent(vintage, type, totalULIPAPE);

    // Row calculation
    let sumT = 0, sumU = 0, sumV = 0, sumW = 0, sumX = 0, sumY = 0;
    let perPolicy = [];

    rowData.forEach(data => {
        let additional = 0;

        if (data.product === "Savings") {
            additional += 0.10 * data.ape;
        }

        if (data.product === "Term") {
            if (type === "BAU") {
                if (data.payment <= 100000) additional += 1500;
                else additional += 0.05 * data.payment;
            } else {
                if (data.payment <= 50000) additional += 2000;
                else additional += 0.05 * data.payment;
            }
        }

        if (data.freq !== "Monthly" && data.autopay === "Yes") {
            additional += 500;
        }

        if (data.supreme === "Yes") {
            additional += 0.01 * data.ape;
        }

        if (data.rider === "Yes") {
            additional += 0.25 * data.riderApe;
        }

        let ulipInc = data.product === "ULIP" ? ulipPercent * data.ape : 0;
        let gbsInc = (type === "BAU" && data.product === "GBS") ? 0.01 * data.ape : 0;

        let base = additional + ulipInc + gbsInc;

        let T = (data.freq === "Annual") ? base : 0;
        let U = (data.freq !== "Annual") ? base : 0;
        let V = (data.freq === "Monthly") ? base : 0;
        let W = (data.freq === "Quarterly") ? base : 0;
        let X = (data.freq === "Half Yearly") ? base : 0;
        let Y = (data.freq === "Single") ? base : 0;

        sumT += T; sumU += U; sumV += V; sumW += W; sumX += X; sumY += Y;

        perPolicy.push(base);
    });

    let total = (sumT + sumU);

    let first = (
        sumV * ACTIVE.installment.monthly +
        sumW * ACTIVE.installment.quarterly +
        sumX * ACTIVE.installment.half +
        sumY +
        sumT * ACTIVE.installment.annual
    );

    let second = (
        sumV * ACTIVE.installment.monthly +
        sumW * ACTIVE.installment.quarterly
    );

    let thirteenth = total - first - second;

    return {
        eligible: true,
        policyGap: 0,
        apeGap: 0,
        total,
        first,
        second,
        thirteenth,
        perPolicy
    };
}
