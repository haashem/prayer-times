import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function runtime() {
    let now = 10000;
    const context = vm.createContext({ Number, Math, Date: { now: () => now } });
    const motion = new vm.SourceTextModule(await readFile(new URL('../utils/compass-motion.js', import.meta.url), 'utf8'), { context });
    await motion.link(() => {});
    await motion.evaluate();
    let sensor;
    let vibrations = 0;
    const widgets = [];
    const deleted = new Set();
    const style = { x: 10, y: 10, w: 28, h: 28, src: 'normal' };
    const mocks = {
        '@zos/ui': { widget: { IMG: 'image', TEXT: 'text', FILL_RECT: 'rect' }, prop: { MORE: 'more' },
            createWidget() {}, deleteWidget(w) { assert.ok(!deleted.has(w)); deleted.add(w); } },
        '@zos/sensor': {
            Compass: class { constructor() { sensor = this; this.angle = 0; this.valid = true; } start() {} stop() {} onChange(cb) { this.cb = cb; } offChange() {} getStatus() { return this.valid; } getDirectionAngle() { return this.angle; } },
            Vibrator: class { stop() {} start({ mode }) { assert.equal(mode, 1); vibrations++; } },
            VIBRATOR_SCENE_DURATION: 1,
        },
        '@zos/utils': { log: { getLogger: () => ({ error() {} }) } },
        '../../../utils/i18n': { t: key => key },
        'zosLoader:./index.page.[pf].layout.js': {
            DEVICE_WIDTH: 480, DEVICE_HEIGHT: 480, DOT_ORBIT_RADIUS: 195,
            ...Object.fromEntries(['COMPASS_RING_STYLE', 'ARROW_STYLE', 'TOP_MARKER_STYLE', 'KAABA_DOT_STYLE', 'CALIBRATE_STYLE', 'QIBLA_NO_DATA_STYLE'].map(key => [key, style])),
        },
    };
    const module = new vm.SourceTextModule(await readFile(new URL('../page/gt/home/qibla.js', import.meta.url), 'utf8'), { context });
    await module.link(name => {
        if (name === '../../../utils/compass-motion') return motion;
        const values = mocks[name];
        return new vm.SyntheticModule(Object.keys(values), function () {
            for (const [key, value] of Object.entries(values)) this.setExport(key, value);
        }, { context });
    });
    await module.evaluate();
    const controller = module.namespace.createQiblaCompass({ createWidget(type, properties) {
        const w = { type, ...properties, setProperty(_, properties) { Object.assign(this, properties); } };
        widgets.push(w);
        return w;
    } });
    return { motion: motion.namespace, controller, widgets, deleted, get vibrations() { return vibrations; },
        sample(angle, valid = true) { now += 2000; sensor.angle = angle; sensor.valid = valid; sensor.cb(); } };
}

test('heading smoothing crosses north by the short path in either direction', async () => {
    const { motion: { smoothHeading } } = await runtime();
    assert.equal(smoothHeading(null, 123, 0), 123);
    assert.ok(smoothHeading(359, 1, 60) > 359);
    assert.ok(smoothHeading(1, 359, 60) < 1);
    assert.ok(Math.abs(smoothHeading(90, 180, 120) - smoothHeading(smoothHeading(90, 180, 60), 180, 60)) < 1e-8);
});

test('alignment has distinct entry and exit thresholds', async () => {
    const { motion: { isQiblaAligned } } = await runtime();
    assert.equal(isQiblaAligned(4.9, false), true);
    assert.equal(isQiblaAligned(5.1, false), false);
    assert.equal(isQiblaAligned(7.9, true), true);
    assert.equal(isQiblaAligned(8, true), false);
});

test('compass updates colors and haptics, recovers from calibration, and cleans up once', async () => {
    const r = await runtime();
    r.controller.build({ latitude: 0, longitude: 39.8262 }); // Qibla is due north.
    r.controller.startCompass();
    r.sample(0);
    const arrow = r.widgets.find(w => w.src === 'image/qibla_pointer_aligned.png');
    const marker = r.widgets.find(w => w.src === 'image/compass_top_aligned.png');
    assert.ok(arrow && marker);
    assert.equal(r.vibrations, 1);
    r.sample(6);
    assert.equal(r.vibrations, 1);
    assert.equal(arrow.src, 'image/qibla_pointer_aligned.png');
    r.sample(10);
    assert.equal(arrow.src, 'normal');
    r.sample('INVALID', false);
    assert.equal(arrow.alpha, 0);
    assert.equal(marker.alpha, 0);
    r.sample(0);
    assert.equal(arrow.alpha, 255);
    assert.equal(r.vibrations, 2);
    r.sample(15);
    r.sample(0);
    assert.equal(r.vibrations, 3);
    r.controller.stopCompass();
    r.controller.startCompass();
    r.sample(0);
    assert.equal(r.vibrations, 3);
    r.controller.destroy();
    assert.equal(r.deleted.size, r.widgets.length);
});
