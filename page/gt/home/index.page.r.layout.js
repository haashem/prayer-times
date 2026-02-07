import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// ── Zepp OS Design Guideline Colors ──
// Contrast ≥ 3:1, avoid RGB 1-46, pressed = ~28.6% brightness reduction
export const COLORS = {
  background: 0x000000,
  title: 0x4fc3f7,       // Light blue — city name
  hijriDate: 0x999999,   // Secondary text (raised from 0x888888 for contrast)
  separator: 0x333333,   // Subtle separator
  prayerName: 0xcccccc,  // Default prayer name
  prayerTime: 0xcccccc,  // Default prayer time
  activeBg: 0x1b5e20,    // Dark green highlight
  activeText: 0x66bb6a,  // Green text for active prayer
  activeTime: 0xffffff,  // White time for active prayer
  noData: 0xff5252,      // Red for error
};

const SIDE_PADDING = px(60);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// Row height = font (32px Body) + vertical padding; 8px gap between rows
export const PRAYER_ROW_HEIGHT = px(64);
export const PRAYER_ROW_GAP = px(8);
export const PRAYER_START_Y = px(150);
export const BOTTOM_PADDING = px(80);

// ── City Title (button) — Title font 36px, line-height 45px ──
export const CITY_STYLE = {
  x: SIDE_PADDING,
  y: px(32),
  w: CONTENT_WIDTH,
  h: px(45),            // 36 × 1.25
  radius: px(8),
  normal_color: 0x000000,
  press_color: 0x121228, // ~28.6% dimmed from black-ish
  text_size: px(36),     // Title
  color: COLORS.title,
  align_h: align.CENTER_H,
};

// ── Hijri Date — Subheadline 28px, line-height 35px ──
export const HIJRI_DATE_STYLE = {
  x: 0,
  y: px(82),
  w: DEVICE_WIDTH,
  h: px(35),             // 28 × 1.25
  color: COLORS.hijriDate,
  text_size: px(28),     // Subheadline
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// ── Separator ──
export const SEPARATOR_STYLE = {
  x: SIDE_PADDING,
  y: px(126),
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
    text_size: px(32),     // Body
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── Prayer Time — Body 32px, centered in row ──
export function getPrayerTimeStyle(y, isActive) {
  return {
    x: DEVICE_WIDTH / 2,
    y: y - px(4),          // Align with row background origin
    w: DEVICE_WIDTH / 2 - SIDE_PADDING,
    h: PRAYER_ROW_HEIGHT,  // Match row height for vertical centering
    color: isActive ? COLORS.activeTime : COLORS.prayerTime,
    text_size: px(32),     // Body
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
  h: px(70),               // 28 × 1.25 × 2 lines
  color: COLORS.noData,
  text_size: px(28),       // Subheadline
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
