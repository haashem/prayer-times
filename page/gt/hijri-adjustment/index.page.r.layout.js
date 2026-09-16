import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH } = getDeviceInfo();

const SIDE_PADDING = px(48);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

const COLORS = {
    rowBg: 0x000000,
    text: 0xffffff,
};

const TITLE_Y = px(44);
const TITLE_HEIGHT = px(64);
const ROW_START_Y = px(184);
const ROW_HEIGHT = px(104);
const ROW_PAD_X = px(76);
const RADIO_SIZE = px(64);
const RADIO_SIDE_PADDING = px(70);
const FOCUS_LINE_HEIGHT = px(22);
const INFO_OUTER_PAD_X = px(48);

export const HIJRI_OPTIONS = [
    { value: -2, labelKey: "hijriMinusTwo" },
    { value: -1, labelKey: "hijriMinusOne" },
    { value: 0, labelKey: "hijriNoAdjustment" },
    { value: 1, labelKey: "hijriPlusOne" },
    { value: 2, labelKey: "hijriPlusTwo" },
];

const INFO_Y = ROW_START_Y + HIJRI_OPTIONS.length * ROW_HEIGHT + px(12);
const INFO_HEIGHT = px(280);
const BOTTOM_PADDING_Y = INFO_Y + INFO_HEIGHT;
export const SCROLL_ITEM_HEIGHT = ROW_HEIGHT;
export const SCROLL_ITEM_COUNT = HIJRI_OPTIONS.length + 2;

export const TITLE_STYLE = {
    x: SIDE_PADDING,
    y: TITLE_Y,
    w: CONTENT_WIDTH,
    h: TITLE_HEIGHT,
    text_size: px(40),
    color: COLORS.text,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const PREVIEW_STYLE = {
    ...TITLE_STYLE,
    y: TITLE_Y + TITLE_HEIGHT,
    h: px(40),
    text_size: px(28),
    color: 0xd4a843,
};

export function getTitleStyle() {
    return {
        ...TITLE_STYLE,
        x: ROW_PAD_X,
        w: DEVICE_WIDTH - ROW_PAD_X * 2,
    };
}

export function getRadioGroupStyle(rtl = false) {
    return {
        x: rtl ? RADIO_SIDE_PADDING : DEVICE_WIDTH - RADIO_SIDE_PADDING - RADIO_SIZE,
        y: ROW_START_Y,
        w: RADIO_SIZE,
        h: HIJRI_OPTIONS.length * ROW_HEIGHT,
    };
}

function getRowY(index) {
    return ROW_START_Y + index * ROW_HEIGHT;
}

export function getHijriRowBgStyle(index) {
    return {
        x: 0,
        y: getRowY(index),
        w: DEVICE_WIDTH,
        h: ROW_HEIGHT,
        color: COLORS.rowBg,
    };
}

export function getHijriRowTextStyle(index, rtl = false) {
    return {
        x: rtl ? RADIO_SIDE_PADDING + RADIO_SIZE + px(16) : ROW_PAD_X,
        y: getRowY(index),
        w: DEVICE_WIDTH - ROW_PAD_X - RADIO_SIDE_PADDING - RADIO_SIZE - px(16),
        h: ROW_HEIGHT,
        text_size: px(40),
        color: COLORS.text,
        align_h: rtl ? align.RIGHT : align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

export function getHijriRowHitStyle(index, rtl = false) {
    return {
        x: rtl ? RADIO_SIDE_PADDING + RADIO_SIZE : 0,
        y: getRowY(index),
        w: DEVICE_WIDTH - RADIO_SIDE_PADDING - RADIO_SIZE,
        h: ROW_HEIGHT,
        color: COLORS.rowBg,
        alpha: 0,
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
    return {
        x: px(24),
        y: getRowY(index),
        w: DEVICE_WIDTH - px(48),
        h: FOCUS_LINE_HEIGHT,
    };
}

export function getFocusLineBottomStyle(index) {
    return {
        x: px(24),
        y: getRowY(index) + ROW_HEIGHT - FOCUS_LINE_HEIGHT,
        w: DEVICE_WIDTH - px(48),
        h: FOCUS_LINE_HEIGHT,
    };
}

export function getInfoTextStyle(rtl = false) {
    const x = rtl ? INFO_OUTER_PAD_X : ROW_PAD_X;
    const endPad = rtl ? ROW_PAD_X : INFO_OUTER_PAD_X;
    return {
        x,
        y: INFO_Y,
        w: DEVICE_WIDTH - x - endPad,
        h: INFO_HEIGHT,
        text_size: px(28),
        color: 0xa6a6a6,
        align_h: rtl ? align.RIGHT : align.LEFT,
        align_v: align.TOP,
        text_style: text_style.WRAP,
    };
}

export const BOTTOM_PADDING = {
    y: BOTTOM_PADDING_Y,
    h: px(80),
};
