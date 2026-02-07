import { createWidget, widget, align, text_style, prop } from "@zos/ui";
import { Time } from "@zos/sensor";
import { log as Logger } from "@zos/utils";
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  COLORS,
  TITLE_STYLE,
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
import {
  openAssetsSync,
  statAssetsSync,
  readSync,
  O_RDONLY,
  closeSync,
} from "@zos/fs";

const logger = Logger.getLogger("prayer-times");

const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function loadPrayerData() {
  try {
    const filePath = "raw/crawley_prayer_times.json";
    const stat = statAssetsSync({ path: filePath });
    if (!stat) {
      logger.error("Prayer times file not found");
      return null;
    }

    const fd = openAssetsSync({ path: filePath, flag: O_RDONLY });
    const buffer = new ArrayBuffer(stat.size);
    readSync({ fd, buffer });
    closeSync({ fd });

    const str = String.fromCharCode.apply(null, new Uint8Array(buffer));
    const data = JSON.parse(str);
    return data;
  } catch (e) {
    logger.error("Error loading prayer data: " + e.message);
    return null;
  }
}

function getTodayPrayers(data) {
  if (!data || !data.data) return null;

  const time = new Time();
  const day = String(time.getDate()).padStart(2, "0");
  const month = String(time.getMonth()).padStart(2, "0");
  const year = String(time.getFullYear());

  const dateStr = `${day}-${month}-${year}`;
  logger.debug("Looking for date: " + dateStr);

  for (let i = 0; i < data.data.length; i++) {
    const entry = data.data[i];
    if (
      entry.date &&
      entry.date.gregorian &&
      entry.date.gregorian.date === dateStr
    ) {
      return entry;
    }
  }

  return null;
}

function formatTime(timeStr) {
  if (!timeStr) return "--:--";
  return timeStr.replace(" (UTC)", "").trim();
}

function getCurrentPrayerIndex(todayData) {
  if (!todayData || !todayData.timings) return -1;

  const time = new Time();
  const nowMinutes = time.getHours() * 60 + time.getMinutes();

  const prayerMinutes = PRAYER_KEYS.map((key) => {
    const t = formatTime(todayData.timings[key]);
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

  // If before Fajr, highlight Fajr as upcoming
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  return currentIndex;
}

Page({
  onInit() {
    logger.debug("prayer-times page onInit");
  },

  build() {
    logger.debug("prayer-times page build");

    const data = loadPrayerData();
    const todayData = getTodayPrayers(data);

    if (!todayData) {
      createWidget(widget.TEXT, NO_DATA_STYLE);
      return;
    }

    const currentIndex = getCurrentPrayerIndex(todayData);
    const hijri = todayData.date.hijri;

    // City name
    createWidget(widget.TEXT, CITY_STYLE);

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
      const prayerTime = formatTime(todayData.timings[PRAYER_KEYS[i]]);
      const rowY = PRAYER_START_Y + i * PRAYER_ROW_HEIGHT;

      // Row background (highlight current prayer)
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

    // Bottom spacer for scrollable padding
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

  onDestroy() {
    logger.debug("prayer-times page onDestroy");
  },
});
