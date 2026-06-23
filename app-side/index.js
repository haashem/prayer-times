import { BaseSideService } from "@zeppos/zml/base-side";
import { createPrayerMonthCache } from "../utils/prayer-cache";

async function getPhoneLocation(res) {
    try {
        console.log("Getting location via IP geolocation...");

        const response = await fetch({
            url: "http://ip-api.com/json/?fields=status,city,country,lat,lon",
            method: "GET",
        });

        const resBody =
            typeof response.body === "string"
                ? JSON.parse(response.body)
                : response.body;

        console.log("IP geolocation result: " + JSON.stringify(resBody));

        if (resBody && resBody.status === "success") {
            res(null, {
                result: {
                    valid: true,
                    city: resBody.city,
                    country: resBody.country,
                    latitude: resBody.lat,
                    longitude: resBody.lon,
                },
            });
        } else {
            console.log("IP geolocation failed");
            res(null, { result: { valid: false, error: "Location not found" } });
        }
    } catch (e) {
        console.log("Error getting location: " + e.message);
        res(null, { result: { valid: false, error: e.message } });
    }
}

const NEEDED_TIMINGS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

function stripDay(day) {
    const t = day.timings;
    const timings = {};
    for (const k of NEEDED_TIMINGS) {
        timings[k] = t[k];
    }
    return {
        timings,
        date: {
            gregorian: { date: day.date.gregorian.date },
            hijri: {
                day: day.date.hijri.day,
                month: {
                    en: day.date.hijri.month.en,
                    number: day.date.hijri.month.number,
                },
                year: day.date.hijri.year,
            },
        },
    };
}

async function fetchPrayerTimes(params, res) {
    try {
        const today = new Date();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        const nextMonth = mm === 12 ? 1 : mm + 1;
        const nextMonthYear = mm === 12 ? yyyy + 1 : yyyy;

        const resBody = await fetchCalendar(yyyy, mm, params);

        console.log("Fetch response code: " + (resBody && resBody.code));

        if (resBody && resBody.code === 200 && Array.isArray(resBody.data)) {
            let nextMonthFirst = null;
            try {
                const nextMonthBody = await fetchCalendar(nextMonthYear, nextMonth, params);
                if (nextMonthBody && nextMonthBody.code === 200 && Array.isArray(nextMonthBody.data)) {
                    nextMonthFirst = stripDay(nextMonthBody.data[0]);
                }
            } catch (e) {
                console.log("Failed to fetch next month first day: " + e.message);
            }

            const slim = resBody.data.map(stripDay);
            const cache = createPrayerMonthCache(slim, yyyy, mm, nextMonthFirst);
            res(null, { result: { code: 200, cache } });
        } else {
            console.log("Fetch error body: " + JSON.stringify(resBody).substring(0, 500));
            res(null, { error: "API returned non-200 status" });
        }
    } catch (e) {
        console.log("Error fetching prayer times: " + e.message);
        res(null, { error: e.message });
    }
}

async function fetchCalendar(year, month, params) {
    const method = params.method || 3;
    const school = params.school === 1 ? 1 : 0;
    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${params.latitude}&longitude=${params.longitude}&method=${method}&school=${school}`;
    console.log("Fetching prayer times: " + url);

    const response = await fetch({ url, method: "GET" });
    return typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;
}

AppSideService(
    BaseSideService({
        onInit() {
            console.log("prayer-times app-side onInit");
        },

        onRequest(req, res) {
            if (req.method === "GET_PHONE_LOCATION") {
                getPhoneLocation(res);
            } else if (req.method === "FETCH_PRAYER_TIMES") {
                fetchPrayerTimes(req.params, res);
            }
        },

        onRun() { },

        onDestroy() { },
    })
);
