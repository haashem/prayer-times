import { localStorage } from '@zos/storage';

const STORAGE_KEY = 'prayerVibrationV1';
export const PRAYER_VIBRATION_OPTIONS = [
    { value: 'default', labelKey: 'vibrationDefault' },
    { value: 'strong', labelKey: 'vibrationStrong' },
    { value: 'continuous', labelKey: 'vibrationContinuous' },
];

export function getPrayerVibration() {
    const value = localStorage.getItem(STORAGE_KEY);
    return PRAYER_VIBRATION_OPTIONS.some(option => option.value === value) ? value : 'default';
}

export function setPrayerVibration(value) {
    if (PRAYER_VIBRATION_OPTIONS.some(option => option.value === value)) localStorage.setItem(STORAGE_KEY, value);
}
