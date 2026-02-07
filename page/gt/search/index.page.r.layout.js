import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(60);
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

// ── Title — Subheadline 28px, line-height 35px, center-aligned (round) ──
export const TITLE_STYLE = {
    x: 0,
    y: px(24),
    w: DEVICE_WIDTH,
    h: px(50),              // 28 × 1.25
    color: COLORS.title,
    text_size: px(40),      // Title
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "Search City",
};

// ── Input Display — Caption1 24px, line-height 30px ──
export const INPUT_BG_STYLE = {
    x: SIDE_PADDING,
    y: px(80),
    w: CONTENT_WIDTH,
    h: px(52),
    radius: px(8),
    color: COLORS.inputBg,
};

export const INPUT_TEXT_STYLE = {
    x: SIDE_PADDING + px(10),
    y: px(80),
    w: CONTENT_WIDTH - px(20),
    h: px(52),
    color: COLORS.inputText,
    text_size: px(32),      // Body
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
export const KEY_SIZE = px(42);
export const KEY_GAP = px(4);
export const KEY_COLS = 10;  // Widest row
export const KEYBOARD_START_Y = px(114);
// Center the widest row (10 keys) on screen
export const KEYBOARD_START_X = (DEVICE_WIDTH - (KEY_SIZE * KEY_COLS + KEY_GAP * (KEY_COLS - 1))) / 2;

export function getKeyStyle(x, y, w) {
    return {
        x,
        y,
        w: w || KEY_SIZE,
        h: KEY_SIZE,
        radius: px(6),
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
        text_size: px(34),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
    };
}

// ── Action Buttons Row (below keyboard) ──
export const ACTION_ROW_Y = px(300);

// Backspace
export const BACKSPACE_STYLE = {
    x: KEYBOARD_START_X,
    y: ACTION_ROW_Y,
    w: px(110),
    h: px(48),
    radius: px(8),
    normal_color: COLORS.clearBtn,
    press_color: 0x351515,
    text: "DEL",
    text_size: px(30),
    color: COLORS.clearBtnText,
};

// Clear
export const CLEAR_STYLE = {
    x: KEYBOARD_START_X + px(118),
    y: ACTION_ROW_Y,
    w: px(90),
    h: px(48),
    radius: px(8),
    normal_color: COLORS.clearBtn,
    press_color: 0x351515,
    text: "CLR",
    text_size: px(30),
    color: COLORS.clearBtnText,
};

// Space
export const SPACE_STYLE = {
    x: KEYBOARD_START_X + px(216),
    y: ACTION_ROW_Y,
    w: DEVICE_WIDTH - KEYBOARD_START_X * 2 - px(216),
    h: px(48),
    radius: px(8),
    normal_color: COLORS.keyBg,
    press_color: 0x14261c,
    text: "SPACE",
    text_size: px(30),
    color: COLORS.keyText,
};

// ── Search Button — Subheadline 28px, capsule style ──
export const SEARCH_BTN_STYLE = {
    x: SIDE_PADDING,
    y: px(360),
    w: CONTENT_WIDTH,
    h: px(60),
    radius: px(30),
    normal_color: COLORS.searchBtn,
    press_color: 0x093620,
    text: "Search",
    text_size: px(36),
    color: COLORS.searchBtnText,
};

// ── Status — Caption1 24px ──
export const STATUS_STYLE = {
    x: SIDE_PADDING,
    y: px(432),
    w: CONTENT_WIDTH,
    h: px(70),
    color: COLORS.statusText,
    text_size: px(32),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "",
};

export const BOTTOM_PADDING = px(60);

// ── Result List — Body 32px rows, 8px gap ──
export const RESULT_ROW_HEIGHT = px(68);
export const RESULT_ROW_GAP = px(12);
export const RESULT_START_Y = px(432);

export function getResultRowBgStyle(y, index) {
    return {
        x: SIDE_PADDING,
        y: y,
        w: CONTENT_WIDTH,
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        radius: px(10),
        color: index % 2 === 0 ? 0x1a2a1a : 0x223322,
    };
}

export function getResultTextStyle(y) {
    return {
        x: SIDE_PADDING + px(12),
        y: y,
        w: CONTENT_WIDTH - px(24),
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        color: 0xe8dcc8,
        text_size: px(32),  // Body
        align_h: align.CENTER_H,  // Round: center-aligned
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}
