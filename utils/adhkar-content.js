// Short meanings, not transliterations. References describe the phrases, not
// a prescribed count or a religious basis for the user's reminder schedule.
export const ADHKAR = [
    { id: 'subhan', arabic: 'سُبْحَانَ اللَّهِ', source: 'Muslim 2137a', url: 'https://sunnah.com/muslim:2137a' },
    { id: 'hamd', arabic: 'الْحَمْدُ لِلَّهِ', source: 'Muslim 2137a', url: 'https://sunnah.com/muslim:2137a' },
    { id: 'akbar', arabic: 'اللَّهُ أَكْبَرُ', source: 'Muslim 2137a', url: 'https://sunnah.com/muslim:2137a' },
    { id: 'tahlil', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', source: 'Muslim 2137a', url: 'https://sunnah.com/muslim:2137a' },
    { id: 'forgiveness', arabic: 'أَسْتَغْفِرُ اللَّهَ', source: 'Muslim 2702a', url: 'https://sunnah.com/muslim:2702a' },
    { id: 'praise', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', source: 'Muslim 2691', url: 'https://sunnah.com/muslim:2691' },
];

export const ADHKAR_MEANINGS = {
    english: ['Glory be to Allah', 'All praise is due to Allah', 'Allah is the Greatest', 'There is no deity but Allah', 'I seek forgiveness from Allah', 'Glory and praise be to Allah'],
    arabic: ['تنزيه الله عن كل نقص', 'الثناء على الله بجميع المحامد', 'الله أعظم من كل شيء', 'لا معبود بحق إلا الله', 'أطلب المغفرة من الله', 'أنزّه الله عن كل نقص وأحمده'],
    farsi: ['خداوند از هر نقصی پاک است', 'همهٔ ستایش‌ها از آنِ خداست', 'خداوند بزرگ‌تر از همه چیز است', 'هیچ معبود برحقی جز الله نیست', 'از خداوند آمرزش می‌خواهم', 'خداوند پاک و منزّه است و او را می‌ستایم'],
    indonesian: ['Mahasuci Allah', 'Segala puji bagi Allah', 'Allah Mahabesar', 'Tidak ada tuhan yang berhak disembah selain Allah', 'Aku memohon ampun kepada Allah', 'Mahasuci Allah dan segala puji bagi-Nya'],
    turkish: ['Allah her türlü eksiklikten uzaktır', 'Bütün övgüler Allah’a aittir', 'Allah en büyüktür', 'Allah’tan başka ibadete layık ilah yoktur', 'Allah’tan bağışlanma dilerim', 'Allah’ı eksikliklerden uzak tutar, O’na hamd ederim'],
    urdu: ['اللہ ہر عیب سے پاک ہے', 'سب تعریفیں اللہ کے لیے ہیں', 'اللہ سب سے بڑا ہے', 'اللہ کے سوا کوئی معبودِ برحق نہیں', 'میں اللہ سے بخشش مانگتا ہوں', 'اللہ پاک ہے اور سب تعریفیں اسی کے لیے ہیں'],
    malay: ['Maha Suci Allah', 'Segala puji bagi Allah', 'Allah Maha Besar', 'Tiada tuhan yang berhak disembah selain Allah', 'Aku memohon keampunan daripada Allah', 'Maha Suci Allah dan segala puji bagi-Nya'],
    bengali: ['আল্লাহ সব ত্রুটি থেকে পবিত্র', 'সমস্ত প্রশংসা আল্লাহর', 'আল্লাহ সর্বশ্রেষ্ঠ', 'আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই', 'আমি আল্লাহর কাছে ক্ষমা চাই', 'আল্লাহ পবিত্র এবং সমস্ত প্রশংসা তাঁর'],
    french: ['Gloire à Allah', 'Toute louange revient à Allah', 'Allah est le plus grand', 'Nulle divinité ne mérite l’adoration sauf Allah', 'Je demande pardon à Allah', 'Gloire et louange à Allah'],
    russian: ['Аллах пречист', 'Вся хвала принадлежит Аллаху', 'Аллах превелик', 'Нет божества, достойного поклонения, кроме Аллаха', 'Прошу у Аллаха прощения', 'Аллах пречист, и Ему хвала'],
};

export function getAdhkarMeaning(id, language = 'english') {
    const index = ADHKAR.findIndex((item) => item.id === id);
    const meanings = ADHKAR_MEANINGS[language === 'arabic-latin' ? 'arabic' : language] || ADHKAR_MEANINGS.english;
    return meanings[index] || '';
}
