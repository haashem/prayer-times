import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(60);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Islamic-Inspired Color Palette ──
export const COLORS = {
    title: 0xd4a843,       // Gold
    label: 0xa89880,       // Warm sandstone
    separator: 0x2a3a2a,   // Dark green separator
    currentName: 0xd4a843, // Gold
    currentTime: 0xffffff, // White
    currentBg: 0x0d4a2e,   // Deep emerald
    nextName: 0xe8dcc8,    // Warm ivory
    nextTime: 0xe8dcc8,    // Warm ivory
    noData: 0xa89880,      // Sandstone
};

// ── City Name ──
export const CITY_STYLE = {
    x: 0,
    y: px(70),
    w: DEVICE_WIDTH,
    h: px(44),
    text_size: px(36),
    color: COLORS.title,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
};

// ── Current Prayer Section ──
export const CURRENT_LABEL_STYLE = {
    x: 0,
    y: px(130),
    w: DEVICE_WIDTH,
    h: px(28),
    text_size: px(22),
    color: COLORS.label,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
};

export const CURRENT_BG_STYLE = {
    x: SIDE_PADDING - px(10),
    y: px(162),
    w: CONTENT_WIDTH + px(20),
    h: px(72),
    radius: px(16),
    color: COLORS.currentBg,
};

export const CURRENT_NAME_STYLE = {
    x: SIDE_PADDING + px(10),
    y: px(162),
    w: CONTENT_WIDTH / 2,
    h: px(72),
    text_size: px(36),
    color: COLORS.currentName,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
};

export const CURRENT_TIME_STYLE = {
    x: DEVICE_WIDTH / 2,
    y: px(162),
    w: DEVICE_WIDTH / 2 - SIDE_PADDING - px(10),
    h: px(72),
    text_size: px(36),
    color: COLORS.currentTime,
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
};

// ── Separator ──
export const SEPARATOR_STYLE = {
    x: SIDE_PADDING + px(20),
    y: px(252),
    w: CONTENT_WIDTH - px(40),
    h: px(1),
    color: COLORS.separator,
};

// ── Next Prayer Section ──
export const NEXT_LABEL_STYLE = {
    x: 0,
    y: px(268),
    w: DEVICE_WIDTH,
    h: px(28),
    text_size: px(22),
    color: COLORS.label,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
};

export const NEXT_NAME_STYLE = {
    x: SIDE_PADDING + px(10),
    y: px(300),
    w: CONTENT_WIDTH / 2,
    h: px(60),
    text_size: px(32),
    color: COLORS.nextName,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
};

export const NEXT_TIME_STYLE = {
    x: DEVICE_WIDTH / 2,
    y: px(300),
    w: DEVICE_WIDTH / 2 - SIDE_PADDING - px(10),
    h: px(60),
    text_size: px(32),
    color: COLORS.nextTime,
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
};

// ── No Data ──
export const NO_DATA_STYLE = {
    x: SIDE_PADDING,
    y: DEVICE_HEIGHT / 2 - px(30),
    w: CONTENT_WIDTH,
    h: px(60),
    text_size: px(28),
    color: COLORS.noData,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};
