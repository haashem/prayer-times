import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// Colors
export const COLORS = {
  background: 0x000000,
  title: 0x4fc3f7,       // Light blue for city name
  date: 0xbbbbbb,        // Light gray for dates
  hijriDate: 0x888888,   // Dimmer gray for hijri
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

export const PRAYER_ROW_HEIGHT = px(64);
export const PRAYER_START_Y = px(150);
export const BOTTOM_PADDING = px(80);

// City title (button style — text set dynamically)
export const CITY_STYLE = {
  x: px(40),
  y: px(36),
  w: DEVICE_WIDTH - px(80),
  h: px(44),
  radius: px(8),
  normal_color: 0x000000,
  press_color: 0x1a1a2e,
  text_size: px(34),
  color: COLORS.title,
};

// Hijri date
export const HIJRI_DATE_STYLE = {
  x: px(0),
  y: px(84),
  w: DEVICE_WIDTH,
  h: px(30),
  color: COLORS.hijriDate,
  text_size: px(22),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.ELLIPSIS,
};

// Separator line
export const SEPARATOR_STYLE = {
  x: SIDE_PADDING,
  y: px(126),
  w: CONTENT_WIDTH,
  h: px(1),
  color: COLORS.separator,
};

// Prayer row background
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

// Prayer name text (left-aligned)
export function getPrayerNameStyle(y, isActive) {
  return {
    x: SIDE_PADDING,
    y: y,
    w: CONTENT_WIDTH / 2,
    h: PRAYER_ROW_HEIGHT - px(8),
    color: isActive ? COLORS.activeText : COLORS.prayerName,
    text_size: isActive ? px(28) : px(26),
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
    text_size: isActive ? px(28) : px(26),
    align_h: align.RIGHT,
    align_v: align.CENTER_V,
    text_style: text_style.ELLIPSIS,
  };
}

// No data message
export const NO_DATA_STYLE = {
  text: "No prayer data\nfor today",
  x: px(40),
  y: DEVICE_HEIGHT / 2 - px(40),
  w: DEVICE_WIDTH - px(80),
  h: px(80),
  color: COLORS.noData,
  text_size: px(28),
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text_style: text_style.WRAP,
};
