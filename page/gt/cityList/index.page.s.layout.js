import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

export const COLORS = {
    title: 0x4fc3f7,
    cityText: 0xe0e0e0,
    cityBg: 0x1a1a2e,
    activeBg: 0x1b5e20,
    activeText: 0x66bb6a,
    addBtn: 0x1b5e20,
    addBtnText: 0x66bb6a,
    emptyText: 0x888888,
};

export const CITY_ROW_HEIGHT = px(58);
export const CITY_START_Y = px(60);
export const BOTTOM_PADDING = px(40);

// Title
export const TITLE_STYLE = {
    x: 0,
    y: px(12),
    w: DEVICE_WIDTH,
    h: px(36),
    color: COLORS.title,
    text_size: px(24),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text: "My Cities",
};

// Add city button
export const ADD_BTN_STYLE = {
    x: SIDE_PADDING,
    y: 0, // set dynamically
    w: CONTENT_WIDTH,
    h: px(46),
    radius: px(10),
    normal_color: COLORS.addBtn,
    press_color: 0x2e7d32,
    text: "+ Add City",
    text_size: px(20),
    color: COLORS.addBtnText,
};

// City row background
export function getCityRowBgStyle(y, isActive) {
    return {
        x: SIDE_PADDING - px(4),
        y: y,
        w: CONTENT_WIDTH + px(8),
        h: CITY_ROW_HEIGHT - px(6),
        radius: px(10),
        color: isActive ? COLORS.activeBg : COLORS.cityBg,
    };
}

// City row text
export function getCityTextStyle(y, isActive) {
    return {
        x: SIDE_PADDING + px(8),
        y: y,
        w: CONTENT_WIDTH - px(16),
        h: CITY_ROW_HEIGHT - px(6),
        color: isActive ? COLORS.activeText : COLORS.cityText,
        text_size: px(22),
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

// Empty state
export const EMPTY_STYLE = {
    x: px(24),
    y: DEVICE_HEIGHT / 2 - px(30),
    w: DEVICE_WIDTH - px(48),
    h: px(60),
    color: COLORS.emptyText,
    text_size: px(20),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: "No cities yet.\nTap + to add one.",
};
