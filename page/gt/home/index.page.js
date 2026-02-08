import { createWidget, widget, align, text_style, prop, event } from "@zos/ui";
import { Time } from "@zos/sensor";
import { replace } from "@zos/router";
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
  getCityTextStyle,
  getLocationIconStyle,
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
      location: null,
      prayerData: null,
    },

    onInit() {
      logger.debug("prayer-times page onInit");
    },

    build() {
      logger.debug("prayer-times page build");

      // Scroll indicator
      createWidget(widget.PAGE_SCROLLBAR);

      // Load saved location
      this.loadLocation();

      if (!this.state.location) {
        // First launch — auto-detect location
        this.showLoading("Detecting location...");
        this.detectLocation();
        return;
      }

      // Try to load cached prayer data for today
      const todayData = this.loadTodayData();

      if (todayData) {
        this.renderPrayerTimes(todayData);
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

        // Find today's entry in the monthly data
        const time = new Time();
        const day = String(time.getDate()).padStart(2, "0");
        const month = String(time.getMonth()).padStart(2, "0");
        const year = String(time.getFullYear());
        const todayStr = `${day}-${month}-${year}`;

        // Check if cached data has matching month/year
        if (cached.month !== month || cached.year !== year) {
          logger.debug("Cache stale: different month/year");
          return null;
        }

        const todayEntry = cached.data.find(
          (d) => d.date && d.date.gregorian && d.date.gregorian.date === todayStr
        );

        if (todayEntry) {
          logger.debug("Cache hit for today: " + todayStr);
          return todayEntry;
        } else {
          logger.debug("No cache entry for today: " + todayStr);
        }
      } catch (e) {
        logger.error("Error loading prayer data: " + e.message);
      }
      return null;
    },

    showLoading(message) {
      createWidget(widget.TEXT, {
        ...NO_DATA_STYLE,
        text: message,
        color: COLORS.hijriDate,
      });
    },

    detectLocation() {
      this.request({
        method: "GET_PHONE_LOCATION",
      })
        .then((data) => {
          logger.debug("Location result: " + JSON.stringify(data));
          if (data && data.result && data.result.valid) {
            const loc = {
              city: data.result.city,
              country: data.result.country,
              latitude: data.result.latitude,
              longitude: data.result.longitude,
              method: 3,
            };
            localStorage.setItem("location", JSON.stringify(loc));
            localStorage.removeItem("prayerData");

            // Reload page with new location
            replace({ url: "page/gt/home/index.page" });
          } else {
            logger.error("Location detection failed");
            replace({ url: "page/gt/home/index.page" });
          }
        })
        .catch((err) => {
          logger.error("Location error: " + JSON.stringify(err));
        });
    },

    fetchFromApi() {
      const loc = this.state.location;
      if (!loc) return;

      logger.debug("Fetching API for location: " + JSON.stringify(loc));

      this.request({
        method: "FETCH_PRAYER_TIMES",
        params: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          method: loc.method || 3,
        },
      })
        .then((data) => {
          logger.debug("Received prayer data");
          if (data && data.result && data.result.code === 200 && data.result.data) {
            // Cache the monthly data
            const time = new Time();
            const month = String(time.getMonth()).padStart(2, "0");
            const year = String(time.getFullYear());

            localStorage.setItem(
              "prayerData",
              JSON.stringify({
                month: month,
                year: year,
                data: data.result.data,
              })
            );

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
      const cityName = this.state.location.city;

      // Location icon (tappable — re-detect location)
      const locIcon = createWidget(widget.IMG, {
        ...getLocationIconStyle(cityName.length),
      });
      locIcon.addEventListener(event.CLICK_DOWN, () => {
        this.onLocationTap();
      });

      // City name
      const cityText = createWidget(widget.TEXT, {
        ...getCityTextStyle(cityName.length),
        text: cityName,
      });
      cityText.addEventListener(event.CLICK_DOWN, () => {
        this.onLocationTap();
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

    onLocationTap() {
      // Clear cached data and re-detect location
      localStorage.removeItem("location");
      localStorage.removeItem("prayerData");
      replace({ url: "page/gt/home/index.page" });
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
