import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH } = getDeviceInfo();

const SIDE_PADDING = px(48);
const TITLE_Y = px(44);
const TITLE_HEIGHT = px(64);
const ROW_START_Y = px(158);
const ROW_HEIGHT = px(104);
const ROW_PAD_X = px(76);
const RADIO_SIZE = px(64);
const RADIO_PAD = px(70);
const FOCUS_LINE_HEIGHT = px(22);

export const SCROLL_ITEM_HEIGHT = ROW_HEIGHT;

export const TITLE_STYLE = {
    x: SIDE_PADDING,
    y: TITLE_Y,
    w: DEVICE_WIDTH - SIDE_PADDING * 2,
    h: TITLE_HEIGHT,
    text_size: px(40),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const LOADING_STYLE = {
    x: SIDE_PADDING,
    y: ROW_START_Y,
    w: DEVICE_WIDTH - SIDE_PADDING * 2,
    h: ROW_HEIGHT,
    text_size: px(30),
    color: 0x999999,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};

function rowY(index) {
    return ROW_START_Y + index * ROW_HEIGHT;
}

export function getRowBgStyle(index) {
    return { x: 0, y: rowY(index), w: DEVICE_WIDTH, h: ROW_HEIGHT, color: 0x000000 };
}

export function getRowTextStyle(index, rtl) {
    const x = rtl ? RADIO_PAD + RADIO_SIZE + px(16) : ROW_PAD_X;
    return {
        x,
        y: rowY(index),
        w: DEVICE_WIDTH - x - ROW_PAD_X - (rtl ? 0 : RADIO_PAD + RADIO_SIZE),
        h: ROW_HEIGHT,
        text_size: px(40),
        color: 0xffffff,
        align_h: rtl ? align.RIGHT : align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
    };
}

export function getRowHitStyle(index, rtl) {
    return {
        x: rtl ? RADIO_PAD + RADIO_SIZE : 0,
        y: rowY(index),
        w: DEVICE_WIDTH - RADIO_PAD - RADIO_SIZE,
        h: ROW_HEIGHT,
        color: 0x000000,
        alpha: 0,
    };
}

export function getRadioGroupStyle(count, rtl) {
    return {
        x: rtl ? RADIO_PAD : DEVICE_WIDTH - RADIO_PAD - RADIO_SIZE,
        y: ROW_START_Y,
        w: RADIO_SIZE,
        h: count * ROW_HEIGHT,
    };
}

export function getStateButtonStyle(index) {
    return {
        x: 0,
        y: index * ROW_HEIGHT + (ROW_HEIGHT - RADIO_SIZE) / 2,
        w: RADIO_SIZE,
        h: RADIO_SIZE,
    };
}

export function getFocusLineTopStyle(index) {
    return { x: px(24), y: rowY(index), w: DEVICE_WIDTH - px(48), h: FOCUS_LINE_HEIGHT };
}

export function getFocusLineBottomStyle(index) {
    return {
        x: px(24),
        y: rowY(index) + ROW_HEIGHT - FOCUS_LINE_HEIGHT,
        w: DEVICE_WIDTH - px(48),
        h: FOCUS_LINE_HEIGHT,
    };
}

export function getFooterStyle(count, rtl) {
    return {
        x: SIDE_PADDING,
        y: ROW_START_Y + count * ROW_HEIGHT + px(24),
        w: DEVICE_WIDTH - SIDE_PADDING * 2,
        h: px(90),
        text_size: px(30),
        color: 0x999999,
        align_h: rtl ? align.RIGHT : align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.WRAP,
    };
}

export function getBottomPaddingStyle(count) {
    return {
        x: 0,
        y: ROW_START_Y + count * ROW_HEIGHT + px(114),
        w: 1,
        h: px(80),
        color: 0x000000,
        alpha: 0,
    };
}
