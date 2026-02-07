import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Islamic-Inspired Color Palette ──
export const COLORS = {
    title: 0xd4a843,       // Gold
    cityText: 0xe8dcc8,    // Warm ivory
    cityBg: 0x1a2a1a,     // Dark green-tinted bg
    activeBg: 0x0d4a2e,   // Deep emerald
    activeText: 0xd4a843,  // Gold accent
    addBtn: 0x0d4a2e,     // Deep emerald
    addBtnText: 0xd4a843,  // Gold
    emptyText: 0xa89880,   // Warm sandstone
    deleteBg: 0x8b2e2e,   // Deep muted red
    deleteText: 0xffffff,
};

// Row height + 8px gap between items
export const CITY_ROW_HEIGHT = px(72);
export const CITY_ROW_GAP = px(12);
export const CITY_START_Y = px(68);
export const BOTTOM_PADDING = px(60);

// ── Title ──
export const TITLE_STYLE = {
    x: 0,
    y: px(14),
    w: DEVICE_WIDTH,
    h: px(46),              // 24 × 1.25
    color: COLORS.title,
    text_size: px(36),      // Title
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "My Cities",
};

// ── Add City Button — Caption1 24px, capsule style ──
export const ADD_BTN_STYLE = {
    x: SIDE_PADDING,
    y: 0, // set dynamically
    w: CONTENT_WIDTH,
    h: px(52),
    radius: px(26),         // Capsule (h/2)
    normal_color: COLORS.addBtn,
    press_color: 0x093620,  // Dimmed emerald
    text: "+ Add City",
    text_size: px(32),      // Body
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
        text_size: px(32),  // Body
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
    h: px(80),               // 32 × 1.25 × 2 lines
    color: COLORS.emptyText,
    text_size: px(32),       // Body
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "No cities yet.\nTap + to add one.",
};

// ── Delete Button (revealed on swipe left) ──
export const DELETE_BTN_WIDTH = px(72);

export function getDeleteBtnBgStyle(y) {
    return {
        x: DEVICE_WIDTH - SIDE_PADDING + px(4),  // Hidden off-screen right
        y: y,
        w: DELETE_BTN_WIDTH,
        h: CITY_ROW_HEIGHT - CITY_ROW_GAP,
        radius: px(10),
        color: COLORS.deleteBg,
    };
}

export function getDeleteBtnTextStyle(y) {
    return {
        x: DEVICE_WIDTH - SIDE_PADDING + px(4),
        y: y,
        w: DELETE_BTN_WIDTH,
        h: CITY_ROW_HEIGHT - CITY_ROW_GAP,
        color: COLORS.deleteText,
        text_size: px(32),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: "✕",
    };
}
