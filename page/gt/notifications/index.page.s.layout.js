import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(20);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;
const TITLE_Y = px(24);
const TITLE_HEIGHT = px(58);
const ROW_HEIGHT = px(88);
const ROW_START_Y = TITLE_Y + TITLE_HEIGHT + px(40);
const ROW_PAD_X = px(34);
const INFO_OUTER_PAD_X = px(22);
const INFO_TOP_GAP = px(18);
const INFO_HEIGHT = px(260);
const TOGGLE_W = px(80);
const TOGGLE_H = px(48);
const TOGGLE_SIDE_PAD = px(30);
const KNOB_RADIUS = px(18);
const KNOB_INSET = px(6);
const FOCUS_LINE_HEIGHT = px(18);

export const SCROLL_ITEM_HEIGHT = ROW_HEIGHT;

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

export function getRowHeight(index) {
    return ROW_HEIGHT;
}

export function getRowY(index) {
    let y = ROW_START_Y;
    for (let i = 0; i < index; i++) {
        y += getRowHeight(i);
    }
    return y;
}

export function getScrollYForIndex(index) {
    if (index === 0) return 0;
    const rowCenterY = getRowY(index) + getRowHeight(index) / 2;
    return Math.min(0, DEVICE_HEIGHT / 2 - rowCenterY);
}

function getToggleX(rtl) {
    return rtl ? TOGGLE_SIDE_PAD : DEVICE_WIDTH - TOGGLE_SIDE_PAD - TOGGLE_W;
}

export function getRowBgStyle(index) {
    return { x: 0, y: getRowY(index), w: DEVICE_WIDTH, h: getRowHeight(index), color: 0x000000 };
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
        y: getRowY(index) + getRowHeight(index) - FOCUS_LINE_HEIGHT,
        w: DEVICE_WIDTH - px(40),
        h: FOCUS_LINE_HEIGHT,
    };
}

export function getInfoTextStyle(index, rtl = false) {
    const x = rtl ? INFO_OUTER_PAD_X : ROW_PAD_X;
    const endPad = rtl ? ROW_PAD_X : INFO_OUTER_PAD_X;
    return {
        x,
        y: getRowY(index) + INFO_TOP_GAP,
        w: DEVICE_WIDTH - x - endPad,
        h: INFO_HEIGHT,
        text_size: px(28),
        color: 0xa6a6a6,
        align_h: rtl ? align.RIGHT : align.LEFT,
        align_v: align.TOP,
        text_style: text_style.WRAP,
    };
}

export function getBottomPaddingStyle(rowCount) {
    return {
        y: getRowY(rowCount) + INFO_TOP_GAP + INFO_HEIGHT,
        h: DEVICE_HEIGHT / 2,
    };
}
