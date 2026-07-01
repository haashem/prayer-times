import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(20);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;
const TITLE_Y = px(24);
const TITLE_HEIGHT = px(58);
const INTRO_Y = TITLE_Y + TITLE_HEIGHT + px(18);
const INTRO_HEIGHT = px(500);
const SECTION_TITLE_Y = INTRO_Y + INTRO_HEIGHT + px(12);
const SECTION_TITLE_HEIGHT = px(56);
const CALCULATION_Y = SECTION_TITLE_Y + SECTION_TITLE_HEIGHT + px(6);
const CALCULATION_HEIGHT = px(600);

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

export const INTRO_STYLE = {
    x: SIDE_PADDING,
    y: INTRO_Y,
    w: CONTENT_WIDTH,
    h: INTRO_HEIGHT,
    text_size: px(36),
    color: 0xa89880,
    align_h: align.LEFT,
    align_v: align.TOP,
    text_style: text_style.WRAP,
};

export const SECTION_TITLE_STYLE = {
    x: SIDE_PADDING,
    y: SECTION_TITLE_Y,
    w: CONTENT_WIDTH,
    h: SECTION_TITLE_HEIGHT,
    text_size: px(34),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
};

export const CALCULATION_STYLE = {
    x: SIDE_PADDING,
    y: CALCULATION_Y,
    w: CONTENT_WIDTH,
    h: CALCULATION_HEIGHT,
    text_size: px(36),
    color: 0xa89880,
    align_h: align.LEFT,
    align_v: align.TOP,
    text_style: text_style.WRAP,
};

export const CONTENT_HEIGHT = CALCULATION_Y + CALCULATION_HEIGHT;
export const BOTTOM_PADDING = px(40);
