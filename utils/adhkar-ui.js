import { align, text_style, getTextLayout } from '@zos/ui';
import { getAlertBackgroundStyle } from './alert-background';
import { localizeDigits } from './i18n';

export function timeLabel(value) {
    return localizeDigits(('0' + Math.floor(value / 60)).slice(-2) + ':' + ('0' + value % 60).slice(-2));
}

export function createAdhkarAlertLayout(square) {
    const background = getAlertBackgroundStyle();
    const { w: width, h: contentHeight } = background;
    const scale = width / (square ? 390 : 480);
    const text = (margin, y, h, size, color) => ({
        x: margin * scale, y: contentHeight * y, w: width - margin * scale * 2, h: contentHeight * h,
        text_size: size * scale, color,
        align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.WRAP,
    });
    const translation = text(square ? 24 : 64, 0.62, 0.22, 32, 0xa6a6a6);
    function fitTwoLines(value, bounds) {
        const style = { ...bounds };
        while (style.text_size > 16 * scale) {
            const options = { text_size: style.text_size, text_width: style.w };
            const single = getTextLayout(value, { ...options, wrapped: 0 });
            const wrapped = getTextLayout(value, { ...options, wrapped: 1 });
            if (wrapped.height <= Math.min(single.height * 2, style.h)) break;
            style.text_size -= scale;
        }
        return style;
    }
    const title = text(square ? 24 : 60, 0.08, 0.10, 28, 0xa6a6a6);
    const arabic = text(square ? 24 : 48, 0.20, 0.40, square ? 56 : 64, 0xffffff);
    return {
        square,
        background,
        titleStyle(value) { return fitTwoLines(value, title); },
        arabicStyle(value) { return fitTwoLines(value, arabic); },
        translationStyle(value) { return fitTwoLines(value, translation); },
    };
}
