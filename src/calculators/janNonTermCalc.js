/* ================= JAN NON-TERM CALCULATOR ================= */
/* Business logic copied verbatim from jannonterm.js */

import { currency, getMultiplier, parsePayment } from '../utils/helpers';

export const TNC = {
    BAU: `
        <ul style="font-size:14px; line-height:1.6;">
            <li class="tnc-warning">
                Please note: The incentive amount displayed is indicative only.
                The final payout will be subject to management approval and discretion
            </li>
            <li> Gate Criteria : <br>
                 Vintage 0-3 months : 3,00,000 min. issued Non-Term APE <br>
                 Vintage >3 months : 5,00,000 min. issued Non-Term APE
            </li>
            <li> Login Period is 1st Jan to 31st Jan'26 & Issuance period is 1st Jan'26 to 12th Feb'26 </li>
            <li> Policies with PPT- 5 yrs & PT- 5 yrs will not be considered for any payout </li>
            <li> Incentive payout : 80% upfront payout on Issuance & 20% deferred payout on 13th month subject to receipt of 13th month persistency at 100% on value. This clause is not applicable for Annual mode cases </li>
            <li> Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP </li>
            <li> Autopay on monthly issued NOPs is mandatory.</li>
        </ul>
    `,
    BFL: `
        <ul style="font-size:14px; line-height:1.6;">
            <li class="tnc-warning">
                Please note: The incentive amount displayed is indicative only.
                The final payout will be subject to management approval and discretion
            </li>
            <li> Gate Criteria : <br>
                 Vintage 0-3 months : 1,00,000 min. issued Non-Term APE <br>
                 Vintage >3 months : 1,50,000 min. issued Non-Term APE 
            </li>
            <li> Login Period is 1st Jan to 31st Jan'26 & Issuance period is 1st Jan'26 to 12th Feb'26 </li>
            <li> Only policies with first touch/source as BFL will be considered for incentives </li>
            <li> Policies with PPT- 5 yrs & PT- 5 yrs will not be considered for any payout </li>
            <li> Incentive payout : 80% upfront payout on Issuance & 20% deferred payout on 13th month subject to receipt of 13th month persistency at 100% on value. This clause is not applicable for Annual mode cases </li>
            <li> Sale summarisation call to be there to get sale credit & to be eligible for incentive on claimed NOP </li>
            <li> FYLP on monthly policies is mandatory. In case FYLP is not received within 2 months of policy issuance date, per NOP amount will be clawed back </li>
            <li> Autopay on monthly issued NOPs is mandatory.</li>   
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
    let requiredAPE;
    if (type === "BAU") {
        requiredAPE = vintage === "0-3" ? 300000 : 500000;
    } else {
        requiredAPE = vintage === "0-3" ? 100000 : 150000;
    }
    return { requiredAPE, requiredPolicies: 0 };
}

export function checkGate(vintage, type, totalNonTermAPE) {
    let requiredAPE;
    if (type === "BAU") {
        requiredAPE = vintage === "0-3" ? 300000 : 500000;
    } else {
        requiredAPE = vintage === "0-3" ? 100000 : 150000;
    }

    if (totalNonTermAPE < requiredAPE) {
        return { eligible: false, apeGap: requiredAPE - totalNonTermAPE };
    }
    return { eligible: true, apeGap: 0 };
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

export function calculateJanNonTerm(vintage, type, policies) {
    let totalNonTermAPE = 0;
    let totalULIPAPE = 0;
    let annualAPEList = [];
    let rowData = [];

    policies.forEach(data => {
        const ape = data.payment * getMultiplier(data.freq);

        if (data.product !== "Term") {
            totalNonTermAPE += ape;
        }
        if (data.product === "ULIP") {
            totalULIPAPE += ape;
        }
        if (data.freq === "Annual" || data.freq === "Single") {
            annualAPEList.push(ape);
        }

        rowData.push({ ...data, ape });
    });

    // Gate
    const gateResult = checkGate(vintage, type, totalNonTermAPE);
    if (!gateResult.eligible) {
        return {
            eligible: false,
            apeGap: gateResult.apeGap,
            total: 0, upfront: 0, deferred: 0,
            perPolicy: policies.map(() => 0)
        };
    }

    // ULIP Slab
    const ulipPercent = getUlipPercent(vintage, type, totalULIPAPE);

    // L19
    let L19 = 0;
    if (annualAPEList.length > 0) {
        let avg = annualAPEList.reduce((a, b) => a + b, 0) / annualAPEList.length;
        L19 = avg <= 120000 ? 2000 : 3000;
    }

    let totalIncentive = 0;
    let sumULIPGBSAnnual = 0;
    let sum80Additional = 0;
    let sumAnnualIncentive = 0;
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

        let additional80 = 0;
        if (data.freq === "Annual" || data.freq === "Single") {
            if (data.product === "Savings") {
                additional80 += 0.10 * data.ape;
            }
            if (data.product === "Term") {
                if (type === "BAU") {
                    if (data.payment <= 100000) additional80 += 1500;
                    else additional80 += 0.05 * data.payment;
                } else {
                    if (data.payment <= 50000) additional80 += 2000;
                    else additional80 += 0.05 * data.payment;
                }
            }
            if (data.autopay === "Yes") {
                additional80 += 500;
            }
        }

        let ulipInc = data.product === "ULIP" ? ulipPercent * data.ape : 0;
        let gbsInc = (type === "BAU" && data.product === "GBS") ? 0.01 * data.ape : 0;
        let annualInc = (data.freq === "Annual" || data.freq === "Single") ? L19 : 0;

        let incentive = additional + ulipInc + gbsInc + annualInc;

        totalIncentive += incentive;

        if (data.freq === "Annual" || data.freq === "Single") {
            sumULIPGBSAnnual += ulipInc + gbsInc;
            sum80Additional += additional80;
            sumAnnualIncentive += annualInc;
        }

        perPolicy.push(incentive);
    });

    let upfront = 0;
    if (totalIncentive > 0) {
        upfront = (0.8 * totalIncentive) +
            0.2 * (sumULIPGBSAnnual + sum80Additional + sumAnnualIncentive);
    }

    let deferred = totalIncentive - upfront;

    return {
        eligible: true,
        apeGap: 0,
        total: totalIncentive,
        upfront,
        deferred,
        perPolicy
    };
}
