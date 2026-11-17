import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWatch, at } from './helpers/watch.mjs';

process.env.TZ = 'Europe/London';
// Fixed expected copy: no production catalog is imported to compute assertions.
const meanings = JSON.parse(await readFile(new URL('./fixtures/adhkar-meanings.json', import.meta.url), 'utf8'));
const phrases = [
    ['سُبْحَانَ اللَّهِ', 'Glory be to Allah', 'Muslim 2137a'],
    ['الْحَمْدُ لِلَّهِ', 'All praise is due to Allah', 'Muslim 2137a'],
    ['اللَّهُ أَكْبَرُ', 'Allah is the Greatest', 'Muslim 2137a'],
    ['لَا إِلَهَ إِلَّا اللَّهُ', 'There is no deity but Allah', 'Muslim 2137a'],
    ['أَسْتَغْفِرُ اللَّهَ', 'I seek forgiveness from Allah', 'Muslim 2702a'],
    ['سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'Glory and praise be to Allah', 'Muslim 2691'],
    ['اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', 'O Allah, bless Muhammad', 'Muslim 405'],
];
async function openAdhkar(watch) { await watch.openSettings(); await watch.tap('Adhkar'); }
async function enable(watch) { await openAdhkar(watch); await watch.tap('Reminders'); }
async function chooseSchedule(watch, label) {
    await watch.tap('Schedule'); await watch.tap(new RegExp(label + '$')); await watch.back();
}
async function editTime(watch, label, time) {
    await watch.tap(label); await watch.pickTime(time);
}
async function keepOnly(watch, indices) {
    for (const [index, [arabic]] of phrases.entries()) {
        if (indices.includes(index)) continue;
        await watch.tap(arabic);
    }
}
function expectNext(watch, day, time) { assert.equal(watch.nextReminderAt?.getTime(), at(day, time).getTime()); }
function expectReminder(reminder, index) {
    assert.deepEqual(reminder.texts, ['Adhkar', phrases[index][0], phrases[index][1]]);
    assert.equal(reminder.interactive, 0, 'Alert has no onscreen buttons');
    assert.equal(reminder.brightTime, 5000);
}

for (const shape of ['r', 's']) {
    test(`${shape}: reminders require opt-in, default to three daily times and all seven phrases`, async () => {
        const watch = await createWatch({ shape });
        await watch.openSettings(); await watch.selectWithCrown('Adhkar');
        assert.ok(watch.switchState('Reminders') === false);
        assert.ok(watch.row('Schedule') === 'Schedule\nThree times daily');
        assert.ok(watch.row('Start time') === 'Start time\n08:00');
        assert.ok(watch.row('End time') === 'End time\n22:00');
        for (const [index, time] of ['09:00', '14:00', '20:00'].entries()) {
            assert.ok(watch.row(`Daily times ${index + 1}`) === `Daily times ${index + 1}\n${time}`);
        }
        assert.equal(watch.alarmCount, 0);
            for (const [arabic, meaning] of phrases) {
            assert.equal(watch.row(arabic), arabic + '\n' + meaning);
            assert.equal(watch.checkboxState(arabic), true);
        }
        await watch.selectWithCrown('Reminders');
        expectNext(watch, '2026-11-15', '09:00');
        assert.equal(watch.alarmCount, 1);
        assert.equal(watch.persistentAlarms, true);
        watch.closeApp();
        await watch.advanceTo(at('2026-11-15', '08:59'));
        assert.equal(watch.reminders.length, 0);
        await watch.advanceTo(at('2026-11-15', '09:00'));
        expectReminder(watch.reminders[0], 0);
        assert.deepEqual(watch.vibrations.map(event => event.mode), ['notification'], 'Adhkar uses the regular prayer notification pattern');
        await watch.elapse(4999);
        assert.ok(watch.screen.includes(phrases[0][0]));
        await watch.elapse(1);
        assert.deepEqual(watch.screen, [], 'Screen closes without user interaction');
        await watch.advanceTo(at('2026-11-15', '14:00')); expectReminder(watch.reminders[1], 1);
        await watch.advanceTo(at('2026-11-15', '20:00')); expectReminder(watch.reminders[2], 2);
        await watch.advanceTo(at('2026-11-16', '08:59'));
        assert.equal(watch.reminders.length, 3, 'No overnight reminders');
        await watch.advanceTo(at('2026-11-16', '09:00')); expectReminder(watch.reminders[3], 3);
    });
}

for (const [label, expectedTimes] of [
    ['Every 30 minutes', ['09:00', '09:30', '10:00', '10:30', '11:00']],
    ['Every hour', ['09:00', '10:00', '11:00']],
    ['Every two hours', ['09:00', '11:00']],
]) {
    test(`choosing ${label} respects edited waking hours and restarts at the next day's start`, async () => {
        const watch = await createWatch(); await enable(watch);
        await chooseSchedule(watch, label);
        await editTime(watch, 'Start time', '09:00');
        await editTime(watch, 'End time', '11:00');
        assert.ok(watch.row('Start time') === 'Start time\n09:00');
        assert.ok(watch.row('End time') === 'End time\n11:00');
        watch.closeApp();
        for (const [index, time] of expectedTimes.entries()) {
            expectNext(watch, '2026-11-15', time);
            await watch.advanceTo(at('2026-11-15', time));
            expectReminder(watch.reminders[index], index);
        }
        await watch.advanceTo(at('2026-11-16', '08:59'));
        assert.equal(watch.reminders.length, expectedTimes.length);
        expectNext(watch, '2026-11-16', '09:00');
        await watch.advanceTo(at('2026-11-16', '09:00'));
        expectReminder(watch.reminders.at(-1), expectedTimes.length % phrases.length);
    });
}

test('edits to all three daily times save immediately and survive restarting the watch', async () => {
    let watch = await createWatch(); await enable(watch);
    for (const [index, time] of ['09:15', '14:30', '20:45'].entries()) await editTime(watch, `Daily times ${index + 1}`, time);
    watch = await watch.restart();
    await openAdhkar(watch);
    assert.ok(watch.switchState('Reminders') === true);
    for (const [index, time] of ['09:15', '14:30', '20:45'].entries()) {
        assert.ok(watch.row(`Daily times ${index + 1}`) === `Daily times ${index + 1}\n${time}`);
    }
    expectNext(watch, '2026-11-15', '09:15');
    await watch.advanceTo(at('2026-11-15', '20:45'));
    assert.deepEqual(watch.reminders.map(reminder => [reminder.at.getHours(), reminder.at.getMinutes()]), [[9, 15], [14, 30], [20, 45]]);
});

test('only selected phrases cycle, browsing does not advance them, and restart preserves the next phrase', async () => {
    let watch = await createWatch(); await enable(watch); await keepOnly(watch, [0, 2]);
    for (const [arabic, meaning, source] of phrases) {
        assert.equal(watch.row(arabic), arabic + '\n' + meaning);
    }
    watch.closeApp();
    await watch.advanceTo(at('2026-11-15', '09:00')); expectReminder(watch.reminders[0], 0);
    watch = await watch.restart();
    await watch.advanceTo(at('2026-11-15', '14:00')); expectReminder(watch.reminders[0], 2);
    await watch.advanceTo(at('2026-11-15', '20:00')); expectReminder(watch.reminders[1], 0);
    await watch.advanceTo(at('2026-11-16', '09:00')); expectReminder(watch.reminders[2], 2);
    await openAdhkar(watch);
    for (const [index, [arabic]] of phrases.entries()) {
        assert.equal(watch.checkboxState(arabic), [0, 2].includes(index));
    }
});

test('selecting all checkboxes restores the full collection and the sequence wraps after its final phrase', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, [0]);
    for (const [arabic] of phrases) if (!watch.checkboxState(arabic)) await watch.tapCheckbox(arabic);
    for (const [arabic, meaning] of phrases) {
            assert.equal(watch.row(arabic), arabic + '\n' + meaning);
            assert.equal(watch.checkboxState(arabic), true);
        }
    await watch.advanceTo(at('2026-11-17', '09:00'));
    assert.equal(watch.reminders.length, 7);
    watch.reminders.forEach((reminder, index) => expectReminder(reminder, index % phrases.length));
});

test('turning off the final phrase explains the change, stops reminders, and can be reversed', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, []);
    assert.deepEqual(watch.messages, ['Reminders turned off: no phrases enabled.']);
    assert.ok(watch.switchState('Reminders') === false);
    assert.equal(watch.nextReminderAt, null);
    for (const [arabic] of phrases) if (!watch.checkboxState(arabic)) await watch.tapCheckbox(arabic);
    assert.ok(watch.switchState('Reminders') === false, 'Selecting content alone does not enable notifications');
    await watch.advanceTo(at('2026-11-16', '08:00'));
    assert.equal(watch.reminders.length, 0);
    await openAdhkar(watch); await watch.tap('Reminders');
    await watch.advanceTo(at('2026-11-16', '09:00')); expectReminder(watch.reminders[0], 0);
});

test('turning the master switch back on with an empty collection selects all phrases', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, []);
    await watch.tap('Reminders');
    for (const [arabic, meaning] of phrases) {
            assert.equal(watch.row(arabic), arabic + '\n' + meaning);
            assert.equal(watch.checkboxState(arabic), true);
        }
    expectNext(watch, '2026-11-15', '09:00');
});

test('turning reminders off cancels delivery, including an alarm already handed to the OS', async () => {
    const watch = await createWatch(); await enable(watch);
    const queued = watch.captureNextAlarm();
    await watch.tap('Reminders');
    assert.equal(watch.nextReminderAt, null);
    watch.sleepUntil(at('2026-11-15', '09:00'));
    await watch.deliverSavedAlarm(queued);
    assert.equal(watch.reminders.length, 0); assert.equal(watch.vibrations.length, 0);
    await watch.advanceTo(at('2026-11-16', '08:00'));
    assert.equal(watch.reminders.length, 0);
    await openAdhkar(watch); await watch.tap('Reminders');
    await watch.advanceTo(at('2026-11-16', '09:00')); expectReminder(watch.reminders[0], 0);
});

test('changing schedules rejects the old alarm and never delivers the same occurrence twice', async () => {
    const watch = await createWatch(); await enable(watch); await chooseSchedule(watch, 'Every 30 minutes');
    const old = watch.captureNextAlarm();
    await chooseSchedule(watch, 'Every hour');
    watch.sleepUntil(at('2026-11-15', '08:30')); await watch.deliverSavedAlarm(old);
    assert.equal(watch.reminders.length, 0); expectNext(watch, '2026-11-15', '09:00');
    const current = watch.captureNextAlarm();
    await watch.advanceTo(at('2026-11-15', '09:00')); expectReminder(watch.reminders[0], 0);
    await watch.elapse(5000); await watch.deliverSavedAlarm(current);
    assert.equal(watch.reminders.length, 1); assert.equal(watch.vibrations.length, 1);
    await watch.advanceTo(at('2026-11-15', '10:00')); expectReminder(watch.reminders[1], 1);
});

test('waking after a missed reminder does not catch up or consume the queued phrase', async () => {
    const watch = await createWatch(); await enable(watch);
    watch.sleepUntil(at('2026-11-15', '16:00')); await watch.deliverOverdueAlarm();
    assert.deepEqual(watch.screen, []); assert.equal(watch.reminders.length, 0); assert.equal(watch.vibrations.length, 0);
    expectNext(watch, '2026-11-15', '20:00');
    await watch.advanceTo(at('2026-11-15', '20:00')); expectReminder(watch.reminders[0], 0);
});

test('opening the app after an undelivered alarm recovers future reminders without catching up', async () => {
    let watch = await createWatch(); await enable(watch);
    watch.sleepUntil(at('2026-11-15', '16:00')); watch = await watch.restart();
    await watch.openHome();
    assert.equal(watch.reminders.length, 0); expectNext(watch, '2026-11-15', '20:00');
    await watch.advanceTo(at('2026-11-15', '20:00')); expectReminder(watch.reminders[0], 0);
});

test('failed alarm creation is recovered when the app is reopened', async () => {
    const watch = await createWatch(); await openAdhkar(watch);
    watch.failNextAlarmCreation(); await watch.tap('Reminders');
    assert.equal(watch.nextReminderAt, null);
    await watch.openHome(); expectNext(watch, '2026-11-15', '09:00');
    await watch.advanceTo(at('2026-11-15', '09:00')); expectReminder(watch.reminders[0], 0);
});

test('invalid picker choices explain the problem and preserve the last valid schedule', async () => {
    const watch = await createWatch(); await enable(watch);
    await watch.tap('Start time'); await watch.pickTime('10:00');
    assert.ok(watch.messages.at(-1).includes('within the waking window'));
    expectNext(watch, '2026-11-15', '09:00');
    await watch.pickTime('09:00');
    assert.equal(watch.row('Start time'), 'Start time\n09:00');
    await watch.tap('Daily times 2'); await watch.pickTime('09:00');
    assert.equal(watch.messages.length, 2);
    await watch.pickTime('10:00');
    assert.equal(watch.row('Daily times 2'), 'Daily times 2\n10:00');
    await watch.tap('End time'); await watch.pickTime('00:00');
    assert.equal(watch.messages.length, 3);
    await watch.back();
    assert.equal(watch.row('End time'), 'End time\n22:00');
    expectNext(watch, '2026-11-15', '09:00');
});

for (const prayerTime of ['09:00', '09:05']) {
    test(`an existing prayer alert at ${prayerTime} does not suppress the 09:00 dhikr`, async () => {
        const watch = await createWatch(); await watch.providePrayerTimes({ Dhuhr: prayerTime });
        await enable(watch);
        await watch.openSettings(); await watch.tap('Prayer Alerts');
        await watch.tap('Dhuhr'); await watch.runPendingTasks();
        await watch.tap('Dhuhr'); await watch.runPendingTasks();
        assert.equal(watch.alarmCount, 6, 'Five prayer alarms and one adhkar alarm coexist');
        await watch.advanceTo(at('2026-11-15', prayerTime));
        assert.equal(watch.reminders.length, 1); expectReminder(watch.reminders[0], 0);
        assert.ok(watch.screen.includes('Dhuhr'), 'The prayer alert also displays');
        expectNext(watch, '2026-11-15', '14:00');
    });
}

for (const [language, title, reminderLabel] of [
    ['english', 'Adhkar', 'Reminders'],
    ['arabic', 'الأذكار', 'التذكيرات'],
    ['arabic-latin', 'الأذكار', 'التذكيرات'],
    ['farsi', 'اذکار', 'یادآوری‌ها'],
    ['indonesian', 'Zikir', 'Pengingat'],
    ['turkish', 'Zikirler', 'Hatırlatıcılar'],
    ['urdu', 'اذکار', 'یاد دہانیاں'],
    ['malay', 'Zikir', 'Peringatan'],
    ['bengali', 'যিকির', 'স্মরণবার্তা'],
    ['french', 'Adhkar', 'Rappels'],
    ['russian', 'Азкары', 'Напоминания'],
]) {
    for (const shape of ['r', 's']) {
        test(`${shape}/${language}: the user enables reminders and reads Arabic with the app-language meaning`, async () => {
            const watch = await createWatch({ shape, language });
            await watch.openSettings(); await watch.tap(title); await watch.tap(reminderLabel);
            // The collection must show Arabic primary text and native-language
            // meaning, rather than replacing the meaning with an On/Off status.
            const collectionLabel = {
                english: 'Collection', arabic: 'مجموعة الأذكار', 'arabic-latin': 'مجموعة الأذكار',
                farsi: 'مجموعهٔ اذکار', indonesian: 'Kumpulan zikir', turkish: 'Zikir listesi',
                urdu: 'اذکار کا مجموعہ', malay: 'Koleksi zikir', bengali: 'যিকির সংগ্রহ',
                french: 'Collection', russian: 'Сборник',
            }[language];
            assert.ok(watch.screen.includes(collectionLabel));
            for (const [index, [arabic]] of phrases.entries()) {
                assert.equal(watch.row(arabic), arabic + '\n' + meanings[language === 'arabic-latin' ? 'arabic' : language][index]);
                const appearance = watch.appearance(arabic);
                assert.equal(appearance.title.text_size, 36);
                assert.equal(appearance.subtitle.text_size, 32);
                assert.ok(appearance.title.h >= appearance.title.text_size * 1.5, 'Title has room for Arabic descenders and vowel marks');
                assert.ok(appearance.subtitle.h >= appearance.subtitle.text_size * 1.5, 'Subtitle has room below the baseline');
                assert.ok(appearance.title.y + appearance.title.h <= appearance.subtitle.y, 'Expanded text boxes do not overlap');
                assert.equal(appearance.title.align_h, 4, 'Arabic remains right-aligned in every app language');
            }
            for (const { x, w } of watch.textBounds) assert.ok(x >= 0 && x + w <= (shape === 'r' ? 480 : 390));
            for (const [index, time] of ['09:00', '14:00', '20:00', '09:00', '14:00', '20:00', '09:00'].entries()) {
                await watch.advanceTo(at(['2026-11-15', '2026-11-16', '2026-11-17'][Math.floor(index / 3)], time));
                assert.deepEqual(watch.screen, [title, phrases[index][0], meanings[language === 'arabic-latin' ? 'arabic' : language][index]]);
                assert.equal(watch.reminders[index].interactive, 0);
                const background = watch.scene[0];
                assert.equal(background.type, 'IMG');
                assert.equal(background.src, 'image/adhkar_border.png');
                assert.equal(background.w, shape === 'r' ? 480 : 390);
                assert.equal(background.h, shape === 'r' ? 480 : 390);
                const [heading, arabicText, translation] = watch.scene.filter(w => w.type === 'TEXT');
                for (const text of [heading, arabicText, translation]) {
                    assert.equal(text.text_style, 1, 'Alert text wraps instead of scrolling');
                }
                assert.ok(arabicText.text_size >= 48, 'Arabic remains prominent while fitting the text');
                assert.ok(watch.textLineCounts.every(count => count <= 2), 'Each alert text block fits within two lines');
                assert.ok(arabicText.text_size > heading.text_size * 1.5);
                assert.ok(arabicText.text_size > translation.text_size * 1.5);
                assert.ok(heading.y + heading.h <= arabicText.y);
                assert.ok(arabicText.y + arabicText.h <= translation.y);
                assert.equal(watch.scene.some(w => w.type === 'BUTTON'), false);
                assert.ok(translation.y + translation.h <= (shape === 'r' ? 480 : 390), 'Translation fits on screen');
                await watch.elapse(5000); assert.deepEqual(watch.screen, []);
            }
        });
    }
}

for (const [before, after] of [['2026-12-31', '2027-01-01'], ['2026-03-28', '2026-03-29'], ['2026-10-24', '2026-10-25']]) {
    test(`daily reminders keep local times across ${before} → ${after}`, async () => {
        const watch = await createWatch({ now: at(before, '21:00') });
        await enable(watch); expectNext(watch, after, '09:00');
        await watch.advanceTo(at(after, '09:00')); expectReminder(watch.reminders[0], 0);
        expectNext(watch, after, '14:00');
    });
}


test('half-hour reminders skip nonexistent spring clock times without duplicate catch-up alerts', async () => {
    const watch = await createWatch({ now: at('2026-03-28', '23:00') });
    await enable(watch); await chooseSchedule(watch, 'Every 30 minutes');
    await editTime(watch, 'Start time', '00:00');
    await editTime(watch, 'End time', '03:00');
    for (const [index, time] of ['00:00', '00:30', '02:00', '02:30', '03:00'].entries()) {
        expectNext(watch, '2026-03-29', time);
        await watch.advanceTo(at('2026-03-29', time));
        expectReminder(watch.reminders[index], index);
    }
    assert.equal(watch.reminders.length, 5);
    expectNext(watch, '2026-03-30', '00:00');
});


test('the collection can be read with reminders off and browsing schedules nothing', async () => {
    const watch = await createWatch(); await openAdhkar(watch);
    for (const [arabic, meaning, source] of phrases) {
        assert.equal(watch.row(arabic), arabic + '\n' + meaning);
        assert.equal(watch.checkboxState(arabic), true);
    }
    assert.equal(watch.alarmCount, 0);
    watch.closeApp(); await watch.advanceTo(at('2026-11-16', '23:00'));
    assert.equal(watch.reminders.length, 0);
});

test('a reminder while the app is open returns to the previous screen automatically', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, [0, 2]);
    const previousScreen = watch.screen;
    await watch.deliverNextReminderInForeground();
    expectReminder(watch.reminders[0], 0);
    await watch.elapse(5000);
    assert.deepEqual(watch.screen, previousScreen);
    await watch.tap('Reminders'); // Turn off without losing the chosen collection.
    await watch.tap('Reminders'); // Turn back on.
    await watch.advanceTo(at('2026-11-15', '14:00'));
    expectReminder(watch.reminders[1], 2);
});

for (const shape of ['r', 's']) {
    for (const language of ['english', 'arabic']) {
        test(`${shape}/${language}: adhkar uses the app's native list, switch and radio design`, async () => {
            const watch = await createWatch({ shape, language });
            const rtl = language === 'arabic';
            const labels = rtl ? ['الأذكار', 'التذكيرات', 'الجدول', 'كل ساعة', 'وقت البداية']
                : ['Adhkar', 'Reminders', 'Schedule', 'Every hour', 'Start time'];
            await watch.openSettings();
            const existingRow = watch.appearance(labels[0]);
            const existingTitle = watch.scene.find(w => w.type === 'TEXT');
            await watch.tap(labels[0]);
            const title = watch.scene.find(w => w.type === 'TEXT');
            assert.equal(title.text_size, existingTitle.text_size);
            assert.equal(title.color, existingTitle.color);
            const nav = watch.appearance(labels[2]);
            assert.ok(nav.chevron, 'Navigation rows have the existing chevron asset');
            assert.equal(nav.chevron.angle, existingRow.chevron.angle);
            assert.equal(nav.title.align_h, existingRow.title.align_h);
            assert.equal(nav.subtitle.color, 0xa6a6a6);
            assert.equal(nav.title.text_size, 36);
            assert.equal(nav.subtitle.text_size, 32);
            assert.equal(watch.appearance(labels[1]).title.text_size, nav.title.text_size);
            assert.equal(existingRow.title.text_size, nav.title.text_size);
            assert.ok(nav.title.y + nav.title.h <= nav.subtitle.y);
            if (rtl) assert.ok(nav.chevron.x + nav.chevron.w <= nav.title.x);
            else assert.ok(nav.title.x + nav.title.w <= nav.chevron.x);
            assert.equal(watch.switchState(labels[1]), false);
            const off = watch.appearance(labels[1]);
            await watch.tap(labels[1]);
            assert.equal(watch.switchState(labels[1]), true);
            const on = watch.appearance(labels[1]);
            assert.equal(on.track.color, 0x078bd1);
            assert.equal(on.knob.color, 0xffffff);
            assert.ok(rtl ? on.track.x + on.track.w <= on.title.x : on.title.x + on.title.w <= on.track.x);
            assert.ok(rtl ? on.knob.center_x < off.knob.center_x : on.knob.center_x > off.knob.center_x);
            await watch.tap(labels[2]);
            assert.deepEqual(watch.radioOptions.map(option => option.selected), [true, false, false, false]);
            await watch.tap(labels[3]);
            assert.deepEqual(watch.radioOptions.map(option => option.selected), [false, false, true, false]);
            await watch.back();
            const timeRow = watch.appearance(labels[4]);
            assert.ok(timeRow.chevron);
            assert.equal(timeRow.subtitle.text, rtl ? '٠٨:٠٠' : '08:00');
        });
    }
}


for (const shape of ['r', 's']) {
    test(`${shape}: daily time rows are shown only for the three-times-daily schedule`, async () => {
        const watch = await createWatch({ shape }); await enable(watch);
        await editTime(watch, 'Daily times 1', '09:15');
        for (const schedule of ['Every 30 minutes', 'Every hour', 'Every two hours']) {
            await chooseSchedule(watch, schedule);
            assert.equal(watch.screen.filter(text => text.startsWith('Daily times')).length, 0);
            assert.ok(watch.screen.includes('Start time'));
            assert.ok(watch.screen.includes('End time'));
            await chooseSchedule(watch, 'Three times daily');
            assert.deepEqual(watch.screen.filter(text => text.startsWith('Daily times')), ['Daily times 1', 'Daily times 2', 'Daily times 3']);
            assert.equal(watch.row('Daily times 1'), 'Daily times 1\n09:15');
        }
    });

    test(`${shape}: the system picker offers only quarter hours and saves when the tick confirms the draft`, async () => {
        let watch = await createWatch({ shape }); await enable(watch);
        await watch.tap('Daily times 1');
        assert.equal(watch.picker.title, 'Daily times 1');
        assert.deepEqual(watch.picker.hours, Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')));
        assert.deepEqual(watch.picker.minutes, ['00', '15', '30', '45']);
        assert.equal(watch.picker.initialHour, 9); assert.equal(watch.picker.initialMinute, 0);
        await watch.choosePickerColumn(0, 10);
        expectNext(watch, '2026-11-15', '09:00'); // Selecting only an hour does not save.
        await watch.back(); // Cancel unfinished selection.
        assert.equal(watch.row('Daily times 1'), 'Daily times 1\n09:00');
        await watch.tap('Daily times 1'); await watch.pickTime('10:45');
        assert.equal(watch.row('Daily times 1'), 'Daily times 1\n10:45');
        expectNext(watch, '2026-11-15', '10:45');
        watch = await watch.restart(); await openAdhkar(watch); await watch.tap('Daily times 1');
        assert.equal(watch.picker.initialHour, 10); assert.equal(watch.picker.initialMinute, 3);
        await watch.back();
        await watch.advanceTo(at('2026-11-15', '10:45')); expectReminder(watch.reminders[0], 0);
    });
}

test('returning to daily reminders after narrowing the interval window restores three editable times inside it', async () => {
    const watch = await createWatch(); await enable(watch); await chooseSchedule(watch, 'Every hour');
    await editTime(watch, 'Start time', '09:00'); await editTime(watch, 'End time', '11:00');
    await chooseSchedule(watch, 'Three times daily');
    assert.equal(watch.row('Daily times 1'), 'Daily times 1\n09:00');
    assert.equal(watch.row('Daily times 2'), 'Daily times 2\n10:00');
    assert.equal(watch.row('Daily times 3'), 'Daily times 3\n11:00');
    await watch.advanceTo(at('2026-11-15', '11:00'));
    assert.deepEqual(watch.reminders.map(reminder => reminder.at.getHours()), [9, 10, 11]);
});


for (const shape of ['r', 's']) {
    test(`${shape}: pressing the time picker's tick returns even without changing either wheel`, async () => {
        const watch = await createWatch({ shape }); await enable(watch);
        await watch.tap('Daily times 1'); await watch.pressTick();
        assert.equal(watch.row('Daily times 1'), 'Daily times 1\n09:00');
        expectNext(watch, '2026-11-15', '09:00');
    });
    test(`${shape}: hardware Back and swipe Back leave the time picker without saving`, async () => {
        const watch = await createWatch({ shape }); await enable(watch);
        await watch.tap('Daily times 1'); await watch.choosePickerColumn(0, 10);
        await watch.choosePickerColumn(1, 2);
        await watch.pressBackKey();
        assert.equal(watch.row('Daily times 1'), 'Daily times 1\n09:00');
        await watch.tap('Daily times 1'); await watch.choosePickerColumn(0, 11);
        await watch.swipeBack();
        assert.equal(watch.row('Daily times 1'), 'Daily times 1\n09:00');
    });
}


test('changing both time wheels does not save or navigate until the tick is pressed', async () => {
    const watch = await createWatch(); await enable(watch);
    await watch.tap('Daily times 1');
    await watch.choosePickerColumn(0, 10); await watch.choosePickerColumn(1, 2);
    assert.equal(watch.picker.title, 'Daily times 1');
    expectNext(watch, '2026-11-15', '09:00');
    await watch.pressTick();
    assert.equal(watch.row('Daily times 1'), 'Daily times 1\n10:30');
    expectNext(watch, '2026-11-15', '10:30');
    await watch.tap('Daily times 1'); await watch.pressBackKey();
    await watch.tap('Schedule'); await watch.selectWithCrown('Every hour');
    await watch.back(); assert.equal(watch.row('Schedule'), 'Schedule\nEvery hour');
});


for (const shape of ['r', 's']) {
    test(`${shape}: time rows push the dedicated picker page and pop back to their original row`, async () => {
        const watch = await createWatch({ shape }); await enable(watch);
        for (const [label, title, focus] of [
            ['Start time', 'Start time', 2], ['End time', 'End time', 3],
            ['Daily times 1', 'Daily times 1', 4], ['Daily times 2', 'Daily times 2', 5], ['Daily times 3', 'Daily times 3', 6],
        ]) {
            const builds = watch.pageBuildCount;
            await watch.tap(label);
            assert.equal(watch.route, 'page/gt/adhkar-time-picker/index.page');
            assert.equal(watch.picker.title, title);
            assert.equal(watch.pageBuildCount, builds + 1, 'Picker gets its own page lifecycle');
            await watch.pressTick();
            assert.equal(watch.route, 'page/gt/adhkar/index.page');
            assert.equal(watch.scrollIndex, focus, 'Return restores crown and scroll position');
            assert.equal(watch.pageBuildCount, builds + 2);
        }
        await watch.tap('Daily times 1'); await watch.pickTime('10:15');
        assert.equal(watch.row('Daily times 1'), 'Daily times 1\n10:15');
        await watch.tap('Daily times 1'); await watch.choosePickerColumn(0, 11); await watch.pressBackKey();
        assert.equal(watch.route, 'page/gt/adhkar/index.page');
        assert.equal(watch.row('Daily times 1'), 'Daily times 1\n10:15');
        assert.equal(watch.scrollIndex, 4);
    });
    test(`${shape}: dhikr rows toggle inline checkboxes and scroll long translations`, async () => {
        const watch = await createWatch({ shape }); await enable(watch);
        const builds = watch.pageBuildCount;
        assert.equal(watch.route, 'page/gt/adhkar/index.page');
        assert.ok(watch.screen.includes('Reminders'));
        const section = watch.appearance('Collection');
        assert.equal(section.chevron, undefined, 'Collection is a section heading, not navigation');
        assert.equal(section.title.text_size, 32);
        assert.equal(section.title.color, 0xffffff);
        assert.equal(section.title.align_h, 1, 'Section heading is centered');
        const [arabic, meaning] = phrases[3];
        assert.equal(watch.checkboxState(arabic), true);
        await watch.tap(arabic);
        assert.equal(watch.checkboxState(arabic), false);
        assert.equal(watch.pageBuildCount, builds, 'No dhikr subpage');
        await watch.tapCheckbox(arabic);
        assert.equal(watch.checkboxState(arabic), true);
        const appearance = watch.appearance(arabic);
        assert.equal(appearance.chevron, undefined);
        assert.equal(appearance.subtitle.text, meaning);
        assert.equal(appearance.subtitle.text_style, 2, 'Native scrolling text instead of ellipsis');
        assert.equal(appearance.title.text_style, 2, 'Long Arabic titles scroll too');
        assert.deepEqual(watch.screen.slice(watch.screen.indexOf('Collection') + 1), phrases.flatMap(([arabic, meaning]) => [arabic, meaning]), 'Collection is the final section of the main Adhkar page');
        await watch.tap('Schedule');
        await watch.tap('Every two hours'); await watch.back();
        assert.equal(watch.appearance('Schedule').subtitle.text_style, 2);
        assert.equal(watch.appearance('Schedule').title.text_style, 2);
        assert.equal(watch.appearance('Reminders').title.text_style, 2);
    });
}


for (const shape of ['r', 's']) {
    test(`${shape}: hardware Back dismisses the alert immediately and cancels its automatic return timer`, async () => {
        const watch = await createWatch({ shape }); await enable(watch);
        await watch.deliverNextReminderInForeground();
        const alarm = watch.captureNextAlarm();
        assert.equal(watch.scene.some(w => w.type === 'BUTTON'), false);
        assert.deepEqual(watch.scene.filter(w => w.type === 'IMG').map(w => w.src), ['image/adhkar_border.png']);
        await watch.elapse(1000); await watch.pressBackKey();
        assert.equal(watch.route, 'page/gt/adhkar/index.page');
        assert.deepEqual(watch.captureNextAlarm(), alarm);
        await watch.tap('Schedule');
        await watch.elapse(5000);
        assert.equal(watch.screen[0], 'Schedule', 'Dismissed alerts cannot trigger a second back navigation');
        await watch.back(); await watch.advanceTo(at('2026-11-15', '14:00'));
        expectReminder(watch.reminders.at(-1), 1);
        await watch.pressBackKey();
        await watch.advanceTo(at('2026-11-15', '20:00'));
        expectReminder(watch.reminders.at(-1), 2);
    });
}


for (const shape of ['r', 's']) {
    test(`${shape}: all five prayer alerts use the shared woven background behind the prayer content`, async () => {
        const watch = await createWatch({ shape, now: at('2026-11-15', '05:00') });
        await watch.providePrayerTimes({});
        await watch.openSettings(); await watch.tap('Prayer Alerts');
        await watch.tap('Fajr'); await watch.runPendingTasks();
        await watch.tap('Fajr'); await watch.runPendingTasks();
        for (const [prayer, time] of [['Fajr', '06:00'], ['Dhuhr', '12:00'], ['Asr', '15:00'], ['Maghrib', '17:00'], ['Isha', '19:00']]) {
            await watch.advanceTo(at('2026-11-15', time));
            assert.equal(watch.route, 'page/gt/prayer-alert/index.page');
            assert.ok(watch.screen.includes(prayer));
            const borderIndex = watch.scene.findIndex(w => w.src === 'image/adhkar_border.png');
            assert.ok(borderIndex >= 0 && borderIndex < watch.scene.findIndex(w => w.type === 'TEXT'));
            const border = watch.scene[borderIndex];
            assert.equal(border.w, shape === 'r' ? 480 : 390);
            assert.equal(border.h, shape === 'r' ? 480 : 390);
            assert.equal(watch.scene.some(w => w.type === 'BUTTON'), prayer === 'Fajr', 'Fajr retains its alarm-dismiss control');
        }
    });
}
