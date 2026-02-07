import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// ── Islamic-Inspired Color Palette ──
// Emerald green, gold accents, warm ivory text
export const COLORS = {
  background: 0x000000,
  title: 0xd4a843,       // Gold — city name (mosque dome gold)
  hijriDate: 0xa89880,   // Warm sandstone secondary text
  separator: 0x2a3a2a,   // Subtle dark green separator
  prayerName: 0xe8dcc8,  // Warm ivory — prayer name
  prayerTime: 0xe8dcc8,  // Warm ivory — prayer time
  activeBg: 0x0d4a2e,    // Deep emerald green highlight
  activeText: 0xd4a843,  // Gold text for active prayer
  activeTime: 0xffffff,  // White time for active prayer
  noData: 0xc75050,      // Muted red for error
};

const SIDE_PADDING = px(60);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// Row height = font (32px Body) + vertical padding; 8px gap between rows
export const PRAYER_ROW_HEIGHT = px(80);
export const PRAYER_ROW_GAP = px(12);
export const PRAYER_START_Y = px(170);
export const BOTTOM_PADDING = px(100);

// ── City Title (button) — Title font 36px, line-height 45px ──
export const CITY_STYLE = {
  x: SIDE_PADDING,
  y: px(36),
  w: CONTENT_WIDTH,
  h: px(60),            // 48 × 1.25
  radius: px(8),
  normal_color: 0x000000,
  press_color: 0x0a1a0a, // Dimmed dark green
  text_size: px(48),     // Title
  color: COLORS.title,
  align_h: align.CENTER_H,
};

// ── Hijri Date — Subheadline 28px, line-height 35px ──
export const HIJRI_DATE_STYLE = {
  x: 0,
  y: px(102),
  w: DEVICE_WIDTH,
  h: px(48),             // 36 × 1.25
  color: COLORS.hijriDate,
  text_size: px(36),     // Subheadline
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// ── Separator ──
export const SEPARATOR_STYLE = {
  x: SIDE_PADDING,
  y: px(156),
  w: CONTENT_WIDTH,
  h: px(1),
  color: COLORS.separator,
};

// ── Prayer Row Background ──
export function getPrayerRowBgStyle(y, isActive) {
  return {
    x: SIDE_PADDING - px(10),
    y: y - px(4),
    w: CONTENT_WIDTH + px(20),
    h: PRAYER_ROW_HEIGHT,
    radius: px(12),
    color: isActive ? COLORS.activeBg : 0x000000,
    alpha: isActive ? 255 : 0,
  };
}

// ── Prayer Name — Body 32px, centered in row ──
export function getPrayerNameStyle(y, isActive) {
  return {
    x: SIDE_PADDING,
    y: y - px(4),          // Align with row background origin
    w: CONTENT_WIDTH / 2,
    h: PRAYER_ROW_HEIGHT,  // Match row height for vertical centering
    color: isActive ? COLORS.activeText : COLORS.prayerName,
    text_size: px(42),     // Body
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── Prayer Time — Body 42px, centered in row ──
export function getPrayerTimeStyle(y, isActive) {
  return {
    x: DEVICE_WIDTH / 2,
    y: y - px(4),
    w: DEVICE_WIDTH / 2 - SIDE_PADDING,
    h: PRAYER_ROW_HEIGHT,
    color: isActive ? COLORS.activeTime : COLORS.prayerTime,
    text_size: px(42),     // Body
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── No Data — Subheadline 28px ──
export const NO_DATA_STYLE = {
  text: "No prayer data\nfor today",
  x: SIDE_PADDING,
  y: DEVICE_HEIGHT / 2 - px(35),
  w: CONTENT_WIDTH,
  h: px(90),               // 36 × 1.25 × 2 lines
  color: COLORS.noData,
  text_size: px(36),       // Subheadline
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
