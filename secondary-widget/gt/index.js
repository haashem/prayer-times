import { createWidget, deleteWidget, widget, event } from "@zos/ui";
import { Time } from "@zos/sensor";
import { push } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    NEXT_SUMMARY_STYLE,
    NEXT_SUMMARY_URGENT_COLOR,
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
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("prayer-widget");

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const NEXT_EVENT_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

SecondaryWidget({
    state: {
        location: null,
        prayerData: null,
        tomorrowData: null,
        uiWidgets: [],
    },

    onInit() {
        logger.debug("prayer widget onInit");
    },

    build() {
        try {
            logger.debug("prayer widget build");

            this.loadData();

            if (!this.state.prayerData) {
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
        try {
            this.clearUI();
            this.loadData();

            if (!this.state.prayerData) {
                this.renderNoData();
                return;
            }

            this.renderWidget();
        } catch (e) {
            logger.error("Widget onResume error: " + e.message);
        }
    },

    onPause() {
        logger.debug("prayer widget onPause");
    },

    onDestroy() {
        this.clearUI();
        logger.debug("prayer widget onDestroy");
    },

    trackWidget(w) {
        this.state.uiWidgets.push(w);
        w.addEventListener(event.SELECT, () => {
            push({ url: "page/gt/home/index.page" });
        });
        return w;
    },

    clearUI() {
        for (const w of this.state.uiWidgets) {
            deleteWidget(w);
        }
        this.state.uiWidgets = [];
    },

    loadData() {
        try {
            this.state.location = null;
            this.state.prayerData = null;
            this.state.tomorrowData = null;

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

                        // Also try to load tomorrow's data
                        const tomorrow = new Date(
                            time.getFullYear(),
                            time.getMonth() - 1,
                            time.getDate() + 1
                        );
                        const tDay = String(tomorrow.getDate()).padStart(2, "0");
                        const tMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
                        const tYear = String(tomorrow.getFullYear());
                        const tomorrowStr = tDay + "-" + tMonth + "-" + tYear;

                        if (cached.month === tMonth && cached.year === tYear) {
                            const tomorrowEntry = cached.data.find(
                                (d) => d.date && d.date.gregorian && d.date.gregorian.date === tomorrowStr
                            );
                            if (tomorrowEntry) {
                                this.state.tomorrowData = tomorrowEntry;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            logger.error("Widget loadData error: " + e.message);
        }
    },

    renderNoData() {
        const bg = this.trackWidget(createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: DEVICE_WIDTH,
            h: DEVICE_HEIGHT,
            color: 0x000000,
            alpha: 0,
        }));

        this.trackWidget(createWidget(widget.TEXT, {
            ...NO_DATA_STYLE,
            text: "Tap to set up\nPrayer Times",
        }));
    },

    renderWidget() {
        const data = this.state.prayerData;

        // Tappable background to open app
        this.trackWidget(createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: DEVICE_WIDTH,
            h: DEVICE_HEIGHT,
            color: 0x000000,
            alpha: 0,
        }));

        const nextInfo = this.getNextPrayerInfo(data, this.state.tomorrowData);
        if (nextInfo) {
            this.trackWidget(createWidget(widget.TEXT, {
                ...NEXT_SUMMARY_STYLE,
                color: nextInfo.remainingMinutes <= 60
                    ? NEXT_SUMMARY_URGENT_COLOR
                    : NEXT_SUMMARY_STYLE.color,
                text: `${nextInfo.label} in ${this.formatRemaining(nextInfo.remainingMinutes)}`,
            }));
        }

        // ── Prayer grid ──
        const currentIndex = this.getCurrentPrayerIndex(data);
        for (let i = 0; i < PRAYER_KEYS.length; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const x = GRID_START_X + col * (GRID_CELL_W + GRID_COL_GAP);
            const y = GRID_START_Y + row * (GRID_CELL_H + GRID_ROW_GAP);
            const isActive = i === currentIndex;
            this.trackWidget(createWidget(widget.FILL_RECT, getPrayerCellBgStyle(x, y, isActive)));
            this.trackWidget(createWidget(widget.TEXT, {
                ...getPrayerLabelStyle(x, y, isActive),
                text: PRAYER_LABELS[i],
            }));
            this.trackWidget(createWidget(widget.TEXT, {
                ...getPrayerTimeStyle(x, y, isActive),
                text: this.formatTime(data.timings[PRAYER_KEYS[i]]),
            }));
        }
    },

    getNextPrayerInfo(todayData, tomorrowData) {
        const time = new Time();
        const nowMinutes = time.getHours() * 60 + time.getMinutes();

        for (const key of NEXT_EVENT_KEYS) {
            const prayerMinutes = this.timeToMinutes(todayData.timings[key]);
            if (nowMinutes < prayerMinutes) {
                return {
                    label: key,
                    remainingMinutes: prayerMinutes - nowMinutes,
                };
            }
        }

        const tomorrowFajr = tomorrowData && tomorrowData.timings
            ? this.timeToMinutes(tomorrowData.timings["Fajr"])
            : this.timeToMinutes(todayData.timings["Fajr"]);

        return {
            label: "Fajr",
            remainingMinutes: 24 * 60 - nowMinutes + tomorrowFajr,
        };
    },

    formatRemaining(totalMinutes) {
        if (totalMinutes < 60) return `${totalMinutes}m`;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
    },

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
});
