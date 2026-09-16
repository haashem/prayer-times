import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const fixture = JSON.parse(await readFile(resolve(root, 'tests/fixtures/hijri-september-2026.json'), 'utf8'));
const pad = (n) => String(n).padStart(2, '0');
const timings = { Fajr: '05:01', Sunrise: '06:10', Dhuhr: '12:05', Asr: '15:20', Maghrib: '18:15', Isha: '19:30' };
function day([gregorian, d, m, y]) {
    return { timings: { ...timings }, date: { gregorian: { date: gregorian }, hijri: { day: pad(d), month: { number: m }, year: String(y) } } };
}
function parts(hijri) {
    return hijri && [Number(hijri.day), hijri.month.number, Number(hijri.year)];
}

async function runtime(extra = {}) {
    const values = new Map();
    const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
    const appCache = {};
    const context = vm.createContext({ console, ...extra.globals });
    const mocks = {
        '@zos/storage': { localStorage: storage },
        '@zos/sensor': { Time: class { getFullYear() { return 2026; } getMonth() { return 9; } getDate() { return 13; } } },
        [resolve(root, 'utils/location-storage.js')]: { getAppCache: () => appCache, getLocationKey: () => 'test-city' },
        [resolve(root, 'utils/prayer-settings.js')]: { getPrayerCalculationSettings: () => ({ method: 3, school: 0 }) },
        ...extra.mocks,
    };
    const modules = new Map();
    async function moduleFor(name, parent = root + '/entry.js') {
        const id = name.startsWith('.') ? resolve(dirname(parent), name.endsWith('.js') ? name : name + '.js') : name;
        if (modules.has(id)) return modules.get(id);
        let module;
        if (mocks[id]) {
            const exports = mocks[id];
            module = new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }, { context, identifier: id });
        } else {
            module = new vm.SourceTextModule(await readFile(id, 'utf8'), { context, identifier: id });
        }
        modules.set(id, module);
        return module;
    }
    async function load(path) {
        const module = await moduleFor(resolve(root, path));
        if (module.status === 'unlinked') await module.link((name, parent) => moduleFor(name, parent.identifier));
        if (module.status === 'linked') await module.evaluate();
        return module.namespace;
    }
    return { load, storage, values, appCache, mocks };
}

function calendar(cacheModule) {
    const dates = fixture.calendars.HJCoSA.map(day);
    const cache = cacheModule.createPrayerMonthCache(dates.slice(2, -2), 2026, 9, dates.at(-2), dates.slice(0, 2).map((d) => d.date.hijri), dates.slice(-2).map((d) => d.date.hijri));
    return { cache, dates };
}

test('default calendar: every September date and all five offsets match saved API responses', async () => {
    const { load } = await runtime();
    const c = await load('utils/prayer-cache.js');
    const { cache, dates } = calendar(c);
    const original = JSON.stringify(cache);
    for (let i = 2; i < dates.length - 2; i++) {
        for (let offset = -2; offset <= 2; offset++) {
            assert.deepEqual(parts(c.getAdjustedHijriDate(cache, dates[i].date.hijri, offset)), parts(dates[i + offset].date.hijri));
        }
    }
    assert.equal(JSON.stringify(cache), original);
    const window = c.getPrayerWindow(cache, { getFullYear: () => 2026, getMonth: () => 9, getDate: () => 30 });
    assert.equal(JSON.stringify(window.today.timings), JSON.stringify(timings));
    assert.equal(window.tomorrow.date.gregorian.date, '01-10-2026');
});

test('a 29-day month rolls into the next month without inventing day 30', async () => {
    const { load } = await runtime();
    const c = await load('utils/prayer-cache.js');
    const saudi = calendar(c);
    const today = saudi.dates[14].date.hijri;
    assert.deepEqual(parts(today), [2, 4, 1448]);
    assert.deepEqual(parts(c.getAdjustedHijriDate(saudi.cache, today, -2)), [29, 3, 1448]);
    const lastDay = saudi.dates[12].date.hijri;
    assert.deepEqual(parts(lastDay), [29, 3, 1448]);
    assert.deepEqual(parts(c.getAdjustedHijriDate(saudi.cache, lastDay, 1)), [1, 4, 1448]);
    assert.deepEqual(parts(c.getAdjustedHijriDate(saudi.cache, saudi.dates[13].date.hijri, -1)), [29, 3, 1448]);
});

test('Hijri year rollover uses the actual 29- or 30-day month; Gregorian leap/year edges work offline', async () => {
    const { load } = await runtime();
    const c = await load('utils/prayer-cache.js');
    for (const lastDay of [29, 30]) {
        const before = [day(['30-12-2025', lastDay - 1, 12, 1447]), day(['31-12-2025', lastDay, 12, 1447])];
        const days = [day(['01-01-2026', 1, 1, 1448]), day(['02-01-2026', 2, 1, 1448])];
        const cache = c.createPrayerMonthCache(days, 2026, 1, null, before.map((d) => d.date.hijri));
        assert.deepEqual(parts(c.getAdjustedHijriDate(cache, days[0].date.hijri, -1)), [lastDay, 12, 1447]);
        assert.deepEqual(parts(c.getAdjustedHijriDate(cache, days[1].date.hijri, -2)), [lastDay, 12, 1447]);
        const transition = [day(['01-01-2026', lastDay, 12, 1447]), day(['02-01-2026', 1, 1, 1448])];
        const forwardCache = c.createPrayerMonthCache(transition, 2026, 1, null);
        assert.deepEqual(parts(c.getAdjustedHijriDate(forwardCache, transition[0].date.hijri, 1)), [1, 1, 1448]);
    }
    for (const [year, count] of [[2024, 29], [2025, 28], [2025, 31]]) {
        const month = count === 31 ? 12 : 2;
        const days = Array.from({ length: count }, (_, i) => day([`${pad(i + 1)}-${pad(month)}-${year}`, i < 29 ? i + 1 : i - 28, i < 29 ? 8 : 9, 1447]));
        const nextMonth = month === 12 ? 1 : 3;
        const nextYear = month === 12 ? year + 1 : year;
        const after = [count, count + 1].map((i, index) => day([`${pad(index + 1)}-${pad(nextMonth)}-${nextYear}`, i < 29 ? i + 1 : i - 28, i < 29 ? 8 : 9, 1447]));
        const cache = c.createPrayerMonthCache(days, year, month, after[0], [], after.map((d) => d.date.hijri));
        assert.deepEqual(parts(c.getAdjustedHijriDate(cache, days.at(-1).date.hijri, 2)), parts(after[1].date.hijri));
    }
});

test('incomplete caches never invent missing boundary dates', async () => {
    const { load } = await runtime();
    const c = await load('utils/prayer-cache.js');
    const { cache, dates } = calendar(c);
    cache.hijriBefore = "";
    cache.hijriAfter = "";
    assert.equal(c.getAdjustedHijriDate(cache, dates[2].date.hijri, -1), null);
    assert.equal(c.getAdjustedHijriDate(cache, dates.at(-3).date.hijri, 2), null);
    assert.equal(c.getAdjustedHijriDate(cache, dates.at(-3).date.hijri, 1), null);
    assert.equal(c.getAdjustedHijriDate(null, dates[2].date.hijri, 0), dates[2].date.hijri);
    assert.equal(c.getAdjustedHijriDate(cache, dates[4].date.hijri, 3), null);
    assert.equal(c.getAdjustedHijriDate({ ...cache, records: '' }, dates[4].date.hijri, 1), null);
});

test('saved offsets apply once, localize correctly, and do not mutate prayer caches', async () => {
    const { load, storage } = await runtime();
    const c = await load('utils/prayer-cache.js');
    const settings = await load('utils/hijri-settings.js');
    const i18n = await load('utils/i18n.js');
    const { cache, dates } = calendar(c);
    const original = JSON.stringify(cache);
    storage.setItem(c.PRAYER_CACHE_KEY, original);
    assert.equal(settings.getHijriAdjustment(), 0);
    settings.setHijriAdjustment(-2);
    assert.equal(settings.getHijriAdjustment(), -2);
    const raw = dates[14].date.hijri;
    assert.equal(i18n.formatHijriDate(raw, 'english'), '29 Rabi al-awwal 1448');
    assert.equal(i18n.formatHijriDate(raw, 'english'), '29 Rabi al-awwal 1448');
    assert.match(i18n.formatHijriDate(raw, 'arabic'), /٢٩/);
    assert.match(i18n.formatHijriDate(raw, 'farsi'), /۲۹/);
    assert.equal(storage.getItem(c.PRAYER_CACHE_KEY), original);
    for (const invalid of ['broken', 3, -3, 0.5, undefined]) {
        storage.setItem(settings.HIJRI_ADJUSTMENT_KEY, invalid);
        assert.equal(settings.getHijriAdjustment(), 0);
    }
});

test('old cache entries require a fresh fetch; new caches have no version metadata', async () => {
    const { load, storage } = await runtime();
    const c = await load('utils/prayer-cache.js');
    const data = await load('utils/prayer-data-cache.js');
    const { cache } = calendar(c);
    const time = { getFullYear: () => 2026, getMonth: () => 9, getDate: () => 13 };
    const oldCache = { ...cache, v: 2, recordSize: 32 };
    storage.setItem('prayerMonthV2', JSON.stringify(oldCache));
    storage.setItem('prayerTodayV1', JSON.stringify({ dayKey: '2026-9-13', locationKey: 'test-city', method: 3, school: 0, data: day(fixture.calendars.HJCoSA[14]) }));
    storage.setItem('prayerData', JSON.stringify({ year: '2026', month: '09', data: fixture.calendars.HJCoSA.map(day) }));
    assert.equal(c.getStoredPrayerWindow(storage, time), null);
    assert.equal(data.loadTodayPrayerData({ name: 'London' }), null);
    assert.equal('v' in cache, false);
    assert.equal('recordSize' in cache, false);
    data.storePrayerMonthCache(cache);
    const today = data.loadTodayPrayerData({ name: 'London' });
    assert.deepEqual(parts(today.date.hijri), [2, 4, 1448]);
    assert.equal(JSON.stringify(today.timings), JSON.stringify(timings));
    assert.ok(storage.getItem('prayerMonth'));
    assert.ok(storage.getItem('prayerToday'));
    data.storePrayerMonthCache(cache);
    assert.equal(storage.getItem('prayerToday'), null);
    storage.setItem('prayerMonth', '{invalid json');
    assert.equal(c.getStoredPrayerWindow(storage, time), null);
});

for (const [shape, language] of ['r', 's'].flatMap((shape) => ['english', 'arabic', 'farsi'].map((language) => [shape, language]))) {
    test(`${shape} ${language}: offset controls, title scrolling, and RTL geometry`, async () => {
        let page;
        let keyCallback;
        const createdWidgets = [];
        const ui = {
            widget: Object.fromEntries(['TEXT', 'RADIO_GROUP', 'STATE_BUTTON', 'FILL_RECT', 'IMG', 'PAGE_SCROLLBAR'].map((key) => [key, key])),
            prop: { TEXT: 'TEXT', INIT: 'INIT', MORE: 'MORE', CHECKED: 'CHECKED' },
            event: { SELECT: 'SELECT' },
            align: { LEFT: 0, RIGHT: 1, CENTER_H: 2, CENTER_V: 3, TOP: 4 },
            text_style: { NONE: 0, WRAP: 1, ELLIPSIS: 2 },
            createWidget(type, options) {
                createdWidgets.push({ type, options });
                const children = [];
                return {
                    type, options, children,
                    setProperty(key, value) {
                        if (key === 'TEXT') this.options.text = value;
                        if (key === 'INIT' || key === 'CHECKED') {
                            this.selected = value;
                            options.check_func?.(this, children.indexOf(value), true);
                        }
                    },
                    addEventListener() {},
                    createWidget(type, opts) { const w = ui.createWidget(type, opts); children.push(w); return w; },
                };
            },
            deleteWidget() {}, setStatusBarVisible() {},
        };
        const config = {
            globals: { Page: (definition) => { page = definition; } },
            mocks: {
                '@zos/ui': ui,
                '@zos/device': { getDeviceInfo: () => ({ width: shape === 'r' ? 480 : 390, screenShape: shape }), SCREEN_SHAPE_SQUARE: 's' },
                '@zos/utils': { px: (value) => value },
                '@zos/display': { setPageBrightTime() {} },
                '@zos/interaction': { onKey: ({ callback }) => { keyCallback = callback; }, offKey() {}, KEY_HOME: 1, KEY_SELECT: 2, KEY_EVENT_CLICK: 3 },
                '@zos/page': { setScrollMode() {}, SCROLL_MODE_SWIPER: 1 },
                '@zeppos/zml/base-page': { BasePage: (value) => value },
            },
        };
        const r = await runtime(config);
        r.storage.setItem("appLanguage", language);
        const c = await r.load('utils/prayer-cache.js');
        const h = await r.load('utils/hijri-settings.js');
        const { cache, dates } = calendar(c);
        r.storage.setItem(c.PRAYER_CACHE_KEY, JSON.stringify(cache));
        r.mocks['zosLoader:./index.page.[pf].layout.js'] = await r.load(`page/gt/hijri-adjustment/index.page.${shape}.layout.js`);
        await r.load('page/gt/hijri-adjustment/index.page.js');
        const today = c.getPrayerWindow(cache, { getFullYear: () => 2026, getMonth: () => 9, getDate: () => 13 }).today;
        page.onInit(JSON.stringify({ hijriDate: today.date.hijri }));
        page.build();
        assert.equal(page.state.radioGroup.selected, page.state.stateButtons[2]);
        assert.equal(h.getHijriAdjustment(), 0); // Programmatic radio initialization must not change it.
        assert.equal(keyCallback(1, 3), true); // First focused option is -2 days.
        assert.equal(h.getHijriAdjustment(), -2);
        const i18n = await r.load('utils/i18n.js');
        assert.equal(page.state.previewWidget.options.text, i18n.formatHijriDate(today.date.hijri, language));
        page.selectIndex(2);
        assert.equal(page.state.previewWidget.options.text, i18n.formatHijriDate(today.date.hijri, language));
        const layout = r.mocks['zosLoader:./index.page.[pf].layout.js'];
        assert.ok(layout.PREVIEW_STYLE.y + layout.PREVIEW_STYLE.h <= layout.getHijriRowBgStyle(0).y);
        assert.ok(layout.getHijriRowTextStyle(0).w > 0);
        const rtl = language !== 'english';
        const radio = page.state.radioGroup.options;
        const label = page.state.optionWidgets.find((w) => w.type === 'TEXT' && w.options.text === i18n.t('hijriMinusTwo')).options;
        const hit = layout.getHijriRowHitStyle(0, rtl);
        assert.equal(label.align_h, rtl ? ui.align.RIGHT : ui.align.LEFT);
        if (rtl) {
            assert.ok(radio.x + radio.w <= label.x);
            assert.ok(radio.x + radio.w <= hit.x);
        } else {
            assert.ok(label.x + label.w <= radio.x);
            assert.ok(hit.x + hit.w <= radio.x);
        }
        const title = createdWidgets.find((w) => w.type === 'TEXT' && w.options.text === i18n.t('hijriAdjustment')).options;
        assert.equal(title.text_style, ui.text_style.NONE);
        assert.equal(title.align_h, rtl ? ui.align.RIGHT : ui.align.LEFT);
        assert.ok(title.x >= 0 && title.x + title.w <= (shape === 'r' ? 480 : 390));
        page.onDestroy();
    });
}

async function requestCalendarRange(year, month, fetchResponse) {
    let service;
    const urls = [];
    const r = await runtime({
        globals: {
            AppSideService: (definition) => { service = definition; },
            Date: class extends Date { constructor(...args) { super(...(args.length ? args : [year, month - 1, 13, 12])); } },
            console: { log() {} },
            fetch: async ({ url }) => { urls.push(new URL(url)); return fetchResponse(); },
        },
        mocks: { '@zeppos/zml/base-side': { BaseSideService: (definition) => definition } },
    });
    await r.load('app-side/index.js');
    const response = await new Promise((resolve) => service.onRequest({ method: 'FETCH_PRAYER_TIMES', params: { latitude: 51.5, longitude: -0.1, method: 3, school: 1 } }, (_, result) => resolve(result)));
    return { response, urls, load: r.load };
}

for (const [year, month, start, end] of [
    [2026, 9, '30-08-2026', '02-10-2026'],
    [2027, 1, '30-12-2026', '02-02-2027'],
    [2026, 12, '29-11-2026', '02-01-2027'],
    [2024, 2, '30-01-2024', '02-03-2024'],
    [2025, 2, '30-01-2025', '02-03-2025'],
]) {
    test(`one range request covers the month and both boundaries: ${year}-${month}`, async () => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const dates = year === 2026 && month === 9 ? fixture.calendars.HJCoSA.map(day) :
            Array.from({ length: daysInMonth + 4 }, (_, index) => {
                const date = new Date(year, month - 1, index - 1);
                return day([`${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`, index % 29 + 1, 3 + Math.floor(index / 29), 1448]);
            });
        const body = { code: 200, data: dates };
        // Zepp fetch can return a parsed body or a JSON string.
        const { response, urls, load } = await requestCalendarRange(year, month, () => ({ body: month === 9 ? JSON.stringify(body) : body }));
        assert.equal(response.result.code, 200);
        assert.equal(urls.length, 1);
        assert.equal(urls[0].pathname, `/v1/calendar/from/${start}/to/${end}`);
        assert.equal(urls[0].searchParams.get('latitude'), '51.5');
        assert.equal(urls[0].searchParams.get('longitude'), '-0.1');
        assert.equal(urls[0].searchParams.get('method'), '3');
        assert.equal(urls[0].searchParams.get('school'), '1');
        assert.equal(urls[0].searchParams.get('calendarMethod'), 'HJCoSA');
        const cache = response.result.cache;
        assert.equal(cache.days, daysInMonth);
        assert.equal(cache.records.length, daysInMonth * 32);
        assert.equal(cache.hijriBefore.length, 16);
        assert.equal(cache.hijriAfter.length, 16);
        const c = await load('utils/prayer-cache.js');
        for (const [index, offset] of [[2, -2], [2, -1], [daysInMonth + 1, 1], [daysInMonth + 1, 2]]) {
            assert.deepEqual(parts(c.getAdjustedHijriDate(cache, dates[index].date.hijri, offset)), parts(dates[index + offset].date.hijri));
        }
        const lastDay = c.getPrayerWindow(cache, { getFullYear: () => year, getMonth: () => month, getDate: () => daysInMonth });
        assert.equal(JSON.stringify(lastDay.today.timings), JSON.stringify(timings));
        assert.equal(JSON.stringify(lastDay.tomorrow.timings), JSON.stringify(timings));
        assert.equal(lastDay.tomorrow.date.gregorian.date, dates.at(-2).date.gregorian.date);
    });
}

for (const failure of ['network', 'api', 'json', 'missing-day', 'duplicate-day']) {
    test(`failed or incomplete range does not produce a cache: ${failure}`, async () => {
        const { response, urls } = await requestCalendarRange(2026, 9, () => {
            if (failure === 'network') throw new Error('offline');
            if (failure === 'api') return { body: { code: 400, data: 'Invalid request' } };
            if (failure === 'json') return { body: '{invalid' };
            const dates = fixture.calendars.HJCoSA.map(day);
            if (failure === 'missing-day') dates.splice(1, 1);
            if (failure === 'duplicate-day') dates[1] = dates[0];
            return { body: { code: 200, data: dates } };
        });
        assert.equal(urls.length, 1);
        assert.ok(response.error);
        assert.equal(response.result, undefined);
    });
}

for (const shape of ['r', 's']) {
    for (const name of ['school', 'language']) {
        test(`${shape} ${name}: RTL controls and language switching preserve selection`, async () => {
            const language = 'arabic';
            let page;
            let keyCallback;
            const createdWidgets = [];
            const ui = {
                widget: Object.fromEntries(['TEXT', 'RADIO_GROUP', 'STATE_BUTTON', 'FILL_RECT', 'IMG', 'PAGE_SCROLLBAR'].map((key) => [key, key])),
                prop: { TEXT: 'TEXT', INIT: 'INIT', MORE: 'MORE', CHECKED: 'CHECKED' },
                event: { SELECT: 'SELECT' },
                align: { LEFT: 0, RIGHT: 1, CENTER_H: 2, CENTER_V: 3, TOP: 4 },
                text_style: { NONE: 0, WRAP: 1, ELLIPSIS: 2 },
                createWidget(type, options) {
                    createdWidgets.push({ type, options });
                    const children = [];
                    return {
                        type, options, children,
                        setProperty(key, value) {
                            if (key === 'TEXT') this.options.text = value;
                            if (key === 'INIT' || key === 'CHECKED') {
                                this.selected = value;
                                options.check_func?.(this, children.indexOf(value), true);
                            }
                        },
                        addEventListener() {},
                        createWidget(type, opts) { const w = ui.createWidget(type, opts); children.push(w); return w; },
                    };
                },
                deleteWidget() {}, setStatusBarVisible() {},
            };
            const config = {
                globals: { Page: (definition) => { page = definition; } },
                mocks: {
                    '@zos/ui': ui,
                    '@zos/device': { getDeviceInfo: () => ({ width: shape === 'r' ? 480 : 390, screenShape: shape }), SCREEN_SHAPE_SQUARE: 's' },
                    '@zos/utils': { px: (value) => value },
                    '@zos/display': { setPageBrightTime() {} },
                    '@zos/interaction': { onKey: ({ callback }) => { keyCallback = callback; }, offKey() {}, KEY_HOME: 1, KEY_SELECT: 2, KEY_EVENT_CLICK: 3, KEY_EVENT_PRESS: 4, KEY_EVENT_RELEASE: 5 },
                    '@zos/page': { setScrollMode() {}, SCROLL_MODE_SWIPER: 1 },
                    '@zeppos/zml/base-page': { BasePage: (value) => value },
                },
            };
            config.mocks[resolve(root, 'utils/prayer-settings.js')] = { getPrayerSchool: () => 0, setPrayerSchool() {} };
            const r = await runtime(config);
            r.storage.setItem("appLanguage", language);

            const layout = await r.load(`page/gt/${name}/index.page.${shape}.layout.js`);
            r.mocks['zosLoader:./index.page.[pf].layout.js'] = layout;
            await r.load(`page/gt/${name}/index.page.js`);
            page.build();
            function checkRows(rtl) {
                const radio = page.state.radioGroup.options;
                const labels = page.state.optionWidgets.filter((w) => w.type === 'TEXT');
                const options = name === 'language' ? layout.LANGUAGE_OPTIONS : layout.SCHOOL_OPTIONS;
                for (const label of labels.slice(0, options.length)) {
                    assert.equal(label.options.align_h, rtl ? ui.align.RIGHT : ui.align.LEFT);
                    assert.ok(rtl ? radio.x + radio.w <= label.options.x : label.options.x + label.options.w <= radio.x);
                }
                assert.equal(page.state.radioGroup.selected, page.state.stateButtons[page.getSelectedIndex()]);
            }
            checkRows(true);
            if (name === 'language') {
                page.setFocusedIndex(1);
                for (const value of ['english', 'farsi', 'arabic', 'english']) {
                    const index = layout.LANGUAGE_OPTIONS.findIndex((option) => option.value === value);
                    page.selectIndex(index);
                    checkRows(value !== 'english');
                    assert.equal(page.state.focusIndex, 1);
                    assert.equal(r.storage.getItem('appLanguage'), value);
                }
            }
            page.onDestroy();
        });
    }
}
