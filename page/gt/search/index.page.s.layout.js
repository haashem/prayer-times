import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(16);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Islamic-Inspired Color Palette ──
export const COLORS = {
    title: 0xd4a843,        // Gold
    inputBg: 0x1a2a1a,      // Dark green-tinted bg
    inputText: 0xe8dcc8,    // Warm ivory
    keyBg: 0x1e3328,        // Deep forest green
    keyText: 0xe8dcc8,      // Warm ivory
    keyPressed: 0xd4a843,   // Gold highlight
    searchBtn: 0x0d4a2e,    // Deep emerald
    searchBtnText: 0xd4a843,// Gold
    clearBtn: 0x4a2020,     // Dark muted red
    clearBtnText: 0xc75050, // Muted red
    statusText: 0xa89880,   // Warm sandstone
    errorText: 0xc75050,    // Muted red
    successText: 0x5dba6a,  // Soft green
};

// ── Title — Caption1 24px, line-height 30px, center-aligned ──
export const TITLE_STYLE = {
    x: 0,
    y: px(12),
    w: DEVICE_WIDTH,
    h: px(46),              // 24 × 1.25
    color: COLORS.title,
    text_size: px(36),      // Title
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "Search City",
};

// ── Input Display — Caption1 24px ──
export const INPUT_BG_STYLE = {
    x: SIDE_PADDING,
    y: px(62),
    w: CONTENT_WIDTH,
    h: px(46),
    radius: px(6),
    color: COLORS.inputBg,
};

export const INPUT_TEXT_STYLE = {
    x: SIDE_PADDING + px(8),
    y: px(62),
    w: CONTENT_WIDTH - px(16),
    h: px(46),
    color: COLORS.inputText,
    text_size: px(30),      // Body
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
    text: "",
};

// ── QWERTY Keyboard ──
export const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
];
export const KEY_SIZE = px(38);
export const KEY_GAP = px(4);
export const KEY_COLS = 10;  // Widest row
export const KEYBOARD_START_Y = px(116);
export const KEYBOARD_START_X = (DEVICE_WIDTH - (KEY_SIZE * KEY_COLS + KEY_GAP * (KEY_COLS - 1))) / 2;

export function getKeyStyle(x, y, w) {
    return {
        x,
        y,
        w: w || KEY_SIZE,
        h: KEY_SIZE,
        radius: px(5),
        color: COLORS.keyBg,
    };
}

export function getKeyTextStyle(x, y, w) {
    return {
        x,
        y,
        w: w || KEY_SIZE,
        h: KEY_SIZE,
        color: COLORS.keyText,
        text_size: px(26),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
    };
}

// ── Action Buttons Row (below keyboard) ──
export const ACTION_ROW_Y = px(246);

// Backspace
export const BACKSPACE_STYLE = {
    x: KEYBOARD_START_X,
    y: ACTION_ROW_Y,
    w: px(94),
    h: px(42),
    radius: px(6),
    normal_color: COLORS.clearBtn,
    press_color: 0x351515,
    text: "DEL",
    text_size: px(26),
    color: COLORS.clearBtnText,
};

// Clear
export const CLEAR_STYLE = {
    x: KEYBOARD_START_X + px(100),
    y: ACTION_ROW_Y,
    w: px(76),
    h: px(42),
    radius: px(6),
    normal_color: COLORS.clearBtn,
    press_color: 0x351515,
    text: "CLR",
    text_size: px(26),
    color: COLORS.clearBtnText,
};

// Space
export const SPACE_STYLE = {
    x: KEYBOARD_START_X + px(182),
    y: ACTION_ROW_Y,
    w: DEVICE_WIDTH - KEYBOARD_START_X * 2 - px(182),
    h: px(42),
    radius: px(6),
    normal_color: COLORS.keyBg,
    press_color: 0x14261c,
    text: "SPACE",
    text_size: px(26),
    color: COLORS.keyText,
};

// ── Search Button — Caption1 24px, capsule style ──
export const SEARCH_BTN_STYLE = {
    x: SIDE_PADDING,
    y: px(300),
    w: CONTENT_WIDTH,
    h: px(52),
    radius: px(26),
    normal_color: COLORS.searchBtn,
    press_color: 0x093620,
    text: "Search",
    text_size: px(32),
    color: COLORS.searchBtnText,
};

// ── Status — Caption1 24px ──
export const STATUS_STYLE = {
    x: SIDE_PADDING,
    y: px(364),
    w: CONTENT_WIDTH,
    h: px(60),
    color: COLORS.statusText,
    text_size: px(28),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "",
};

export const BOTTOM_PADDING = px(40);

// ── Result List — 8px gap between rows ──
export const RESULT_ROW_HEIGHT = px(60);
export const RESULT_ROW_GAP = px(12);
export const RESULT_START_Y = px(364);

export function getResultRowBgStyle(y, index) {
    return {
        x: SIDE_PADDING,
        y: y,
        w: CONTENT_WIDTH,
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        radius: px(8),
        color: index % 2 === 0 ? 0x1a2a1a : 0x223322,
    };
}

export function getResultTextStyle(y) {
    return {
        x: SIDE_PADDING + px(10),
        y: y,
        w: CONTENT_WIDTH - px(20),
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        color: 0xe8dcc8,
        text_size: px(28),
        align_h: align.LEFT,   // Square: content left-aligned
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}