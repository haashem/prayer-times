import test from 'node:test';
import assert from 'node:assert/strict';
import { createWatch, at } from './helpers/watch.mjs';

async function settings(watch) {
    await watch.openSettings();
    await watch.tap('Prayer Alerts');
}
async function schedule(watch) {
    await watch.providePrayerTimes({});
    await settings(watch);
    await watch.tap('Fajr'); await watch.runPendingTasks();
    await watch.tap('Fajr'); await watch.runPendingTasks();
}

for (const shape of ['r', 's']) {
    test(`${shape}: prayer vibration defaults preserve notification and Fajr alarm patterns`, async () => {
        const watch = await createWatch({ shape, now: at('2026-11-15', '05:00') });
        await schedule(watch);
        await watch.selectWithCrown('Vibration');
        assert.deepEqual(watch.radioOptions.map(option => option.selected), [true, false, false]);
        await watch.advanceTo(at('2026-11-15', '06:00'));
        assert.equal(watch.vibrations.at(-1).mode, 'timer');
        await watch.advanceTo(at('2026-11-15', '12:00'));
        assert.equal(watch.vibrations.at(-1).mode, 'notification');
        await watch.elapse(10000);
        assert.equal(watch.activeVibrationCount, 0);
        assert.notEqual(watch.route, 'page/gt/prayer-alert/index.page');
    });

    test(`${shape}: strong long-duration vibration saves through reboot and applies to prayer alerts`, async () => {
        let watch = await createWatch({ shape, now: at('2026-11-15', '05:00') });
        await schedule(watch);
        await watch.tap('Vibration'); await watch.selectWithCrown('Strong');
        watch = await watch.restart();
        await settings(watch); await watch.tap('Vibration');
        assert.deepEqual(watch.radioOptions.map(option => option.selected), [false, true, false]);
        await watch.advanceTo(at('2026-11-15', '06:00'));
        assert.equal(watch.vibrations.at(-1).mode, 'timer', 'Strong does not change Fajr');
        await watch.pressBackKey();
        assert.equal(watch.activeVibrationCount, 0);
        await watch.advanceTo(at('2026-11-15', '12:00'));
        assert.equal(watch.vibrations.at(-1).mode, 'duration-long');
        await watch.elapse(10000);
        assert.equal(watch.activeVibrationCount, 0);
    });

    test(`${shape}: continuous prayer vibration lasts until button or hardware Back dismissal`, async () => {
        const watch = await createWatch({ shape, now: at('2026-11-15', '05:00') });
        await schedule(watch);
        await watch.tap('Vibration'); await watch.tap('Continuous');
        await watch.advanceTo(at('2026-11-15', '06:00'));
        assert.equal(watch.vibrations.at(-1).mode, 'timer');
        await watch.elapse(6 * 60 * 1000);
        assert.equal(watch.route, 'page/gt/prayer-alert/index.page');
        assert.equal(watch.activeVibrationCount, 0, 'Fajr retains its five-minute limit');
        await watch.dismissPrayerAlert();
        assert.equal(watch.activeVibrationCount, 0);
        await watch.advanceTo(at('2026-11-15', '12:00'));
        assert.equal(watch.vibrations.at(-1).mode, 'timer');
        await watch.elapse(6 * 60 * 1000);
        assert.equal(watch.route, 'page/gt/prayer-alert/index.page');
        assert.equal(watch.activeVibrationCount, 1);
        await watch.dismissPrayerAlert();
        assert.equal(watch.activeVibrationCount, 0);
        await watch.advanceTo(at('2026-11-15', '15:00'));
        assert.equal(watch.vibrations.at(-1).mode, 'timer');
        await watch.elapse(20000);
        await watch.pressBackKey();
        assert.equal(watch.activeVibrationCount, 0);
        assert.notEqual(watch.route, 'page/gt/prayer-alert/index.page');
    });
}

for (const shape of ['r', 's']) {
    test(`${shape}: selecting vibration choices previews each pattern and cleans up on change or exit`, async () => {
        const watch = await createWatch({ shape });
        await settings(watch); await watch.tap('Vibration');
        assert.ok(watch.screen.includes('Notification'));
        assert.equal(watch.vibrations.length, 0, 'Opening settings is silent');
        await watch.tap('Notification');
        assert.equal(watch.vibrations.at(-1).mode, 'notification');
        await watch.tap('Strong');
        assert.equal(watch.vibrations.at(-1).mode, 'duration-long');
        assert.equal(watch.activeVibrationCount, 1);
        await watch.selectWithCrown('Continuous');
        assert.equal(watch.vibrations.at(-1).mode, 'timer');
        await watch.elapse(2000);
        assert.equal(watch.activeVibrationCount, 1);
        await watch.tap('Continuous');
        assert.equal(watch.vibrations.length, 4, 'Reselecting plays another preview');
        await watch.elapse(1000);
        assert.equal(watch.activeVibrationCount, 1, 'Old preview timeout is cancelled');
        await watch.elapse(2000);
        assert.equal(watch.activeVibrationCount, 0, 'Continuous preview is limited to three seconds');
        await watch.tap('Continuous');
        await watch.back();
        assert.equal(watch.activeVibrationCount, 0, 'Leaving settings stops preview immediately');
        await watch.elapse(3000);
        assert.equal(watch.route, 'page/gt/notifications/index.page');
    });
}
