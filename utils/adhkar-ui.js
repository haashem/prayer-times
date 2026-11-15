import { createWidget, widget, align, text_style } from '@zos/ui';
import { getDeviceInfo } from '@zos/device';

export function adhkarGeometry(square) {
    const info = getDeviceInfo();
    const scale = info.width / (square ? 390 : 480);
    return { width: info.width, height: info.height, square, scale,
        margin: (square ? 24 : 60) * scale, top: (square ? 24 : 44) * scale,
        rowStart: (square ? 100 : 144) * scale, rowHeight: (square ? 100 : 112) * scale };
}

export function adhkarText(geometry, text, y, height, size = 28, color = 0xffffff) {
    return createWidget(widget.TEXT, {
        x: geometry.margin, y, w: geometry.width - geometry.margin * 2, h: height,
        text, text_size: size * geometry.scale, color,
        align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.WRAP,
    });
}
