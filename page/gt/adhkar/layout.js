import { align, text_style } from '@zos/ui';

// Share the existing Settings, Prayer Alerts and Time Format geometry and assets.
// Only two-line rows and the longer reading rows need additional layout rules.
export function createAdhkarLayout(settings, notifications, radio, square) {
    const rowHeight = settings.SCROLL_ITEM_HEIGHT;
    const start = settings.getSettingsRowBgStyle(0).y;
    const bodySize = square ? 28 : 32;
    function row(index, height = rowHeight) {
        return { ...settings.getSettingsRowBgStyle(index), y: start + index * height, h: height };
    }
    function text(index, kind, subtitle, rtl, height = rowHeight) {
        const base = kind === 'toggle' ? notifications.getRowTextStyle(index, rtl)
            : kind === 'radio' ? radio.getTimeFormatRowTextStyle(index, rtl)
            : settings.getSettingsRowTextStyle(index, rtl);
        const bounds = row(index, height);
        if (kind === 'info') {
            const padding = settings.TITLE_STYLE.x;
            return { ...base, x: padding, y: bounds.y, w: settings.TITLE_STYLE.w,
                h: height, text_size: bodySize, text_style: text_style.WRAP,
                align_h: rtl ? align.RIGHT : align.LEFT };
        }
        return { ...base, y: bounds.y + (subtitle ? (square ? 8 : 12) : 0),
            h: subtitle ? (square ? 38 : 44) : height,
            text_size: subtitle ? bodySize : base.text_size,
            text_style: subtitle ? text_style.ELLIPSIS : text_style.WRAP };
    }
    return {
        TITLE_STYLE: settings.TITLE_STYLE, rowHeight, start,
        readingRowHeight: square ? 132 : 156,
        row,
        text,
        subtitle(index, kind, rtl, height = rowHeight) {
            const base = text(index, kind, true, rtl, height);
            return { ...base, y: row(index, height).y + (square ? 48 : 58),
                h: square ? 32 : 36, text_size: square ? 24 : 28, color: 0xa6a6a6 };
        },
        chevron(index, rtl, height = rowHeight) {
            const base = settings.getSettingsRowChevronStyle(index, rtl);
            return { ...base, y: row(index, height).y + (height - base.h) / 2 };
        },
        track(index, checked, rtl, height = rowHeight) {
            const base = notifications.getToggleTrackStyle(index, checked, rtl);
            return { ...base, y: row(index, height).y + (height - base.h) / 2 };
        },
        knob(index, checked, rtl, height = rowHeight) {
            return { ...notifications.getToggleKnobStyle(index, checked, rtl), center_y: row(index, height).y + height / 2 };
        },
        focusTop(index, height = rowHeight) { return { ...settings.getFocusLineTopStyle(index), y: row(index, height).y }; },
        focusBottom(index, height = rowHeight) {
            const base = settings.getFocusLineBottomStyle(index);
            return { ...base, y: row(index, height).y + height - base.h };
        },
        radioGroup(rtl, count) { return { ...radio.getRadioGroupStyle(rtl), h: count * rowHeight }; },
        radioButton: radio.getStateButtonStyle,
        bottom(count, height = rowHeight) { return { x: 0, y: start + count * height, w: 1, h: square ? 40 : 80, color: 0, alpha: 0 }; },
    };
}
