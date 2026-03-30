import { createWidget, widget, align, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { localStorage } from "@zos/storage";
import { Time } from "@zos/sensor";
import { BasePage } from "@zeppos/zml/base-page";
import {
    getParaStyle,
    getHijriDateStyle,
    PARA_HEIGHT,
    PARA_GAP,
    PARA_START_Y,
    TITLE_FONT_SIZE,
    TITLE_HEIGHT,
    HIJRI_DATE_HEIGHT,
    BOTTOM_PADDING,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        build() {
            // Keep the screen bright while the user reads the help page.
            setPageBrightTime({ brightTime: 30000 });

            const { screenShape } = getDeviceInfo();

            // Hide system title bar on square watches to avoid overlay on app content.
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            createWidget(widget.PAGE_SCROLLBAR);

            // Title
            createWidget(widget.TEXT, {
                ...getParaStyle(PARA_START_Y),
                text: "Prayer Times",
                text_size: TITLE_FONT_SIZE,
                color: 0xffffff,
                h: TITLE_HEIGHT,
                align_h: align.CENTER_H,
            });

            // Hijri date below title
            const hijriText = this.getTodayHijriText();

            if (hijriText) {
                createWidget(widget.TEXT, {
                    ...getHijriDateStyle(PARA_START_Y + TITLE_HEIGHT),
                    text: hijriText,
                });
            }

            let y = PARA_START_Y + TITLE_HEIGHT + (hijriText ? HIJRI_DATE_HEIGHT + PARA_GAP : 0) + PARA_GAP;
            createWidget(widget.TEXT, {
                ...getParaStyle(y),
                h: PARA_HEIGHT,
                text:
                    "This app detects your location and fetches accurate local prayer times.\n\n" +
                    "For the best results:\n" +
                    "• Connect to Wi-Fi\n" +
                    "• Disconnect from VPN\n" +
                    "• Turn off iCloud Private\n" +
                    "  Relay on iPhone",
            });
            y += PARA_HEIGHT + PARA_GAP;

            // Calculation method section
            createWidget(widget.TEXT, {
                ...getParaStyle(y),
                text: "Calculation Method",
                text_size: TITLE_FONT_SIZE,
                color: 0xffffff,
                h: TITLE_HEIGHT,
                align_h: align.CENTER_H,
            });
            y += TITLE_HEIGHT + PARA_GAP;

            createWidget(widget.TEXT, {
                ...getParaStyle(y),
                h: PARA_HEIGHT,
                text:
                    "Prayer times are calculated using the Muslim World League (MWL) method.\n\n" +
                    "Asr time follows the Shafi'i school, where Asr begins when an object's shadow equals its height.",
            });
            y += PARA_HEIGHT + PARA_GAP;

            // Bottom spacer
            createWidget(widget.FILL_RECT, {
                x: 0,
                y: y,
                w: 1,
                h: BOTTOM_PADDING,
                color: 0x000000,
                alpha: 0,
            });
        },

        getTodayHijriText() {
            try {
                const stored = localStorage.getItem("prayerData");
                if (!stored) return "";
                const cached = JSON.parse(stored);
                const time = new Time();
                const day = String(time.getDate()).padStart(2, "0");
                const month = String(time.getMonth()).padStart(2, "0");
                const year = String(time.getFullYear());
                const todayStr = `${day}-${month}-${year}`;
                const entry = cached.data && cached.data.find(
                    (d) => d.date && d.date.gregorian && d.date.gregorian.date === todayStr
                );
                const hijri = entry && entry.date && entry.date.hijri;
                return hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year}` : "";
            } catch (e) {
                return "";
            }
        },
    })
);
