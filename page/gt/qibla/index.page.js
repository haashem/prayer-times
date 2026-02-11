import { createWidget, deleteWidget, widget, prop, event } from "@zos/ui";
import { back } from "@zos/router";
import { Compass } from "@zos/sensor";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    COLORS,
    COMPASS_RING_STYLE,
    ARROW_STYLE,
    KAABA_DOT_STYLE,
    DOT_ORBIT_RADIUS,
    DEGREE_STYLE,
    DIRECTION_STYLE,
    CALIBRATE_STYLE,
    NO_DATA_STYLE,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("qibla-finder");

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

Page({
    state: {
        compass: null,
        location: null,
        qiblaBearing: 0,
        uiWidgets: [],
        compassCallback: null,
        ringWidget: null,
        arrowWidget: null,
        dotWidget: null,
        degreeWidget: null,
        directionWidget: null,
        calibrateWidget: null,
        isCalibrated: false,
    },

    onInit() {
        logger.debug("qibla page onInit");
    },

    build() {
        logger.debug("qibla page build");

        // Load location
        try {
            const stored = localStorage.getItem("location");
            if (stored) {
                this.state.location = JSON.parse(stored);
            }
        } catch (e) {
            logger.error("Error loading location: " + e.message);
        }

        if (!this.state.location) {
            this.renderNoData();
            return;
        }

        // Calculate Qibla bearing from user's location
        this.state.qiblaBearing = this.calculateQiblaBearing(
            this.state.location.latitude,
            this.state.location.longitude
        );

        // Render UI
        this.renderCompass();

        // Start compass
        this.startCompass();
    },

    // ── Widget tracking ──

    trackWidget(w) {
        this.state.uiWidgets.push(w);
        return w;
    },

    clearUI() {
        for (const w of this.state.uiWidgets) {
            deleteWidget(w);
        }
        this.state.uiWidgets = [];
    },

    // ── Qibla bearing calculation ──

    calculateQiblaBearing(lat, lon) {
        const phi1 = (lat * Math.PI) / 180;
        const phi2 = (KAABA_LAT * Math.PI) / 180;
        const dLambda = ((KAABA_LON - lon) * Math.PI) / 180;

        const x = Math.sin(dLambda) * Math.cos(phi2);
        const y =
            Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

        let bearing = (Math.atan2(x, y) * 180) / Math.PI;
        return (bearing + 360) % 360;
    },

    // ── Compass ──

    startCompass() {
        try {
            this.state.compass = new Compass();
            this.state.compass.start();

            this.state.compassCallback = () => {
                this.updateCompass();
            };

            this.state.compass.onChange(this.state.compassCallback);
        } catch (e) {
            logger.error("Compass error: " + e.message);
        }
    },

    stopCompass() {
        if (this.state.compass) {
            if (this.state.compassCallback) {
                this.state.compass.offChange(this.state.compassCallback);
                this.state.compassCallback = null;
            }
            this.state.compass.stop();
            this.state.compass = null;
        }
    },

    updateCompass() {
        if (!this.state.compass) return;

        const calibrated = this.state.compass.getStatus();
        const angle = this.state.compass.getDirectionAngle();

        if (!calibrated || angle === "INVALID") {
            if (!this.state.calibrateWidget) {
                this.showCalibration();
            }
            return;
        }

        // Hide calibration message if it was showing
        if (this.state.calibrateWidget) {
            this.hideCalibration();
        }

        // The compass gives us the angle of 12-o'clock relative to north (clockwise)
        // To point the arrow toward Qibla:
        // arrowAngle = qiblaBearing - compassHeading
        const heading = typeof angle === "number" ? angle : 0;
        const arrowAngle = (this.state.qiblaBearing - heading + 360) % 360;

        // Rotate the ring opposite to heading (so N stays at top relative to real world)
        const ringAngle = (360 - heading) % 360;

        // Update arrow rotation
        if (this.state.arrowWidget) {
            this.state.arrowWidget.setProperty(prop.MORE, {
                angle: arrowAngle,
            });
        }

        // Update ring rotation
        if (this.state.ringWidget) {
            this.state.ringWidget.setProperty(prop.MORE, {
                angle: ringAngle,
            });
        }

        // Update kaaba dot position on compass edge
        if (this.state.dotWidget) {
            const dotAngleRad = (arrowAngle - 90) * (Math.PI / 180);
            const cx = DEVICE_WIDTH / 2 - KAABA_DOT_STYLE.w / 2;
            const cy = DEVICE_HEIGHT / 2 - KAABA_DOT_STYLE.h / 2;
            const dotX = cx + DOT_ORBIT_RADIUS * Math.cos(dotAngleRad);
            const dotY = cy + DOT_ORBIT_RADIUS * Math.sin(dotAngleRad);

            this.state.dotWidget.setProperty(prop.MORE, {
                x: Math.round(dotX),
                y: Math.round(dotY),
            });
        }

        // Update degree text
        if (this.state.degreeWidget) {
            this.state.degreeWidget.setProperty(prop.MORE, {
                text: `${Math.round(this.state.qiblaBearing)}°`,
            });
        }

        // Update direction label
        if (this.state.directionWidget) {
            this.state.directionWidget.setProperty(prop.MORE, {
                text: this.getDirectionLabel(this.state.qiblaBearing),
            });
        }
    },

    getDirectionLabel(bearing) {
        const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const index = Math.round(bearing / 45) % 8;
        return dirs[index];
    },

    // ── Render ──

    showCalibration() {
        // Hide compass elements
        if (this.state.ringWidget) {
            this.state.ringWidget.setProperty(prop.MORE, { alpha: 0 });
        }
        if (this.state.arrowWidget) {
            this.state.arrowWidget.setProperty(prop.MORE, { alpha: 0 });
        }
        if (this.state.dotWidget) {
            this.state.dotWidget.setProperty(prop.MORE, { alpha: 0 });
        }

        this.state.calibrateWidget = this.trackWidget(
            createWidget(widget.TEXT, {
                ...CALIBRATE_STYLE,
                text: "Rotate your wrist in a figure-8 to calibrate the compass",
            })
        );
    },

    hideCalibration() {
        if (this.state.calibrateWidget) {
            deleteWidget(this.state.calibrateWidget);
            this.state.calibrateWidget = null;
        }

        // Show compass elements
        if (this.state.ringWidget) {
            this.state.ringWidget.setProperty(prop.MORE, { alpha: 255 });
        }
        if (this.state.arrowWidget) {
            this.state.arrowWidget.setProperty(prop.MORE, { alpha: 255 });
        }
        if (this.state.dotWidget) {
            this.state.dotWidget.setProperty(prop.MORE, { alpha: 255 });
        }
    },

    renderCompass() {
        // Compass ring (rotates with heading)
        this.state.ringWidget = this.trackWidget(
            createWidget(widget.IMG, {
                ...COMPASS_RING_STYLE,
                center_x: COMPASS_RING_STYLE.w / 2,
                center_y: COMPASS_RING_STYLE.h / 2,
                angle: 0,
            })
        );

        // Kaaba dot on compass edge
        this.state.dotWidget = this.trackWidget(
            createWidget(widget.IMG, {
                ...KAABA_DOT_STYLE,
                angle: 0,
            })
        );

        // Qibla arrow (rotates to point at Qibla)
        this.state.arrowWidget = this.trackWidget(
            createWidget(widget.IMG, {
                ...ARROW_STYLE,
                angle: 0,
            })
        );

        // Degree text
        this.state.degreeWidget = this.trackWidget(
            createWidget(widget.TEXT, {
                ...DEGREE_STYLE,
                text: `${Math.round(this.state.qiblaBearing)}°`,
            })
        );

        // Direction label
        this.state.directionWidget = this.trackWidget(
            createWidget(widget.TEXT, {
                ...DIRECTION_STYLE,
                text: this.getDirectionLabel(this.state.qiblaBearing),
            })
        );
    },

    renderNoData() {
        this.trackWidget(
            createWidget(widget.TEXT, {
                ...NO_DATA_STYLE,
                text: "No location data.\nOpen the app first to detect your city.",
            })
        );
    },

    onDestroy() {
        this.stopCompass();
        this.clearUI();
        logger.debug("qibla page onDestroy");
    },
});
