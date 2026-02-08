import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(20);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

const COLORS = {
    text: 0xffffff,
};

export const PARA_START_Y = px(20);
export const PARA_HEIGHT = px(170);
export const PARA_GAP = px(10);
export const TITLE_FONT_SIZE = px(34);
export const TITLE_HEIGHT = px(56);

export function getParaStyle(y) {
    return {
        x: SIDE_PADDING,
        y: y,
        w: CONTENT_WIDTH,
        h: PARA_HEIGHT,
        text_size: px(22),
        color: COLORS.text,
        align_h: align.LEFT,
        align_v: align.TOP,
        text_style: text_style.WRAP,
    };
}

export const BOTTOM_PADDING = px(40);
