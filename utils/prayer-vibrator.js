import { VIBRATOR_SCENE_NOTIFICATION, VIBRATOR_SCENE_DURATION_LONG, VIBRATOR_SCENE_TIMER } from '@zos/sensor';

// Shared by the settings preview and the real prayer alert.
export function startPrayerVibration(vibrator, value, isFajr = false) {
    const mode = isFajr || value === 'continuous' ? VIBRATOR_SCENE_TIMER
        : value === 'strong' ? VIBRATOR_SCENE_DURATION_LONG : VIBRATOR_SCENE_NOTIFICATION;
    vibrator.start({ mode });
}
