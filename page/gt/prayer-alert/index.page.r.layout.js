import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(58);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;
const DISMISS_HEIGHT = px(96);
const TITLE_HEIGHT = px(82);
const TIME_HEIGHT = px(72);
const TEXT_GAP = px(6);
const TEXT_BLOCK_Y = (DEVICE_HEIGHT - DISMISS_HEIGHT - TITLE_HEIGHT - TIME_HEIGHT - TEXT_GAP) / 2;

export const TITLE_STYLE = {
    x: SIDE_PADDING,
    y: TEXT_BLOCK_Y,
    w: CONTENT_WIDTH,
    h: TITLE_HEIGHT,
    text_size: px(52),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
};

export const MESSAGE_STYLE = {
    x: SIDE_PADDING,
    y: TEXT_BLOCK_Y + TITLE_HEIGHT + TEXT_GAP,
    w: CONTENT_WIDTH,
    h: TIME_HEIGHT,
    text_size: px(48),
    color: 0xd4a843,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
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
    y: DEVICE_HEIGHT - px(80),
    w: px(64),
    h: px(64),
};
