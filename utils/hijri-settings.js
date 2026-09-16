import { localStorage } from "@zos/storage";
import { PRAYER_CACHE_KEY, getAdjustedHijriDate } from "./prayer-cache";

export const HIJRI_ADJUSTMENT_KEY = "hijriDateAdjustment";

function normalizeAdjustment(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= -2 && number <= 2 ? number : 0;
}

export function getHijriAdjustment() {
    try {
        return normalizeAdjustment(localStorage.getItem(HIJRI_ADJUSTMENT_KEY));
    } catch (e) {
        return 0;
    }
}

export function setHijriAdjustment(value) {
    const adjustment = normalizeAdjustment(value);
    localStorage.setItem(HIJRI_ADJUSTMENT_KEY, String(adjustment));
    return adjustment;
}

export function getDisplayHijriDate(hijri) {
    if (!hijri) return hijri;
    const adjustment = getHijriAdjustment();
    try {
        if (adjustment === 0) return hijri;
        const stored = localStorage.getItem(PRAYER_CACHE_KEY);
        const cache = typeof stored === "string" ? JSON.parse(stored) : stored;
        return getAdjustedHijriDate(cache, hijri, adjustment);
    } catch (e) {
        return null;
    }
}
