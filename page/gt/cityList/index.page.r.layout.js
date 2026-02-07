import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(60);
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
    emptyText: 0x999999,   // Raised from 0x888888 for contrast ≥ 3:1
};

// Row height + 8px gap between items
export const CITY_ROW_HEIGHT = px(64);
export const CITY_ROW_GAP = px(8);
export const CITY_START_Y = px(80);
export const BOTTOM_PADDING = px(80);

// ── Title — Subheadline 28px, line-height 35px, center-aligned (round) ──
export const TITLE_STYLE = {
    x: 0,
    y: px(24),
    w: DEVICE_WIDTH,
    h: px(35),              // 28 × 1.25
    color: COLORS.title,
    text_size: px(28),      // Subheadline
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "My Cities",
};

// ── Add City Button — Subheadline 28px, capsule style ──
export const ADD_BTN_STYLE = {
    x: SIDE_PADDING,
    y: 0, // set dynamically
    w: CONTENT_WIDTH,
    h: px(52),
    radius: px(26),         // Capsule (h/2)
    normal_color: COLORS.addBtn,
    press_color: 0x134215,  // 28.6% dimmed
    text: "+ Add City",
    text_size: px(28),      // Subheadline
    color: COLORS.addBtnText,
};

// ── City Row Background ──
export function getCityRowBgStyle(y, isActive) {
    return {
        x: SIDE_PADDING - px(6),
        y: y,
        w: CONTENT_WIDTH + px(12),
        h: CITY_ROW_HEIGHT - CITY_ROW_GAP,
        radius: px(12),
        color: isActive ? COLORS.activeBg : COLORS.cityBg,
    };
}

// ── City Row Text — Subheadline 28px, center-aligned (round) ──
export function getCityTextStyle(y, isActive) {
    return {
        x: SIDE_PADDING + px(10),
        y: y,
        w: CONTENT_WIDTH - px(20),
        h: CITY_ROW_HEIGHT - CITY_ROW_GAP,
        color: isActive ? COLORS.activeText : COLORS.cityText,
        text_size: px(28),  // Subheadline
        align_h: align.CENTER_H,  // Round: center-aligned
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

// ── Empty State — Subheadline 28px ──
export const EMPTY_STYLE = {
    x: SIDE_PADDING,
    y: DEVICE_HEIGHT / 2 - px(35),
    w: CONTENT_WIDTH,
    h: px(70),               // 28 × 1.25 × 2 lines
    color: COLORS.emptyText,
    text_size: px(28),       // Subheadline
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "No cities yet.\nTap + to add one.",
};
