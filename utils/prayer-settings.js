import { localStorage } from "@zos/storage";
import { PRAYER_CACHE_KEY, PRAYER_TODAY_CACHE_KEY } from "./prayer-cache";
import { invalidatePrayerNotificationSchedule } from "./prayer-notifications";

import { DEFAULT_PRAYER_METHOD, normalizePrayerMethod } from "./prayer-methods";
export { DEFAULT_PRAYER_METHOD } from "./prayer-methods";
const APPLIED_SETTINGS_KEY = "prayerAppliedCalculationV1";
export const DEFAULT_PRAYER_SCHOOL = 0;

export const PRAYER_METHOD_KEY = "prayerCalculationMethod";
export const PRAYER_SCHOOL_KEY = "prayerCalculationSchool";

export const PRAYER_SCHOOL_OPTIONS = [
    { value: 0, labelKey: "schoolShafaei" },
    { value: 1, labelKey: "schoolHanafi" },
];

function readNumber(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        if (stored === null || stored === "") return fallback;
        const value = Number(stored);
        return isFinite(value) ? value : fallback;
    } catch (e) {
        return fallback;
    }
}

function isValidSchool(value) {
    for (const option of PRAYER_SCHOOL_OPTIONS) {
        if (option.value === value) return true;
    }
    return false;
}

function clearCachedPrayerTimes() {
    try {
        localStorage.removeItem(PRAYER_CACHE_KEY);
        localStorage.removeItem(PRAYER_TODAY_CACHE_KEY);
    } catch (e) {
        // Ignore storage failures; the next API fetch will still use current settings.
    }

    try {
        const app = getApp();
        const appCache = app && app._options ? app._options.globalData : null;
        if (appCache) {
            appCache.prayerCache = null;
            appCache.prayerData = null;
            appCache.prayerDayKey = null;
        }
    } catch (e) {
        // getApp is not available in every runtime context.
    }

    try {
        invalidatePrayerNotificationSchedule();
    } catch (e) {
        // Notification APIs may not be available in every settings context.
    }
}

export function getPrayerMethod() {
    return normalizePrayerMethod(readNumber(PRAYER_METHOD_KEY, DEFAULT_PRAYER_METHOD));
}

export function getPrayerSchool() {
    const school = readNumber(PRAYER_SCHOOL_KEY, DEFAULT_PRAYER_SCHOOL);
    return isValidSchool(school) ? school : DEFAULT_PRAYER_SCHOOL;
}

export function setPrayerSchool(school) {
    const nextSchool = isValidSchool(Number(school))
        ? Number(school)
        : DEFAULT_PRAYER_SCHOOL;
    if (getPrayerSchool() !== nextSchool) {
        getAppliedPrayerCalculationSettings();
        localStorage.setItem(PRAYER_SCHOOL_KEY, String(nextSchool));
    }
    return nextSchool;
}

export function getPrayerCalculationSettings() {
    return {
        method: getPrayerMethod(),
        school: getPrayerSchool(),
    };
}

export function setPrayerMethod(method) {
    const nextMethod = normalizePrayerMethod(Number(method));
    getAppliedPrayerCalculationSettings();
    localStorage.setItem(PRAYER_METHOD_KEY, String(nextMethod));
    return nextMethod;
}

// Preserve the settings of existing caches before a user edits their selection.
export function getAppliedPrayerCalculationSettings() {
    const stored = localStorage.getItem(APPLIED_SETTINGS_KEY);
    if (stored) {
        try {
            const value = typeof stored === "string" ? JSON.parse(stored) : stored;
            if (value && normalizePrayerMethod(value.method) === value.method && isValidSchool(value.school)) return value;
        } catch (e) { /* Reinitialize legacy or invalid metadata. */ }
    }
    const current = getPrayerCalculationSettings();
    localStorage.setItem(APPLIED_SETTINGS_KEY, JSON.stringify(current));
    return current;
}

// Called only when entering the home page, never by settings screens or widgets.
export function applyPrayerCalculationSettings() {
    const selected = getPrayerCalculationSettings();
    const applied = getAppliedPrayerCalculationSettings();
    if (selected.method === applied.method && selected.school === applied.school) return false;
    clearCachedPrayerTimes();
    localStorage.setItem(APPLIED_SETTINGS_KEY, JSON.stringify(selected));
    return true;
}
