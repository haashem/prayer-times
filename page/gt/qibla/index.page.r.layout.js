import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// ── Color Palette (matches home page) ──
export const COLORS = {
    background: 0x000000,
    noData: 0xc75050,      // Error
    calibrate: 0xd4a843,   // Gold accent
};

// ── Compass Ring (full-screen background) ──
const RING_SIZE = px(460);
export const COMPASS_RING_STYLE = {
    x: (DEVICE_WIDTH - RING_SIZE) / 2,
    y: (DEVICE_HEIGHT - RING_SIZE) / 2,
    w: RING_SIZE,
    h: RING_SIZE,
    src: "image/compass_ring.png",
};

// ── Qibla Arrow (rotates) ──
const ARROW_SIZE = px(100);
export const ARROW_STYLE = {
    x: (DEVICE_WIDTH - ARROW_SIZE) / 2,
    y: (DEVICE_HEIGHT - ARROW_SIZE) / 2,
    w: ARROW_SIZE,
    h: ARROW_SIZE,
    center_x: ARROW_SIZE / 2,
    center_y: ARROW_SIZE / 2,
    src: "image/qibla_arrow.png",
};

// ── Kaaba Dot (placed on compass edge, rotates) ──
const DOT_SIZE = px(28);
export const KAABA_DOT_STYLE = {
    x: (DEVICE_WIDTH - DOT_SIZE) / 2,
    y: (DEVICE_HEIGHT - DOT_SIZE) / 2,
    w: DOT_SIZE,
    h: DOT_SIZE,
    center_x: DOT_SIZE / 2,
    center_y: DOT_SIZE / 2,
    src: "image/kaaba_dot.png",
};

// Radius at which kaaba dot orbits
export const DOT_ORBIT_RADIUS = px(195);

// ── Calibration Message ──
export const CALIBRATE_STYLE = {
    x: px(40),
    y: DEVICE_HEIGHT / 2 - px(40),
    w: DEVICE_WIDTH - px(80),
    h: px(80),
    color: COLORS.calibrate,
    text_size: px(28),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};

// ── No Data ──
export const NO_DATA_STYLE = {
    x: px(60),
    y: DEVICE_HEIGHT / 2 - px(35),
    w: DEVICE_WIDTH - px(120),
    h: px(90),
    color: COLORS.noData,
    text_size: px(30),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};
