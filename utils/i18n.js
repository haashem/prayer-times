import { localStorage } from "@zos/storage";

export const APP_LANGUAGE_KEY = "appLanguage";
export const DEFAULT_LANGUAGE = "english";

export const LANGUAGE_OPTIONS = [
    { value: "farsi", label: "فارسی" },
    { value: "arabic", label: "العربية" },
    { value: "english", label: "English" },
];

let cachedAppLanguage = null;

const TRANSLATIONS = {
    english: {
        appName: "Prayer Times",
        settings: "Settings",
        help: "Help",
        prayerAlerts: "Prayer Alerts",
        prayerNotificationTitle: "{prayer} Prayer",
        fajrAlarmSound: "Fajr sound",
        am: "AM",
        pm: "PM",
        selectLanguage: "Language",
        contactUs: "Contact Us",
        calculationMethod: "Calculation Method",
        helpIntro:
            "This app detects your location and fetches accurate local prayer times.\n\n" +
            "For the best results:\n" +
            "• Connect to Wi-Fi\n" +
            "• Disconnect from VPN\n" +
            "• Turn off iCloud Private\n" +
            "  Relay on iPhone",
        helpCalculation:
            "Prayer times are calculated using the Muslim World League (MWL) method.\n\n" +
            "Asr time follows the Shafi'i school, where Asr begins when an object's shadow equals its height.",
        detectingLocation: "Detecting location...",
        loadingPrayerTimes: "Loading prayer times...",
        locationDetectionFailed: "Location detection failed",
        checkPhoneConnection: "Check watch is connected to phone",
        noDataToday: "No data for today",
        failedLoadData: "Failed to load data",
        networkError: "Network error. Check connection.",
        noPrayerData: "No prayer data",
        tapSetupPrayerTimes: "Tap to set up Prayer Times",
        tapSetupPrayerTimesTwoLine: "Tap to set up\nPrayer Times",
        qiblaCalibrate: "Rotate your wrist in a figure-8 to calibrate the compass",
        qiblaNoData: "No location data.\nOpen the app first to detect your city.",
        hourUnit: "h",
        minuteUnit: "m",
    },
    farsi: {
        appName: "اوقات شرعی",
        settings: "تنظیمات",
        help: "راهنما",
        prayerAlerts: "اعلان‌های نماز",
        prayerNotificationTitle: "نماز {prayer}",
        fajrAlarmSound: "صدای صبح",
        am: "ق.ظ",
        pm: "ب.ظ",
        selectLanguage: "انتخاب زبان",
        contactUs: "تماس با ما",
        calculationMethod: "روش محاسبه",
        helpIntro:
            "این برنامه موقعیت شما را تشخیص می‌دهد و اوقات شرعی دقیق محلی را دریافت می‌کند.\n\n" +
            "برای بهترین نتیجه:\n" +
            "• به Wi-Fi وصل شوید\n" +
            "• VPN را قطع کنید\n" +
            "• iCloud Private Relay را در iPhone خاموش کنید",
        helpCalculation:
            "اوقات شرعی با روش اتحادیه جهانی مسلمانان (MWL) محاسبه می‌شود.\n\n" +
            "وقت عصر بر اساس مذهب شافعی است؛ یعنی وقتی سایه هر جسم به اندازه ارتفاع خودش برسد.",
        detectingLocation: "در حال تشخیص موقعیت...",
        loadingPrayerTimes: "در حال دریافت اوقات شرعی...",
        locationDetectionFailed: "تشخیص موقعیت ناموفق بود",
        checkPhoneConnection: "اتصال ساعت به گوشی را بررسی کنید",
        noDataToday: "داده‌ای برای امروز نیست",
        failedLoadData: "دریافت داده ناموفق بود",
        networkError: "خطای شبکه. اتصال را بررسی کنید.",
        noPrayerData: "داده اوقات شرعی نیست",
        tapSetupPrayerTimes: "برای تنظیم اوقات شرعی لمس کنید",
        tapSetupPrayerTimesTwoLine: "برای تنظیم\nاوقات شرعی لمس کنید",
        qiblaCalibrate: "برای کالیبره کردن قطب‌نما، مچ خود را به شکل ۸ حرکت دهید",
        qiblaNoData: "داده موقعیت وجود ندارد.\nابتدا برنامه را باز کنید تا شهر شما تشخیص داده شود.",
        hourUnit: "ساعت",
        minuteUnit: "دقیقه",
    },
    arabic: {
        appName: "مواقيت الصلاة",
        settings: "الإعدادات",
        help: "المساعدة",
        prayerAlerts: "تنبيهات الصلاة",
        prayerNotificationTitle: "صلاة {prayer}",
        fajrAlarmSound: "صوت الفجر",
        am: "ص",
        pm: "م",
        selectLanguage: "اختيار اللغة",
        contactUs: "اتصل بنا",
        calculationMethod: "طريقة الحساب",
        helpIntro:
            "يكتشف هذا التطبيق موقعك ويجلب مواقيت الصلاة المحلية بدقة.\n\n" +
            "لأفضل النتائج:\n" +
            "• اتصل بشبكة Wi-Fi\n" +
            "• افصل VPN\n" +
            "• أوقف iCloud Private Relay على iPhone",
        helpCalculation:
            "تُحسب مواقيت الصلاة باستخدام طريقة رابطة العالم الإسلامي (MWL).\n\n" +
            "يتبع وقت العصر المذهب الشافعي، حيث يبدأ العصر عندما يصبح ظل الجسم مساوياً لطوله.",
        detectingLocation: "جارٍ تحديد الموقع...",
        loadingPrayerTimes: "جارٍ تحميل مواقيت الصلاة...",
        locationDetectionFailed: "فشل تحديد الموقع",
        checkPhoneConnection: "تحقق من اتصال الساعة بالهاتف",
        noDataToday: "لا توجد بيانات لليوم",
        failedLoadData: "فشل تحميل البيانات",
        networkError: "خطأ في الشبكة. تحقق من الاتصال.",
        noPrayerData: "لا توجد بيانات للصلاة",
        tapSetupPrayerTimes: "اضغط لإعداد مواقيت الصلاة",
        tapSetupPrayerTimesTwoLine: "اضغط لإعداد\nمواقيت الصلاة",
        qiblaCalibrate: "حرّك معصمك على شكل 8 لمعايرة البوصلة",
        qiblaNoData: "لا توجد بيانات موقع.\nافتح التطبيق أولاً لتحديد مدينتك.",
        hourUnit: "ساعة",
        minuteUnit: "دقيقة",
    },
};

const PRAYER_LABELS = {
    english: {
        Fajr: "Fajr",
        Sunrise: "Sunrise",
        Dhuhr: "Dhuhr",
        Asr: "Asr",
        Maghrib: "Maghrib",
        Isha: "Isha",
    },
    farsi: {
        Fajr: "صبح",
        Sunrise: "طلوع",
        Dhuhr: "ظهر",
        Asr: "عصر",
        Maghrib: "مغرب",
        Isha: "عشا",
    },
    arabic: {
        Fajr: "الفجر",
        Sunrise: "الشروق",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء",
    },
};

const HIJRI_MONTHS = {
    farsi: [
        "محرم",
        "صفر",
        "ربیع‌الاول",
        "ربیع‌الثانی",
        "جمادی‌الاول",
        "جمادی‌الثانی",
        "رجب",
        "شعبان",
        "رمضان",
        "شوال",
        "ذی‌القعده",
        "ذی‌الحجه",
    ],
    arabic: [
        "محرم",
        "صفر",
        "ربيع الأول",
        "ربيع الآخر",
        "جمادى الأولى",
        "جمادى الآخرة",
        "رجب",
        "شعبان",
        "رمضان",
        "شوال",
        "ذو القعدة",
        "ذو الحجة",
    ],
};

const LOCAL_DIGITS = {
    farsi: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
    arabic: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
};

const HIJRI_MONTH_EN_TO_INDEX = {
    muharram: 1,
    safar: 2,
    "rabi al awwal": 3,
    "rabi al thani": 4,
    "jumada al ula": 5,
    "jumada al awwal": 5,
    "jumada al akhirah": 6,
    "jumada al thani": 6,
    rajab: 7,
    shaban: 8,
    ramadan: 9,
    shawwal: 10,
    "dhu al qidah": 11,
    "dhu al qadah": 11,
    "dhu al hijjah": 12,
};

function normalizeMonthName(name) {
    const text = String(name || "").toLowerCase();
    const normalized = typeof text.normalize === "function" ? text.normalize("NFD") : text;
    return normalized
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]+/g, " ")
        .trim();
}

function getHijriDateParts(hijri) {
    const dateParts = hijri && hijri.date ? String(hijri.date).split("-") : [];
    return {
        day: hijri && hijri.day ? hijri.day : dateParts[0],
        month: dateParts[1],
        year: hijri && hijri.year ? hijri.year : dateParts[2],
    };
}

function getHijriMonthNumber(hijri) {
    if (!hijri) return 0;
    if (hijri.month && hijri.month.number) {
        return Number(hijri.month.number);
    }

    const parts = getHijriDateParts(hijri);
    if (parts.month) {
        return Number(parts.month);
    }

    if (hijri.month && hijri.month.en) {
        return HIJRI_MONTH_EN_TO_INDEX[normalizeMonthName(hijri.month.en)] || 0;
    }

    return 0;
}

export function normalizeLanguage(language) {
    for (const option of LANGUAGE_OPTIONS) {
        if (option.value === language) {
            return language;
        }
    }
    return DEFAULT_LANGUAGE;
}

export function getAppLanguage() {
    if (cachedAppLanguage !== null) {
        return cachedAppLanguage;
    }

    try {
        cachedAppLanguage = normalizeLanguage(localStorage.getItem(APP_LANGUAGE_KEY));
    } catch (e) {
        cachedAppLanguage = DEFAULT_LANGUAGE;
    }
    return cachedAppLanguage;
}

export function refreshAppLanguage() {
    cachedAppLanguage = null;
    return getAppLanguage();
}

export function setAppLanguage(language) {
    const normalized = normalizeLanguage(language);
    if (cachedAppLanguage !== normalized) {
        cachedAppLanguage = normalized;
        localStorage.setItem(APP_LANGUAGE_KEY, normalized);
    }
    return normalized;
}

export function isRtl(language = getAppLanguage()) {
    const normalized = normalizeLanguage(language);
    return normalized === "farsi" || normalized === "arabic";
}

export function t(key, language = getAppLanguage()) {
    const normalized = normalizeLanguage(language);
    const text = (
        (TRANSLATIONS[normalized] && TRANSLATIONS[normalized][key]) ||
        TRANSLATIONS[DEFAULT_LANGUAGE][key] ||
        key
    );
    return localizeDigits(text, normalized);
}

export function getPrayerLabel(key, language = getAppLanguage()) {
    const normalized = normalizeLanguage(language);
    return (
        (PRAYER_LABELS[normalized] && PRAYER_LABELS[normalized][key]) ||
        PRAYER_LABELS[DEFAULT_LANGUAGE][key] ||
        key
    );
}

export function localizeDigits(value, language = getAppLanguage()) {
    const normalized = normalizeLanguage(language);
    const digits = LOCAL_DIGITS[normalized];
    const text = String(value);
    if (!digits) return text;
    return text.replace(/[0-9]/g, (digit) => digits[Number(digit)]);
}

export function formatRemaining(totalMinutes, language = getAppLanguage()) {
    const normalized = normalizeLanguage(language);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const minute = t("minuteUnit", normalized);
    const hour = t("hourUnit", normalized);

    if (totalMinutes < 60) {
        return normalized === "english"
            ? `${localizeDigits(totalMinutes, normalized)}${minute}`
            : `${localizeDigits(totalMinutes, normalized)} ${minute}`;
    }

    const hourText = normalized === "english"
        ? `${localizeDigits(hours, normalized)}${hour}`
        : `${localizeDigits(hours, normalized)} ${hour}`;
    const minuteText = normalized === "english"
        ? `${localizeDigits(minutes, normalized)}${minute}`
        : `${localizeDigits(minutes, normalized)} ${minute}`;

    if (minutes === 0) return hourText;
    return normalized === "english" ? `${hourText} ${minuteText}` : `${hourText} و ${minuteText}`;
}

export function formatRelativeRemaining(remainingMinutes, language = getAppLanguage()) {
    const normalized = normalizeLanguage(language);
    const remaining = formatRemaining(remainingMinutes, normalized);

    if (normalized === "farsi") return `${remaining} مانده`;
    if (normalized === "arabic") return `باقي ${remaining}`;
    return `in ${remaining}`;
}

export function formatNextPrayer(label, remainingMinutes, language = getAppLanguage()) {
    const normalized = normalizeLanguage(language);
    if (normalized !== "farsi" && normalized !== "arabic") {
        return `${formatRemaining(remainingMinutes, normalized)} to ${label}`;
    }

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    const remaining = hours > 0
        ? `${localizeDigits(hours, normalized)}" ${localizeDigits(minutes, normalized)}'`
        : `${localizeDigits(minutes, normalized)} ${t("minuteUnit", normalized)}`;

    if (normalized === "farsi") return `${remaining} تا ${label}`;
    if (normalized === "arabic") return `${remaining} حتى ${label}`;
    return "";
}

export function formatHijriDate(hijri, language = getAppLanguage()) {
    if (!hijri) return "";
    const normalized = normalizeLanguage(language);
    const parts = getHijriDateParts(hijri);
    const monthNumber = getHijriMonthNumber(hijri);
    let month = hijri.month && hijri.month.en;

    if (normalized === "arabic") {
        month = (hijri.month && hijri.month.ar) || (HIJRI_MONTHS.arabic && HIJRI_MONTHS.arabic[monthNumber - 1]);
    } else if (normalized === "farsi") {
        month = HIJRI_MONTHS.farsi && HIJRI_MONTHS.farsi[monthNumber - 1];
    }

    return month && parts.day && parts.year
        ? `${localizeDigits(parts.day, normalized)} ${month} ${localizeDigits(parts.year, normalized)}`
        : "";
}
