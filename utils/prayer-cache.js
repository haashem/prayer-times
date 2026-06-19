export const PRAYER_CACHE_KEY = "prayerMonthV2";

export const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

const RECORD_SIZE = 32;
const EMPTY_RECORD = "00000000000000000000000000000000";

const HIJRI_MONTHS_EN = [
    "Muharram",
    "Safar",
    "Rabi al-awwal",
    "Rabi al-thani",
    "Jumada al-awwal",
    "Jumada al-thani",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
];

const HIJRI_MONTH_EN_TO_INDEX = {
    muharram: 1,
    safar: 2,
    "rabi al awwal": 3,
    "rabi al thani": 4,
    "jumada al awwal": 5,
    "jumada al thani": 6,
    rajab: 7,
    "sha ban": 8,
    ramadan: 9,
    shawwal: 10,
    "dhu al qidah": 11,
    "dhu al qadah": 11,
    "dhu al hijjah": 12,
};

function pad(value, size) {
    let text = String(value || "");
    while (text.length < size) text = "0" + text;
    return text.slice(-size);
}

function normalizeMonthName(name) {
    const text = String(name || "").toLowerCase();
    const normalized = typeof text.normalize === "function" ? text.normalize("NFD") : text;
    return normalized
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]+/g, " ")
        .trim();
}

function getGregorianParts(day) {
    const date = day && day.date && day.date.gregorian && day.date.gregorian.date;
    const parts = date ? String(date).split("-") : [];
    return {
        day: Number(parts[0] || 0),
        month: parts[1] || "",
        year: parts[2] || "",
    };
}

function getHijriMonthNumber(hijri) {
    if (!hijri) return 0;
    if (hijri.month && hijri.month.number) return Number(hijri.month.number);

    const dateParts = hijri.date ? String(hijri.date).split("-") : [];
    if (dateParts[1]) return Number(dateParts[1]);

    if (hijri.month && hijri.month.en) {
        return HIJRI_MONTH_EN_TO_INDEX[normalizeMonthName(hijri.month.en)] || 0;
    }

    return 0;
}

function toCompactTime(timeStr) {
    const match = String(timeStr || "").match(/(\d{1,2}):(\d{2})/);
    if (!match) return "0000";
    return pad(match[1], 2) + pad(match[2], 2);
}

function fromCompactTime(text) {
    return text.slice(0, 2) + ":" + text.slice(2, 4);
}

function packDay(day) {
    if (!day || !day.timings || !day.date) return EMPTY_RECORD;

    let record = "";
    for (const key of PRAYER_KEYS) {
        record += toCompactTime(day.timings[key]);
    }

    const hijri = day.date.hijri || {};
    const hijriDay = hijri.day || (hijri.date ? String(hijri.date).split("-")[0] : "");
    record += pad(hijriDay, 2);
    record += pad(getHijriMonthNumber(hijri), 2);
    record += pad(hijri.year || (hijri.date ? String(hijri.date).split("-")[2] : ""), 4);

    return record.length === RECORD_SIZE ? record : EMPTY_RECORD;
}

function unpackDay(record, year, month, day) {
    if (!record || record.length !== RECORD_SIZE || record === EMPTY_RECORD) return null;

    const timings = {};
    for (let i = 0; i < PRAYER_KEYS.length; i++) {
        const start = i * 4;
        timings[PRAYER_KEYS[i]] = fromCompactTime(record.slice(start, start + 4));
    }

    const hijriDay = Number(record.slice(24, 26));
    const hijriMonth = Number(record.slice(26, 28));
    const hijriYear = record.slice(28, 32);

    return {
        timings,
        date: {
            gregorian: {
                date: pad(day, 2) + "-" + pad(month, 2) + "-" + String(year),
            },
            hijri: {
                day: pad(hijriDay, 2),
                month: {
                    number: hijriMonth,
                    en: HIJRI_MONTHS_EN[hijriMonth - 1] || "",
                },
                year: hijriYear,
            },
        },
    };
}

function getNextMonth(year, month) {
    const numericYear = Number(year);
    const numericMonth = Number(month);
    if (numericMonth === 12) {
        return { year: String(numericYear + 1), month: "01" };
    }
    return { year: String(numericYear), month: pad(numericMonth + 1, 2) };
}

export function createPrayerMonthCache(days, year, month, nextMonthFirstDay) {
    const paddedMonth = pad(month, 2);
    const records = [];

    for (let i = 0; i < days.length; i++) {
        records.push(EMPTY_RECORD);
    }

    for (const day of days) {
        const parts = getGregorianParts(day);
        const index = parts.day - 1;
        if (index >= 0 && index < records.length) {
            records[index] = packDay(day);
        }
    }

    return {
        v: 2,
        year: String(year),
        month: paddedMonth,
        days: records.length,
        recordSize: RECORD_SIZE,
        records: records.join(""),
        nextMonthFirst: nextMonthFirstDay ? packDay(nextMonthFirstDay) : "",
    };
}

export function getPrayerWindow(cache, time) {
    if (!cache || cache.v !== 2 || cache.recordSize !== RECORD_SIZE) return null;
    if (!cache.records || cache.records.length < cache.days * RECORD_SIZE) return null;

    const year = String(time.getFullYear());
    const month = pad(time.getMonth(), 2);
    const day = time.getDate();

    if (cache.year !== year || cache.month !== month || day < 1 || day > cache.days) {
        return null;
    }

    const todayOffset = (day - 1) * RECORD_SIZE;
    const today = unpackDay(
        cache.records.slice(todayOffset, todayOffset + RECORD_SIZE),
        year,
        month,
        day
    );
    if (!today) return null;

    let tomorrow = null;
    if (day < cache.days) {
        const tomorrowOffset = day * RECORD_SIZE;
        tomorrow = unpackDay(
            cache.records.slice(tomorrowOffset, tomorrowOffset + RECORD_SIZE),
            year,
            month,
            day + 1
        );
    } else if (cache.nextMonthFirst) {
        const nextMonth = getNextMonth(year, month);
        tomorrow = unpackDay(cache.nextMonthFirst, nextMonth.year, nextMonth.month, 1);
    }

    return { today, tomorrow };
}

function getPrayerDateTime(day, prayerKey) {
    if (!day || !day.timings || !day.timings[prayerKey]) return null;

    const dateText = day.date && day.date.gregorian && day.date.gregorian.date;
    const dateMatch = String(dateText || "").match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    const timeMatch = String(day.timings[prayerKey] || "").match(/(\d{1,2}):(\d{2})/);
    if (!dateMatch || !timeMatch) return null;

    return new Date(
        Number(dateMatch[3]),
        Number(dateMatch[2]) - 1,
        Number(dateMatch[1]),
        Number(timeMatch[1]),
        Number(timeMatch[2]),
        0,
        0
    );
}

export function getNextPrayerOccurrence(cache, prayerKey, now = new Date()) {
    const cacheTime = {
        getFullYear: () => now.getFullYear(),
        getMonth: () => now.getMonth() + 1,
        getDate: () => now.getDate(),
    };
    const prayerWindow = getPrayerWindow(cache, cacheTime);
    if (!prayerWindow) return null;

    const minimumTime = now.getTime() + 30000;
    const candidates = [prayerWindow.today, prayerWindow.tomorrow];
    for (const day of candidates) {
        const occurrence = getPrayerDateTime(day, prayerKey);
        if (occurrence && occurrence.getTime() > minimumTime) {
            return occurrence;
        }
    }

    return null;
}
