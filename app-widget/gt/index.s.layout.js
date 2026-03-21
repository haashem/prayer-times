import { align, text_style } from "@zos/ui";
import { px } from "@zos/utils";

// ── Plain text card — square 390px ──
// Row heights = font_size × 1.25
//   28px → 35px   "in 2h 15m"
//   36px → 45px   "Asr 15:30"
//   24px → 30px   "21 Sha'ban 1446"
export const MARGIN = px(16);
const GAP = px(8);

const REMAINING_H = px(35); // 28px text
const PRAYER_H = px(45); // 36px text
const HIJRI_H = px(30); // 24px text

// Dynamic height — derived from actual row sizes + margins
export const CARD_HEIGHT = MARGIN * 2 + REMAINING_H + GAP + PRAYER_H + GAP + HIJRI_H;

const ROW1_Y = MARGIN;
const ROW2_Y = ROW1_Y + REMAINING_H + GAP;
const ROW3_Y = ROW2_Y + PRAYER_H + GAP;

const COLORS = {
    remaining: 0xd4a843,
    remainingUrgent: 0xff5252,
    prayer: 0xffffff,
    hijri: 0xa89880,
    noData: 0xd4a843,
};

// ── "in 2h 15m" — 28px ──
export const REMAINING_STYLE = {
    y: ROW1_Y,
    h: REMAINING_H,
    text_size: px(28),
    color: COLORS.remaining,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const REMAINING_URGENT_COLOR = COLORS.remainingUrgent;

// ── "Asr 15:30" — 36px ──
export const PRAYER_STYLE = {
    y: ROW2_Y,
    h: PRAYER_H,
    text_size: px(36),
    color: COLORS.prayer,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

// ── "21 Sha'ban 1446" — 24px ──
export const HIJRI_STYLE = {
    y: ROW3_Y,
    h: HIJRI_H,
    text_size: px(24),
    color: COLORS.hijri,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};

export const NO_DATA_STYLE = {
    y: 0,
    h: CARD_HEIGHT,
    text_size: px(28),
    color: COLORS.noData,
    align_h: align.LEFT,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
};
