import { createWidget, widget, event, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { back } from "@zos/router";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { Vibrator, VIBRATOR_SCENE_NOTIFICATION, VIBRATOR_SCENE_TIMER, SystemSounds } from "@zos/sensor";
import { BasePage } from "@zeppos/zml/base-page";
import { getPrayerLabel, t } from "../../../utils/i18n";
import {
    getPrayerNotificationPayloadDisplay,
    isPrayerNotificationCurrent,
    scheduleNextPrayerNotification,
} from "../../../utils/prayer-notifications";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    MESSAGE_STYLE,
    DISMISS_BUTTON_STYLE,
    DISMISS_ICON_STYLE,
    getEyebrowStyle,
    getPrayerNameStyle,
    getTimeStyle,
} from "zosLoader:./index.page.[pf].layout.js";

const FAJR_PRAYER_KEY = "Fajr";
const FAJR_ALERT_DURATION_MS = 5 * 60 * 1000;
const PRAYER_ALERT_DURATION_MS = 10 * 1000;

function parsePayload(value) {
    try {
        if (!value) return null;
        const data = typeof value === "string" ? JSON.parse(value) : value;
        if (data && data.prayerKey) return data;
        if (data && data.param) return parsePayload(data.param);
        if (data && data.params) return parsePayload(data.params);
    } catch (e) {
        return null;
    }
    return null;
}

function isFajrAlert(payload) {
    return payload && payload.prayerKey === FAJR_PRAYER_KEY;
}

function getAlertDurationMs(payload) {
    return isFajrAlert(payload) ? FAJR_ALERT_DURATION_MS : PRAYER_ALERT_DURATION_MS;
}

Page(
    BasePage({
        state: {
            payload: null,
            vibrator: null,
            systemSounds: null,
            stopTimer: null,
            dismissButton: null,
            stopped: false,
        },

        onInit(params) {
            this.state.payload = parsePayload(params) || this.takePendingPayload();
        },

        build(params) {
            if (!this.state.payload) {
                this.state.payload = parsePayload(params) || this.takePendingPayload();
            }

            const payload = this.state.payload;
            const alertDuration = getAlertDurationMs(payload);
            setPageBrightTime({ brightTime: alertDuration });
            const { screenShape } = getDeviceInfo();
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            createWidget(widget.FILL_RECT, {
                x: 0,
                y: 0,
                w: DEVICE_WIDTH,
                h: DEVICE_HEIGHT,
                color: 0x000000,
            });

            const isTest = payload && payload.test === true;
            if (!payload ||
                (!isTest && !isPrayerNotificationCurrent(payload.prayerKey, payload.context))) {
                createWidget(widget.TEXT, {
                    ...MESSAGE_STYLE,
                    text: t("noPrayerData"),
                });
                return;
            }

            const display = getPrayerNotificationPayloadDisplay(payload);
            const isAlarmAlert = isFajrAlert(payload);
            createWidget(widget.TEXT, {
                ...getEyebrowStyle(isAlarmAlert),
                text: t("timeForPrayer"),
            });
            createWidget(widget.TEXT, {
                ...getPrayerNameStyle(isAlarmAlert),
                text: getPrayerLabel(payload.prayerKey),
            });
            createWidget(widget.TEXT, {
                ...getTimeStyle(isAlarmAlert),
                text: display.time,
            });
            if (isAlarmAlert) {
                this.renderDismissButton();
            }

            if (!isTest) {
                scheduleNextPrayerNotification(payload.prayerKey, payload.context, new Date());
            }

            this.state.vibrator = new Vibrator();
            if (isAlarmAlert) {
                this.startVibrationPattern();
                this.startAlarmSound(alertDuration);
            } else {
                this.startSubtleVibration();
            }
            this.state.stopTimer = setTimeout(() => {
                if (isAlarmAlert) {
                    this.stopAlert();
                } else {
                    this.dismissAlert();
                }
            }, alertDuration);
        },

        renderDismissButton() {
            this.state.dismissButton = createWidget(widget.BUTTON, {
                ...DISMISS_BUTTON_STYLE,
                text: "",
                click_func: () => this.dismissAlert(),
            });
            this.state.dismissIcon = createWidget(widget.IMG, {
                ...DISMISS_ICON_STYLE,
                src: "image/ic_cancel_64px.png",
            });
            this.state.dismissIcon.addEventListener(event.SELECT, () => this.dismissAlert());
        },

        startVibrationPattern() {
            if (!this.state.vibrator || this.state.stopped) return;
            this.state.vibrator.stop();
            this.state.vibrator.start({ mode: VIBRATOR_SCENE_TIMER });
        },

        startSubtleVibration() {
            if (!this.state.vibrator || this.state.stopped) return;
            this.state.vibrator.stop();
            this.state.vibrator.start({ mode: VIBRATOR_SCENE_NOTIFICATION });
        },

        startAlarmSound(durationMs) {
            try {
                if (typeof SystemSounds !== "function") return;
                const sounds = new SystemSounds();
                if (!sounds.getEnabled()) return;
                const sourceTypes = sounds.getSourceType();
                if (!sourceTypes || typeof sourceTypes.REGULAR !== "number") return;
                this.state.systemSounds = sounds;
                sounds.start(sourceTypes.REGULAR, Math.ceil(durationMs / 1000));
            } catch (e) {
                this.state.systemSounds = null;
            }
        },

        dismissAlert() {
            this.stopAlert();
            back();
        },

        takePendingPayload() {
            try {
                const app = getApp();
                const globalData = app && app._options && app._options.globalData;
                if (!globalData) return null;
                const payload = globalData.pendingPrayerAlert;
                globalData.pendingPrayerAlert = null;
                return payload;
            } catch (e) {
                return null;
            }
        },

        stopAlert() {
            if (this.state.stopped) return;
            this.state.stopped = true;
            if (this.state.stopTimer !== null) {
                clearTimeout(this.state.stopTimer);
                this.state.stopTimer = null;
            }
            if (this.state.vibrator) {
                this.state.vibrator.stop();
            }
            if (this.state.systemSounds) {
                try {
                    this.state.systemSounds.stop();
                } catch (e) {
                    // Sound may already have stopped or be unsupported.
                }
            }
        },

        onDestroy() {
            this.stopAlert();
            this.state.vibrator = null;
            this.state.systemSounds = null;
            this.state.dismissButton = null;
            this.state.dismissIcon = null;
        },
    })
);
