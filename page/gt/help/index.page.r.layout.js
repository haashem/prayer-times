import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(40);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

const COLORS = {
    text: 0xa89880,
};

export const PARA_START_Y = px(46);
export const PARA_HEIGHT = px(540);
export const PARA_GAP = px(6);
export const TITLE_FONT_SIZE = px(40);
export const TITLE_HEIGHT = px(66);
export const HIJRI_DATE_HEIGHT = px(40);

export function getHijriDateStyle(y) {
    return {
        x: SIDE_PADDING,
        y: y,
        w: CONTENT_WIDTH,
        h: HIJRI_DATE_HEIGHT,
        text_size: px(28),
        color: 0xd4a843,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
    };
}

export function getParaStyle(y) {
    return {
        x: SIDE_PADDING,
        y: y,
        w: CONTENT_WIDTH,
        h: PARA_HEIGHT,
        text_size: px(36),
        color: COLORS.text,
        align_h: align.LEFT,
        align_v: align.TOP,
        text_style: text_style.WRAP,
    };
}

export const BOTTOM_PADDING = px(80);
