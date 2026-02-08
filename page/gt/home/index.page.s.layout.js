import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// ── Color Palette ──
export const COLORS = {
  background: 0x000000,
  title: 0xd4a843,
  subtitle: 0xa89880,
  nextLabel: 0xa89880,
  nextName: 0xe8dcc8,
  countdown: 0xd4a843,
  nextTime: 0xffffff,
  progressBg: 0x2a4a2a,
  progressFill: 0xd4a843,
  cellBg: 0x2a4a2a,
  cellName: 0xa89880,
  cellTime: 0xe8dcc8,
  noData: 0xc75050,
};

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── Location Icon ──
const ICON_SIZE = px(40);
const CITY_Y = px(16);
const CITY_H = px(50);
const CITY_FONT_SIZE = px(40);
const ICON_GAP = px(8);

export function getCityTextStyle(textLen) {
  const textW = Math.ceil(textLen * CITY_FONT_SIZE * 0.55);
  const groupW = textW + ICON_GAP + ICON_SIZE;
  const startX = (DEVICE_WIDTH - groupW) / 2;
  return {
    x: startX,
    y: CITY_Y,
    w: textW,
    h: CITY_H,
    text_size: CITY_FONT_SIZE,
    color: COLORS.title,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

export function getLocationIconStyle(textLen) {
  const textW = Math.ceil(textLen * CITY_FONT_SIZE * 0.55);
  const groupW = textW + ICON_GAP + ICON_SIZE;
  const startX = (DEVICE_WIDTH - groupW) / 2;
  return {
    src: "image/location.png",
    x: startX + textW + ICON_GAP,
    y: CITY_Y + (CITY_H - ICON_SIZE) / 2,
    w: ICON_SIZE,
    h: ICON_SIZE,
  };
}

// ── Next Prayer Section ──
export const NEXT_LABEL_STYLE = {
  x: 0,
  y: px(76),
  w: DEVICE_WIDTH,
  h: px(30),
  color: COLORS.nextLabel,
  text_size: px(24),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

export const NEXT_NAME_STYLE = {
  x: 0,
  y: px(104),
  w: DEVICE_WIDTH,
  h: px(46),
  color: COLORS.nextName,
  text_size: px(38),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

export const COUNTDOWN_STYLE = {
  x: 0,
  y: px(148),
  w: DEVICE_WIDTH,
  h: px(28),
  color: COLORS.countdown,
  text_size: px(22),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

export const NEXT_TIME_STYLE = {
  x: 0,
  y: px(172),
  w: DEVICE_WIDTH,
  h: px(64),
  color: COLORS.nextTime,
  text_size: px(60),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// ── Progress Bar ──
export const PROGRESS_BG_STYLE = {
  x: SIDE_PADDING,
  y: px(246),
  w: CONTENT_WIDTH,
  h: px(6),
  radius: px(3),
  color: COLORS.progressBg,
};

export function getProgressFillStyle(fraction) {
  const fillW = Math.max(px(6), Math.round(CONTENT_WIDTH * Math.min(1, fraction)));
  return {
    x: SIDE_PADDING,
    y: px(246),
    w: fillW,
    h: px(6),
    radius: px(3),
    color: COLORS.progressFill,
  };
}

// ── Upcoming Prayer Cells ──
export const CELL_START_Y = px(270);
export const CELL_HEIGHT = px(60);
export const CELL_GAP = px(8);
export const CELL_RADIUS = px(12);
export const BOTTOM_PADDING = px(60);

export function getCellBgStyle(y) {
  return {
    x: SIDE_PADDING - px(8),
    y: y,
    w: CONTENT_WIDTH + px(16),
    h: CELL_HEIGHT,
    radius: CELL_RADIUS,
    color: COLORS.cellBg,
  };
}

export function getCellNameStyle(y) {
  return {
    x: SIDE_PADDING + px(6),
    y: y,
    w: CONTENT_WIDTH / 2,
    h: CELL_HEIGHT,
    color: COLORS.cellName,
    text_size: px(28),
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

export function getCellTimeStyle(y) {
  return {
    x: DEVICE_WIDTH / 2,
    y: y,
    w: DEVICE_WIDTH / 2 - SIDE_PADDING - px(6),
    h: CELL_HEIGHT,
    color: COLORS.cellTime,
    text_size: px(28),
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── No Data ──
export const NO_DATA_STYLE = {
  text: "No prayer data",
  x: SIDE_PADDING,
  y: DEVICE_HEIGHT / 2 - px(30),
  w: CONTENT_WIDTH,
  h: px(80),
  color: COLORS.noData,
  text_size: px(32),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
