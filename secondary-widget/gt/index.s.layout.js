import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Color Palette (matches home page) ──
export const COLORS = {
    title: 0xd4a843,       // Gold — city name
    nextLabel: 0xa89880,   // Warm sandstone — "Next prayer"
    nextName: 0xe8dcc8,    // Warm ivory — prayer name
    nextTime: 0xffffff,    // White — large time
    cellBg: 0x2a4a2a,      // Dark green cell bg
    cellName: 0xa89880,    // Sandstone — cell prayer name
    cellTime: 0xe8dcc8,    // Warm ivory — cell time
    noData: 0xc75050,      // Error red
};

// ── City Header (pill) ──
const CITY_Y = px(16);
const CITY_H = px(46);
const CITY_FONT_SIZE = px(36);
const CITY_PAD_H = px(20);

export function getCityBgStyle(textLen) {
    const textW = Math.ceil(textLen * CITY_FONT_SIZE * 0.55);
    const pillW = textW + CITY_PAD_H * 2;
    return {
        x: (DEVICE_WIDTH - pillW) / 2,
        y: CITY_Y,
        w: pillW,
        h: CITY_H,
        radius: CITY_H / 2,
        color: COLORS.cellBg,
    };
}

export function getCityTextStyle(textLen) {
    const textW = Math.ceil(textLen * CITY_FONT_SIZE * 0.55);
    const pillW = textW + CITY_PAD_H * 2;
    return {
        x: (DEVICE_WIDTH - pillW) / 2,
        y: CITY_Y,
        w: pillW,
        h: CITY_H,
        text_size: CITY_FONT_SIZE,
        color: COLORS.title,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

// ── Next Prayer Section ──
export const NEXT_LABEL_STYLE = {
    x: 0,
    y: px(76),
    w: DEVICE_WIDTH,
    h: px(30),
    color: COLORS.nextLabel,
    text_size: px(24),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
};

export const NEXT_NAME_STYLE = {
    x: 0,
    y: px(104),
    w: DEVICE_WIDTH,
    h: px(46),
    color: COLORS.nextName,
    text_size: px(38),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
};

export const NEXT_TIME_STYLE = {
    x: 0,
    y: px(172),
    w: DEVICE_WIDTH,
    h: px(64),
    color: COLORS.nextTime,
    text_size: px(60),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
};

// ── Upcoming Prayer Cell ──
const CELL_Y = px(248);
const CELL_HEIGHT = px(60);
const CELL_RADIUS = px(12);

export function getCellBgStyle() {
    return {
        x: SIDE_PADDING - px(8),
        y: CELL_Y,
        w: CONTENT_WIDTH + px(16),
        h: CELL_HEIGHT,
        radius: CELL_RADIUS,
        color: COLORS.cellBg,
    };
}

export function getCellNameStyle() {
    return {
        x: SIDE_PADDING + px(6),
        y: CELL_Y,
        w: CONTENT_WIDTH / 2,
        h: CELL_HEIGHT,
        color: COLORS.cellName,
        text_size: px(28),
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

export function getCellTimeStyle() {
    return {
        x: DEVICE_WIDTH / 2,
        y: CELL_Y,
        w: DEVICE_WIDTH / 2 - SIDE_PADDING - px(6),
        h: CELL_HEIGHT,
        color: COLORS.cellTime,
        text_size: px(28),
        align_h: align.RIGHT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

// ── No Data ──
export const NO_DATA_STYLE = {
    x: SIDE_PADDING,
    y: DEVICE_HEIGHT / 2 - px(26),
    w: CONTENT_WIDTH,
    h: px(70),
    color: COLORS.noData,
    text_size: px(32),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};
