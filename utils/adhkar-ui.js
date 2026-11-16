import { align, text_style } from '@zos/ui';
import { getDeviceInfo } from '@zos/device';

export function createAdhkarAlertLayout(square) {
    const { width, height: contentHeight } = getDeviceInfo();
    const scale = width / (square ? 390 : 480);
    const text = (margin, y, h, size, color) => ({
        x: margin * scale, y: contentHeight * y, w: width - margin * scale * 2, h: contentHeight * h,
        text_size: size * scale, color,
        align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
    });
    const translation = text(square ? 24 : 80, 0.64, 0.22, 32, 0xa6a6a6);
    return {
        square,
        title: text(square ? 24 : 60, 0.08, 0.10, 28, 0xa6a6a6),
        arabic: text(square ? 24 : 48, 0.20, 0.40, square ? 56 : 64, 0xffffff),
        translationStyle() {
            return { ...translation };
        },
    };
}
