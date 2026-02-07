import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// ── Zepp OS Design Guideline Colors ──
export const COLORS = {
  background: 0x000000,
  title: 0x4fc3f7,
  hijriDate: 0x999999,   // Raised from 0x888888 for contrast ≥ 3:1
  separator: 0x333333,
  prayerName: 0xcccccc,
  prayerTime: 0xcccccc,
  activeBg: 0x1b5e20,
  activeText: 0x66bb6a,
  activeTime: 0xffffff,
  noData: 0xff5252,
};

const SIDE_PADDING = px(24);
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// Row height includes font + padding; 8px gap between rows
export const PRAYER_ROW_HEIGHT = px(56);
export const PRAYER_ROW_GAP = px(8);
export const PRAYER_START_Y = px(110);
export const BOTTOM_PADDING = px(40);

// ── City Title (button) — Subheadline 28px, line-height 35px ──
// Square: title center-aligned
export const CITY_STYLE = {
  x: SIDE_PADDING,
  y: px(14),
  w: CONTENT_WIDTH,
  h: px(35),             // 28 × 1.25
  radius: px(6),
  normal_color: 0x000000,
  press_color: 0x121228,
  text_size: px(28),     // Subheadline
  color: COLORS.title,
  align_h: align.CENTER_H,
};

// ── Hijri Date — Caption1 24px, line-height 30px ──
export const HIJRI_DATE_STYLE = {
  x: 0,
  y: px(52),
  w: DEVICE_WIDTH,
  h: px(30),             // 24 × 1.25
  color: COLORS.hijriDate,
  text_size: px(24),     // Caption1
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// ── Separator ──
export const SEPARATOR_STYLE = {
  x: SIDE_PADDING,
  y: px(90),
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
    text_size: px(28),     // Subheadline (consistent)
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// ── Prayer Time — Subheadline 28px, centered in row ──
export function getPrayerTimeStyle(y, isActive) {
  return {
    x: DEVICE_WIDTH / 2,
    y: y - px(4),          // Align with row background origin
    w: DEVICE_WIDTH / 2 - SIDE_PADDING,
    h: PRAYER_ROW_HEIGHT,  // Match row height for vertical centering
    color: isActive ? COLORS.activeTime : COLORS.prayerTime,
    text_size: px(28),     // Subheadline (consistent)
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
  h: px(60),               // 24 × 1.25 × 2 lines
  color: COLORS.noData,
  text_size: px(24),       // Caption1
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
