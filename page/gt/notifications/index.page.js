import { createWidget, widget, prop, event, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { onKey, offKey, KEY_HOME, KEY_SELECT, KEY_EVENT_CLICK } from "@zos/interaction";
import { setScrollMode, SCROLL_MODE_SWIPER } from "@zos/page";
import { BasePage } from "@zeppos/zml/base-page";
import { getPrayerLabel, isRtl, t } from "../../../utils/i18n";
import {
    PRAYER_NOTIFICATION_KEYS,
    getFajrAlarmSoundEnabled,
    getPrayerNotificationPreferences,
    setFajrAlarmSoundEnabled,
    setPrayerNotificationEnabled,
} from "../../../utils/prayer-notifications";
import {
    TITLE_STYLE,
    SCROLL_ITEM_HEIGHT,
    getRowBgStyle,
    getRowTextStyle,
    getToggleTrackStyle,
    getToggleKnobStyle,
    getFocusLineTopStyle,
    getFocusLineBottomStyle,
    getInfoTextStyle,
    getBottomPaddingStyle,
} from "zosLoader:./index.page.[pf].layout.js";

const SOUND_ROW_INDEX = PRAYER_NOTIFICATION_KEYS.length;
const ROW_COUNT = SOUND_ROW_INDEX + 1;

Page(
    BasePage({
        state: {
            preferences: {},
            soundEnabled: false,
            rowWidgets: [],
            toggles: [],
            focusIndex: 0,
            focusTop: null,
            focusBottom: null,
        },

        build() {
            setPageBrightTime({ brightTime: 30000 });
            const { screenShape } = getDeviceInfo();
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            this.state.preferences = getPrayerNotificationPreferences();
            this.state.soundEnabled = getFajrAlarmSoundEnabled();
            setScrollMode({
                mode: SCROLL_MODE_SWIPER,
                options: {
                    height: SCROLL_ITEM_HEIGHT,
                    count: ROW_COUNT,
                    modeParams: {
                        crown_enable: true,
                        on_page: (pageIndex) => this.setFocusedIndex(pageIndex),
                    },
                },
            });

            createWidget(widget.PAGE_SCROLLBAR);
            createWidget(widget.TEXT, {
                ...TITLE_STYLE,
                text: t("prayerAlerts"),
            });

            for (let i = 0; i < PRAYER_NOTIFICATION_KEYS.length; i++) {
                this.renderRow(PRAYER_NOTIFICATION_KEYS[i], i);
            }
            this.renderSoundRow();
            this.renderInfoText();
            this.renderFocusIndicator();
            const bottomPadding = getBottomPaddingStyle(ROW_COUNT);
            this.trackWidget(createWidget(widget.FILL_RECT, {
                x: 0,
                y: bottomPadding.y,
                w: 1,
                h: bottomPadding.h,
                color: 0x000000,
                alpha: 0,
            }));
            this.registerSelectionKey();
        },

        trackWidget(w) {
            this.state.rowWidgets.push(w);
            return w;
        },

        renderRow(prayerKey, index) {
            const rtl = isRtl();
            const checked = this.state.preferences[prayerKey] === true;
            const bg = this.trackWidget(createWidget(widget.FILL_RECT, getRowBgStyle(index)));
            const label = this.trackWidget(createWidget(widget.TEXT, {
                ...getRowTextStyle(index, rtl),
                text: getPrayerLabel(prayerKey),
            }));
            const track = this.trackWidget(createWidget(widget.FILL_RECT, getToggleTrackStyle(index, checked, rtl)));
            const knob = this.trackWidget(createWidget(widget.CIRCLE, getToggleKnobStyle(index, checked, rtl)));
            this.state.toggles[index] = { track, knob };

            const toggle = () => this.toggleIndex(index);
            for (const w of [bg, label, track, knob]) {
                w.addEventListener(event.SELECT, toggle);
            }
        },

        renderSoundRow() {
            const index = SOUND_ROW_INDEX;
            const rtl = isRtl();
            const checked = this.state.soundEnabled;
            const bg = this.trackWidget(createWidget(widget.FILL_RECT, getRowBgStyle(index)));
            const label = this.trackWidget(createWidget(widget.TEXT, {
                ...getRowTextStyle(index, rtl),
                text: t("fajrAlarmSound"),
            }));
            const track = this.trackWidget(createWidget(
                widget.FILL_RECT,
                getToggleTrackStyle(index, checked, rtl)
            ));
            const knob = this.trackWidget(createWidget(
                widget.CIRCLE,
                getToggleKnobStyle(index, checked, rtl)
            ));
            this.state.toggles[index] = { track, knob };
            const toggle = () => this.toggleIndex(index);
            for (const w of [bg, label, track, knob]) {
                w.addEventListener(event.SELECT, toggle);
            }
        },

        renderInfoText() {
            this.trackWidget(createWidget(widget.TEXT, {
                ...getInfoTextStyle(ROW_COUNT, isRtl()),
                text: t("prayerAlertInfo"),
            }));
        },

        toggleIndex(index) {
            if (index === SOUND_ROW_INDEX) {
                const checked = !this.state.soundEnabled;
                this.state.soundEnabled = checked;
                const rtl = isRtl();
                const toggle = this.state.toggles[index];
                toggle.track.setProperty(prop.MORE, getToggleTrackStyle(index, checked, rtl));
                toggle.knob.setProperty(prop.MORE, getToggleKnobStyle(index, checked, rtl));
                setFajrAlarmSoundEnabled(checked);
                return;
            }
            const prayerKey = PRAYER_NOTIFICATION_KEYS[index];
            if (!prayerKey) return;

            const checked = this.state.preferences[prayerKey] !== true;
            this.state.preferences[prayerKey] = checked;
            const rtl = isRtl();
            const toggle = this.state.toggles[index];
            toggle.track.setProperty(prop.MORE, getToggleTrackStyle(index, checked, rtl));
            toggle.knob.setProperty(prop.MORE, getToggleKnobStyle(index, checked, rtl));
            setPrayerNotificationEnabled(prayerKey, checked);
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
            const nextIndex = Math.max(
                0,
                Math.min(ROW_COUNT - 1, index)
            );
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
                        this.toggleIndex(this.state.focusIndex);
                        return true;
                    }
                    return false;
                },
            });
        },

        onDestroy() {
            offKey();
            this.state.rowWidgets = [];
            this.state.toggles = [];
        },
    })
);
