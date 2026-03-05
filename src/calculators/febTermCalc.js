/* ================= FEB TERM CALCULATOR ================= */
/* Business logic copied verbatim from febterm.js */

import { currency, getMultiplier, parsePayment } from '../utils/helpers';

export const CONFIG = {
    BFL: {
        eligibility: {
            "0-3": { minPolicies: 4, minAPE: 80000 },
            "3-6": { minPolicies: 5, minAPE: 115000 },
            "6+": { minPolicies: 6, minAPE: 135000 }
        },
        slabs: {
            "0-3": [
                { min: 80000, rate: 0.08 },
                { min: 125000, rate: 0.0825 },
                { min: 150000, rate: 0.085 },
                { min: 175000, rate: 0.0875 },
                { min: 200000, rate: 0.09 },
                { min: 225000, rate: 0.0925 }
            ],
            "3-6": [
                { min: 115000, rate: 0.08 },
                { min: 160600, rate: 0.0825 },
                { min: 185600, rate: 0.085 },
                { min: 210600, rate: 0.0875 },
                { min: 235600, rate: 0.09 },
                { min: 260600, rate: 0.0925 }
            ],
            "6+": [
                { min: 135000, rate: 0.08 },
                { min: 188100, rate: 0.0825 },
                { min: 213100, rate: 0.085 },
                { min: 238100, rate: 0.0875 },
                { min: 263100, rate: 0.09 },
                { min: 288100, rate: 0.0925 }
            ]
        },
        installment: {
            monthly: 0.4,
            quarterly: 0.4,
            half: 0.8,
            annual: 0.8,
            single: 1
        }
    },
    BAU: {
        eligibility: {
            "0-3": { minPolicies: 5, minAPE: 100000 },
            "3-6": { minPolicies: 6, minAPE: 135600 },
            "6+": { minPolicies: 7, minAPE: 163100 }
        },
        slabs: {
            "0-3": [
                { min: 100000, rate: 0.08 },
                { min: 125000, rate: 0.0825 },
                { min: 150000, rate: 0.085 },
                { min: 175000, rate: 0.0875 },
                { min: 200000, rate: 0.09 },
                { min: 225000, rate: 0.0925 }
            ],
            "3-6": [
                { min: 135600, rate: 0.08 },
                { min: 160600, rate: 0.0825 },
                { min: 185600, rate: 0.085 },
                { min: 210600, rate: 0.0875 },
                { min: 235600, rate: 0.09 },
                { min: 260600, rate: 0.0925 }
            ],
            "6+": [
                { min: 163100, rate: 0.08 },
                { min: 188100, rate: 0.0825 },
                { min: 213100, rate: 0.085 },
                { min: 238100, rate: 0.0875 },
                { min: 263100, rate: 0.09 },
                { min: 288100, rate: 0.0925 }
            ]
        },
        installment: {
            monthly: 0.5,
            quarterly: 0.5,
            half: 1,
            annual: 0.8,
            single: 1
        }
    }
};

export const TNC = {
    BAU: `
        <ul style="font-size:14px; line-height:1.6;">
            <li> Gate Criteria : <br> Vintage 0-3 months : 5 Issued Term NOPs and 1,00,000 Issued Term APE <br> Vintage 3-6 months : 6 Issued Term NOPs and 1,35,600 Issued Term APE <br> Vintage >6 months : 7 Issued Term NOPs and 1,63,100 Issued Term APE</li>
            <li> Login Period is 1st Feb to 28th Feb'26 & Issuance period is 1st Feb'26 to 12th Mar'26 </li>
            <li> Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP </li>
            <li> Payout structure: 80% payout on Annual cases on Issuance and 20% on receiving 13th month persistency. For non-annual cases, payout will be released in 2 installments : 50% on receiving 2 months FYLP and remaining 50% on receiving next 3 months FYLP</li>
             <li class="tnc-warning">
                 Please note: The incentive amount displayed is indicative only.
                 The final payout will be subject to management approval and discretion.
            </li>
        </ul>
    `,
    BFL: `
        <ul style="font-size:14px; line-height:1.6;">
            <li> Gate Criteria : <br> Vintage 0-3 months : 4 Issued Term NOPs and 80,000 Issued Term APE <br> Vintage 3-6 months : 5 Issued Term NOPs and 1,15,000 Issued Term APE <br> Vintage >6 months : 6 Issued Term NOPs and 1,35,000 Issued Term APE <br></li>
            <li> Login Period is 1st Feb to 28th Feb'26 & Issuance period is 1st Feb'26 to 12th Mar'26 </li>
            <li> Only policies logged and issued under Agent code 59L will be applicable for incentives </li>
            <li> Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP </li>
            <li> Payout structure: 80% payout on Annual cases on Issuance and 20% on receiving 13th month persistency. For non-annual cases, payout will be released in 3 installments : 40% on receiving 2 months FYLP and next 40% on receiving next 3 months FYLP  and remaining 20% on receiving 13th month persistency </li>
            <li class="tnc-warning">
                 Please note: The incentive amount displayed is indicative only.
                 The final payout will be subject to management approval and discretion.
            </li>
        </ul>
    `
};

export function getEligibilityRequirements(vintage, type) {
    const gate = CONFIG[type].eligibility[vintage];
    return {
        requiredAPE: gate.minAPE,
        requiredPolicies: gate.minPolicies
    };
}

export function calculateFebTerm(vintage, medical, type, policies) {
    const ACTIVE = CONFIG[type];

    let termAPE = 0, termPolicies = 0;
    let monthlyTerm = 0, monthlyTermYes = 0;
    let rowData = [];

    policies.forEach(data => {
        const ape = data.payment * getMultiplier(data.freq);

        if (data.product === "Term") {
            termAPE += ape;
            termPolicies++;
            if (data.freq === "Monthly") {
                monthlyTerm++;
                if (data.autopay === "Yes") monthlyTermYes++;
            }
        }

        rowData.push({ ...data, ape });
    });

    const gate = ACTIVE.eligibility[vintage];

    let policyShort = 0;
    let apeShort = 0;

    if (termPolicies < gate.minPolicies) {
        policyShort = gate.minPolicies - termPolicies;
    }

    if (termAPE < gate.minAPE) {
        apeShort = gate.minAPE - termAPE;
    }

    if (policyShort > 0 || apeShort > 0) {
        return {
            eligible: false,
            policyGap: policyShort,
            apeGap: apeShort,
            total: 0, first: 0, second: 0, thirteenth: 0,
            perPolicy: policies.map(() => 0)
        };
    }

    let medicalPenalty = (medical === "Yes") ? 0 : 0.3;
    let autopayPenalty = 0;

    if (monthlyTerm > 0 && (monthlyTermYes / monthlyTerm) < 0.95)
        autopayPenalty = 0.1;

    let totalPenalty = medicalPenalty + autopayPenalty;

    let slabRate = 0;
    ACTIVE.slabs[vintage].forEach(s => {
        if (termAPE >= s.min) slabRate = s.rate;
    });

    let sumT = 0, sumU = 0, sumV = 0, sumW = 0, sumX = 0, sumY = 0;
    let perPolicy = [];

    rowData.forEach(data => {
        let K = 0;
        if (data.rider === "Yes") K += 0.25 * data.riderApe;
        if (data.product === "Non-Term") K += 1000;

        let R = 0;
        if (data.product === "Term") R = slabRate * data.ape;

        let KR = K + R;

        let T = (data.freq === "Annual") ? KR : 0;
        let U = (data.freq !== "Annual") ? KR : 0;
        let V = (data.freq === "Monthly") ? KR : 0;
        let W = (data.freq === "Quarterly") ? KR : 0;
        let X = (data.freq === "Half Yearly") ? KR : 0;
        let Y = (data.freq === "Single") ? KR : 0;

        sumT += T; sumU += U; sumV += V; sumW += W; sumX += X; sumY += Y;

        let rowInc = (U + T) * (1 - totalPenalty);
        perPolicy.push(rowInc);
    });

    let total = (sumT + sumU) * (1 - totalPenalty);

    let first = (
        sumV * ACTIVE.installment.monthly +
        sumW * ACTIVE.installment.quarterly +
        sumX * ACTIVE.installment.half +
        sumY +
        sumT * ACTIVE.installment.annual
    ) * (1 - totalPenalty);

    let second = (
        sumV * ACTIVE.installment.monthly +
        sumW * ACTIVE.installment.quarterly
    ) * (1 - totalPenalty);

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
