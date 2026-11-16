import { localStorage } from '@zos/storage';
import { set as setAlarm, cancel as cancelAlarm, REPEAT_ONCE } from '@zos/alarm';
import { ADHKAR } from './adhkar-content';

export const ADHKAR_SETTINGS_KEY = 'adhkarSettingsV1';
const ALARM_KEY = 'adhkarAlarmV1';
const CURSOR_KEY = 'adhkarCursorV1';
const LAST_DISPLAY_KEY = 'adhkarLastDisplayV1';
const REVISION_KEY = 'adhkarScheduleRevisionV1';
export const ADHKAR_MODES = ['daily', '30', '60', '120'];

function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function minute(value, fallback) {
    return Number.isInteger(value) && value >= 0 && value < 1440 ? Math.min(1425, Math.round(value / 15) * 15) : fallback;
}
export function getAdhkarSettings() {
    const stored = read(ADHKAR_SETTINGS_KEY, {});
    let start = minute(stored.start, 480);
    let end = minute(stored.end, 1320);
    if (start >= end) { start = 480; end = 1320; }
    const mode = ADHKAR_MODES.indexOf(stored.mode) !== -1 ? stored.mode : 'daily';
    let times = Array.isArray(stored.times) && stored.times.length === 3
        ? stored.times.map((value, index) => minute(value, [540, 840, 1200][index]))
        : [540, 840, 1200];
    // Older versions allowed individual minutes. Rounding must not leave
    // duplicate daily times that would prevent any subsequent settings edit.
    if (times.some((time, index) => times.indexOf(time) !== index)) {
        if (mode === 'daily' && end - start < 30) { start = 480; end = 1320; }
        times = end - start >= 30 ? [start, Math.floor((start + end) / 30) * 15, end] : [540, 840, 1200];
    }
    const enabledIds = Array.isArray(stored.enabledIds)
        ? ADHKAR.filter((item) => stored.enabledIds.indexOf(item.id) !== -1).map((item) => item.id)
        : ADHKAR.map((item) => item.id);
    return {
        enabled: stored.enabled === true && enabledIds.length > 0,
        enabledIds,
        mode, start, end, times,
    };
}

export function saveAdhkarSettings(settings) {
    if (!Number.isInteger(settings.start) || !Number.isInteger(settings.end) ||
        settings.start < 0 || settings.end >= 1440 || settings.start % 15 !== 0 || settings.end % 15 !== 0 || settings.start >= settings.end ||
        ADHKAR_MODES.indexOf(settings.mode) === -1 || settings.times.length !== 3 ||
        settings.times.some((time) => !Number.isInteger(time) || time < 0 || time >= 1440 || time % 15 !== 0) ||
        (settings.mode === 'daily' && settings.times.some((time) => time < settings.start || time > settings.end)) ||
        settings.times.some((time, index) => settings.times.indexOf(time) !== index)) return false;
    settings.enabled = settings.enabled === true && settings.enabledIds.length > 0;
    write(ADHKAR_SETTINGS_KEY, settings);
    refreshAdhkarSchedule();
    return true;
}

// Calendar arithmetic preserves local wall-clock times across DST and month/year boundaries.
export function getNextAdhkarOccurrence(settings, now = new Date()) {
    if (!settings.enabled || !settings.enabledIds.length) return null;
    const minutes = [];
    if (settings.mode === 'daily') {
        for (const value of settings.times) {
            if (value >= settings.start && value <= settings.end) minutes.push(value);
        }
    } else {
        const interval = Number(settings.mode);
        if ([30, 60, 120].indexOf(interval) === -1) return null;
        for (let value = settings.start; value <= settings.end; value += interval) minutes.push(value);
    }
    minutes.sort((a, b) => a - b);
    for (let day = 0; day < 3; day++) {
        for (const value of minutes) {
            const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day,
                Math.floor(value / 60), value % 60, 0, 0);
            // Do not emit a normalized nonexistent local time outside the requested slot.
            if (candidate.getHours() * 60 + candidate.getMinutes() !== value) continue;
            if (candidate.getTime() > now.getTime()) return candidate;
        }
    }
    return null;
}

function cancelCurrent() {
    const alarm = read(ALARM_KEY, null);
    if (alarm && alarm.id > 0) {
        try { cancelAlarm(alarm.id); } catch (e) { /* Already fired. */ }
    }
    write(ALARM_KEY, null);
}

export function refreshAdhkarSchedule(now = new Date()) {
    cancelCurrent();
    const occurrence = getNextAdhkarOccurrence(getAdhkarSettings(), now);
    if (!occurrence) return 0;
    const time = occurrence.getTime();
    const revision = Number(read(REVISION_KEY, 0)) + 1;
    write(REVISION_KEY, revision);
    const payload = { adhkar: true, occurrenceTime: time, token: String(revision) + '|' + time };
    const id = setAlarm({
        url: 'page/gt/adhkar-alert/index.page', time: Math.floor(time / 1000),
        param: JSON.stringify(payload), repeat_type: REPEAT_ONCE, store: true,
    });
    if (id > 0) write(ALARM_KEY, { ...payload, id, timezoneOffset: occurrence.getTimezoneOffset(), settingsSignature: JSON.stringify(getAdhkarSettings()) });
    return id;
}

export function ensureAdhkarSchedule(now = new Date()) {
    const settings = getAdhkarSettings();
    const alarm = read(ALARM_KEY, null);
    if (!settings.enabled) { if (alarm) cancelCurrent(); return; }
    if (!alarm || !(alarm.id > 0) || alarm.occurrenceTime <= now.getTime() || alarm.settingsSignature !== JSON.stringify(settings) ||
        alarm.timezoneOffset !== new Date(alarm.occurrenceTime).getTimezoneOffset()) refreshAdhkarSchedule(now);
}

// Called by the alarm page before rendering. Late deliveries never advance rotation.
export function prepareAdhkarReminder(payload, now = new Date()) {
    const alarm = read(ALARM_KEY, null);
    if (!payload || !alarm || payload.token !== alarm.token ||
        payload.occurrenceTime !== alarm.occurrenceTime) return null;
    const settings = getAdhkarSettings();
    const lateness = now.getTime() - alarm.occurrenceTime;
    const wallMinute = now.getHours() * 60 + now.getMinutes();
    if (lateness < 0) return null;
    refreshAdhkarSchedule(now);
    if (!settings.enabled || lateness > 60000 || alarm.settingsSignature !== JSON.stringify(settings) ||
        alarm.timezoneOffset !== new Date(alarm.occurrenceTime).getTimezoneOffset() ||
        wallMinute < settings.start || wallMinute > settings.end) return null;
    const last = read(LAST_DISPLAY_KEY, null);
    if (last === payload.occurrenceTime) return null;
    const cursor = read(CURSOR_KEY, ADHKAR[0].id);
    let start = ADHKAR.findIndex((item) => item.id === cursor);
    if (start < 0) start = 0;
    for (let offset = 0; offset < ADHKAR.length; offset++) {
        const item = ADHKAR[(start + offset) % ADHKAR.length];
        if (settings.enabledIds.indexOf(item.id) !== -1) return item;
    }
    return null;
}

// Commit only after both text widgets have been created successfully.
export function markAdhkarDisplayed(item, occurrenceTime) {
    const index = ADHKAR.findIndex((entry) => entry.id === item.id);
    write(CURSOR_KEY, ADHKAR[(index + 1) % ADHKAR.length].id);
    write(LAST_DISPLAY_KEY, occurrenceTime);
}

export function parseAdhkarPayload(value) {
    try {
        const data = typeof value === 'string' ? JSON.parse(value) : value;
        if (!data) return null;
        if (data.adhkar === true) return data;
        return parseAdhkarPayload(data.param || data.params);
    } catch (e) { return null; }
}
