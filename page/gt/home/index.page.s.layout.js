import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// ── Islamic-Inspired Color Palette ──
export const COLORS = {
  background: 0x000000,
  title: 0xd4a843,       // Gold — mosque dome
  hijriDate: 0xa89880,   // Warm sandstone
  separator: 0x2a3a2a,   // Subtle dark green
  prayerName: 0xe8dcc8,  // Warm ivory
  prayerTime: 0xe8dcc8,  // Warm ivory
  activeBg: 0x0d4a2e,    // Deep emerald green
  activeText: 0xd4a843,  // Gold accent
  activeTime: 0xffffff,  // White
  noData: 0xc75050,      // Muted red
};

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// Row height includes font + padding; 8px gap between rows
export const PRAYER_ROW_HEIGHT = px(72);
export const PRAYER_ROW_GAP = px(12);
export const PRAYER_START_Y = px(130);
export const BOTTOM_PADDING = px(60);

// ── City Title — dynamic width based on name length ──
const CITY_FONT_SIZE = px(40);
const CITY_H = px(50);
const CITY_Y = px(16);
const CITY_PAD_X = px(24);   // horizontal padding inside pill

export function getCityBgStyle(textLen) {
  const estWidth = textLen * CITY_FONT_SIZE * 0.55 + CITY_PAD_X * 2;
  const w = Math.min(Math.max(estWidth, px(100)), CONTENT_WIDTH);
  return {
    x: (DEVICE_WIDTH - w) / 2,
    y: CITY_Y,
    w: w,
    h: CITY_H,
    radius: CITY_H / 2,
    color: 0x141e14,       // Subtle dark green hint
  };
}

export const CITY_TEXT_STYLE = {
  x: 0,
  y: CITY_Y,
  w: DEVICE_WIDTH,
  h: CITY_H,
  text_size: CITY_FONT_SIZE,
  color: COLORS.title,
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
};

// ── Hijri Date — Caption1 24px, line-height 30px ──
export const HIJRI_DATE_STYLE = {
  x: 0,
  y: px(70),
  w: DEVICE_WIDTH,
  h: px(42),             // 32 × 1.25
  color: COLORS.hijriDate,
  text_size: px(32),     // Subheadline
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// ── Separator ──
export const SEPARATOR_STYLE = {
  x: SIDE_PADDING,
  y: px(116),
  w: CONTENT_WIDTH,
  h: px(1),
  color: COLORS.separator,
};

// ── Prayer Row Background ──
export function getPrayerRowBgStyle(y, isActive) {
  return {
    x: SIDE_PADDING - px(8),
    y: y - px(4),
    w: CONTENT_WIDTH + px(16),
    h: PRAYER_ROW_HEIGHT,
    radius: px(10),
    color: isActive ? COLORS.activeBg : 0x000000,
    alpha: isActive ? 255 : 0,
  };
}

// ── Prayer Name — Subheadline 28px, centered in row ──
// Square: content left-aligned
export function getPrayerNameStyle(y, isActive) {
  return {
    x: SIDE_PADDING,
    y: y - px(4),          // Align with row background origin
    w: CONTENT_WIDTH / 2,
    h: PRAYER_ROW_HEIGHT,  // Match row height for vertical centering
    color: isActive ? COLORS.activeText : COLORS.prayerName,
    text_size: px(36),     // Body
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── Prayer Time — Body 36px, centered in row ──
export function getPrayerTimeStyle(y, isActive) {
  return {
    x: DEVICE_WIDTH / 2,
    y: y - px(4),
    w: DEVICE_WIDTH / 2 - SIDE_PADDING,
    h: PRAYER_ROW_HEIGHT,
    color: isActive ? COLORS.activeTime : COLORS.prayerTime,
    text_size: px(36),     // Body
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── No Data — Caption1 24px ──
export const NO_DATA_STYLE = {
  text: "No prayer data\nfor today",
  x: SIDE_PADDING,
  y: DEVICE_HEIGHT / 2 - px(30),
  w: CONTENT_WIDTH,
  h: px(80),               // 32 × 1.25 × 2 lines
  color: COLORS.noData,
  text_size: px(32),       // Body
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
