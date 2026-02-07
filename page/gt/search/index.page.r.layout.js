import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(60);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Zepp OS Design Guideline Colors ──
export const COLORS = {
    title: 0x4fc3f7,
    inputBg: 0x1a1a2e,
    inputText: 0xffffff,
    keyBg: 0x2a2a3e,
    keyText: 0xffffff,
    keyPressed: 0x4fc3f7,
    searchBtn: 0x1b5e20,
    searchBtnText: 0x66bb6a,
    clearBtn: 0x5e1b1b,
    clearBtnText: 0xff5252,
    statusText: 0x999999,   // Raised for contrast ≥ 3:1
    errorText: 0xff5252,
    successText: 0x66bb6a,
};

// ── Title — Subheadline 28px, line-height 35px, center-aligned (round) ──
export const TITLE_STYLE = {
    x: 0,
    y: px(20),
    w: DEVICE_WIDTH,
    h: px(35),              // 28 × 1.25
    color: COLORS.title,
    text_size: px(28),      // Subheadline
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "Search City",
};

// ── Input Display — Caption1 24px, line-height 30px ──
export const INPUT_BG_STYLE = {
    x: SIDE_PADDING,
    y: px(62),
    w: CONTENT_WIDTH,
    h: px(42),
    radius: px(8),
    color: COLORS.inputBg,
};

export const INPUT_TEXT_STYLE = {
    x: SIDE_PADDING + px(10),
    y: px(62),
    w: CONTENT_WIDTH - px(20),
    h: px(42),
    color: COLORS.inputText,
    text_size: px(24),      // Caption1
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
    text: "",
};

// ── Keyboard Grid ──
export const KEY_SIZE = px(40);
export const KEY_GAP = px(4);
export const KEY_COLS = 7;
export const KEYBOARD_START_X = (DEVICE_WIDTH - (KEY_SIZE * KEY_COLS + KEY_GAP * (KEY_COLS - 1))) / 2;
export const KEYBOARD_START_Y = px(114);

export function getKeyStyle(x, y) {
    return {
        x,
        y,
        w: KEY_SIZE,
        h: KEY_SIZE,
        radius: px(6),
        color: COLORS.keyBg,
    };
}

export function getKeyTextStyle(x, y) {
    return {
        x,
        y,
        w: KEY_SIZE,
        h: KEY_SIZE,
        color: COLORS.keyText,
        text_size: px(24),  // Caption1 — raised from 22
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
    };
}

// ── Action Buttons Row ──
export const ACTION_ROW_Y = px(300);

// Backspace — Caption1 24px, pressed = ~28.6% dim
export const BACKSPACE_STYLE = {
    x: SIDE_PADDING,
    y: ACTION_ROW_Y,
    w: px(100),
    h: px(44),              // 24 × 1.25 + padding
    radius: px(8),
    normal_color: COLORS.clearBtn,
    press_color: 0x431313,  // 28.6% dimmed
    text: "DEL",
    text_size: px(24),      // Caption1
    color: COLORS.clearBtnText,
};

// Clear
export const CLEAR_STYLE = {
    x: SIDE_PADDING + px(110),
    y: ACTION_ROW_Y,
    w: px(80),
    h: px(44),
    radius: px(8),
    normal_color: COLORS.clearBtn,
    press_color: 0x431313,
    text: "CLR",
    text_size: px(24),      // Caption1
    color: COLORS.clearBtnText,
};

// Space
export const SPACE_STYLE = {
    x: SIDE_PADDING + px(200),
    y: ACTION_ROW_Y,
    w: CONTENT_WIDTH - px(200),
    h: px(44),
    radius: px(8),
    normal_color: COLORS.keyBg,
    press_color: 0x1e1e2d,  // 28.6% dimmed from 0x2a2a3e
    text: "SPACE",
    text_size: px(24),      // Caption1
    color: COLORS.keyText,
};

// ── Search Button — Subheadline 28px, capsule style ──
export const SEARCH_BTN_STYLE = {
    x: SIDE_PADDING,
    y: px(354),
    w: CONTENT_WIDTH,
    h: px(52),              // 28 × 1.25 + padding
    radius: px(26),         // Capsule (h/2)
    normal_color: COLORS.searchBtn,
    press_color: 0x134215,  // 28.6% dimmed
    text: "Search",
    text_size: px(28),      // Subheadline
    color: COLORS.searchBtnText,
};

// ── Status — Caption1 24px ──
export const STATUS_STYLE = {
    x: SIDE_PADDING,
    y: px(416),
    w: CONTENT_WIDTH,
    h: px(60),
    color: COLORS.statusText,
    text_size: px(24),      // Caption1
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "",
};

export const BOTTOM_PADDING = px(60);

// ── Result List — Body 32px rows, 8px gap ──
export const RESULT_ROW_HEIGHT = px(56);
export const RESULT_ROW_GAP = px(8);
export const RESULT_START_Y = px(416);

export function getResultRowBgStyle(y, index) {
    return {
        x: SIDE_PADDING,
        y: y,
        w: CONTENT_WIDTH,
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        radius: px(10),
        color: index % 2 === 0 ? 0x1a1a2e : 0x222238,
    };
}

export function getResultTextStyle(y) {
    return {
        x: SIDE_PADDING + px(12),
        y: y,
        w: CONTENT_WIDTH - px(24),
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        color: 0xffffff,
        text_size: px(24),  // Caption1
        align_h: align.CENTER_H,  // Round: center-aligned
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}
