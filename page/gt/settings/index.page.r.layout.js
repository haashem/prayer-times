import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH } = getDeviceInfo();

const SIDE_PADDING = px(48);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;
const TITLE_Y = px(44);
const TITLE_HEIGHT = px(64);
const HIJRI_DATE_Y = TITLE_Y + TITLE_HEIGHT;
const ROW_START_Y = px(184);
const ROW_HEIGHT = px(104);
const ROW_PAD_X = px(76);
const CHEVRON_SIZE = px(64);
const CHEVRON_RIGHT_PAD = px(70);
const FOCUS_LINE_HEIGHT = px(22);

export const SETTINGS_ITEMS = [
    { labelKey: "selectLanguage", url: "page/gt/language/index.page" },
    { labelKey: "contactUs", url: "page/gt/contact/index.page" },
    { labelKey: "help", url: "page/gt/help/index.page" },
];

export const SCROLL_ITEM_HEIGHT = ROW_HEIGHT;

export const TITLE_STYLE = {
    x: SIDE_PADDING,
    y: TITLE_Y,
    w: CONTENT_WIDTH,
    h: TITLE_HEIGHT,
    text_size: px(40),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const HIJRI_DATE_STYLE = {
    x: SIDE_PADDING,
    y: HIJRI_DATE_Y,
    w: CONTENT_WIDTH,
    h: px(40),
    text_size: px(28),
    color: 0xd4a843,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

function getRowY(index) {
    return ROW_START_Y + index * ROW_HEIGHT;
}

export function getSettingsRowBgStyle(index) {
    return { x: 0, y: getRowY(index), w: DEVICE_WIDTH, h: ROW_HEIGHT, color: 0x000000 };
}

export function getSettingsRowTextStyle(index, rtl = false) {
    const textX = rtl ? CHEVRON_RIGHT_PAD + CHEVRON_SIZE + px(16) : ROW_PAD_X;
    return {
        x: textX,
        y: getRowY(index),
        w: rtl
            ? DEVICE_WIDTH - textX - ROW_PAD_X
            : DEVICE_WIDTH - ROW_PAD_X - CHEVRON_RIGHT_PAD - CHEVRON_SIZE - px(16),
        h: ROW_HEIGHT,
        text_size: px(40),
        color: 0xffffff,
        align_h: rtl ? align.RIGHT : align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

export function getSettingsRowChevronStyle(index, rtl = false) {
    return {
        x: rtl ? CHEVRON_RIGHT_PAD : DEVICE_WIDTH - CHEVRON_RIGHT_PAD - CHEVRON_SIZE,
        y: getRowY(index) + (ROW_HEIGHT - CHEVRON_SIZE) / 2,
        w: CHEVRON_SIZE,
        h: CHEVRON_SIZE,
        center_x: CHEVRON_SIZE / 2,
        center_y: CHEVRON_SIZE / 2,
        angle: rtl ? 180 : 0,
    };
}

export function getFocusLineTopStyle(index) {
    return { x: px(24), y: getRowY(index), w: DEVICE_WIDTH - px(48), h: FOCUS_LINE_HEIGHT };
}

export function getFocusLineBottomStyle(index) {
    return {
        x: px(24),
        y: getRowY(index) + ROW_HEIGHT - FOCUS_LINE_HEIGHT,
        w: DEVICE_WIDTH - px(48),
        h: FOCUS_LINE_HEIGHT,
    };
}

export const BOTTOM_PADDING = {
    y: ROW_START_Y + SETTINGS_ITEMS.length * ROW_HEIGHT,
    h: px(80),
};
