/* ================= SHARED UTILITIES ================= */

export function currency(n) {
    return "₹ " + Math.round(n).toLocaleString("en-IN");
}

export function getMultiplier(freq) {
    return {
        "Monthly": 12,
        "Quarterly": 4,
        "Half Yearly": 2,
        "Annual": 1,
        "Single": 1
    }[freq] || 1;
}

export function parsePayment(value) {
    if (!value) return 0;
    return parseFloat(String(value).replace(/[^\d]/g, "")) || 0;
}

export function formatPaymentInput(value) {
    let cleaned = String(value).replace(/[^\d]/g, '');
    if (!cleaned) return "";
    return "₹ " + parseInt(cleaned).toLocaleString("en-IN");
}
