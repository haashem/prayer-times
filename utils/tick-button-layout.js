import { getDeviceInfo } from '@zos/device';
import { px } from '@zos/utils';

export function createTickButtonLayout(square) {
    const { width, height } = getDeviceInfo();
    return {
        button: {
            x: 0, y: height - px(square ? 80 : 96), w: width, h: px(square ? 80 : 96),
            normal_color: 0x333333, press_color: 0x242424,
        },
        icon: {
            x: (width - px(64)) / 2, y: height - px(square ? 72 : 80), w: px(64), h: px(64),
        },
    };
}
