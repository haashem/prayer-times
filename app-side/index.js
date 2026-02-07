import { BaseSideService } from "@zeppos/zml/base-side";

// Get your free API key at https://api-ninjas.com/register
const API_NINJAS_KEY = "7sqocH3iwCBEAYEskxHjNIkwKJVKQO0LXPPoOCxY";

async function searchCity(query, res) {
    try {
        const url = `https://api.api-ninjas.com/v1/city?name=${encodeURIComponent(query)}`;
        console.log("Searching city: " + url);

        const response = await fetch({
            url,
            method: "GET",
            headers: { "X-Api-Key": API_NINJAS_KEY },
        });

        const resBody =
            typeof response.body === "string"
                ? JSON.parse(response.body)
                : response.body;

        console.log("Search result count: " + (resBody ? resBody.length : 0));

        if (Array.isArray(resBody) && resBody.length > 0) {
            // Return list of matching cities
            const cities = resBody.map(function (c) {
                return {
                    name: c.name,
                    country: c.country,
                    latitude: c.latitude,
                    longitude: c.longitude,
                    population: c.population,
                };
            });
            console.log("Cities found: " + JSON.stringify(cities));
            res(null, { result: { valid: true, cities: cities } });
        } else {
            console.log("No cities found for: " + query);
            res(null, { result: { valid: false } });
        }
    } catch (e) {
        console.log("Error searching city: " + e.message);
        res(null, { result: { valid: false, error: e.message } });
    }
}

async function fetchPrayerTimes(params, res) {
    try {
        // Fetch only today's prayer times (small response)
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const dateStr = dd + "-" + mm + "-" + yyyy;

        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${params.latitude}&longitude=${params.longitude}&method=${params.method}`;
        console.log("Fetching prayer times: " + url);

        const response = await fetch({ url, method: "GET" });
        const resBody =
            typeof response.body === "string"
                ? JSON.parse(response.body)
                : response.body;

        console.log("Fetch response code: " + (resBody && resBody.code));

        if (resBody && resBody.code === 200) {
            res(null, { result: resBody });
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
            if (req.method === "SEARCH_CITY") {
                const { query } = req.params;
                searchCity(query, res);
            } else if (req.method === "FETCH_PRAYER_TIMES") {
                fetchPrayerTimes(req.params, res);
            }
        },

        onRun() { },

        onDestroy() { },
    })
);
