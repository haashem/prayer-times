import { createWidget, deleteWidget, widget, prop } from "@zos/ui";
import { Compass, Vibrator, VIBRATOR_SCENE_SHORT_MIDDLE } from "@zos/sensor";
import { log as Logger } from "@zos/utils";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    COMPASS_RING_STYLE,
    ARROW_STYLE,
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
        ringWidget: null,
        arrowWidget: null,
        dotWidget: null,
        calibrateWidget: null,
        facingQibla: false,
        lastVibrateTime: 0,
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
        if (state.compass) return; // Already running
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

        if (!calibrated || angle === "INVALID") {
            if (!state.calibrateWidget) {
                showCalibration();
            }
            return;
        }

        // Hide calibration message if it was showing
        if (state.calibrateWidget) {
            hideCalibration();
        }

        const heading = typeof angle === "number" ? angle : 0;
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

            state.dotWidget.setProperty(prop.MORE, {
                x: Math.round(dotX),
                y: Math.round(dotY),
            });
        }

        // Gentle vibration when facing Qibla (within ±5°)
        const diff = Math.abs(arrowAngle <= 180 ? arrowAngle : 360 - arrowAngle);
        const isFacing = diff < 5;

        if (isFacing && !state.facingQibla) {
            const now = Date.now();
            if (now - state.lastVibrateTime > 2000) {
                state.lastVibrateTime = now;
                if (state.vibrate) {
                    state.vibrate.stop();
                    state.vibrate.setMode(VIBRATOR_SCENE_SHORT_MIDDLE);
                    state.vibrate.start();
                }
            }
        }
        state.facingQibla = isFacing;
    }

    // ── Render ──

    function showCalibration() {
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
                text: "Rotate your wrist in a figure-8 to calibrate the compass",
            })
        );
    }

    function hideCalibration() {
        if (state.calibrateWidget) {
            deleteWidget(state.calibrateWidget);
            state.calibrateWidget = null;
        }

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
    }

    function renderNoData() {
        trackWidget(
            container.createWidget(widget.TEXT, {
                ...QIBLA_NO_DATA_STYLE,
                text: "No location data.\nOpen the app first to detect your city.",
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
            if (!location) {
                renderNoData();
                return;
            }

            state.qiblaBearing = calculateQiblaBearing(location.latitude, location.longitude);
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
