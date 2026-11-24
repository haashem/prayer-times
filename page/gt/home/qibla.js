import { deleteWidget, widget, prop } from "@zos/ui";
import { Compass, Vibrator, VIBRATOR_SCENE_DURATION } from "@zos/sensor";
import { log as Logger } from "@zos/utils";
import { smoothHeading, isQiblaAligned } from "../../../utils/compass-motion";
import { t } from "../../../utils/i18n";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    COMPASS_RING_STYLE,
    ARROW_STYLE,
    TOP_MARKER_STYLE,
    KAABA_DOT_STYLE,
    DOT_ORBIT_RADIUS,
    CALIBRATE_STYLE,
    QIBLA_NO_DATA_STYLE,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("qibla-compass");

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

/**
 * Creates a Qibla compass controller bound to the given VIEW_CONTAINER.
 *
 * Usage:
 *   const qibla = createQiblaCompass(container);
 *   qibla.build(location);     // render UI
 *   qibla.startCompass();      // start sensor
 *   qibla.stopCompass();       // stop sensor
 *   qibla.destroy();           // full cleanup
 */
export function createQiblaCompass(container) {
    const state = {
        compass: null,
        vibrate: null,
        qiblaBearing: 0,
        compassCallback: null,
        heading: null,
        headingTime: null,
        markerWidget: null,
        backingWidget: null,
        backingBounds: null,
        ringWidget: null,
        arrowWidget: null,
        dotWidget: null,
        calibrateWidget: null,
        facingQibla: false,
        lastVibrateTime: 0,
        visualAligned: false,
        widgets: [],
    };

    // ── Widget tracking ──

    function trackWidget(w) {
        state.widgets.push(w);
        return w;
    }

    function clearUI() {
        for (const w of state.widgets) {
            deleteWidget(w);
        }
        state.widgets = [];
        state.heading = null;
        state.headingTime = null;
        state.visualAligned = false;
        state.markerWidget = null;
        state.backingWidget = null;
        state.ringWidget = null;
        state.arrowWidget = null;
        state.dotWidget = null;
        state.calibrateWidget = null;
    }

    // ── Qibla bearing calculation ──

    function calculateQiblaBearing(lat, lon) {
        const phi1 = (lat * Math.PI) / 180;
        const phi2 = (KAABA_LAT * Math.PI) / 180;
        const dLambda = ((KAABA_LON - lon) * Math.PI) / 180;

        const x = Math.sin(dLambda) * Math.cos(phi2);
        const y =
            Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

        let bearing = (Math.atan2(x, y) * 180) / Math.PI;
        return (bearing + 360) % 360;
    }

    // ── Compass sensor ──

    function startCompass() {
        if (!state.ringWidget || state.compass) return; // Already running
        try {
            state.compass = new Compass();
            state.compass.start();

            state.compassCallback = () => {
                updateCompass();
            };

            state.compass.onChange(state.compassCallback);
        } catch (e) {
            logger.error("Compass error: " + e.message);
        }
    }

    function stopCompass() {
        state.heading = null;
        state.headingTime = null;
        if (state.compass) {
            if (state.compassCallback) {
                state.compass.offChange(state.compassCallback);
                state.compassCallback = null;
            }
            state.compass.stop();
            state.compass = null;
        }
    }

    function updateCompass() {
        if (!state.compass) return;

        const calibrated = state.compass.getStatus();
        const angle = state.compass.getDirectionAngle();

        if (!calibrated || typeof angle !== "number" || !Number.isFinite(angle)) {
            if (!state.calibrateWidget) {
                showCalibration();
            }
            return;
        }

        // Hide calibration message if it was showing
        if (state.calibrateWidget) {
            hideCalibration();
        }

        const now = Date.now();
        const heading = smoothHeading(state.heading, angle,
            state.headingTime === null ? 0 : now - state.headingTime);
        state.heading = heading;
        state.headingTime = now;
        const arrowAngle = (state.qiblaBearing - heading + 360) % 360;
        const ringAngle = (360 - heading) % 360;

        // Update arrow rotation
        if (state.arrowWidget) {
            state.arrowWidget.setProperty(prop.MORE, {
                angle: arrowAngle,
            });
        }

        // Update ring rotation
        if (state.ringWidget) {
            state.ringWidget.setProperty(prop.MORE, {
                angle: ringAngle,
            });
        }

        // Update kaaba dot position on compass edge
        if (state.dotWidget) {
            const dotAngleRad = (arrowAngle - 90) * (Math.PI / 180);
            const cx = DEVICE_WIDTH / 2 - KAABA_DOT_STYLE.w / 2;
            const cy = DEVICE_HEIGHT / 2 - KAABA_DOT_STYLE.h / 2;
            const dotX = cx + DOT_ORBIT_RADIUS * Math.cos(dotAngleRad);
            const dotY = cy + DOT_ORBIT_RADIUS * Math.sin(dotAngleRad);

            state.backingBounds = {
                x: Math.round(dotX) - 4, y: Math.round(dotY) - 4,
                w: KAABA_DOT_STYLE.w + 8, h: KAABA_DOT_STYLE.h + 8,
            };
            state.backingWidget.setProperty(prop.MORE, state.backingBounds);
            state.dotWidget.setProperty(prop.MORE, {
                x: Math.round(dotX),
                y: Math.round(dotY),
            });
        }

        // Vibrate when facing Qibla (within ±5°)
        const diff = Math.abs(arrowAngle <= 180 ? arrowAngle : 360 - arrowAngle);
        const isFacing = isQiblaAligned(diff, state.visualAligned);
        if (isFacing !== state.visualAligned) {
            state.arrowWidget.setProperty(prop.MORE, {
                src: isFacing ? "image/qibla_pointer_aligned.png" : ARROW_STYLE.src,
            });
            state.markerWidget.setProperty(prop.MORE, {
                src: isFacing ? "image/compass_top_aligned.png" : TOP_MARKER_STYLE.src,
            });
        }

        state.visualAligned = isFacing;

        {
            // Vibrate when facing Qibla (within ±5°)
            const vibrationAngle = (state.qiblaBearing - angle + 360) % 360;
            const diff = Math.abs(vibrationAngle <= 180 ? vibrationAngle : 360 - vibrationAngle);
            const isFacing = diff < 5;

            if (isFacing && !state.facingQibla) {
                const now = Date.now();
                if (now - state.lastVibrateTime > 2000) {
                    state.lastVibrateTime = now;
                    if (state.vibrate) {
                        state.vibrate.stop();
                        state.vibrate.start({ mode: VIBRATOR_SCENE_DURATION });
                    }
                }
            }
            state.facingQibla = isFacing;
        }
    }

    // ── Render ──

    function showCalibration() {
        state.heading = null;
        state.headingTime = null;
        state.visualAligned = false;
        state.arrowWidget.setProperty(prop.MORE, { src: ARROW_STYLE.src });
        state.markerWidget.setProperty(prop.MORE, { src: TOP_MARKER_STYLE.src });
        state.markerWidget.setProperty(prop.MORE, { alpha: 0 });
        state.backingWidget.setProperty(prop.MORE, { ...state.backingBounds, alpha: 0 });
        // Hide compass elements
        if (state.ringWidget) {
            state.ringWidget.setProperty(prop.MORE, { alpha: 0 });
        }
        if (state.arrowWidget) {
            state.arrowWidget.setProperty(prop.MORE, { alpha: 0 });
        }
        if (state.dotWidget) {
            state.dotWidget.setProperty(prop.MORE, { alpha: 0 });
        }

        state.calibrateWidget = trackWidget(
            container.createWidget(widget.TEXT, {
                ...CALIBRATE_STYLE,
                text: t("qiblaCalibrate"),
            })
        );
    }

    function hideCalibration() {
        if (state.calibrateWidget) {
            state.widgets = state.widgets.filter(w => w !== state.calibrateWidget);
            deleteWidget(state.calibrateWidget);
            state.calibrateWidget = null;
        }

        state.markerWidget.setProperty(prop.MORE, { alpha: 255 });
        state.backingWidget.setProperty(prop.MORE, { ...state.backingBounds, alpha: 255 });
        // Show compass elements
        if (state.ringWidget) {
            state.ringWidget.setProperty(prop.MORE, { alpha: 255 });
        }
        if (state.arrowWidget) {
            state.arrowWidget.setProperty(prop.MORE, { alpha: 255 });
        }
        if (state.dotWidget) {
            state.dotWidget.setProperty(prop.MORE, { alpha: 255 });
        }
    }

    function renderCompass() {
        // Compass ring (rotates with heading)
        state.ringWidget = trackWidget(
            container.createWidget(widget.IMG, {
                ...COMPASS_RING_STYLE,
                center_x: COMPASS_RING_STYLE.w / 2,
                center_y: COMPASS_RING_STYLE.h / 2,
                angle: 0,
            })
        );

        state.markerWidget = trackWidget(container.createWidget(widget.IMG, TOP_MARKER_STYLE));

        state.backingBounds = {
            x: KAABA_DOT_STYLE.x - 4, y: KAABA_DOT_STYLE.y - 4,
            w: KAABA_DOT_STYLE.w + 8, h: KAABA_DOT_STYLE.h + 8,
        };
        state.backingWidget = trackWidget(container.createWidget(widget.FILL_RECT, {
            ...state.backingBounds,
            radius: (KAABA_DOT_STYLE.w + 8) / 2, color: 0x000000,
        }));

        // Kaaba dot on compass edge
        state.dotWidget = trackWidget(
            container.createWidget(widget.IMG, {
                ...KAABA_DOT_STYLE,
                angle: 0,
            })
        );

        // Qibla arrow (rotates to point at Qibla)
        state.arrowWidget = trackWidget(
            container.createWidget(widget.IMG, {
                ...ARROW_STYLE,
                angle: 0,
            })
        );
        showCalibration();
    }

    function renderNoData() {
        trackWidget(
            container.createWidget(widget.TEXT, {
                ...QIBLA_NO_DATA_STYLE,
                text: t("qiblaNoData"),
            })
        );
    }

    // ── Public API ──

    return {
        /**
         * Build the qibla compass UI. If location is null, shows "no data" message.
         * Compass sensor is NOT started — call startCompass() separately.
         */
        build(location) {
            const bearing = location
                ? calculateQiblaBearing(location.latitude, location.longitude)
                : null;
            // Calibration text may need rebuilding after a language change.
            if (state.ringWidget && !state.calibrateWidget && bearing === state.qiblaBearing) return;

            clearUI();
            if (!location) {
                renderNoData();
                return;
            }

            state.qiblaBearing = bearing;
            renderCompass();

            try {
                state.vibrate = new Vibrator();
            } catch (e) {
                logger.error("Vibrate init error: " + e.message);
            }

        },

        startCompass,
        stopCompass,

        /** Full cleanup: stop sensor, remove all widgets */
        destroy() {
            stopCompass();
            if (state.vibrate) {
                state.vibrate.stop();
            }
            clearUI();
        },
    };
}
