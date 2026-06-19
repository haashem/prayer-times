import { set as setAlarm, cancel as cancelAlarm, REPEAT_ONCE } from "@zos/alarm";
import { localStorage } from "@zos/storage";
import { getPrayerLabel, t } from "./i18n";
import { PRAYER_CACHE_KEY, getNextPrayerOccurrence } from "./prayer-cache";

export const PRAYER_NOTIFICATION_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
export const PRAYER_NOTIFICATION_PREFS_KEY = "prayerNotificationPrefsV1";

const ALARM_IDS_KEY = "prayerNotificationAlarmIdsV1";
const SCHEDULE_CONTEXT_KEY = "prayerNotificationScheduleContextV1";
const SCHEDULE_SIGNATURE_KEY = "prayerNotificationScheduleSignatureV1";
const NOTIFICATION_SERVICE_URL = "app-service/prayer-notification";

function readJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (e) {
        return fallback;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getPrayerNotificationPreferences() {
    const stored = readJson(PRAYER_NOTIFICATION_PREFS_KEY, {});
    const preferences = {};
    for (const key of PRAYER_NOTIFICATION_KEYS) {
        preferences[key] = stored[key] === true;
    }
    return preferences;
}

function getAlarmIds() {
    return readJson(ALARM_IDS_KEY, {});
}

function saveAlarmIds(ids) {
    writeJson(ALARM_IDS_KEY, ids);
}

function cancelAlarmId(id) {
    if (typeof id !== "number" || id <= 0) return;
    try {
        cancelAlarm(id);
    } catch (e) {
        // The alarm may already have fired.
    }
}

export function cancelPrayerNotificationAlarms() {
    const ids = getAlarmIds();
    for (const key of PRAYER_NOTIFICATION_KEYS) {
        cancelAlarmId(ids[key]);
    }
    saveAlarmIds({});
}

function cancelPrayerNotificationAlarm(prayerKey) {
    const ids = getAlarmIds();
    cancelAlarmId(ids[prayerKey]);
    delete ids[prayerKey];
    saveAlarmIds(ids);
}

function getStoredLocation() {
    return readJson("location", null);
}

function getStoredCache() {
    return readJson(PRAYER_CACHE_KEY, null);
}

function createScheduleContext(location, cache) {
    const latitude = location && location.latitude;
    const longitude = location && location.longitude;
    const cacheMonth = cache ? String(cache.year) + "-" + String(cache.month) : "no-cache";
    return [latitude, longitude, cacheMonth, Date.now()].join("|");
}

function createScheduleSignature(location, cache) {
    if (!location || !cache) return "";
    return [
        location.latitude,
        location.longitude,
        cache.year,
        cache.month,
    ].join("|");
}

function buildAlarmPayload(prayerKey, context, location) {
    const prayer = getPrayerLabel(prayerKey);
    const city = location && location.city ? String(location.city) : t("yourLocation");
    return {
        prayerKey,
        context,
        title: t("prayerNotificationTitle"),
        content: t("prayerNotificationContent")
            .replace("{prayer}", prayer)
            .replace("{city}", city),
        openLabel: t("openApp"),
    };
}

export function scheduleNextPrayerNotification(prayerKey, context, now = new Date()) {
    if (PRAYER_NOTIFICATION_KEYS.indexOf(prayerKey) === -1) return 0;

    const preferences = getPrayerNotificationPreferences();
    if (!preferences[prayerKey]) return 0;
    if (!context || localStorage.getItem(SCHEDULE_CONTEXT_KEY) !== context) return 0;

    const location = getStoredLocation();
    const cache = getStoredCache();
    if (!location || !cache) return 0;

    const occurrence = getNextPrayerOccurrence(cache, prayerKey, now);
    if (!occurrence) return 0;

    const ids = getAlarmIds();
    cancelAlarmId(ids[prayerKey]);

    const alarmId = setAlarm({
        url: NOTIFICATION_SERVICE_URL,
        time: Math.floor(occurrence.getTime() / 1000),
        param: JSON.stringify(buildAlarmPayload(prayerKey, context, location)),
        repeat_type: REPEAT_ONCE,
        store: true,
    });

    if (alarmId > 0) {
        ids[prayerKey] = alarmId;
        saveAlarmIds(ids);
    } else {
        delete ids[prayerKey];
        saveAlarmIds(ids);
    }
    return alarmId;
}

export function refreshPrayerNotificationSchedule() {
    const location = getStoredLocation();
    const cache = getStoredCache();

    cancelPrayerNotificationAlarms();
    const context = createScheduleContext(location, cache);
    localStorage.setItem(SCHEDULE_CONTEXT_KEY, context);
    localStorage.setItem(SCHEDULE_SIGNATURE_KEY, createScheduleSignature(location, cache));

    if (!location || !cache) return;
    for (const prayerKey of PRAYER_NOTIFICATION_KEYS) {
        scheduleNextPrayerNotification(prayerKey, context);
    }
}

export function deferPrayerNotificationScheduleRefresh() {
    setTimeout(() => refreshPrayerNotificationSchedule(), 0);
}

export function refreshPrayerNotificationScheduleIfNeeded() {
    const location = getStoredLocation();
    const cache = getStoredCache();
    const expectedSignature = createScheduleSignature(location, cache);
    const storedSignature = localStorage.getItem(SCHEDULE_SIGNATURE_KEY) || "";
    const context = localStorage.getItem(SCHEDULE_CONTEXT_KEY);

    if (!expectedSignature || expectedSignature !== storedSignature || !context) {
        deferPrayerNotificationScheduleRefresh();
        return;
    }

    const preferences = getPrayerNotificationPreferences();
    const ids = getAlarmIds();
    for (const prayerKey of PRAYER_NOTIFICATION_KEYS) {
        if (preferences[prayerKey] && !(ids[prayerKey] > 0)) {
            deferPrayerNotificationScheduleRefresh();
            return;
        }
    }
}

export function invalidatePrayerNotificationSchedule() {
    cancelPrayerNotificationAlarms();
    localStorage.setItem(SCHEDULE_CONTEXT_KEY, "invalid|" + Date.now());
    localStorage.setItem(SCHEDULE_SIGNATURE_KEY, "");
}

export function deferPrayerNotificationScheduleInvalidation() {
    setTimeout(() => invalidatePrayerNotificationSchedule(), 0);
}

export function setPrayerNotificationEnabled(prayerKey, enabled) {
    if (PRAYER_NOTIFICATION_KEYS.indexOf(prayerKey) === -1) return;
    const preferences = getPrayerNotificationPreferences();
    preferences[prayerKey] = enabled === true;
    writeJson(PRAYER_NOTIFICATION_PREFS_KEY, preferences);

    setTimeout(() => {
        const currentPreferences = getPrayerNotificationPreferences();
        if (!currentPreferences[prayerKey]) {
            cancelPrayerNotificationAlarm(prayerKey);
            return;
        }

        const location = getStoredLocation();
        const cache = getStoredCache();
        const expectedSignature = createScheduleSignature(location, cache);
        const storedSignature = localStorage.getItem(SCHEDULE_SIGNATURE_KEY) || "";
        const context = localStorage.getItem(SCHEDULE_CONTEXT_KEY);
        if (!expectedSignature || expectedSignature !== storedSignature || !context) {
            refreshPrayerNotificationSchedule();
            return;
        }

        scheduleNextPrayerNotification(prayerKey, context);
    }, 0);
}

export function isPrayerNotificationCurrent(prayerKey, context) {
    const preferences = getPrayerNotificationPreferences();
    return preferences[prayerKey] === true &&
        Boolean(context) &&
        localStorage.getItem(SCHEDULE_CONTEXT_KEY) === context;
}
