import { localStorage } from "@zos/storage";
import { PRAYER_CACHE_KEY } from "./prayer-cache";
import { invalidatePrayerNotificationSchedule } from "./prayer-notifications";

export const DEFAULT_PRAYER_METHOD = 3;
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
        localStorage.removeItem("prayerData");
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
    return readNumber(PRAYER_METHOD_KEY, DEFAULT_PRAYER_METHOD);
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
        localStorage.setItem(PRAYER_SCHOOL_KEY, String(nextSchool));
        clearCachedPrayerTimes();
    }
    return nextSchool;
}

export function getPrayerCalculationSettings() {
    return {
        method: getPrayerMethod(),
        school: getPrayerSchool(),
    };
}
