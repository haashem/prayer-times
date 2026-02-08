import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(24);
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
    y: px(30),
    w: DEVICE_WIDTH,
    h: px(38),
    text_size: px(32),
    color: COLORS.title,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
};

// ── Current Prayer Section ──
export const CURRENT_LABEL_STYLE = {
    x: 0,
    y: px(80),
    w: DEVICE_WIDTH,
    h: px(26),
    text_size: px(20),
    color: COLORS.label,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
};

export const CURRENT_BG_STYLE = {
    x: SIDE_PADDING - px(6),
    y: px(110),
    w: CONTENT_WIDTH + px(12),
    h: px(62),
    radius: px(12),
    color: COLORS.currentBg,
};

export const CURRENT_NAME_STYLE = {
    x: SIDE_PADDING + px(10),
    y: px(110),
    w: CONTENT_WIDTH / 2,
    h: px(62),
    text_size: px(32),
    color: COLORS.currentName,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
};

export const CURRENT_TIME_STYLE = {
    x: DEVICE_WIDTH / 2,
    y: px(110),
    w: DEVICE_WIDTH / 2 - SIDE_PADDING - px(10),
    h: px(62),
    text_size: px(32),
    color: COLORS.currentTime,
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
};

// ── Separator ──
export const SEPARATOR_STYLE = {
    x: SIDE_PADDING + px(10),
    y: px(188),
    w: CONTENT_WIDTH - px(20),
    h: px(1),
    color: COLORS.separator,
};

// ── Next Prayer Section ──
export const NEXT_LABEL_STYLE = {
    x: 0,
    y: px(200),
    w: DEVICE_WIDTH,
    h: px(26),
    text_size: px(20),
    color: COLORS.label,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
};

export const NEXT_NAME_STYLE = {
    x: SIDE_PADDING + px(10),
    y: px(230),
    w: CONTENT_WIDTH / 2,
    h: px(52),
    text_size: px(28),
    color: COLORS.nextName,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
};

export const NEXT_TIME_STYLE = {
    x: DEVICE_WIDTH / 2,
    y: px(230),
    w: DEVICE_WIDTH / 2 - SIDE_PADDING - px(10),
    h: px(52),
    text_size: px(28),
    color: COLORS.nextTime,
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
};

// ── No Data ──
export const NO_DATA_STYLE = {
    x: SIDE_PADDING,
    y: DEVICE_HEIGHT / 2 - px(26),
    w: CONTENT_WIDTH,
    h: px(52),
    text_size: px(24),
    color: COLORS.noData,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};
