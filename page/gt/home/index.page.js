import { createWidget, deleteWidget, widget, prop, event, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { push } from "@zos/router";
import {
  setScrollMode,
  swipeToIndex,
  SCROLL_MODE_SWIPER,
  SCROLL_ANIMATION_NONE,
} from "@zos/page";
import { Time } from "@zos/sensor";
import { log as Logger } from "@zos/utils";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { BasePage } from "@zeppos/zml/base-page";
import { createQiblaCompass } from "./qibla";
import { getPrayerLabel, localizeDigits, t } from "../../../utils/i18n";
import {
  getConfiguredLocationSelection,
  getLocationKey,
  getPersistedLocationSelection,
  persistLocation,
  readStoredLocation,
} from "../../../utils/location-storage";
import {
  loadTodayPrayerData,
  storePrayerMonthCache,
} from "../../../utils/prayer-data-cache";
import { deferPrayerNotificationScheduleRefresh } from "../../../utils/prayer-notifications";
import { getPrayerCalculationSettings } from "../../../utils/prayer-settings";
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
  HELP_HIT_STYLE,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("prayer-times");

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

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
      lastLocationSyncAt: 0,
      locationSyncToken: 0,
    },

    onInit() {
      logger.debug("prayer-times page onInit");
    },

    build() {
      logger.debug("prayer-times page build");
      // Keep the screen bright while the user views prayer times.
      // Without this, AOD will dismiss the app back to the watch face.
      setPageBrightTime({ brightTime: 30000 });

      const { screenShape } = getDeviceInfo();

      // Hide system title bar on square watches to avoid overlay on app content.
      if (screenShape === SCREEN_SHAPE_SQUARE) {
        setStatusBarVisible(false);
      }

      this.configurePageScroll(false);

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

      this.state.qibla.build(null);
      this.state.qibla.stopCompass();

      // Restore the last location and today's compact cache immediately. The
      // phone sync below only needs to update the UI if its selected city changed.
      this.state.location = readStoredLocation();
      const storedTodayData = loadTodayPrayerData(this.state.location);
      if (storedTodayData) {
        this.renderUI(storedTodayData);
        this.state.qibla.build(this.state.location);
        this.state.qibla.stopCompass();
      }
      this.initializeLocationSelection();
    },

    configurePageScroll(resetToPrayerPage) {
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
      if (resetToPrayerPage) {
        swipeToIndex({ index: 0, animation: SCROLL_ANIMATION_NONE });
      }
    },

    initializeLocationSelection() {
      this.state.lastLocationSyncAt = Date.now();
      const syncToken = ++this.state.locationSyncToken;
      this.request({ method: "GET_LOCATION_SETTINGS" })
        .then((data) => {
          if (syncToken !== this.state.locationSyncToken) return;
          const selection = getConfiguredLocationSelection(data && data.result);
          if (selection) {
            this.activateLocation(selection);
            return;
          }
          persistLocation(null, "auto", "auto");
          this.state.location = null;
          this.showLoading(t("detectingLocation"));
          this.detectLocation(syncToken);
        })
        .catch(() => {
          if (syncToken !== this.state.locationSyncToken) return;
          const selection = getPersistedLocationSelection();
          if (selection) {
            this.activateLocation(selection);
          } else {
            this.showLoading(t("detectingLocation"));
            this.detectLocation(syncToken);
          }
        });
    },

    activateLocation(selection) {
      const { location, mode, defaultCityKey } = selection;
      this.state.location = location;
      persistLocation(location, mode, defaultCityKey);

      const todayData = loadTodayPrayerData(location);
      if (todayData) {
        this.clearLoading();
        this.renderUI(todayData);
      } else {
        this.showLoading(t("loadingPrayerTimes"));
        this.fetchFromApi();
      }

      this.state.qibla.build(location);
      this.state.qibla.stopCompass();
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

    detectLocation(syncToken) {
      this.request({ method: "GET_PHONE_LOCATION" })
        .then((data) => {
          if (syncToken && syncToken !== this.state.locationSyncToken) return;
          if (data && data.result && data.result.valid) {
            const loc = {
              city: data.result.city,
              country: data.result.country,
              latitude: data.result.latitude,
              longitude: data.result.longitude,
            };
            this.activateLocation({ location: loc, mode: "auto", defaultCityKey: "auto" });
          } else {
            logger.error("Location detection failed");
            this.clearLoading();
            this.showLoading(t("locationDetectionFailed"));
          }
        })
        .catch((err) => {
          if (syncToken && syncToken !== this.state.locationSyncToken) return;
          logger.error("Location error: " + JSON.stringify(err));
          this.clearLoading();
          this.showLoading(t("checkPhoneConnection"));
        });
    },

    fetchFromApi() {
      const loc = this.state.location;
      if (!loc) return;
      const requestedLocationKey = getLocationKey(loc);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 15000)
      );

      Promise.race([
        this.request({
          method: "FETCH_PRAYER_TIMES",
          params: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            ...getPrayerCalculationSettings(),
          },
        }),
        timeout,
      ])
        .then((data) => {
          if (requestedLocationKey !== getLocationKey(this.state.location)) return;
          if (data && data.result && data.result.code === 200 && data.result.cache) {
            storePrayerMonthCache(data.result.cache);
            deferPrayerNotificationScheduleRefresh();

            this.clearLoading();
            const todayData = loadTodayPrayerData(this.state.location);
            if (todayData) {
              this.renderUI(todayData);
            } else {
              this.showLoading(t("noDataToday"));
            }
          } else {
            logger.error("API response invalid");
            this.clearLoading();
            this.showLoading(t("failedLoadData"));
          }
        })
        .catch((err) => {
          if (requestedLocationKey !== getLocationKey(this.state.location)) return;
          logger.error("Fetch error: " + (err && err.message ? err.message : JSON.stringify(err)));
          this.clearLoading();
          this.showLoading(t("networkError"));
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
      const fixedCityW = DEVICE_WIDTH / 2.4;
      const cityTextPad = 6;
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
          text: getPrayerLabel(PRAYER_KEYS[i]),
        }));
        this.trackWidget(container.createWidget(widget.TEXT, {
          ...getPrayerTimeStyle(x, y, isActive),
          text: localizeDigits(this.formatTime(todayData.timings[PRAYER_KEYS[i]])),
        }));
      }

      // Settings/help entry icon
      const helpHit = this.trackWidget(container.createWidget(widget.FILL_RECT, HELP_HIT_STYLE));
      const helpIcon = this.trackWidget(container.createWidget(widget.IMG, {
        ...HELP_ICON_STYLE,
        src: "image/ic_QA_40px.png",
      }));
      const onHelpDown = () => {
        helpIcon.setProperty(prop.MORE, { alpha: 120 });
      };
      const onHelpReset = () => {
        helpIcon.setProperty(prop.MORE, { alpha: 255 });
      };
      const onHelpSelect = () => {
        onHelpReset();
        push({
          url: "page/gt/settings/index.page",
          params: JSON.stringify({
            hijriDate: todayData && todayData.date && todayData.date.hijri,
          }),
        });
      };
      for (const target of [helpHit, helpIcon]) {
        target.addEventListener(event.CLICK_DOWN, onHelpDown);
        target.addEventListener(event.MOVE, onHelpReset);
        target.addEventListener(event.SELECT, onHelpSelect);
      }
    },

    onLocationTap() {
      push({ url: "page/gt/location/index.page" });
    },

    onCall(data) {
      if (data && data.type === "LOCATION_SETTINGS_CHANGED") {
        this.configurePageScroll(true);
        this.initializeLocationSelection();
      }
    },

    onResume() {
      if (!this.state.prayerContainer) return;
      if (Date.now() - this.state.lastLocationSyncAt < 200) return;
      this.configurePageScroll(true);
      this.initializeLocationSelection();
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
