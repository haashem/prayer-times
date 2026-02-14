import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Color Palette (matches home page) ──
export const COLORS = {
    title: 0xd4a843,       // Gold — city name
    subtitle: 0xa89880,    // Warm sandstone — secondary text
    nextLabel: 0xa89880,   // Warm sandstone — "Next prayer"
    nextName: 0xe8dcc8,    // Warm ivory — prayer name
    nextTime: 0xffffff,    // White — large time
    cellBg: 0x2a4a2a,      // Dark green cell bg
    cellBgPressed: 0x3a6a3a, // Active cell bg
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
        text_style: text_style.NONE,
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

// ── Prayer Grid ──
export const GRID_START_X = SIDE_PADDING;
export const GRID_START_Y = px(84);
export const GRID_COL_GAP = px(8);
export const GRID_ROW_GAP = px(10);
export const GRID_CELL_W = (CONTENT_WIDTH - GRID_COL_GAP) / 2;
export const GRID_CELL_H = px(76);
const GRID_RADIUS = px(12);

export function getPrayerCellBgStyle(x, y, isActive) {
    return {
        x,
        y,
        w: GRID_CELL_W,
        h: GRID_CELL_H,
        radius: GRID_RADIUS,
        color: isActive ? COLORS.cellBgPressed : 0x000000,
    };
}

export function getPrayerLabelStyle(x, y, isActive) {
    return {
        x,
        y,
        w: GRID_CELL_W,
        h: GRID_CELL_H / 2,
        color: isActive ? COLORS.title : COLORS.subtitle,
        text_size: px(24),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

export function getPrayerTimeStyle(x, y, isActive) {
    return {
        x,
        y: y + GRID_CELL_H / 2,
        w: GRID_CELL_W,
        h: GRID_CELL_H / 2,
        color: isActive ? COLORS.nextTime : COLORS.subtitle,
        text_size: px(32),
        align_h: align.CENTER_H,
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
