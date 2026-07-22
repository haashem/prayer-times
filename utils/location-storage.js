import { localStorage } from "@zos/storage";
import { PRAYER_CACHE_KEY, PRAYER_TODAY_CACHE_KEY } from "./prayer-cache";
import { deferPrayerNotificationScheduleInvalidation } from "./prayer-notifications";

export function getAppCache() {
  try {
    const app = getApp();
    return app && app._options ? app._options.globalData : null;
  } catch (e) {
    return null;
  }
}

export function getLocationKey(location) {
  if (!location) return "";
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  if (!isFinite(latitude) || !isFinite(longitude)) return "";
  return latitude.toFixed(5) + "," + longitude.toFixed(5);
}

export function readStoredLocation() {
  const appCache = getAppCache();
  if (appCache && appCache.location) return appCache.location;

  try {
    const stored = localStorage.getItem("location");
    const location = stored
      ? (typeof stored === "string" ? JSON.parse(stored) : stored)
      : null;
    if (appCache) appCache.location = location;
    return location;
  } catch (e) {
    return null;
  }
}

export function clearPrayerCaches() {
  localStorage.removeItem(PRAYER_CACHE_KEY);
  localStorage.removeItem(PRAYER_TODAY_CACHE_KEY);
  localStorage.removeItem("prayerData");

  const appCache = getAppCache();
  if (appCache) {
    appCache.prayerCache = null;
    appCache.prayerData = null;
    appCache.prayerDayKey = null;
  }
  deferPrayerNotificationScheduleInvalidation();
}

export function persistLocation(location, mode, defaultCityKey) {
  const previousLocation = readStoredLocation();
  const previousKey = getLocationKey(previousLocation);
  const nextKey = getLocationKey(location);
  const changed = previousKey !== nextKey || Boolean(previousLocation) !== Boolean(location);

  localStorage.setItem("locationMode", mode);
  localStorage.setItem("defaultCityKey", defaultCityKey);
  if (location) localStorage.setItem("location", JSON.stringify(location));
  else localStorage.removeItem("location");

  const appCache = getAppCache();
  if (appCache) appCache.location = location || null;
  if (changed) clearPrayerCaches();
  return changed;
}

export function persistLocationChoice(city, defaultCityKey) {
  const previousDefaultCityKey = localStorage.getItem("defaultCityKey") || "auto";
  let location = null;
  if (city) {
    location = {
      city: city.name,
      country: "",
      latitude: city.latitude,
      longitude: city.longitude,
    };
  } else if (defaultCityKey === "auto" && previousDefaultCityKey === "auto") {
    location = readStoredLocation();
  }
  return persistLocation(
    location,
    defaultCityKey === "auto" ? "auto" : "city",
    defaultCityKey
  );
}

export function getPersistedLocationSelection() {
  const location = readStoredLocation();
  return location
    ? {
        location,
        mode: localStorage.getItem("locationMode") || "auto",
        defaultCityKey: localStorage.getItem("defaultCityKey") || "auto",
      }
    : null;
}

export function getConfiguredLocationSelection(result) {
  const settings = result || {};
  const cities = Array.isArray(settings.cities) ? settings.cities : [];
  const defaultCityKey = settings.defaultCityKey || "auto";
  const city = cities.find((item) => getLocationKey(item) === defaultCityKey);

  if (city) {
    return {
      location: {
        city: city.name,
        country: "",
        latitude: city.latitude,
        longitude: city.longitude,
      },
      mode: "city",
      defaultCityKey,
    };
  }

  const persisted = getPersistedLocationSelection();
  if (persisted && persisted.mode !== "city") {
    return { ...persisted, mode: "auto", defaultCityKey: "auto" };
  }
  return null;
}
