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

// ── City Title (button) — Subheadline 28px, line-height 35px ──
// Square: title center-aligned
export const CITY_STYLE = {
  x: SIDE_PADDING,
  y: px(16),
  w: CONTENT_WIDTH,
  h: px(50),             // 40 × 1.25
  radius: px(6),
  normal_color: 0x000000,
  press_color: 0x0a1a0a, // Dimmed dark green
  text_size: px(40),     // Title
  color: COLORS.title,
  align_h: align.CENTER_H,
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
