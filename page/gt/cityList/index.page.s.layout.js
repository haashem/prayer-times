import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Zepp OS Design Guideline Colors ──
export const COLORS = {
    title: 0x4fc3f7,
    cityText: 0xe0e0e0,
    cityBg: 0x1a1a2e,
    activeBg: 0x1b5e20,
    activeText: 0x66bb6a,
    addBtn: 0x1b5e20,
    addBtnText: 0x66bb6a,
    emptyText: 0x999999,   // Raised for contrast ≥ 3:1
};

// Row height + 8px gap between items
export const CITY_ROW_HEIGHT = px(56);
export const CITY_ROW_GAP = px(8);
export const CITY_START_Y = px(56);
export const BOTTOM_PADDING = px(40);

// ── Title — Caption1 24px, line-height 30px, center-aligned ──
export const TITLE_STYLE = {
    x: 0,
    y: px(12),
    w: DEVICE_WIDTH,
    h: px(30),              // 24 × 1.25
    color: COLORS.title,
    text_size: px(24),      // Caption1
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "My Cities",
};

// ── Add City Button — Caption1 24px, capsule style ──
export const ADD_BTN_STYLE = {
    x: SIDE_PADDING,
    y: 0, // set dynamically
    w: CONTENT_WIDTH,
    h: px(44),
    radius: px(22),         // Capsule (h/2)
    normal_color: COLORS.addBtn,
    press_color: 0x134215,  // 28.6% dimmed
    text: "+ Add City",
    text_size: px(24),      // Caption1
    color: COLORS.addBtnText,
};

// ── City Row Background ──
export function getCityRowBgStyle(y, isActive) {
    return {
        x: SIDE_PADDING - px(4),
        y: y,
        w: CONTENT_WIDTH + px(8),
        h: CITY_ROW_HEIGHT - CITY_ROW_GAP,
        radius: px(10),
        color: isActive ? COLORS.activeBg : COLORS.cityBg,
    };
}

// ── City Row Text — Caption1 24px, left-aligned (square) ──
export function getCityTextStyle(y, isActive) {
    return {
        x: SIDE_PADDING + px(8),
        y: y,
        w: CONTENT_WIDTH - px(16),
        h: CITY_ROW_HEIGHT - CITY_ROW_GAP,
        color: isActive ? COLORS.activeText : COLORS.cityText,
        text_size: px(24),  // Caption1
        align_h: align.LEFT,   // Square: content left-aligned
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

// ── Empty State — Caption1 24px ──
export const EMPTY_STYLE = {
    x: SIDE_PADDING,
    y: DEVICE_HEIGHT / 2 - px(30),
    w: CONTENT_WIDTH,
    h: px(60),               // 24 × 1.25 × 2 lines
    color: COLORS.emptyText,
    text_size: px(24),       // Caption1
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "No cities yet.\nTap + to add one.",
};
