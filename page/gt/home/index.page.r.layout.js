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
  cellBgPressed: 0x2a5a2a, // Pressed state
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
    text_style: text_style.NONE,
  };
}

// ── Prayer List ──
export const GRID_START_X = SIDE_PADDING;
export const GRID_START_Y = px(110);
export const GRID_COL_GAP = px(10);
export const GRID_ROW_GAP = px(12);
export const GRID_CELL_W = (CONTENT_WIDTH - GRID_COL_GAP) / 2;
export const GRID_CELL_H = px(88);
const GRID_RADIUS = px(16);


export function getPrayerCellBgStyle(x, y, isActive) {
  return {
    x,
    y,
    w: GRID_CELL_W,
    h: GRID_CELL_H,
    radius: GRID_RADIUS,
    color: isActive ? COLORS.cellBgPressed : COLORS.cellBg,
  };
}

export function getPrayerLabelStyle(x, y, isActive) {
  return {
    x,
    y,
    w: GRID_CELL_W,
    h: GRID_CELL_H / 2,
    color: isActive ? COLORS.title : COLORS.subtitle,
    text_size: px(28),
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

export function getPrayerTimeStyle(x, y, isActive) {
  return {
    x,
    y: y + GRID_CELL_H / 2,
    w: GRID_CELL_W,
    h: GRID_CELL_H / 2,
    color: isActive ? COLORS.nextTime : COLORS.subtitle,
    text_size: px(38),
    align_h: align.CENTER_H,
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

// ── Help Icon ──
export const HELP_ICON_STYLE = {
  x: DEVICE_WIDTH / 2 - px(20),
  y: DEVICE_HEIGHT - px(70),
  w: px(40),
  h: px(40),
};

// ── Qibla Compass (page 1) ──
const RING_SIZE = px(460);
export const COMPASS_RING_STYLE = {
  x: (DEVICE_WIDTH - RING_SIZE) / 2,
  y: (DEVICE_HEIGHT - RING_SIZE) / 2,
  w: RING_SIZE,
  h: RING_SIZE,
  src: "image/compass_ring.png",
};

const ARROW_SIZE = px(100);
export const ARROW_STYLE = {
  x: (DEVICE_WIDTH - ARROW_SIZE) / 2,
  y: (DEVICE_HEIGHT - ARROW_SIZE) / 2,
  w: ARROW_SIZE,
  h: ARROW_SIZE,
  center_x: ARROW_SIZE / 2,
  center_y: ARROW_SIZE / 2,
  src: "image/qibla_arrow.png",
};

const DOT_SIZE = px(28);
export const KAABA_DOT_STYLE = {
  x: (DEVICE_WIDTH - DOT_SIZE) / 2,
  y: (DEVICE_HEIGHT - DOT_SIZE) / 2,
  w: DOT_SIZE,
  h: DOT_SIZE,
  center_x: DOT_SIZE / 2,
  center_y: DOT_SIZE / 2,
  src: "image/kaaba_dot.png",
};

export const DOT_ORBIT_RADIUS = px(195);

export const CALIBRATE_STYLE = {
  x: px(40),
  y: DEVICE_HEIGHT / 2 - px(40),
  w: DEVICE_WIDTH - px(80),
  h: px(80),
  color: COLORS.title,
  text_size: px(28),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};

export const QIBLA_NO_DATA_STYLE = {
  x: px(60),
  y: DEVICE_HEIGHT / 2 - px(35),
  w: DEVICE_WIDTH - px(120),
  h: px(90),
  color: COLORS.noData,
  text_size: px(30),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
