import { BaseApp } from "@zeppos/zml/base-app";

App(
  BaseApp({
    globalData: {},
    onCreate(options) {
      console.log("prayer-times app onCreate");
    },

    onDestroy(options) {
      console.log("prayer-times app onDestroy");
    },
  })
);
