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
];
async function openAdhkar(watch) { await watch.openSettings(); await watch.tap('Adhkar'); }
async function enable(watch) { await openAdhkar(watch); await watch.tap('Reminders'); }
async function chooseSchedule(watch, label) {
    await watch.tap('Schedule'); await watch.tap(new RegExp(label + '$')); await watch.back();
}
async function editTime(watch, label, control, count = 1) {
    await watch.tap(label);
    for (let n = 0; n < count; n++) await watch.tap(control);
    await watch.back();
}
async function keepOnly(watch, indices) {
    await watch.tap('Collection');
    for (const [index, [arabic]] of phrases.entries()) {
        if (indices.includes(index)) continue;
        await watch.tap(arabic); await watch.tap('Reminders'); await watch.back();
    }
    await watch.back();
}
function expectNext(watch, day, time) { assert.equal(watch.nextReminderAt?.getTime(), at(day, time).getTime()); }
function expectReminder(reminder, index) {
    assert.deepEqual(reminder.texts, ['Adhkar', phrases[index][0], phrases[index][1]]);
    assert.equal(reminder.interactive, 0, 'No dismiss, completion, count or other interactive control');
    assert.equal(reminder.brightTime, 15000);
}

for (const shape of ['r', 's']) {
    test(`${shape}: reminders require opt-in, default to three daily times and all six phrases`, async () => {
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
        await watch.tap('Collection');
        for (const [arabic] of phrases) assert.ok(watch.row(arabic) === arabic + '\nOn');
        await watch.back();
        await watch.selectWithCrown('Reminders');
        expectNext(watch, '2026-11-15', '09:00');
        assert.equal(watch.alarmCount, 1);
        assert.equal(watch.persistentAlarms, true);
        watch.closeApp();
        await watch.advanceTo(at('2026-11-15', '08:59'));
        assert.equal(watch.reminders.length, 0);
        await watch.advanceTo(at('2026-11-15', '09:00'));
        expectReminder(watch.reminders[0], 0);
        assert.deepEqual(watch.vibrations.map(event => event.mode), ['notification']);
        await watch.elapse(14999);
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
        await editTime(watch, 'Start time', 'Hour +', 1);
        await editTime(watch, 'End time', 'Hour −', 11);
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
        expectReminder(watch.reminders.at(-1), expectedTimes.length % 6);
    });
}

test('edits to all three daily times save immediately and survive restarting the watch', async () => {
    let watch = await createWatch(); await enable(watch);
    for (let index = 1; index <= 3; index++) await editTime(watch, `Daily times ${index}`, 'Minute +');
    watch = await watch.restart();
    await openAdhkar(watch);
    assert.ok(watch.switchState('Reminders') === true);
    for (const [index, time] of ['09:01', '14:01', '20:01'].entries()) {
        assert.ok(watch.row(`Daily times ${index + 1}`) === `Daily times ${index + 1}\n${time}`);
    }
    expectNext(watch, '2026-11-15', '09:01');
    await watch.advanceTo(at('2026-11-15', '20:01'));
    assert.deepEqual(watch.reminders.map(reminder => [reminder.at.getHours(), reminder.at.getMinutes()]), [[9, 1], [14, 1], [20, 1]]);
});

test('only selected phrases cycle, browsing does not advance them, and restart preserves the next phrase', async () => {
    let watch = await createWatch(); await enable(watch); await keepOnly(watch, [0, 2]);
    await watch.tap('Collection');
    for (const [arabic, meaning, source] of phrases) {
        await watch.tap(arabic);
        assert.ok(watch.screen.includes(arabic));
        assert.ok(watch.screen.includes(meaning));
        assert.ok(watch.screen.includes(source));
        await watch.back();
    }
    watch.closeApp();
    await watch.advanceTo(at('2026-11-15', '09:00')); expectReminder(watch.reminders[0], 0);
    watch = await watch.restart();
    await watch.advanceTo(at('2026-11-15', '14:00')); expectReminder(watch.reminders[0], 2);
    await watch.advanceTo(at('2026-11-15', '20:00')); expectReminder(watch.reminders[1], 0);
    await watch.advanceTo(at('2026-11-16', '09:00')); expectReminder(watch.reminders[2], 2);
    await openAdhkar(watch); await watch.tap('Collection');
    for (const [index, [arabic]] of phrases.entries()) {
        assert.ok(watch.row(arabic) === arabic + '\n' + ([0, 2].includes(index) ? 'On' : 'Off'));
    }
});

test('enable all restores the full collection and the sequence wraps after its final phrase', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, [0]);
    await watch.tap('Collection'); await watch.tap('Enable all');
    for (const [arabic] of phrases) assert.ok(watch.row(arabic) === arabic + '\nOn');
    await watch.advanceTo(at('2026-11-17', '09:00'));
    assert.equal(watch.reminders.length, 7);
    watch.reminders.forEach((reminder, index) => expectReminder(reminder, index % 6));
});

test('turning off the final phrase explains the change, stops reminders, and can be reversed', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, []);
    assert.deepEqual(watch.messages, ['Reminders turned off: no phrases enabled.']);
    assert.ok(watch.switchState('Reminders') === false);
    assert.equal(watch.nextReminderAt, null);
    await watch.tap('Collection'); await watch.tap('Enable all'); await watch.back();
    assert.ok(watch.switchState('Reminders') === false, 'Selecting content alone does not enable notifications');
    await watch.advanceTo(at('2026-11-16', '08:00'));
    assert.equal(watch.reminders.length, 0);
    await openAdhkar(watch); await watch.tap('Reminders');
    await watch.advanceTo(at('2026-11-16', '09:00')); expectReminder(watch.reminders[0], 0);
});

test('turning the master switch back on with an empty collection selects all phrases', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, []);
    await watch.tap('Reminders'); await watch.tap('Collection');
    for (const [arabic] of phrases) assert.ok(watch.row(arabic) === arabic + '\nOn');
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
    await watch.elapse(15000); await watch.deliverSavedAlarm(current);
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

test('invalid clock edits explain the problem and preserve the last valid schedule', async () => {
    const watch = await createWatch(); await enable(watch);
    await watch.tap('Start time');
    await watch.tap('Hour +'); // 09:00 still contains the first daily reminder.
    await watch.tap('Hour +'); // 10:00 would exclude it.
    assert.ok(watch.screen.includes('09:00'));
    assert.ok(watch.messages.at(-1).includes('within the waking window'));
    await watch.back(); expectNext(watch, '2026-11-15', '09:00');
    await watch.tap('Daily times 2');
    for (let n = 0; n < 5; n++) await watch.tap('Hour −'); // Reject collision with 09:00.
    assert.ok(watch.screen.includes('10:00'));
    assert.equal(watch.messages.length, 2);
    await watch.back();
    await watch.tap('End time');
    for (let n = 0; n < 3; n++) await watch.tap('Hour +'); // Reject an end at 00:00.
    assert.ok(watch.screen.includes('23:00'));
    assert.equal(watch.messages.length, 4);
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
            for (const { x, w } of watch.textBounds) assert.ok(x >= 0 && x + w <= (shape === 'r' ? 480 : 390));
            for (const [index, time] of ['09:00', '14:00', '20:00', '09:00', '14:00', '20:00'].entries()) {
                await watch.advanceTo(at(index < 3 ? '2026-11-15' : '2026-11-16', time));
                assert.deepEqual(watch.screen, [title, phrases[index][0], meanings[language === 'arabic-latin' ? 'arabic' : language][index]]);
                assert.equal(watch.reminders[index].interactive, 0);
                await watch.elapse(15000); assert.deepEqual(watch.screen, []);
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
    await editTime(watch, 'Start time', 'Hour −', 8);
    await editTime(watch, 'End time', 'Hour −', 19);
    for (const [index, time] of ['00:00', '00:30', '02:00', '02:30', '03:00'].entries()) {
        expectNext(watch, '2026-03-29', time);
        await watch.advanceTo(at('2026-03-29', time));
        expectReminder(watch.reminders[index], index);
    }
    assert.equal(watch.reminders.length, 5);
    expectNext(watch, '2026-03-30', '00:00');
});


test('the collection can be read with reminders off and browsing schedules nothing', async () => {
    const watch = await createWatch(); await openAdhkar(watch); await watch.tap('Collection');
    for (const [arabic, meaning, source] of phrases) {
        await watch.tap(arabic);
        assert.deepEqual(watch.screen, ['Adhkar', arabic, meaning, source, 'Reminders']);
        await watch.back();
    }
    assert.equal(watch.alarmCount, 0);
    watch.closeApp(); await watch.advanceTo(at('2026-11-16', '23:00'));
    assert.equal(watch.reminders.length, 0);
});

test('a reminder while the app is open returns to the previous screen automatically', async () => {
    const watch = await createWatch(); await enable(watch); await keepOnly(watch, [0, 2]);
    await watch.tap('Collection');
    const previousScreen = watch.screen;
    await watch.deliverNextReminderInForeground();
    expectReminder(watch.reminders[0], 0);
    await watch.elapse(15000);
    assert.deepEqual(watch.screen, previousScreen);
    await watch.back(); await watch.tap('Reminders'); // Turn off without losing the chosen collection.
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
            assert.ok(nav.subtitle.text_size < nav.title.text_size);
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
