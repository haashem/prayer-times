export const DEFAULT_PRAYER_METHOD = 3;

export const PRAYER_METHOD_OPTIONS = [
    { value: 3, labelKey: "method3" },
    { value: 2, labelKey: "method2" },
    { value: 5, labelKey: "method5" },
    { value: 4, labelKey: "method4" },
    { value: 1, labelKey: "method1" },
    { value: 7, labelKey: "method7" },
    { value: 0, labelKey: "method0" },
    { value: 8, labelKey: "method8" },
    { value: 9, labelKey: "method9" },
    { value: 10, labelKey: "method10" },
    { value: 11, labelKey: "method11" },
    { value: 12, labelKey: "method12" },
    { value: 13, labelKey: "method13" },
    { value: 14, labelKey: "method14" },
    { value: 15, labelKey: "method15" },
    { value: 16, labelKey: "method16" },
    { value: 17, labelKey: "method17" },
    { value: 18, labelKey: "method18" },
    { value: 19, labelKey: "method19" },
    { value: 20, labelKey: "method20" },
    { value: 21, labelKey: "method21" },
    { value: 22, labelKey: "method22" },
    { value: 23, labelKey: "method23" },
];

export function normalizePrayerMethod(value) {
    return PRAYER_METHOD_OPTIONS.some((option) => option.value === value)
        ? value : DEFAULT_PRAYER_METHOD;
}
