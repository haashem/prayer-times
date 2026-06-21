import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(20);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;
const TITLE_Y = px(24);
const TITLE_HEIGHT = px(58);
const ROW_HEIGHT = px(88);
const ROW_START_Y = (DEVICE_HEIGHT - ROW_HEIGHT) / 2;
const ROW_PAD_X = px(34);
const TOGGLE_W = px(80);
const TOGGLE_H = px(48);
const TOGGLE_SIDE_PAD = px(30);
const KNOB_RADIUS = px(18);
const KNOB_INSET = px(6);
const FOCUS_LINE_HEIGHT = px(18);

export const SCROLL_ITEM_HEIGHT = ROW_HEIGHT;
export const BOTTOM_PADDING = {
    y: ROW_START_Y + ROW_HEIGHT * 6,
    h: px(40),
};

export const TITLE_STYLE = {
    x: SIDE_PADDING,
    y: TITLE_Y,
    w: CONTENT_WIDTH,
    h: TITLE_HEIGHT,
    text_size: px(34),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

function getRowY(index) {
    return ROW_START_Y + index * ROW_HEIGHT;
}

function getToggleX(rtl) {
    return rtl ? TOGGLE_SIDE_PAD : DEVICE_WIDTH - TOGGLE_SIDE_PAD - TOGGLE_W;
}

export function getRowBgStyle(index) {
    return { x: 0, y: getRowY(index), w: DEVICE_WIDTH, h: ROW_HEIGHT, color: 0x000000 };
}

export function getRowTextStyle(index, rtl = false) {
    const toggleSpace = TOGGLE_SIDE_PAD + TOGGLE_W + px(18);
    return {
        x: rtl ? toggleSpace : ROW_PAD_X,
        y: getRowY(index),
        w: DEVICE_WIDTH - toggleSpace - ROW_PAD_X,
        h: ROW_HEIGHT,
        text_size: px(36),
        color: 0xffffff,
        align_h: rtl ? align.RIGHT : align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

export function getToggleTrackStyle(index, checked, rtl = false) {
    return {
        x: getToggleX(rtl),
        y: getRowY(index) + (ROW_HEIGHT - TOGGLE_H) / 2,
        w: TOGGLE_W,
        h: TOGGLE_H,
        radius: TOGGLE_H / 2,
        color: checked ? 0x078bd1 : 0x4a4a4d,
    };
}

export function getToggleKnobStyle(index, checked, rtl = false) {
    const trackX = getToggleX(rtl);
    const onAtRight = !rtl;
    const knobOnX = onAtRight
        ? trackX + TOGGLE_W - KNOB_INSET - KNOB_RADIUS
        : trackX + KNOB_INSET + KNOB_RADIUS;
    const knobOffX = onAtRight
        ? trackX + KNOB_INSET + KNOB_RADIUS
        : trackX + TOGGLE_W - KNOB_INSET - KNOB_RADIUS;
    return {
        center_x: checked ? knobOnX : knobOffX,
        center_y: getRowY(index) + ROW_HEIGHT / 2,
        radius: KNOB_RADIUS,
        color: 0xffffff,
    };
}

export function getFocusLineTopStyle(index) {
    return { x: px(20), y: getRowY(index), w: DEVICE_WIDTH - px(40), h: FOCUS_LINE_HEIGHT };
}

export function getFocusLineBottomStyle(index) {
    return {
        x: px(20),
        y: getRowY(index) + ROW_HEIGHT - FOCUS_LINE_HEIGHT,
        w: DEVICE_WIDTH - px(40),
        h: FOCUS_LINE_HEIGHT,
    };
}
