import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// ── Color Palette ──
export const COLORS = {
  background: 0x000000,
  title: 0xd4a843,        // Gold — city name
  subtitle: 0xa89880,     // Warm sandstone — secondary text
  nextLabel: 0xa89880,    // "Next prayer" label
  nextName: 0xe8dcc8,     // Next prayer name — warm ivory
  countdown: 0xd4a843,    // "In X minutes" — gold accent
  nextTime: 0xffffff,     // Large next time — white

  cellBg: 0x1a3a1a,       // Upcoming cell background
  cellName: 0xa89880,     // Upcoming cell prayer name
  cellTime: 0xe8dcc8,     // Upcoming cell time
  noData: 0xc75050,       // Error
};

const SIDE_PADDING = px(60);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// ── City Header ──
const CITY_Y = px(36);
const CITY_H = px(56);
const CITY_FONT_SIZE = px(42);
const CITY_PAD_H = px(24); // horizontal padding inside pill

export function getCityBgStyle(textLen) {
  const textW = Math.ceil(textLen * CITY_FONT_SIZE * 0.55);
  const pillW = textW + CITY_PAD_H * 2;
  return {
    x: (DEVICE_WIDTH - pillW) / 2,
    y: CITY_Y,
    w: pillW,
    h: CITY_H,
    radius: CITY_H / 2,
    color: COLORS.cellBg,
  };
}

export function getCityTextStyle(textLen) {
  const textW = Math.ceil(textLen * CITY_FONT_SIZE * 0.55);
  const pillW = textW + CITY_PAD_H * 2;
  return {
    x: (DEVICE_WIDTH - pillW) / 2,
    y: CITY_Y,
    w: pillW,
    h: CITY_H,
    text_size: CITY_FONT_SIZE,
    color: COLORS.title,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── Next Prayer Section ──
export const NEXT_LABEL_STYLE = {
  x: 0,
  y: px(110),
  w: DEVICE_WIDTH,
  h: px(36),
  color: COLORS.nextLabel,
  text_size: px(28),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

export const NEXT_NAME_STYLE = {
  x: 0,
  y: px(144),
  w: DEVICE_WIDTH,
  h: px(56),
  color: COLORS.nextName,
  text_size: px(46),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

export const COUNTDOWN_STYLE = {
  x: 0,
  y: px(198),
  w: DEVICE_WIDTH,
  h: px(34),
  color: COLORS.countdown,
  text_size: px(26),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

export const NEXT_TIME_STYLE = {
  x: 0,
  y: px(228),
  w: DEVICE_WIDTH,
  h: px(80),
  color: COLORS.nextTime,
  text_size: px(72),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// ── Upcoming Prayer Cells ──
export const CELL_START_Y = px(320);
export const CELL_HEIGHT = px(72);
export const CELL_GAP = px(10);
export const CELL_RADIUS = px(16);
export const BOTTOM_PADDING = px(100);

export function getCellBgStyle(y) {
  return {
    x: SIDE_PADDING - px(10),
    y: y,
    w: CONTENT_WIDTH + px(20),
    h: CELL_HEIGHT,
    radius: CELL_RADIUS,
    color: COLORS.cellBg,
  };
}

export function getCellNameStyle(y) {
  return {
    x: SIDE_PADDING + px(8),
    y: y,
    w: CONTENT_WIDTH / 2,
    h: CELL_HEIGHT,
    color: COLORS.cellName,
    text_size: px(34),
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

export function getCellTimeStyle(y) {
  return {
    x: DEVICE_WIDTH / 2,
    y: y,
    w: DEVICE_WIDTH / 2 - SIDE_PADDING - px(8),
    h: CELL_HEIGHT,
    color: COLORS.cellTime,
    text_size: px(34),
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── No Data ──
export const NO_DATA_STYLE = {
  text: "No prayer data",
  x: SIDE_PADDING,
  y: DEVICE_HEIGHT / 2 - px(35),
  w: CONTENT_WIDTH,
  h: px(90),
  color: COLORS.noData,
  text_size: px(36),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
