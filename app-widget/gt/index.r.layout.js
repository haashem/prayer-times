import { align, text_style } from "@zos/ui";
import { px } from "@zos/utils";

// ── Icon + text card — round 480px ──
// Layout: Row[ icon, Column[ remaining, prayer, hijri ] ]
// Row heights = font_size × 1.25 (line-height rule)
//   Body        32px → 40px   "in 2h 15m"
//   Title1      40px → 50px   "Asr 15:30"
//   Subheadline 28px → 35px   "21 Sha'ban 1446"
export const MARGIN = px(16);
const GAP = px(8);

const REMAINING_H = px(40); // Body 32px
const PRAYER_H = px(50); // Title1 40px
const HIJRI_H = px(35); // Subheadline 28px

// Icon dimensions
export const ICON_SIZE = px(80);
const ICON_GAP = px(12); // gap between icon and text column
export const TEXT_OFFSET = ICON_SIZE + ICON_GAP; // left inset for text

const TEXT_COL_H = REMAINING_H + GAP + PRAYER_H + GAP + HIJRI_H; // 141px

// Dynamic height — derived from actual row sizes + margins
export const CARD_HEIGHT = MARGIN * 2 + Math.max(ICON_SIZE, TEXT_COL_H);

// Icon vertically centered within content area
export const ICON_Y = MARGIN + Math.round((TEXT_COL_H - ICON_SIZE) / 2);

const ROW1_Y = MARGIN;
const ROW2_Y = ROW1_Y + REMAINING_H + GAP;
const ROW3_Y = ROW2_Y + PRAYER_H + GAP;

const COLORS = {
    remaining: 0xd4a843, // Gold
    prayer: 0xffffff, // White — dominant
    hijri: 0xa89880, // Warm sandstone
    noData: 0xd4a843,
};

// ── "in 2h 15m" — Body 32px ──
export const REMAINING_STYLE = {
    y: ROW1_Y,
    h: REMAINING_H,
    text_size: px(32),
    color: COLORS.remaining,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

// ── "Asr 15:30" — Title1 40px ──
export const PRAYER_STYLE = {
    y: ROW2_Y,
    h: PRAYER_H,
    text_size: px(40),
    color: COLORS.prayer,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

// ── "21 Sha'ban 1446" — Subheadline 28px ──
export const HIJRI_STYLE = {
    y: ROW3_Y,
    h: HIJRI_H,
    text_size: px(28),
    color: COLORS.hijri,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const NO_DATA_STYLE = {
    y: 0,
    h: CARD_HEIGHT,
    text_size: px(32),
    color: COLORS.noData,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};
