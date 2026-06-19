import { BaseApp } from "@zeppos/zml/base-app";

App(
  BaseApp({
    globalData: {
      location: null,
      prayerCache: null,
      prayerData: null,
      prayerDayKey: null,
    },
    onCreate(options) {
      console.log("prayer-times app onCreate");
    },

    onDestroy(options) {
      console.log("prayer-times app onDestroy");
    },
  })
);
