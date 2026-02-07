import { createWidget, widget, align, text_style, prop, event } from "@zos/ui";
import { Time } from "@zos/sensor";
import { push, replace } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  COLORS,
  HIJRI_DATE_STYLE,
  SEPARATOR_STYLE,
  getPrayerNameStyle,
  getPrayerTimeStyle,
  getPrayerRowBgStyle,
  CITY_STYLE,
  PRAYER_ROW_HEIGHT,
  PRAYER_START_Y,
  BOTTOM_PADDING,
  NO_DATA_STYLE,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("prayer-times");

const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

Page(
  BasePage({
    state: {
      activeCity: null,
      prayerData: null,
    },

    onInit() {
      logger.debug("prayer-times page onInit");
    },

    build() {
      logger.debug("prayer-times page build");

      // Scroll indicator
      createWidget(widget.PAGE_SCROLLBAR);

      // Load active city
      this.loadActiveCity();

      // No city set — redirect to search
      if (!this.state.activeCity) {
        replace({ url: "page/gt/search/index.page" });
        return;
      }

      // Try to load cached prayer data for today
      const todayData = this.loadTodayData();

      if (todayData) {
        this.renderPrayerTimes(todayData);
      } else {
        // No cached data or stale — fetch from API
        this.showLoading();
        this.fetchFromApi();
      }
    },

    loadActiveCity() {
      try {
        const stored = localStorage.getItem("activeCity");
        if (stored) {
          this.state.activeCity = JSON.parse(stored);
        }
      } catch (e) {
        logger.error("Error loading active city: " + e.message);
      }
    },

    loadTodayData() {
      try {
        const stored = localStorage.getItem("prayerData");
        if (!stored) return null;

        const cached = JSON.parse(stored);
        // Check if cached data is for today
        if (cached && cached.data && cached.data.date && cached.data.date.gregorian) {
          const time = new Time();
          const day = String(time.getDate()).padStart(2, "0");
          const month = String(time.getMonth()).padStart(2, "0");
          const year = String(time.getFullYear());
          const todayStr = `${day}-${month}-${year}`;

          if (cached.data.date.gregorian.date === todayStr) {
            logger.debug("Cache hit for today: " + todayStr);
            return cached.data;
          } else {
            logger.debug("Cache stale: " + cached.data.date.gregorian.date + " vs " + todayStr);
          }
        }
      } catch (e) {
        logger.error("Error loading prayer data: " + e.message);
      }
      return null;
    },

    showLoading() {
      createWidget(widget.TEXT, {
        ...NO_DATA_STYLE,
        text: "Loading prayer times\nfor " + this.state.activeCity.city + "...",
        color: COLORS.hijriDate,
      });
    },

    fetchFromApi() {
      const city = this.state.activeCity;
      if (!city) return;

      logger.debug("Fetching API for city: " + JSON.stringify(city));

      this.request({
        method: "FETCH_PRAYER_TIMES",
        params: {
          latitude: city.latitude,
          longitude: city.longitude,
          method: city.method || 3,
        },
      })
        .then((data) => {
          logger.debug("Received prayer data");
          if (data && data.result && data.result.code === 200 && data.result.data) {
            // Cache the whole response (single day)
            localStorage.setItem("prayerData", JSON.stringify(data.result));

            // Re-render with the fresh data
            replace({ url: "page/gt/home/index.page" });
          } else {
            logger.error("API response invalid: " + JSON.stringify(data));
          }
        })
        .catch((err) => {
          logger.error("Fetch error: " + JSON.stringify(err));
        });
    },

    renderPrayerTimes(todayData) {
      const currentIndex = this.getCurrentPrayerIndex(todayData);
      const hijri = todayData.date.hijri;
      const cityName = this.state.activeCity.city;

      // City name (tappable → city list)
      const cityWidget = createWidget(widget.BUTTON, {
        ...CITY_STYLE,
        text: cityName,
        click_func: () => {
          push({ url: "page/gt/cityList/index.page" });
        },
      });

      // Hijri date
      const hijriText = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
      createWidget(widget.TEXT, {
        ...HIJRI_DATE_STYLE,
        text: hijriText,
      });

      // Separator line
      createWidget(widget.FILL_RECT, SEPARATOR_STYLE);

      // Prayer rows
      for (let i = 0; i < PRAYER_KEYS.length; i++) {
        const isActive = i === currentIndex;
        const prayerTime = this.formatTime(todayData.timings[PRAYER_KEYS[i]]);
        const rowY = PRAYER_START_Y + i * PRAYER_ROW_HEIGHT;

        // Row background
        createWidget(widget.FILL_RECT, getPrayerRowBgStyle(rowY, isActive));

        // Prayer name
        createWidget(widget.TEXT, {
          ...getPrayerNameStyle(rowY, isActive),
          text: PRAYER_LABELS[i],
        });

        // Prayer time
        createWidget(widget.TEXT, {
          ...getPrayerTimeStyle(rowY, isActive),
          text: prayerTime,
        });
      }

      // Bottom spacer
      const lastRowY = PRAYER_START_Y + PRAYER_KEYS.length * PRAYER_ROW_HEIGHT;
      createWidget(widget.FILL_RECT, {
        x: 0,
        y: lastRowY,
        w: 1,
        h: BOTTOM_PADDING,
        color: 0x000000,
        alpha: 0,
      });
    },

    formatTime(timeStr) {
      if (!timeStr) return "--:--";
      return timeStr.replace(/\s*\(.*\)/, "").trim();
    },

    getCurrentPrayerIndex(todayData) {
      if (!todayData || !todayData.timings) return -1;

      const time = new Time();
      const nowMinutes = time.getHours() * 60 + time.getMinutes();

      const prayerMinutes = PRAYER_KEYS.map((key) => {
        const t = this.formatTime(todayData.timings[key]);
        const parts = t.split(":");
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      });

      let currentIndex = -1;
      for (let i = PRAYER_KEYS.length - 1; i >= 0; i--) {
        if (nowMinutes >= prayerMinutes[i]) {
          currentIndex = i;
          break;
        }
      }

      if (currentIndex === -1) {
        currentIndex = 0;
      }

      return currentIndex;
    },

    onDestroy() {
      logger.debug("prayer-times page onDestroy");
    },
  })
);
