import { getDeviceInfo } from '@zos/device';

// The same static Woven Ribbon asset frames both prayer and adhkar alerts.
export function getAlertBackgroundStyle() {
    const { width, height } = getDeviceInfo();
    return {
        x: 0, y: 0, w: width, h: height,
        src: 'image/adhkar_border.png', auto_scale: true, auto_scale_obj_fit: true,
    };
}
