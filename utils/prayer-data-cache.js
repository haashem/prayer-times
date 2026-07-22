import { Time } from "@zos/sensor";
import { localStorage } from "@zos/storage";
import {
  PRAYER_CACHE_KEY,
  PRAYER_TODAY_CACHE_KEY,
  getPrayerWindow,
  getStoredPrayerWindow,
} from "./prayer-cache";
import { getPrayerCalculationSettings } from "./prayer-settings";
import { getAppCache, getLocationKey } from "./location-storage";

function getDayKey(time) {
  return [time.getFullYear(), time.getMonth(), time.getDate()].join("-");
}

export function loadTodayPrayerData(location) {
  if (!location) return null;

  const time = new Time();
  const dayKey = getDayKey(time);
  const locationKey = getLocationKey(location);
  const settings = getPrayerCalculationSettings();
  const appCache = getAppCache();

  if (appCache && appCache.prayerDayKey === dayKey && appCache.prayerData) {
    return appCache.prayerData;
  }

  try {
    const stored = localStorage.getItem(PRAYER_TODAY_CACHE_KEY);
    const snapshot = stored
      ? (typeof stored === "string" ? JSON.parse(stored) : stored)
      : null;
    if (
      snapshot &&
      snapshot.dayKey === dayKey &&
      snapshot.locationKey === locationKey &&
      snapshot.method === settings.method &&
      snapshot.school === settings.school &&
      snapshot.data
    ) {
      if (appCache) {
        appCache.prayerDayKey = dayKey;
        appCache.prayerData = snapshot.data;
      }
      return snapshot.data;
    }
  } catch (e) {
    // Fall through to the monthly cache.
  }

  const memoryCache = appCache && appCache.prayerCache;
  const prayerWindow =
    (memoryCache && getPrayerWindow(memoryCache, time)) ||
    getStoredPrayerWindow(localStorage, time);
  const todayData = prayerWindow ? prayerWindow.today : null;

  if (appCache) {
    appCache.prayerDayKey = dayKey;
    appCache.prayerData = todayData;
  }
  if (todayData && locationKey) {
    localStorage.setItem(
      PRAYER_TODAY_CACHE_KEY,
      JSON.stringify({
        dayKey,
        locationKey,
        method: settings.method,
        school: settings.school,
        data: todayData,
      })
    );
  }
  return todayData;
}

export function storePrayerMonthCache(cache) {
  localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(cache));
  localStorage.removeItem("prayerData");

  const appCache = getAppCache();
  if (appCache) {
    appCache.prayerCache = cache;
    appCache.prayerData = null;
    appCache.prayerDayKey = null;
  }
}
