import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const SIDE_PADDING = px(40);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

const COLORS = {
    rowBg: 0x000000,
    text: 0xa89880,
    value: 0xffffff,
};

export const PARA_START_Y = px(46);
export const PARA_HEIGHT = px(540);
export const PARA_GAP = px(6);
export const TITLE_FONT_SIZE = px(40);
export const TITLE_HEIGHT = px(66);
export const HIJRI_DATE_HEIGHT = px(40);
export const LANGUAGE_TILE_GAP = px(12);
const LANGUAGE_TILE_HEIGHT = px(104);
const LANGUAGE_TILE_PAD_X = px(76);
const LANGUAGE_TILE_CHEVRON_W = px(64);
export const CONTACT_QR_SECTION_HEIGHT = px(346);
const CONTACT_QR_GAP = px(14);
const CONTACT_QR_SIZE = px(230);
const CONTACT_QR_BG_PADDING = px(14);
const CONTACT_EMAIL_GAP = px(20);
const CONTACT_EMAIL_HEIGHT = px(38);

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

export function getLanguageTileBgStyle(y) {
    return {
        x: 0,
        y: y,
        w: DEVICE_WIDTH,
        h: LANGUAGE_TILE_HEIGHT,
        color: COLORS.rowBg,
    };
}

export function getLanguageTileTitleStyle(y) {
    return {
        x: LANGUAGE_TILE_PAD_X,
        y: y,
        w: DEVICE_WIDTH - LANGUAGE_TILE_PAD_X * 2 - LANGUAGE_TILE_CHEVRON_W,
        h: LANGUAGE_TILE_HEIGHT,
        text_size: px(40),
        color: COLORS.value,
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.ELLIPSIS,
    };
}

export function getLanguageTileChevronStyle(y) {
    return {
        x: DEVICE_WIDTH - LANGUAGE_TILE_PAD_X - LANGUAGE_TILE_CHEVRON_W,
        y: y + (LANGUAGE_TILE_HEIGHT - LANGUAGE_TILE_CHEVRON_W) / 2,
        w: LANGUAGE_TILE_CHEVRON_W,
        h: LANGUAGE_TILE_CHEVRON_W,
    };
}

export function getContactQrStyle(y) {
    const x = (DEVICE_WIDTH - CONTACT_QR_SIZE) / 2;

    return {
        x: x,
        y: y + CONTACT_QR_GAP,
        w: CONTACT_QR_SIZE,
        h: CONTACT_QR_SIZE,
        bg_x: x - CONTACT_QR_BG_PADDING,
        bg_y: y + CONTACT_QR_GAP - CONTACT_QR_BG_PADDING,
        bg_w: CONTACT_QR_SIZE + CONTACT_QR_BG_PADDING * 2,
        bg_h: CONTACT_QR_SIZE + CONTACT_QR_BG_PADDING * 2,
        bg_radius: px(8),
    };
}

export function getContactEmailTextStyle(y) {
    return {
        x: SIDE_PADDING,
        y: y + CONTACT_QR_GAP + CONTACT_QR_SIZE + CONTACT_EMAIL_GAP,
        w: CONTENT_WIDTH,
        h: CONTACT_EMAIL_HEIGHT,
        text_size: px(26),
        color: COLORS.value,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
    };
}

export const BOTTOM_PADDING = px(80);
