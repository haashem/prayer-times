import { BaseSideService } from "@zeppos/zml/base-side";
import { createPrayerMonthCache } from "../utils/prayer-cache";

const CITY_SEARCH_REQUEST_KEY = "citySearchRequest";
const CITY_SEARCH_RESULTS_KEY = "citySearchResults";
const CITY_SEARCH_STATUS_KEY = "citySearchStatus";
const SAVED_CITIES_KEY = "savedCities";
const DEFAULT_CITY_KEY = "defaultCityKey";

function cityKey(city) {
    if (!city) return "";
    const latitude = Number(city.latitude);
    const longitude = Number(city.longitude);
    if (isFinite(latitude) && isFinite(longitude)) {
        return latitude.toFixed(5) + "," + longitude.toFixed(5);
    }
    return String((city && city.name) || "").toLowerCase();
}

function normalizeSavedCity(city) {
    return {
        name: String((city && city.name) || ""),
        latitude: Number(city && city.latitude),
        longitude: Number(city && city.longitude),
    };
}

function getLocationSettings() {
    const storedCities = parseJson(settings.settingsStorage.getItem(SAVED_CITIES_KEY), []);
    const cities = Array.isArray(storedCities)
        ? storedCities
            .map(normalizeSavedCity)
            .filter((city) => city.name && isFinite(city.latitude) && isFinite(city.longitude))
            .slice(0, 5)
        : [];
    const requestedDefault = settings.settingsStorage.getItem(DEFAULT_CITY_KEY) || "auto";
    const defaultCityKey =
        requestedDefault === "auto" || cities.some((city) => cityKey(city) === requestedDefault)
            ? requestedDefault
            : "auto";

    if (defaultCityKey !== requestedDefault) {
        settings.settingsStorage.setItem(DEFAULT_CITY_KEY, "auto");
    }

    return { cities, defaultCityKey };
}

function setDefaultLocation(params, res) {
    const locationSettings = getLocationSettings();
    const requestedKey = params && params.key ? String(params.key) : "auto";
    const valid =
        requestedKey === "auto" ||
        locationSettings.cities.some((city) => cityKey(city) === requestedKey);
    const defaultCityKey = valid ? requestedKey : "auto";
    settings.settingsStorage.setItem(DEFAULT_CITY_KEY, defaultCityKey);
    res(null, { result: { valid, defaultCityKey } });
}

function parseJson(value, fallback) {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch (e) {
        return fallback;
    }
}

function normalizeCityResult(result) {
    return {
        id: result.id,
        name: result.name,
        admin1: result.admin1 || "",
        country: result.country || result.country_code || "",
        latitude: result.latitude,
        longitude: result.longitude,
        timezone: result.timezone || "",
    };
}

async function searchCities(requestValue) {
    const request = parseJson(requestValue, null);
    const query = request && typeof request.query === "string" ? request.query.trim() : "";
    if (query.length < 2) return;

    try {
        const response = await fetch({
            url:
                "https://geocoding-api.open-meteo.com/v1/search?name=" +
                encodeURIComponent(query) +
                "&count=8&language=en&format=json",
            method: "GET",
        });
        const body =
            typeof response.body === "string" ? JSON.parse(response.body) : response.body;
        const results = body && Array.isArray(body.results)
            ? body.results.map(normalizeCityResult)
            : [];

        // Ignore an old response if another search was submitted while it was loading.
        if (settings.settingsStorage.getItem(CITY_SEARCH_REQUEST_KEY) !== requestValue) return;

        settings.settingsStorage.setItem(CITY_SEARCH_RESULTS_KEY, JSON.stringify(results));
        settings.settingsStorage.setItem(
            CITY_SEARCH_STATUS_KEY,
            results.length > 0 ? "success" : "empty"
        );
    } catch (e) {
        console.log("City search failed: " + e.message);
        if (settings.settingsStorage.getItem(CITY_SEARCH_REQUEST_KEY) === requestValue) {
            settings.settingsStorage.setItem(CITY_SEARCH_RESULTS_KEY, "[]");
            settings.settingsStorage.setItem(CITY_SEARCH_STATUS_KEY, "error");
        }
    }
}

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

        const resBody = await fetchPrayerCalendarRange(yyyy, mm, params);

        console.log("Fetch response code: " + (resBody && resBody.code));

        if (resBody && resBody.code === 200 && Array.isArray(resBody.data)) {
            validatePrayerCalendarRange(resBody.data, yyyy, mm);
            const prayerDays = resBody.data.map(stripDay);
            const previousMonthLastTwoHijriDates = prayerDays.slice(0, 2).map((day) => day.date.hijri);
            const currentMonthPrayerDays = prayerDays.slice(2, -2);
            const nextMonthFirstTwoDays = prayerDays.slice(-2);
            const cache = createPrayerMonthCache(
                currentMonthPrayerDays, yyyy, mm, nextMonthFirstTwoDays[0],
                previousMonthLastTwoHijriDates, nextMonthFirstTwoDays.map((day) => day.date.hijri)
            );
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

function validatePrayerCalendarRange(days, year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    if (days.length !== daysInMonth + 4) throw new Error("Incomplete prayer calendar date range");
    for (let index = 0; index < days.length; index++) {
        const expectedDate = formatApiDate(new Date(year, month - 1, index - 1));
        if (days[index].date.gregorian.date !== expectedDate) {
            throw new Error("Unexpected date in prayer calendar range");
        }
    }
}

function formatApiDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${date.getFullYear()}`;
}

async function fetchPrayerCalendarRange(year, month, params) {
    const start = formatApiDate(new Date(year, month - 1, -1));
    const end = formatApiDate(new Date(year, month, 2));
    const method = params.method || 3;
    const school = params.school === 1 ? 1 : 0;
    const url = `https://api.aladhan.com/v1/calendar/from/${start}/to/${end}?latitude=${params.latitude}&longitude=${params.longitude}&method=${method}&school=${school}&calendarMethod=HJCoSA`;
    console.log("Fetching prayer calendar: " + url);
    const response = await fetch({ url, method: "GET" });
    return typeof response.body === "string" ? JSON.parse(response.body) : response.body;
}

AppSideService(
    BaseSideService({
        onInit() {
            console.log("prayer-times app-side onInit");
            settings.settingsStorage.addListener("change", ({ key, newValue }) => {
                if (key === CITY_SEARCH_REQUEST_KEY) searchCities(newValue);
                if (key === SAVED_CITIES_KEY) getLocationSettings();
                if (key === SAVED_CITIES_KEY || key === DEFAULT_CITY_KEY) {
                    try {
                        const pendingCall = this.call({
                            type: "LOCATION_SETTINGS_CHANGED",
                            key,
                        });
                        if (pendingCall && pendingCall.catch) pendingCall.catch(() => { });
                    } catch (e) {
                        // The watch app may not currently be open.
                    }
                }
            });
        },

        onRequest(req, res) {
            if (req.method === "GET_PHONE_LOCATION") {
                getPhoneLocation(res);
            } else if (req.method === "FETCH_PRAYER_TIMES") {
                fetchPrayerTimes(req.params, res);
            } else if (req.method === "GET_LOCATION_SETTINGS") {
                res(null, { result: getLocationSettings() });
            } else if (req.method === "SET_DEFAULT_LOCATION") {
                setDefaultLocation(req.params, res);
            }
        },

        onRun() { },

        onDestroy() { },
    })
);
