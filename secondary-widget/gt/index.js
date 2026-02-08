import { createWidget, widget, align, text_style, event } from "@zos/ui";
import { Time } from "@zos/sensor";
import { push } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    COLORS,
    CITY_STYLE,
    CURRENT_LABEL_STYLE,
    CURRENT_BG_STYLE,
    CURRENT_NAME_STYLE,
    CURRENT_TIME_STYLE,
    SEPARATOR_STYLE,
    NEXT_LABEL_STYLE,
    NEXT_NAME_STYLE,
    NEXT_TIME_STYLE,
    NO_DATA_STYLE,
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("prayer-widget");

const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

SecondaryWidget({
    state: {
        location: null,
        prayerData: null,
    },

    onInit() {
        logger.debug("prayer widget onInit");
    },

    build() {
        try {
            logger.debug("prayer widget build");

            this.loadData();

            if (!this.state.location || !this.state.prayerData) {
                this.renderNoData();
                return;
            }

            this.renderWidget();
        } catch (e) {
            logger.error("Widget build error: " + e.message);
        }
    },

    onResume() {
        logger.debug("prayer widget onResume");
    },

    onPause() {
        logger.debug("prayer widget onPause");
    },

    onDestroy() {
        logger.debug("prayer widget onDestroy");
    },

    loadData() {
        try {
            const storedLoc = localStorage.getItem("location");
            if (storedLoc) {
                this.state.location = JSON.parse(storedLoc);
            }

            const storedData = localStorage.getItem("prayerData");
            if (storedData) {
                const cached = JSON.parse(storedData);
                if (cached && Array.isArray(cached.data)) {
                    const time = new Time();
                    const day = String(time.getDate()).padStart(2, "0");
                    const month = String(time.getMonth()).padStart(2, "0");
                    const year = String(time.getFullYear());
                    const todayStr = day + "-" + month + "-" + year;

                    if (cached.month === month && cached.year === year) {
                        const todayEntry = cached.data.find(
                            (d) => d.date && d.date.gregorian && d.date.gregorian.date === todayStr
                        );
                        if (todayEntry) {
                            this.state.prayerData = todayEntry;
                        }
                    }
                }
            }
        } catch (e) {
            logger.error("Widget loadData error: " + e.message);
        }
    },

    renderNoData() {
        const bg = createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: DEVICE_WIDTH,
            h: DEVICE_HEIGHT,
            color: 0x000000,
            alpha: 0,
        });

        createWidget(widget.TEXT, {
            ...NO_DATA_STYLE,
            text: "Tap to set up\nPrayer Times",
        });

        bg.addEventListener(event.CLICK_DOWN, () => {
            push({ url: "page/gt/home/index.page" });
        });
    },

    renderWidget() {
        const data = this.state.prayerData;
        const currentIndex = this.getCurrentPrayerIndex(data);
        const nextIndex = this.getNextPrayerIndex(currentIndex);

        // Tappable background to open app
        const bg = createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: DEVICE_WIDTH,
            h: DEVICE_HEIGHT,
            color: 0x000000,
            alpha: 0,
        });
        bg.addEventListener(event.CLICK_DOWN, () => {
            push({ url: "page/gt/home/index.page" });
        });

        // City name
        createWidget(widget.TEXT, {
            ...CITY_STYLE,
            text: this.state.location.city,
        });

        // ── Current Prayer ──
        createWidget(widget.TEXT, {
            ...CURRENT_LABEL_STYLE,
            text: "Current Prayer",
        });

        createWidget(widget.FILL_RECT, CURRENT_BG_STYLE);

        createWidget(widget.TEXT, {
            ...CURRENT_NAME_STYLE,
            text: PRAYER_LABELS[currentIndex],
        });

        createWidget(widget.TEXT, {
            ...CURRENT_TIME_STYLE,
            text: this.formatTime(data.timings[PRAYER_KEYS[currentIndex]]),
        });

        // ── Separator ──
        createWidget(widget.FILL_RECT, SEPARATOR_STYLE);

        // ── Next Prayer ──
        const nextLabel = nextIndex === currentIndex ? "Next (tomorrow)" : "Next Prayer";
        createWidget(widget.TEXT, {
            ...NEXT_LABEL_STYLE,
            text: nextLabel,
        });

        createWidget(widget.TEXT, {
            ...NEXT_NAME_STYLE,
            text: PRAYER_LABELS[nextIndex],
        });

        createWidget(widget.TEXT, {
            ...NEXT_TIME_STYLE,
            text: this.formatTime(data.timings[PRAYER_KEYS[nextIndex]]),
        });
    },

    formatTime(timeStr) {
        if (!timeStr) return "--:--";
        return timeStr.replace(/\s*\(.*\)/, "").trim();
    },

    getCurrentPrayerIndex(todayData) {
        if (!todayData || !todayData.timings) return 0;

        const time = new Time();
        const nowMinutes = time.getHours() * 60 + time.getMinutes();

        const prayerMinutes = PRAYER_KEYS.map((key) => {
            const t = this.formatTime(todayData.timings[key]);
            const parts = t.split(":");
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        });

        let currentIndex = 0;
        for (let i = PRAYER_KEYS.length - 1; i >= 0; i--) {
            if (nowMinutes >= prayerMinutes[i]) {
                currentIndex = i;
                break;
            }
        }

        return currentIndex;
    },

    getNextPrayerIndex(currentIndex) {
        if (currentIndex >= PRAYER_KEYS.length - 1) return 0; // Isha → Fajr
        return currentIndex + 1;
    },
});
