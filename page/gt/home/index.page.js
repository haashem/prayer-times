import { createWidget, deleteWidget, widget, prop, event } from "@zos/ui";
import { push } from "@zos/router";
import { setScrollMode, SCROLL_MODE_SWIPER_HORIZONTAL } from "@zos/page";
import { Time } from "@zos/sensor";
import { localStorage } from "@zos/storage";
import { log as Logger, px } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import { createQiblaCompass } from "./qibla";
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
      // View containers for horizontal swipe
      prayerContainer: null,
      qiblaContainer: null,
      // Qibla compass module
      qibla: null,
    },

    onInit() {
      logger.debug("prayer-times page onInit");
    },

    build() {
      logger.debug("prayer-times page build");

      // Enable horizontal swipe between 2 pages
      setScrollMode({
        mode: SCROLL_MODE_SWIPER_HORIZONTAL,
        options: {
          width: DEVICE_WIDTH,
          count: 2,
          modeParams: {
            on_page: (pageIndex) => {
              if (!this.state.qibla) return;
              if (pageIndex === 1) {
                this.state.qibla.startCompass();
              } else {
                this.state.qibla.stopCompass();
              }
            },
          },
        },
      });

      // Page 0: Prayer Times (vertically scrollable)
      this.state.prayerContainer = createWidget(widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        scroll_enable: 1,
        page: 0,
      });

      // Page 1: Qibla Compass
      this.state.qiblaContainer = createWidget(widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        scroll_enable: 0,
        page: 1,
      });

      // Create qibla compass module
      this.state.qibla = createQiblaCompass(this.state.qiblaContainer);

      this.loadLocation();

      if (!this.state.location) {
        this.showLoading("Detecting location...");
        this.state.qibla.build(null);
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

      // Build Qibla compass UI (sensor starts lazily on swipe)
      this.state.qibla.build(this.state.location);
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
      this.clearUI();
      this.clearLoading();
      const container = this.state.prayerContainer;
      this.state.loadingBg = container.createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        color: COLORS.background,
      });
      this.state.loadingWidget = container.createWidget(widget.TEXT, {
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

            // Build Qibla now that we have location
            this.state.qibla.build(this.state.location);
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

      const prayers = PRAYER_KEYS.map((key, i) => ({
        key,
        label: PRAYER_LABELS[i],
        minutes: this.timeToMinutes(todayData.timings[key]),
      }));

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

      const tomorrowData = this.loadTomorrowData();
      const tomorrowFajr = tomorrowData
        ? this.timeToMinutes(tomorrowData.timings["Fajr"])
        : prayers[0].minutes;

      return {
        nextIndex: PRAYER_KEYS.length,
        prevIndex: prayers.length - 1,
        nextPrayer: {
          key: "Fajr",
          label: "Fajr",
          minutes: tomorrowFajr + 24 * 60,
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
      const container = this.state.prayerContainer;
      const cityName = this.state.location.city;
      const info = this.getNextPrayerInfo(todayData);

      // ── Header: City with pill background ──
      const cityBg = this.trackWidget(container.createWidget(widget.FILL_RECT, getCityBgStyle(cityName.length)));

      const cityText = this.trackWidget(container.createWidget(widget.TEXT, {
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
      this.trackWidget(container.createWidget(widget.TEXT, {
        ...NEXT_LABEL_STYLE,
        text: "Next prayer",
      }));

      // ── Next prayer name ──
      this.trackWidget(container.createWidget(widget.TEXT, {
        ...NEXT_NAME_STYLE,
        text: info.nextPrayer.label,
      }));

      // ── Countdown (only if < 60 minutes) ──
      const remaining = info.nextPrayer.minutes - info.nowMinutes;
      if (remaining > 0 && remaining <= 60) {
        this.trackWidget(container.createWidget(widget.TEXT, {
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

      this.trackWidget(container.createWidget(widget.TEXT, {
        ...NEXT_TIME_STYLE,
        text: nextTimeStr,
      }));

      // ── Upcoming prayer cells ──
      this.renderUpcomingCells(todayData, info);
    },

    renderUpcomingCells(todayData, info) {
      const container = this.state.prayerContainer;
      const cells = [];

      if (info.isNextDay) {
        const tmrw = info.tomorrowData;
        if (tmrw) {
          cells.push({ label: "Sunrise", time: this.formatTime(tmrw.timings["Sunrise"]) });
        }
      } else {
        for (let i = info.nextIndex + 1; i < PRAYER_KEYS.length; i++) {
          cells.push({
            label: PRAYER_LABELS[i],
            time: this.formatTime(todayData.timings[PRAYER_KEYS[i]]),
          });
        }

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
        this.trackWidget(container.createWidget(widget.FILL_RECT, getCellBgStyle(y)));
        this.trackWidget(container.createWidget(widget.TEXT, { ...getCellNameStyle(y), text: cell.label }));
        this.trackWidget(container.createWidget(widget.TEXT, { ...getCellTimeStyle(y), text: cell.time }));
        y += CELL_HEIGHT + CELL_GAP;
      }

      // Bottom spacer
      this.trackWidget(container.createWidget(widget.FILL_RECT, {
        x: 0,
        y: y,
        w: 1,
        h: BOTTOM_PADDING,
        color: 0x000000,
        alpha: 0,
      }));

      // Help icon
      const helpIcon = this.trackWidget(container.createWidget(widget.IMG, {
        ...HELP_ICON_STYLE,
        y: y + px(20),
        src: "image/ic_QA_40px.png",
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
      if (this.state.qibla) {
        this.state.qibla.destroy();
      }
      this.clearUI();
      logger.debug("prayer-times page onDestroy");
    },
  })
);
