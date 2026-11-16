import { SETTINGS_ROW_TITLE_SIZE, SETTINGS_ROW_SUBTITLE_SIZE } from '../../../utils/settings-typography';
import { px } from '@zos/utils';
import { align, text_style } from '@zos/ui';

// Share the existing Settings, Prayer Alerts and Time Format geometry and assets.
// Only two-line rows and the longer reading rows need additional layout rules.
export function createAdhkarLayout(settings, notifications, radio, square) {
    // Arabic/Persian glyphs extend well below the Latin baseline. Leave
    // enough room for two full lines rather than cropping to nominal sizes.
    const rowHeight = px(square ? 112 : 120);
    const start = settings.getSettingsRowBgStyle(0).y;
    const bodySize = SETTINGS_ROW_TITLE_SIZE;
    function row(index, height = rowHeight) {
        return { ...settings.getSettingsRowBgStyle(index), y: start + index * height, h: height };
    }
    function text(index, kind, subtitle, rtl, height = rowHeight) {
        const base = kind === 'toggle' ? notifications.getRowTextStyle(index, rtl)
            : (kind === 'radio' || kind === 'checkbox') ? radio.getTimeFormatRowTextStyle(index, rtl)
            : settings.getSettingsRowTextStyle(index, rtl);
        const bounds = row(index, height);
        if (kind === 'section') {
            const padding = settings.TITLE_STYLE.x;
            return { ...base, x: padding, y: bounds.y, w: settings.TITLE_STYLE.w,
                h: height, text_size: px(32), color: 0xffffff, text_style: text_style.NONE,
                align_h: align.CENTER_H };
        }
        return { ...base, y: bounds.y + (subtitle ? px(4) : 0),
            h: subtitle ? px(56) : height,
            text_size: bodySize,
            text_style: text_style.NONE };
    }
    return {
        TITLE_STYLE: settings.TITLE_STYLE, rowHeight, start,
        row,
        text,
        subtitle(index, kind, rtl, height = rowHeight) {
            const base = text(index, kind, true, rtl, height);
            return { ...base, y: row(index, height).y + px(60),
                h: px(48), text_size: SETTINGS_ROW_SUBTITLE_SIZE, color: 0xa6a6a6, text_style: text_style.NONE };
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
        radioButton(index) {
            const base = radio.getStateButtonStyle(index);
            return { ...base, y: index * rowHeight + (rowHeight - base.h) / 2 };
        },
        checkboxGroup(index, rtl) {
            const base = radio.getRadioGroupStyle(rtl);
            return { ...base, y: row(index).y, h: rowHeight };
        },
        bottom(count, height = rowHeight) { return { x: 0, y: start + count * height, w: 1, h: square ? 40 : 80, color: 0, alpha: 0 }; },
    };
}
