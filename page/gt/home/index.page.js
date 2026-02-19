import { createWidget, deleteWidget, widget, prop, event, setStatusBarVisible } from "@zos/ui";
import { push } from "@zos/router";
import { setScrollMode, SCROLL_MODE_SWIPER } from "@zos/page";
import { Time } from "@zos/sensor";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { BasePage } from "@zeppos/zml/base-page";
import { createQiblaCompass } from "./qibla";
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  COLORS,
  getCityTextStyle,
  getCityBgStyle,
  GRID_START_Y,
  GRID_START_X,
  GRID_COL_GAP,
  GRID_ROW_GAP,
  GRID_CELL_W,
  GRID_CELL_H,
  getPrayerCellBgStyle,
  getPrayerLabelStyle,
  getPrayerTimeStyle,
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
      // Page groups
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
      const { screenShape } = getDeviceInfo();

      // Hide system title bar on square watches to avoid overlay on app content.
      if (screenShape === SCREEN_SHAPE_SQUARE) {
        setStatusBarVisible(false);
      }

      // Page-level swiper (snapping between two vertical pages)
      setScrollMode({
        mode: SCROLL_MODE_SWIPER,
        options: {
          height: DEVICE_HEIGHT,
          count: 2,
          modeParams: {
            crown_enable: true,
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

      // Page 0: Prayer Times
      this.state.prayerContainer = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
      });

      // Page 1: Qibla Compass
      this.state.qiblaContainer = createWidget(widget.GROUP, {
        x: 0,
        y: DEVICE_HEIGHT,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
      });
      this.state.qibla = createQiblaCompass(this.state.qiblaContainer);

      createWidget(widget.PAGE_SCROLLBAR);

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

      // Build Qibla compass UI
      this.state.qibla.build(this.state.location);
      this.state.qibla.stopCompass();
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

    getCurrentPrayerIndex(todayData) {
      const time = new Time();
      const nowMinutes = time.getHours() * 60 + time.getMinutes();
      const fajr = this.timeToMinutes(todayData.timings["Fajr"]);
      const sunrise = this.timeToMinutes(todayData.timings["Sunrise"]);
      const dhuhr = this.timeToMinutes(todayData.timings["Dhuhr"]);
      const asr = this.timeToMinutes(todayData.timings["Asr"]);
      const maghrib = this.timeToMinutes(todayData.timings["Maghrib"]);
      const isha = this.timeToMinutes(todayData.timings["Isha"]);

      let activeKey = "Isha";
      if (nowMinutes < fajr) activeKey = "Isha";
      else if (nowMinutes < sunrise) activeKey = "Fajr";
      else if (nowMinutes < dhuhr) activeKey = "Dhuhr";
      else if (nowMinutes < asr) activeKey = "Dhuhr";
      else if (nowMinutes < maghrib) activeKey = "Asr";
      else if (nowMinutes < isha) activeKey = "Maghrib";
      else activeKey = "Isha";

      return PRAYER_KEYS.indexOf(activeKey);
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

      // ── Header: City with fixed width ──
      const fixedCityW = DEVICE_WIDTH / 2;
      const cityTextPad = 8;
      const cityBgStyle = getCityBgStyle(1);
      const cityTextStyle = getCityTextStyle(1);

      const cityBg = this.trackWidget(container.createWidget(widget.FILL_RECT, {
        ...cityBgStyle,
        w: fixedCityW,
        x: (DEVICE_WIDTH - fixedCityW) / 2,
      }));

      const cityText = this.trackWidget(container.createWidget(widget.TEXT, {
        ...cityTextStyle,
        w: fixedCityW - cityTextPad * 2,
        x: (DEVICE_WIDTH - fixedCityW) / 2 + cityTextPad,
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

      // ── Prayer grid ──
      this.renderPrayerGrid(todayData);
    },

    renderPrayerGrid(todayData) {
      const container = this.state.prayerContainer;
      const currentIndex = this.getCurrentPrayerIndex(todayData);

      for (let i = 0; i < PRAYER_KEYS.length; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = GRID_START_X + col * (GRID_CELL_W + GRID_COL_GAP);
        const y = GRID_START_Y + row * (GRID_CELL_H + GRID_ROW_GAP);
        const isActive = i === currentIndex;
        this.trackWidget(container.createWidget(widget.FILL_RECT, getPrayerCellBgStyle(x, y, isActive)));
        this.trackWidget(container.createWidget(widget.TEXT, {
          ...getPrayerLabelStyle(x, y, isActive),
          text: PRAYER_LABELS[i],
        }));
        this.trackWidget(container.createWidget(widget.TEXT, {
          ...getPrayerTimeStyle(x, y, isActive),
          text: this.formatTime(todayData.timings[PRAYER_KEYS[i]]),
        }));
      }

      // Help icon
      const helpIcon = this.trackWidget(container.createWidget(widget.IMG, {
        ...HELP_ICON_STYLE,
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
        this.state.qibla.stopCompass();
        this.state.qibla.destroy();
      }
      this.clearUI();
      logger.debug("prayer-times page onDestroy");
    },
  })
);
