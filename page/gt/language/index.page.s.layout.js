import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH } = getDeviceInfo();

const SIDE_PADDING = px(20);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

const COLORS = {
    rowBg: 0x000000,
    text: 0xffffff,
};

const TITLE_Y = px(24);
const TITLE_HEIGHT = px(58);
const ROW_START_Y = px(128);
const ROW_HEIGHT = px(88);
const ROW_PAD_X = px(44);
const RADIO_SIZE = px(54);
const RADIO_RIGHT_PAD = px(40);
const FOCUS_LINE_HEIGHT = px(18);

export const LANGUAGE_OPTIONS = [
    { value: "farsi", label: "فارسی" },
    { value: "arabic", label: "العربية" },
    { value: "english", label: "English" },
];

const BOTTOM_PADDING_Y = ROW_START_Y + LANGUAGE_OPTIONS.length * ROW_HEIGHT;
export const SCROLL_ITEM_HEIGHT = ROW_HEIGHT;

export const TITLE_STYLE = {
    x: SIDE_PADDING,
    y: TITLE_Y,
    w: CONTENT_WIDTH,
    h: TITLE_HEIGHT,
    text_size: px(34),
    color: COLORS.text,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const RADIO_GROUP_STYLE = {
    x: DEVICE_WIDTH - RADIO_RIGHT_PAD - RADIO_SIZE,
    y: ROW_START_Y,
    w: RADIO_SIZE,
    h: LANGUAGE_OPTIONS.length * ROW_HEIGHT,
};

function getRowY(index) {
    return ROW_START_Y + index * ROW_HEIGHT;
}

export function getLanguageRowBgStyle(index) {
    return {
        x: 0,
        y: getRowY(index),
        w: DEVICE_WIDTH,
        h: ROW_HEIGHT,
        color: COLORS.rowBg,
    };
}

export function getLanguageRowTextStyle(index) {
    return {
        x: ROW_PAD_X,
        y: getRowY(index),
        w: DEVICE_WIDTH - ROW_PAD_X - RADIO_RIGHT_PAD - RADIO_SIZE - px(14),
        h: ROW_HEIGHT,
        text_size: px(36),
        color: COLORS.text,
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

export function getLanguageRowHitStyle(index) {
    return {
        x: 0,
        y: getRowY(index),
        w: DEVICE_WIDTH - RADIO_RIGHT_PAD - RADIO_SIZE,
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
        x: px(20),
        y: getRowY(index),
        w: DEVICE_WIDTH - px(40),
        h: FOCUS_LINE_HEIGHT,
    };
}

export function getFocusLineBottomStyle(index) {
    return {
        x: px(20),
        y: getRowY(index) + ROW_HEIGHT - FOCUS_LINE_HEIGHT,
        w: DEVICE_WIDTH - px(40),
        h: FOCUS_LINE_HEIGHT,
    };
}

export const BOTTOM_PADDING = {
    y: BOTTOM_PADDING_Y,
    h: px(40),
};
