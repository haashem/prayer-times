import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(16);
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

// ── Title — Caption1 24px, line-height 30px, center-aligned ──
export const TITLE_STYLE = {
    x: 0,
    y: px(8),
    w: DEVICE_WIDTH,
    h: px(30),              // 24 × 1.25
    color: COLORS.title,
    text_size: px(24),      // Caption1
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "Search City",
};

// ── Input Display — Caption1 24px ──
export const INPUT_BG_STYLE = {
    x: SIDE_PADDING,
    y: px(44),
    w: CONTENT_WIDTH,
    h: px(36),
    radius: px(6),
    color: COLORS.inputBg,
};

export const INPUT_TEXT_STYLE = {
    x: SIDE_PADDING + px(8),
    y: px(44),
    w: CONTENT_WIDTH - px(16),
    h: px(36),
    color: COLORS.inputText,
    text_size: px(22),      // Slightly below Caption1 for fit
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
export const KEY_SIZE = px(35);
export const KEY_GAP = px(3);
export const KEY_COLS = 10;  // Widest row
export const KEYBOARD_START_Y = px(88);
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
        text_size: px(20),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
    };
}

// ── Action Buttons Row (below keyboard) ──
export const ACTION_ROW_Y = px(207);

// Backspace
export const BACKSPACE_STYLE = {
    x: KEYBOARD_START_X,
    y: ACTION_ROW_Y,
    w: px(84),
    h: px(35),
    radius: px(6),
    normal_color: COLORS.clearBtn,
    press_color: 0x431313,
    text: "DEL",
    text_size: px(18),
    color: COLORS.clearBtnText,
};

// Clear
export const CLEAR_STYLE = {
    x: KEYBOARD_START_X + px(90),
    y: ACTION_ROW_Y,
    w: px(68),
    h: px(35),
    radius: px(6),
    normal_color: COLORS.clearBtn,
    press_color: 0x431313,
    text: "CLR",
    text_size: px(18),
    color: COLORS.clearBtnText,
};

// Space
export const SPACE_STYLE = {
    x: KEYBOARD_START_X + px(164),
    y: ACTION_ROW_Y,
    w: DEVICE_WIDTH - KEYBOARD_START_X * 2 - px(164),
    h: px(35),
    radius: px(6),
    normal_color: COLORS.keyBg,
    press_color: 0x1e1e2d,
    text: "SPACE",
    text_size: px(18),
    color: COLORS.keyText,
};

// ── Search Button — Caption1 24px, capsule style ──
export const SEARCH_BTN_STYLE = {
    x: SIDE_PADDING,
    y: px(252),
    w: CONTENT_WIDTH,
    h: px(44),
    radius: px(22),
    normal_color: COLORS.searchBtn,
    press_color: 0x134215,
    text: "Search",
    text_size: px(24),
    color: COLORS.searchBtnText,
};

// ── Status — Caption1 24px ──
export const STATUS_STYLE = {
    x: SIDE_PADDING,
    y: px(304),
    w: CONTENT_WIDTH,
    h: px(50),
    color: COLORS.statusText,
    text_size: px(20),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "",
};

export const BOTTOM_PADDING = px(40);

// ── Result List — 8px gap between rows ──
export const RESULT_ROW_HEIGHT = px(48);
export const RESULT_ROW_GAP = px(8);
export const RESULT_START_Y = px(304);

export function getResultRowBgStyle(y, index) {
    return {
        x: SIDE_PADDING,
        y: y,
        w: CONTENT_WIDTH,
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        radius: px(8),
        color: index % 2 === 0 ? 0x1a1a2e : 0x222238,
    };
}

export function getResultTextStyle(y) {
    return {
        x: SIDE_PADDING + px(10),
        y: y,
        w: CONTENT_WIDTH - px(20),
        h: RESULT_ROW_HEIGHT - RESULT_ROW_GAP,
        color: 0xffffff,
        text_size: px(20),
        align_h: align.LEFT,   // Square: content left-aligned
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}