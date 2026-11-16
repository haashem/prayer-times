import { align, text_style, getTextLayout } from '@zos/ui';
import { getDeviceInfo } from '@zos/device';

export function createAdhkarAlertLayout(square) {
    const { width, height } = getDeviceInfo();
    const scale = width / (square ? 390 : 480);
    const text = (margin, y, h, size, color) => ({
        x: margin * scale, y: height * y, w: width - margin * scale * 2, h: height * h,
        text_size: size * scale, color,
        align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.WRAP,
    });
    const translation = text(square ? 24 : 80, square ? 0.66 : 0.63, square ? 0.26 : 0.22, 32, 0xa6a6a6);
    return {
        square,
        title: text(square ? 24 : 60, 0.08, 0.10, 28, 0xa6a6a6),
        arabic: text(square ? 24 : 48, 0.20, square ? 0.43 : 0.40, square ? 56 : 64, 0xffffff),
        translationStyle(value) {
            const style = { ...translation };
            // Preserve room for the large Arabic text without clipping longer
            // translations in languages that require more lines.
            while (style.text_size > 26 * scale && getTextLayout(value, {
                text_size: style.text_size, text_width: style.w, wrapped: 1,
            }).height > style.h) style.text_size -= scale;
            return style;
        },
    };
}
