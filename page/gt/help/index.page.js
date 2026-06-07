import { createWidget, widget, prop, event, align, setStatusBarVisible } from "@zos/ui";
import { push } from "@zos/router";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { BasePage } from "@zeppos/zml/base-page";
import { formatHijriDate, isRtl, t } from "../../../utils/i18n";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    getParaStyle,
    getHijriDateStyle,
    PARA_HEIGHT,
    PARA_GAP,
    PARA_START_Y,
    TITLE_FONT_SIZE,
    TITLE_HEIGHT,
    HIJRI_DATE_HEIGHT,
    LANGUAGE_TILE_GAP,
    BOTTOM_PADDING,
    getLanguageTileBgStyle,
    getLanguageTileTitleStyle,
    getLanguageTileChevronStyle,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        state: {
            hijriDate: null,
        },

        onInit(params) {
            this.state.hijriDate = this.getHijriDateParam(params);
        },

        build(params) {
            if (!this.state.hijriDate) {
                this.state.hijriDate = this.getHijriDateParam(params);
            }

            // Keep the screen bright while the user reads the help page.
            setPageBrightTime({ brightTime: 30000 });

            const { screenShape } = getDeviceInfo();

            // Hide system title bar on square watches to avoid overlay on app content.
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            const pageBg = createWidget(widget.FILL_RECT, {
                x: 0,
                y: 0,
                w: DEVICE_WIDTH,
                h: DEVICE_HEIGHT,
                color: 0x000000,
            });
            createWidget(widget.PAGE_SCROLLBAR);
            const bodyAlign = isRtl() ? align.RIGHT : align.LEFT;

            // Title
            createWidget(widget.TEXT, {
                ...getParaStyle(PARA_START_Y),
                text: t("appName"),
                text_size: TITLE_FONT_SIZE,
                color: 0xffffff,
                h: TITLE_HEIGHT,
                align_h: align.CENTER_H,
            });

            // Hijri date below title
            const hijriText = formatHijriDate(this.state.hijriDate);

            if (hijriText) {
                createWidget(widget.TEXT, {
                    ...getHijriDateStyle(PARA_START_Y + TITLE_HEIGHT),
                    text: hijriText,
                });
            }

            let y = PARA_START_Y + TITLE_HEIGHT + (hijriText ? HIJRI_DATE_HEIGHT + PARA_GAP : 0) + PARA_GAP;
            this.renderLanguageTile(y);
            y += getLanguageTileBgStyle(y).h + LANGUAGE_TILE_GAP;

            createWidget(widget.TEXT, {
                ...getParaStyle(y),
                h: PARA_HEIGHT,
                text: t("helpIntro"),
                align_h: bodyAlign,
            });
            y += PARA_HEIGHT + PARA_GAP;

            // Calculation method section
            createWidget(widget.TEXT, {
                ...getParaStyle(y),
                text: t("calculationMethod"),
                text_size: TITLE_FONT_SIZE,
                color: 0xffffff,
                h: TITLE_HEIGHT,
                align_h: align.CENTER_H,
            });
            y += TITLE_HEIGHT + PARA_GAP;

            createWidget(widget.TEXT, {
                ...getParaStyle(y),
                h: PARA_HEIGHT,
                text: t("helpCalculation"),
                align_h: bodyAlign,
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
            pageBg.setProperty(prop.MORE, {
                x: 0,
                y: 0,
                w: DEVICE_WIDTH,
                h: y + BOTTOM_PADDING,
                color: 0x000000,
            });
        },

        renderLanguageTile(y) {
            const tileBg = createWidget(widget.FILL_RECT, getLanguageTileBgStyle(y));
            const tileTitle = createWidget(widget.TEXT, {
                ...getLanguageTileTitleStyle(y),
                text: t("selectLanguage"),
                align_h: align.LEFT,
            });
            const tileChevron = createWidget(widget.IMG, {
                ...getLanguageTileChevronStyle(y),
                src: "image/chevron_right.png",
            });

            const setPressed = (pressed) => {
                tileBg.setProperty(prop.MORE, {
                    ...getLanguageTileBgStyle(y),
                    color: pressed ? 0x101010 : 0x000000,
                });
            };
            const openLanguagePage = () => {
                setPressed(false);
                push({ url: "page/gt/language/index.page" });
            };

            for (const w of [tileBg, tileTitle, tileChevron]) {
                w.addEventListener(event.CLICK_DOWN, () => setPressed(true));
                w.addEventListener(event.MOVE, () => setPressed(false));
                w.addEventListener(event.SELECT, openLanguagePage);
            }
        },

        getHijriDateParam(params) {
            try {
                if (!params) return null;
                const data = typeof params === "string" ? JSON.parse(params) : params;
                return data && data.hijriDate ? data.hijriDate : null;
            } catch (e) {
                return null;
            }
        },
    })
);
