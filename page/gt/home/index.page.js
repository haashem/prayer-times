import { createWidget, deleteWidget, widget, align, text_style, prop, event } from "@zos/ui";
import { push } from "@zos/router";
import { Time } from "@zos/sensor";
import { localStorage } from "@zos/storage";
import { log as Logger, px } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  COLORS,
  NEXT_LABEL_STYLE,
  NEXT_NAME_STYLE,
  COUNTDOWN_STYLE,
  NEXT_TIME_STYLE,
  getCityTextStyle,
  getCityBgStyle,
  CELL_START_Y,
  CELL_HEIGHT,
  CELL_GAP,
  getCellBgStyle,
  getCellNameStyle,
  getCellTimeStyle,
  BOTTOM_PADDING,
  NO_DATA_STYLE,
  HELP_ICON_STYLE,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("prayer-times");

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

Page(
  BasePage({
    state: {
      location: null,
      prayerData: null,
      loadingWidget: null,
      uiWidgets: [],
    },

    onInit() {
      logger.debug("prayer-times page onInit");
    },

    build() {
      logger.debug("prayer-times page build");

      createWidget(widget.PAGE_SCROLLBAR);

      this.loadLocation();

      if (!this.state.location) {
        this.showLoading("Detecting location...");
        this.detectLocation();
        return;
      }

      const todayData = this.loadTodayData();
      if (todayData) {
        this.renderUI(todayData);
      } else {
        this.showLoading("Loading prayer times...");
        this.fetchFromApi();
      }
    },

    loadLocation() {
      try {
        const stored = localStorage.getItem("location");
        if (stored) {
          this.state.location = JSON.parse(stored);
        }
      } catch (e) {
        logger.error("Error loading location: " + e.message);
      }
    },

    loadTodayData() {
      try {
        const stored = localStorage.getItem("prayerData");
        if (!stored) return null;

        const cached = JSON.parse(stored);
        if (!cached || !Array.isArray(cached.data)) return null;

        const time = new Time();
        const day = String(time.getDate()).padStart(2, "0");
        const month = String(time.getMonth()).padStart(2, "0");
        const year = String(time.getFullYear());
        const todayStr = `${day}-${month}-${year}`;

        if (cached.month !== month || cached.year !== year) {
          return null;
        }

        const todayEntry = cached.data.find(
          (d) => d.date && d.date.gregorian && d.date.gregorian.date === todayStr
        );

        return todayEntry || null;
      } catch (e) {
        logger.error("Error loading prayer data: " + e.message);
      }
      return null;
    },

    loadTomorrowData() {
      try {
        const stored = localStorage.getItem("prayerData");
        if (!stored) return null;

        const cached = JSON.parse(stored);
        if (!cached || !Array.isArray(cached.data)) return null;

        const time = new Time();
        const tomorrow = new Date(
          time.getFullYear(),
          time.getMonth() - 1,
          time.getDate() + 1
        );
        const day = String(tomorrow.getDate()).padStart(2, "0");
        const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const year = String(tomorrow.getFullYear());
        const tomorrowStr = `${day}-${month}-${year}`;

        if (cached.month !== month || cached.year !== year) {
          return null;
        }

        return cached.data.find(
          (d) => d.date && d.date.gregorian && d.date.gregorian.date === tomorrowStr
        ) || null;
      } catch (e) {
        logger.error("Error loading tomorrow data: " + e.message);
      }
      return null;
    },

    showLoading(message) {
      this.clearLoading();
      this.state.loadingBg = createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        color: COLORS.background,
      });
      this.state.loadingWidget = createWidget(widget.TEXT, {
        ...NO_DATA_STYLE,
        text: message,
        color: COLORS.subtitle,
      });
    },

    clearLoading() {
      if (this.state.loadingBg) {
        deleteWidget(this.state.loadingBg);
        this.state.loadingBg = null;
      }
      if (this.state.loadingWidget) {
        deleteWidget(this.state.loadingWidget);
        this.state.loadingWidget = null;
      }
    },

    detectLocation() {
      this.request({ method: "GET_PHONE_LOCATION" })
        .then((data) => {
          if (data && data.result && data.result.valid) {
            const loc = {
              city: data.result.city,
              country: data.result.country,
              latitude: data.result.latitude,
              longitude: data.result.longitude,
              method: 3,
            };
            this.state.location = loc;
            localStorage.setItem("location", JSON.stringify(loc));
            localStorage.removeItem("prayerData");

            this.showLoading("Loading prayer times...");
            this.fetchFromApi();
          } else {
            logger.error("Location detection failed");
            this.clearLoading();
            this.showLoading("Location detection failed");
          }
        })
        .catch((err) => {
          logger.error("Location error: " + JSON.stringify(err));
        });
    },

    fetchFromApi() {
      const loc = this.state.location;
      if (!loc) return;

      this.request({
        method: "FETCH_PRAYER_TIMES",
        params: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          method: loc.method || 3,
        },
      })
        .then((data) => {
          if (data && data.result && data.result.code === 200 && data.result.data) {
            const time = new Time();
            const month = String(time.getMonth()).padStart(2, "0");
            const year = String(time.getFullYear());

            localStorage.setItem(
              "prayerData",
              JSON.stringify({ month, year, data: data.result.data })
            );

            this.clearLoading();
            const todayData = this.loadTodayData();
            if (todayData) {
              this.renderUI(todayData);
            } else {
              this.showLoading("No data for today");
            }
          } else {
            logger.error("API response invalid");
            this.clearLoading();
            this.showLoading("Failed to load data");
          }
        })
        .catch((err) => {
          logger.error("Fetch error: " + JSON.stringify(err));
        });
    },

    // ── Helpers ──

    formatTime(timeStr) {
      if (!timeStr) return "--:--";
      return timeStr.replace(/\s*\(.*\)/, "").trim();
    },

    timeToMinutes(timeStr) {
      const t = this.formatTime(timeStr);
      const parts = t.split(":");
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    },

    getNextPrayerInfo(todayData) {
      const time = new Time();
      const nowMinutes = time.getHours() * 60 + time.getMinutes();

      // Build array of { key, label, minutes } for today
      const prayers = PRAYER_KEYS.map((key, i) => ({
        key,
        label: PRAYER_LABELS[i],
        minutes: this.timeToMinutes(todayData.timings[key]),
      }));

      // Find next prayer (first one whose time is in the future)
      for (let i = 0; i < prayers.length; i++) {
        if (nowMinutes < prayers[i].minutes) {
          return {
            nextIndex: i,
            prevIndex: i > 0 ? i - 1 : null,
            nextPrayer: prayers[i],
            prevPrayer: i > 0 ? prayers[i - 1] : null,
            nowMinutes,
            isNextDay: false,
          };
        }
      }

      // All prayers passed → next is tomorrow's Fajr
      const tomorrowData = this.loadTomorrowData();
      const tomorrowFajr = tomorrowData
        ? this.timeToMinutes(tomorrowData.timings["Fajr"])
        : prayers[0].minutes;

      return {
        nextIndex: PRAYER_KEYS.length, // past all today
        prevIndex: prayers.length - 1,
        nextPrayer: {
          key: "Fajr",
          label: "Fajr",
          minutes: tomorrowFajr + 24 * 60, // offset for math
        },
        prevPrayer: prayers[prayers.length - 1],
        nowMinutes,
        isNextDay: true,
        tomorrowData,
      };
    },

    // ── Render ──

    trackWidget(w) {
      this.state.uiWidgets.push(w);
      return w;
    },

    clearUI() {
      for (const w of this.state.uiWidgets) {
        deleteWidget(w);
      }
      this.state.uiWidgets = [];
    },

    renderUI(todayData) {
      this.clearUI();
      const cityName = this.state.location.city;
      const info = this.getNextPrayerInfo(todayData);

      // ── Header: City with pill background ──
      const cityBg = this.trackWidget(createWidget(widget.FILL_RECT, getCityBgStyle(cityName.length)));

      const cityText = this.trackWidget(createWidget(widget.TEXT, {
        ...getCityTextStyle(cityName.length),
        text: cityName,
      }));

      // Press feedback + action on release
      const onCityDown = () => {
        cityBg.setProperty(prop.MORE, { alpha: 120 });
        cityText.setProperty(prop.MORE, { alpha: 120 });
      };
      const onCityReset = () => {
        cityBg.setProperty(prop.MORE, { alpha: 255 });
        cityText.setProperty(prop.MORE, { alpha: 255 });
      };
      const onCitySelect = () => {
        onCityReset();
        this.onLocationTap();
      };
      cityBg.addEventListener(event.CLICK_DOWN, onCityDown);
      cityBg.addEventListener(event.MOVE, onCityReset);
      cityBg.addEventListener(event.SELECT, onCitySelect);
      cityText.addEventListener(event.CLICK_DOWN, onCityDown);
      cityText.addEventListener(event.MOVE, onCityReset);
      cityText.addEventListener(event.SELECT, onCitySelect);

      // ── "Next prayer" label ──
      this.trackWidget(createWidget(widget.TEXT, {
        ...NEXT_LABEL_STYLE,
        text: "Next prayer",
      }));

      // ── Next prayer name ──
      this.trackWidget(createWidget(widget.TEXT, {
        ...NEXT_NAME_STYLE,
        text: info.nextPrayer.label,
      }));

      // ── Countdown (only if < 60 minutes) ──
      const remaining = info.nextPrayer.minutes - info.nowMinutes;
      if (remaining > 0 && remaining <= 60) {
        this.trackWidget(createWidget(widget.TEXT, {
          ...COUNTDOWN_STYLE,
          text: remaining === 1 ? "In 1 minute" : `In ${remaining} minutes`,
        }));
      }

      // ── Large next prayer time ──
      const nextTimeStr = info.isNextDay
        ? this.formatTime(
          (info.tomorrowData || todayData).timings[info.nextPrayer.key]
        )
        : this.formatTime(todayData.timings[info.nextPrayer.key]);

      this.trackWidget(createWidget(widget.TEXT, {
        ...NEXT_TIME_STYLE,
        text: nextTimeStr,
      }));

      // ── Upcoming prayer cells ──
      this.renderUpcomingCells(todayData, info);
    },

    renderUpcomingCells(todayData, info) {
      const cells = [];

      if (info.isNextDay) {
        // After Isha: show tomorrow's Fajr and Sunrise
        const tmrw = info.tomorrowData;
        if (tmrw) {
          cells.push({ label: "Fajr", time: this.formatTime(tmrw.timings["Fajr"]) });
          cells.push({ label: "Sunrise", time: this.formatTime(tmrw.timings["Sunrise"]) });
        }
      } else {
        // Show remaining prayers after the next one
        for (let i = info.nextIndex + 1; i < PRAYER_KEYS.length; i++) {
          cells.push({
            label: PRAYER_LABELS[i],
            time: this.formatTime(todayData.timings[PRAYER_KEYS[i]]),
          });
        }

        // When next is Isha, append tomorrow's Fajr & Sunrise
        if (info.nextPrayer.key === "Isha") {
          const tmrw = this.loadTomorrowData();
          if (tmrw) {
            cells.push({ label: "Fajr", time: this.formatTime(tmrw.timings["Fajr"]) });
            cells.push({ label: "Sunrise", time: this.formatTime(tmrw.timings["Sunrise"]) });
          }
        }
      }

      let y = CELL_START_Y;
      for (const cell of cells) {
        this.trackWidget(createWidget(widget.FILL_RECT, getCellBgStyle(y)));
        this.trackWidget(createWidget(widget.TEXT, { ...getCellNameStyle(y), text: cell.label }));
        this.trackWidget(createWidget(widget.TEXT, { ...getCellTimeStyle(y), text: cell.time }));
        y += CELL_HEIGHT + CELL_GAP;
      }

      // Bottom spacer
      this.trackWidget(createWidget(widget.FILL_RECT, {
        x: 0,
        y: y,
        w: 1,
        h: BOTTOM_PADDING,
        color: 0x000000,
        alpha: 0,
      }));

      // Help icon
      const helpIcon = this.trackWidget(createWidget(widget.IMG, {
        ...HELP_ICON_STYLE,
        y: y + px(20),
        src: "image/ic_QA_32px.png",
      }));
      helpIcon.addEventListener(event.CLICK_DOWN, () => {
        helpIcon.setProperty(prop.MORE, { alpha: 120 });
      });
      helpIcon.addEventListener(event.MOVE, () => {
        helpIcon.setProperty(prop.MORE, { alpha: 255 });
      });
      helpIcon.addEventListener(event.SELECT, () => {
        helpIcon.setProperty(prop.MORE, { alpha: 255 });
        push({ url: "page/gt/help/index.page" });
      });
    },

    onLocationTap() {
      this.showLoading("Detecting location...");
      this.detectLocation();
    },

    onDestroy() {
      logger.debug("prayer-times page onDestroy");
    },
  })
);
