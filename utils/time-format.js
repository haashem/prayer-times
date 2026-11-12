import { localStorage } from "@zos/storage";
import { localizeDigits, t } from "./i18n";

export const TIME_FORMAT_KEY = "prayerTimeFormat";
export const TIME_FORMAT_OPTIONS = [
    { value: "24", labelKey: "timeFormat24" },
    { value: "12", labelKey: "timeFormat12" },
];

export function getTimeFormat() {
    try {
        return localStorage.getItem(TIME_FORMAT_KEY) === "12" ? "12" : "24";
    } catch (e) {
        return "24";
    }
}

export function setTimeFormat(value) {
    const format = value === "12" ? "12" : "24";
    localStorage.setItem(TIME_FORMAT_KEY, format);
    return format;
}

export function formatPrayerTime(value) {
    const match = /^(\d{1,2}):(\d{2})(?:\s*\(.*\))?$/.exec(String(value || "").trim());
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return "--:--";
    const hours = Number(match[1]);
    const minutes = match[2];
    if (getTimeFormat() === "12") {
        return localizeDigits(`${hours % 12 || 12}:${minutes} ${t(hours >= 12 ? "pm" : "am")}`);
    }
    return localizeDigits(`${hours < 10 ? "0" : ""}${hours}:${minutes}`);
}

export function getPrayerTimeParts(value) {
    const formatted = formatPrayerTime(value);
    const separator = formatted.lastIndexOf(" ");
    return separator < 0
        ? { time: formatted, period: "" }
        : { time: formatted.slice(0, separator), period: formatted.slice(separator + 1) };
}
