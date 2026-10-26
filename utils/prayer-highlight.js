import { localStorage } from "@zos/storage";

export const PRAYER_HIGHLIGHT_KEY = "prayerHighlight";
export const HIGHLIGHT_OPTIONS = [
    { value: "current", labelKey: "currentPrayer" },
    { value: "next", labelKey: "nextPrayer" },
];
const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export function getPrayerHighlight() {
    try {
        return localStorage.getItem(PRAYER_HIGHLIGHT_KEY) === "next" ? "next" : "current";
    } catch (e) {
        return "current";
    }
}

export function setPrayerHighlight(value) {
    const mode = value === "next" ? "next" : "current";
    localStorage.setItem(PRAYER_HIGHLIGHT_KEY, mode);
    return mode;
}

function timeToMinutes(value) {
    const parts = String(value || "").split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function getHighlightedPrayer(timings, nowMinutes, mode = getPrayerHighlight()) {
    // After sunrise, both modes point to Dhuhr until its start time.
    if (nowMinutes >= timeToMinutes(timings.Sunrise) && nowMinutes < timeToMinutes(timings.Dhuhr)) {
        return "Dhuhr";
    }
    const nextIndex = PRAYERS.findIndex((key) => {
        return timeToMinutes(timings[key]) > nowMinutes;
    });
    if (mode === "next") return PRAYERS[nextIndex < 0 ? 0 : nextIndex];
    return PRAYERS[nextIndex <= 0 ? PRAYERS.length - 1 : nextIndex - 1];
}
