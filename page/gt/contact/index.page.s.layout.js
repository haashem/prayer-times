import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(20);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;
const QR_SIZE = px(210);
const QR_BG_PADDING = px(12);
const QR_Y = px(112);

export const TITLE_STYLE = {
    x: SIDE_PADDING,
    y: px(24),
    w: CONTENT_WIDTH,
    h: px(58),
    text_size: px(34),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const QR_STYLE = {
    x: (DEVICE_WIDTH - QR_SIZE) / 2,
    y: QR_Y,
    w: QR_SIZE,
    h: QR_SIZE,
    bg_x: (DEVICE_WIDTH - QR_SIZE) / 2 - QR_BG_PADDING,
    bg_y: QR_Y - QR_BG_PADDING,
    bg_w: QR_SIZE + QR_BG_PADDING * 2,
    bg_h: QR_SIZE + QR_BG_PADDING * 2,
    bg_radius: px(8),
};

export const EMAIL_STYLE = {
    x: SIDE_PADDING,
    y: QR_Y + QR_SIZE + px(18),
    w: CONTENT_WIDTH,
    h: px(34),
    text_size: px(24),
    color: 0xffffff,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const CONTENT_HEIGHT = EMAIL_STYLE.y + EMAIL_STYLE.h;
export const BOTTOM_PADDING = px(40);
