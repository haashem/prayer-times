import { BaseSideService } from "@zeppos/zml/base-side";

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
                month: { en: day.date.hijri.month.en },
                year: day.date.hijri.year,
            },
        },
    };
}

async function fetchPrayerTimes(params, res) {
    try {
        const today = new Date();
        const mm = String(today.getMonth() + 1);
        const yyyy = today.getFullYear();

        const url = `https://api.aladhan.com/v1/calendar/${yyyy}/${mm}?latitude=${params.latitude}&longitude=${params.longitude}&method=${params.method}`;
        console.log("Fetching prayer times: " + url);

        const response = await fetch({ url, method: "GET" });
        const resBody =
            typeof response.body === "string"
                ? JSON.parse(response.body)
                : response.body;

        console.log("Fetch response code: " + (resBody && resBody.code));

        if (resBody && resBody.code === 200) {
            // Strip each day down to only the fields we need
            const slim = resBody.data.map(stripDay);
            res(null, { result: { code: 200, data: slim } });
        } else {
            console.log("Fetch error body: " + JSON.stringify(resBody).substring(0, 500));
            res(null, { error: "API returned non-200 status" });
        }
    } catch (e) {
        console.log("Error fetching prayer times: " + e.message);
        res(null, { error: e.message });
    }
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
