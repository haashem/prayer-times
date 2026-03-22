import { createWidget, deleteWidget, widget, event, setAppWidgetSize, getAppWidgetSize } from "@zos/ui";
import { Time } from "@zos/sensor";
import { push } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import {
    CARD_HEIGHT,
    MARGIN,
    ICON_SIZE,
    ICON_Y,
    TEXT_OFFSET,
    REMAINING_STYLE,
    PRAYER_STYLE,
    HIJRI_STYLE,
    NO_DATA_STYLE,
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("prayer-card");

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

const PRAYER_ICONS = {
    Fajr: "image/ic_fajr_80px.png",
    Sunrise: "image/ic_sunrise_80px.png",
    Dhuhr: "image/ic_dhuhr_80px.png",
    Asr: "image/ic_asr_80px.png",
    Maghrib: "image/ic_maghrib_80px.png",
    Isha: "image/ic_isha_80px.png",
};

AppWidget({
    state: {
        prayerData: null,
        tomorrowData: null,
        cardW: 0,
        cardX: 0,
        uiWidgets: [],
    },

    onInit() {
        logger.debug("prayer card onInit");
    },

    build() {
        try {
            setAppWidgetSize({ h: CARD_HEIGHT });
            const cardSize = getAppWidgetSize();
            this.state.cardW = cardSize.w;
            this.state.cardX = cardSize.margin;
            this.loadData();
            if (!this.state.prayerData) {
                this.renderNoData();
                return;
            }
            this.renderCard();
        } catch (e) {
            logger.error("Card build error: " + e.message);
        }
    },

    onResume() {
        try {
            this.clearUI();
            setAppWidgetSize({ h: CARD_HEIGHT });
            const cardSize = getAppWidgetSize();
            this.state.cardW = cardSize.w;
            this.state.cardX = cardSize.margin;
            this.loadData();
            if (!this.state.prayerData) {
                this.renderNoData();
                return;
            }
            this.renderCard();
        } catch (e) {
            logger.error("Card onResume error: " + e.message);
        }
    },

    onPause() { },

    onDestroy() {
        this.clearUI();
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
            this.state.prayerData = null;
            this.state.tomorrowData = null;

            const storedData = localStorage.getItem("prayerData");
            if (!storedData) return;

            const cached = JSON.parse(storedData);
            if (!cached || !Array.isArray(cached.data)) return;

            const time = new Time();
            const day = String(time.getDate()).padStart(2, "0");
            const month = String(time.getMonth()).padStart(2, "0");
            const year = String(time.getFullYear());
            const todayStr = day + "-" + month + "-" + year;

            if (cached.month !== month || cached.year !== year) return;

            const todayEntry = cached.data.find(
                (d) => d.date && d.date.gregorian && d.date.gregorian.date === todayStr
            );
            if (todayEntry) this.state.prayerData = todayEntry;

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
                if (tomorrowEntry) this.state.tomorrowData = tomorrowEntry;
            }
        } catch (e) {
            logger.error("loadData error: " + e.message);
        }
    },

    renderNoData() {
        this.trackWidget(createWidget(widget.TEXT, {
            ...NO_DATA_STYLE,
            x: this.state.cardX + MARGIN,
            w: this.state.cardW - MARGIN,
            text: "Tap to set up Prayer Times",
        }));
    },

    renderCard() {
        const data = this.state.prayerData;
        const nextInfo = this.getNextPrayerInfo(data, this.state.tomorrowData);

        // Icon (left side)
        const iconX = this.state.cardX + MARGIN;
        this.trackWidget(createWidget(widget.IMG, {
            x: iconX,
            y: ICON_Y,
            w: ICON_SIZE,
            h: ICON_SIZE,
            src: PRAYER_ICONS[nextInfo.key],
        }));

        // Text column (right of icon)
        const textX = this.state.cardX + MARGIN + TEXT_OFFSET;
        const textW = this.state.cardW - MARGIN - TEXT_OFFSET;

        this.trackWidget(createWidget(widget.TEXT, {
            ...REMAINING_STYLE,
            x: textX,
            w: textW,
            text: `in ${this.formatRemaining(nextInfo.remainingMinutes)}`,
        }));

        const prayerTime = this.formatTime(data.timings[nextInfo.key]);
        this.trackWidget(createWidget(widget.TEXT, {
            ...PRAYER_STYLE,
            x: textX,
            w: textW,
            text: `${nextInfo.label} ${prayerTime}`,
        }));

        const hijriText = this.getHijriText(data);
        if (hijriText) {
            this.trackWidget(createWidget(widget.TEXT, {
                ...HIJRI_STYLE,
                x: textX,
                w: textW,
                text: hijriText,
            }));
        }
    },

    getNextPrayerInfo(todayData, tomorrowData) {
        const time = new Time();
        const nowMinutes = time.getHours() * 60 + time.getMinutes();

        for (const key of PRAYER_KEYS) {
            const prayerMinutes = this.timeToMinutes(todayData.timings[key]);
            if (nowMinutes < prayerMinutes) {
                return { key, label: key, remainingMinutes: prayerMinutes - nowMinutes };
            }
        }

        // All prayers passed — next is tomorrow's Fajr
        const tomorrowFajr = tomorrowData && tomorrowData.timings
            ? this.timeToMinutes(tomorrowData.timings["Fajr"])
            : this.timeToMinutes(todayData.timings["Fajr"]);

        return {
            key: "Fajr",
            label: "Fajr",
            remainingMinutes: 24 * 60 - nowMinutes + tomorrowFajr,
        };
    },

    getHijriText(data) {
        try {
            const hijri = data && data.date && data.date.hijri;
            return hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year}` : "";
        } catch (e) {
            return "";
        }
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
});
