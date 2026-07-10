import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;
const DISMISS_HEIGHT = px(82);
const EYEBROW_HEIGHT = px(34);
const PRAYER_HEIGHT = px(74);
const TIME_HEIGHT = px(70);
const EYEBROW_GAP = px(2);
const TIME_GAP = px(8);
const CONTENT_HEIGHT = EYEBROW_HEIGHT + EYEBROW_GAP + PRAYER_HEIGHT + TIME_GAP + TIME_HEIGHT;
const CONTENT_Y = (DEVICE_HEIGHT - DISMISS_HEIGHT - CONTENT_HEIGHT) / 2;

export const EYEBROW_STYLE = {
    x: SIDE_PADDING,
    y: CONTENT_Y,
    w: CONTENT_WIDTH,
    h: EYEBROW_HEIGHT,
    text_size: px(24),
    color: 0xa6a6a6,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const PRAYER_NAME_STYLE = {
    x: SIDE_PADDING,
    y: CONTENT_Y + EYEBROW_HEIGHT + EYEBROW_GAP,
    w: CONTENT_WIDTH,
    h: PRAYER_HEIGHT,
    text_size: px(56),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
};

export const TIME_STYLE = {
    x: SIDE_PADDING,
    y: CONTENT_Y + EYEBROW_HEIGHT + EYEBROW_GAP + PRAYER_HEIGHT + TIME_GAP,
    w: CONTENT_WIDTH,
    h: TIME_HEIGHT,
    text_size: px(56),
    color: 0xd4a843,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const MESSAGE_STYLE = {
    x: SIDE_PADDING,
    y: (DEVICE_HEIGHT - DISMISS_HEIGHT - TIME_HEIGHT) / 2,
    w: CONTENT_WIDTH,
    h: TIME_HEIGHT,
    text_size: px(36),
    color: 0xd4a843,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};

export const DISMISS_BUTTON_STYLE = {
    x: 0,
    y: DEVICE_HEIGHT - DISMISS_HEIGHT,
    w: DEVICE_WIDTH,
    h: DISMISS_HEIGHT,
    radius: 0,
    normal_color: 0x3b3b3d,
    press_color: 0x29292b,
};

export const DISMISS_ICON_STYLE = {
    x: (DEVICE_WIDTH - px(64)) / 2,
    y: DEVICE_HEIGHT - px(73),
    w: px(64),
    h: px(64),
};
