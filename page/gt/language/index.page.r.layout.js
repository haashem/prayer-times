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

const TITLE_Y = px(70);
const TITLE_HEIGHT = px(64);
const ROW_START_Y = px(176);
const ROW_HEIGHT = px(104);
const ROW_PAD_X = px(76);
const RADIO_SIZE = px(64);
const RADIO_RIGHT_PAD = px(70);

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
    text_size: px(40),
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
        w: DEVICE_WIDTH - ROW_PAD_X - RADIO_RIGHT_PAD - RADIO_SIZE - px(16),
        h: ROW_HEIGHT,
        text_size: px(40),
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
        x: px(24),
        y: getRowY(index),
        w: DEVICE_WIDTH - px(48),
        h: px(22),
    };
}

export function getFocusLineBottomStyle(index) {
    return {
        x: px(24),
        y: getRowY(index) + ROW_HEIGHT - px(22),
        w: DEVICE_WIDTH - px(48),
        h: px(22),
    };
}

export const BOTTOM_PADDING = {
    y: BOTTOM_PADDING_Y,
    h: px(80),
};
