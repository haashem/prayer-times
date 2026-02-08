import { createWidget, widget, align, text_style, event } from "@zos/ui";
import { Time } from "@zos/sensor";
import { push } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    COLORS,
    getCityBgStyle,
    getCityTextStyle,
    NEXT_LABEL_STYLE,
    NEXT_NAME_STYLE,
    NEXT_TIME_STYLE,
    getCellBgStyle,
    getCellNameStyle,
    getCellTimeStyle,
    NO_DATA_STYLE,
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("prayer-widget");

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

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
        const info = this.getNextPrayerInfo(data);

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

        // ── City pill ──
        const cityName = this.state.location.city;
        createWidget(widget.FILL_RECT, getCityBgStyle(cityName.length));
        createWidget(widget.TEXT, {
            ...getCityTextStyle(cityName.length),
            text: cityName,
        });

        // ── "Next prayer" label ──
        createWidget(widget.TEXT, {
            ...NEXT_LABEL_STYLE,
            text: "Next prayer",
        });

        // ── Next prayer name ──
        createWidget(widget.TEXT, {
            ...NEXT_NAME_STYLE,
            text: info.nextPrayer.label,
        });

        // ── Large next prayer time ──
        const nextTimeStr = info.isNextDay
            ? this.formatTime(
                (this.state.tomorrowData || data).timings[info.nextPrayer.key]
            )
            : this.formatTime(data.timings[info.nextPrayer.key]);

        createWidget(widget.TEXT, {
            ...NEXT_TIME_STYLE,
            text: nextTimeStr,
        });

        // ── Upcoming prayer cell (one row) ──
        const upcoming = this.getUpcomingPrayer(data, info);
        if (upcoming) {
            createWidget(widget.FILL_RECT, getCellBgStyle());
            createWidget(widget.TEXT, { ...getCellNameStyle(), text: upcoming.label });
            createWidget(widget.TEXT, { ...getCellTimeStyle(), text: upcoming.time });
        }
    },

    getUpcomingPrayer(todayData, info) {
        if (info.isNextDay) {
            // After Isha → next is tomorrow's Fajr, upcoming is tomorrow's Sunrise
            const tmrw = this.state.tomorrowData;
            if (tmrw) {
                return { label: "Sunrise", time: this.formatTime(tmrw.timings["Sunrise"]) };
            }
            return null;
        }

        // When next is Isha → upcoming is tomorrow's Fajr
        if (info.nextPrayer.key === "Isha") {
            const tmrw = this.state.tomorrowData;
            if (tmrw) {
                return { label: "Fajr", time: this.formatTime(tmrw.timings["Fajr"]) };
            }
            return null;
        }

        // Otherwise show the prayer after next
        const afterNextIndex = info.nextIndex + 1;
        if (afterNextIndex < PRAYER_KEYS.length) {
            return {
                label: PRAYER_LABELS[afterNextIndex],
                time: this.formatTime(todayData.timings[PRAYER_KEYS[afterNextIndex]]),
            };
        }

        return null;
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

    getNextPrayerInfo(todayData) {
        if (!todayData || !todayData.timings) {
            return { nextIndex: 0, nextPrayer: { key: "Fajr", label: "Fajr" }, isNextDay: false };
        }

        const time = new Time();
        const nowMinutes = time.getHours() * 60 + time.getMinutes();

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
                    nextPrayer: prayers[i],
                    nowMinutes,
                    isNextDay: false,
                };
            }
        }

        // All prayers passed → next is tomorrow's Fajr
        return {
            nextIndex: 0,
            nextPrayer: { key: "Fajr", label: "Fajr" },
            nowMinutes,
            isNextDay: true,
        };
    },
});
