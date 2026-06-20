import { BaseApp } from "@zeppos/zml/base-app";

function parsePrayerAlertPayload(options) {
  try {
    if (!options) return null;
    const data = typeof options === "string" ? JSON.parse(options) : options;
    if (data && data.prayerKey) return data;
    if (data && data.param) return parsePrayerAlertPayload(data.param);
    if (data && data.params) return parsePrayerAlertPayload(data.params);
  } catch (e) {
    return null;
  }
  return null;
}

App(
  BaseApp({
    globalData: {
      location: null,
      prayerCache: null,
      prayerData: null,
      prayerDayKey: null,
      pendingPrayerAlert: null,
    },
    onCreate(options) {
      console.log("prayer-times app onCreate");
      this.globalData.pendingPrayerAlert = parsePrayerAlertPayload(options);
    },

    onDestroy(options) {
      console.log("prayer-times app onDestroy");
    },
  })
);
