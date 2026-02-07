import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// Colors
export const COLORS = {
  background: 0x000000,
  title: 0x4fc3f7,
  date: 0xbbbbbb,
  hijriDate: 0x888888,
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

export const PRAYER_ROW_HEIGHT = px(60);
export const PRAYER_START_Y = px(120);
export const BOTTOM_PADDING = px(40);

// City title (button style — text set dynamically)
export const CITY_STYLE = {
  x: px(24),
  y: px(16),
  w: DEVICE_WIDTH - px(48),
  h: px(36),
  radius: px(6),
  normal_color: 0x000000,
  press_color: 0x1a1a2e,
  text_size: px(30),
  color: COLORS.title,
};

// Hijri date
export const HIJRI_DATE_STYLE = {
  x: px(0),
  y: px(56),
  w: DEVICE_WIDTH,
  h: px(28),
  color: COLORS.hijriDate,
  text_size: px(20),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// Separator line
export const SEPARATOR_STYLE = {
  x: SIDE_PADDING,
  y: px(96),
  w: CONTENT_WIDTH,
  h: px(1),
  color: COLORS.separator,
};

// Prayer row background
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

// Prayer name text (left-aligned)
export function getPrayerNameStyle(y, isActive) {
  return {
    x: SIDE_PADDING,
    y: y,
    w: CONTENT_WIDTH / 2,
    h: PRAYER_ROW_HEIGHT - px(8),
    color: isActive ? COLORS.activeText : COLORS.prayerName,
    text_size: isActive ? px(26) : px(24),
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// Prayer time text (right-aligned)
export function getPrayerTimeStyle(y, isActive) {
  return {
    x: DEVICE_WIDTH / 2,
    y: y,
    w: DEVICE_WIDTH / 2 - SIDE_PADDING,
    h: PRAYER_ROW_HEIGHT - px(8),
    color: isActive ? COLORS.activeTime : COLORS.prayerTime,
    text_size: isActive ? px(26) : px(24),
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// No data message
export const NO_DATA_STYLE = {
  text: "No prayer data\nfor today",
  x: px(24),
  y: DEVICE_HEIGHT / 2 - px(30),
  w: DEVICE_WIDTH - px(48),
  h: px(60),
  color: COLORS.noData,
  text_size: px(26),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
