import { createWidget, widget, prop, event, setStatusBarVisible } from "@zos/ui";
import { push } from "@zos/router";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { onKey, offKey, KEY_HOME, KEY_SELECT, KEY_EVENT_CLICK } from "@zos/interaction";
import { setScrollMode, SCROLL_MODE_SWIPER } from "@zos/page";
import { BasePage } from "@zeppos/zml/base-page";
import { formatHijriDate, isRtl, t } from "../../../utils/i18n";
import {
    TITLE_STYLE,
    HIJRI_DATE_STYLE,
    SETTINGS_ITEMS,
    BOTTOM_PADDING,
    SCROLL_ITEM_HEIGHT,
    getSettingsRowBgStyle,
    getSettingsRowTextStyle,
    getSettingsRowChevronStyle,
    getFocusLineTopStyle,
    getFocusLineBottomStyle,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        state: {
            hijriDate: null,
            rowWidgets: [],
            focusIndex: 0,
            focusTop: null,
            focusBottom: null,
        },

        onInit(params) {
            this.state.hijriDate = this.getHijriDateParam(params);
        },

        build(params) {
            if (!this.state.hijriDate) {
                this.state.hijriDate = this.getHijriDateParam(params);
            }

            setPageBrightTime({ brightTime: 30000 });

            const { screenShape } = getDeviceInfo();
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            setScrollMode({
                mode: SCROLL_MODE_SWIPER,
                options: {
                    height: SCROLL_ITEM_HEIGHT,
                    count: SETTINGS_ITEMS.length,
                    modeParams: {
                        crown_enable: true,
                        on_page: (pageIndex) => this.setFocusedIndex(pageIndex),
                    },
                },
            });

            createWidget(widget.PAGE_SCROLLBAR);
            createWidget(widget.TEXT, {
                ...TITLE_STYLE,
                text: t("appName"),
            });

            const hijriText = formatHijriDate(this.state.hijriDate);
            if (hijriText) {
                createWidget(widget.TEXT, {
                    ...HIJRI_DATE_STYLE,
                    text: hijriText,
                });
            }

            for (let i = 0; i < SETTINGS_ITEMS.length; i++) {
                this.renderRow(SETTINGS_ITEMS[i], i);
            }

            this.renderFocusIndicator();
            this.trackWidget(createWidget(widget.FILL_RECT, {
                x: 0,
                y: BOTTOM_PADDING.y,
                w: 1,
                h: BOTTOM_PADDING.h,
                color: 0x000000,
                alpha: 0,
            }));
            this.registerSelectionKey();
        },

        trackWidget(w) {
            this.state.rowWidgets.push(w);
            return w;
        },

        renderRow(item, index) {
            const rtl = isRtl();
            const bg = this.trackWidget(createWidget(widget.FILL_RECT, getSettingsRowBgStyle(index)));
            const label = this.trackWidget(createWidget(widget.TEXT, {
                ...getSettingsRowTextStyle(index, rtl),
                text: t(item.labelKey),
            }));
            const chevron = this.trackWidget(createWidget(widget.IMG, {
                ...getSettingsRowChevronStyle(index, rtl),
                src: "image/chevron_right.png",
            }));

            const setPressed = (pressed) => {
                bg.setProperty(prop.MORE, {
                    ...getSettingsRowBgStyle(index),
                    color: pressed ? 0x101010 : 0x000000,
                });
            };
            const select = () => {
                setPressed(false);
                this.openItem(index);
            };

            for (const w of [bg, label, chevron]) {
                w.addEventListener(event.CLICK_DOWN, () => setPressed(true));
                w.addEventListener(event.MOVE, () => setPressed(false));
                w.addEventListener(event.SELECT, select);
            }
        },

        renderFocusIndicator() {
            this.state.focusIndex = 0;
            this.state.focusTop = this.trackWidget(createWidget(widget.IMG, {
                ...getFocusLineTopStyle(0),
                src: "image/focus_line_top.png",
            }));
            this.state.focusBottom = this.trackWidget(createWidget(widget.IMG, {
                ...getFocusLineBottomStyle(0),
                src: "image/focus_line_bottom.png",
            }));
        },

        setFocusedIndex(index) {
            const nextIndex = Math.max(0, Math.min(SETTINGS_ITEMS.length - 1, index));
            if (nextIndex === this.state.focusIndex) return;

            this.state.focusIndex = nextIndex;
            this.state.focusTop.setProperty(prop.MORE, getFocusLineTopStyle(nextIndex));
            this.state.focusBottom.setProperty(prop.MORE, getFocusLineBottomStyle(nextIndex));
        },

        registerSelectionKey() {
            onKey({
                callback: (key, keyEvent) => {
                    const isCrownKey = key === KEY_HOME || key === KEY_SELECT;
                    if (isCrownKey && keyEvent === KEY_EVENT_CLICK) {
                        this.openItem(this.state.focusIndex);
                        return true;
                    }
                    return false;
                },
            });
        },

        openItem(index) {
            const item = SETTINGS_ITEMS[index];
            if (!item) return;
            push({ url: item.url });
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

        onDestroy() {
            offKey();
            this.state.rowWidgets = [];
        },
    })
);
