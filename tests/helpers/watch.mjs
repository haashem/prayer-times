import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '../..');
const SETTINGS = 'page/gt/settings/index.page';
const HOME = 'page/gt/home/index.page';
const isReminder = (alarm) => alarm.url === 'page/gt/adhkar-alert/index.page';
export const at = (day, time) => new Date(`${day}T${time}:00`);

// Only Zepp/phone boundaries are faked. Pages, layouts, routing parameters,
// app startup, persistence, content and both schedulers execute production code.
export async function createWatch({ shape = 'r', language = 'english', now = at('2026-11-15', '08:00'), device } = {}) {
    device ||= { now, storage: new Map(), alarms: new Map(), nextAlarmId: 1 };
    if (!device.storage.has('appLanguage')) device.storage.set('appLanguage', language);
    const width = shape === 'r' ? 480 : 390;
    const height = shape === 'r' ? 480 : 390;
    const modules = new Map();
    const definitions = new Map();
    const timers = new Map();
    const navigation = [];
    const stack = [];
    const reminders = [];
    const vibrations = [];
    const messages = [];
    let nextTimer = 1;
    let pageBuilds = 0;
    let redraws = 0;
    let capturedPage;
    let appDefinition;
    let app;
    let current;
    let keyCallback;
    let gestureCallback;
    let scroll;
    let scrollIndex = 0;
    let failNextAlarm = false;

    function createWidget(type, properties) {
        if (type === 'WIDGET_PICKER') {
            // Full-screen native components own input until the app releases
            // those handlers. Zepp permits only one key/gesture registration.
            keyCallback ||= () => true;
            gestureCallback ||= () => true;
        }
        const w = { type, ...properties, handlers: {}, children: [],
            setProperty(property, changes) {
                if (this.type === 'CHECKBOX_GROUP' && ['INIT', 'CHECKED', 'UNCHECKED'].includes(property)) {
                    changes.selected = property !== 'UNCHECKED';
                    this.check_func?.(this, this.children.indexOf(changes), changes.selected); return;
                }
                if (this.type === 'RADIO_GROUP' && property === 'INIT') {
                    this.children.forEach(child => { child.selected = child === changes; }); return;
                }
                Object.assign(this, changes);
            },
            addEventListener(event, fn) { this.handlers[event] = fn; },
            createWidget(type, properties) { const child = createWidget(type, properties); this.children.push(child); child.parent = this; return child; },
        };
        current.widgets.push(w);
        return w;
    }
    const quiet = { log() {}, debug() {}, error() {} };
    const mocks = {
        '@zos/storage': { localStorage: {
            getItem: key => device.storage.get(key) ?? null,
            setItem: (key, value) => device.storage.set(key, value), removeItem: key => device.storage.delete(key),
        } },
        '@zos/alarm': { REPEAT_ONCE: 1,
            set(options) {
                if (failNextAlarm) { failNextAlarm = false; return 0; }
                const id = device.nextAlarmId++;
                device.alarms.set(id, { ...options, id }); return id;
            },
            cancel(id) { device.alarms.delete(id); },
        },
        '@zos/ui': {
            widget: Object.fromEntries(['TEXT', 'FILL_RECT', 'PAGE_SCROLLBAR', 'IMG', 'BUTTON', 'GROUP', 'CIRCLE', 'RADIO_GROUP', 'STATE_BUTTON', 'WIDGET_PICKER', 'CHECKBOX_GROUP'].map(key => [key, key])),
            prop: { MORE: 'MORE', INIT: 'INIT', CUR_COLUMN: 'CUR_COLUMN', CHECKED: 'CHECKED', UNCHECKED: 'UNCHECKED' }, event: { SELECT: 'SELECT', CLICK_DOWN: 'CLICK_DOWN', MOVE: 'MOVE' },
            align: { CENTER_H: 1, CENTER_V: 2, LEFT: 3, RIGHT: 4 }, text_style: { WRAP: 1, NONE: 2, ELLIPSIS: 3 },
            createWidget, deleteWidget(w) { if (current) current.widgets = current.widgets.filter(item => item !== w); },
            getTextLayout(text, { text_size, text_width }) {
                const width = Array.from(text).length * text_size * 0.5;
                return { width: Math.min(width, text_width), height: Math.ceil(width / text_width) * text_size * 1.25 };
            },
            setStatusBarVisible() {}, redraw() { redraws++; },
        },
        '@zos/device': { SCREEN_SHAPE_SQUARE: 1, getDeviceInfo: () => ({ width, height, screenShape: shape === 's' ? 1 : 0 }) },
        '@zos/router': { push: route => navigation.push({ type: 'push', route }), back: () => navigation.push({ type: 'back' }) },
        '@zos/settings': { getSystemMode: () => ({ sleep: false, DND: false }) },
        '@zos/display': { setPageBrightTime({ brightTime }) { current.brightTime = brightTime; } },
        '@zos/page': { SCROLL_MODE_SWIPER: 1, SCROLL_ANIMATION_NONE: 0,
            setScrollMode(options) { scroll = options.options; },
            swipeToIndex({ index }) { scrollIndex = index; scroll?.modeParams?.on_page?.(index); },
        },
        '@zos/interaction': {
            createModal: ({ content }) => messages.push(content),
            onKey({ callback }) { keyCallback ||= callback; }, offKey() { keyCallback = null; },
            onGesture({ callback }) { gestureCallback ||= callback; }, offGesture() { gestureCallback = null; },
            KEY_BACK: 4, GESTURE_RIGHT: 5,
            KEY_HOME: 1, KEY_SELECT: 2, KEY_EVENT_CLICK: 3,
        },
        '@zos/sensor': {
            Time: class {
                getFullYear() { return device.now.getFullYear(); } getMonth() { return device.now.getMonth() + 1; }
                getDate() { return device.now.getDate(); } getHours() { return device.now.getHours(); } getMinutes() { return device.now.getMinutes(); }
            },
            Compass: class { stop() {} offChange() {} },
            Vibrator: class { start({ mode }) { vibrations.push({ mode, at: new Date(device.now) }); } stop() {} },
            VIBRATOR_SCENE_NOTIFICATION: 'notification', VIBRATOR_SCENE_TIMER: 'timer', VIBRATOR_SCENE_SHORT_LIGHT: 'short',
            SystemSounds: class { getEnabled() { return false; } },
        },
        '@zos/utils': { px: n => n, log: { getLogger: () => quiet } },
        '@zeppos/zml/base-app': { BaseApp: value => value },
        '@zeppos/zml/base-page': { BasePage: value => ({
            // Phone is unavailable unless a scenario provides cached data. An
            // unresolved bridge request must not prevent standalone reminders.
            request: () => new Promise(() => {}), ...value,
        }) },
    };
    const context = vm.createContext({ console: quiet,
        Date: class extends Date {
            constructor(...args) { super(...(args.length ? args : [device.now.getTime()])); }
            static now() { return device.now.getTime(); }
        },
        Page(definition) { capturedPage = definition; }, App(definition) { appDefinition = definition; },
        getApp: () => ({ _options: { globalData: app.globalData } }),
        setTimeout(fn, delay) { const id = nextTimer++; timers.set(id, { fn, time: device.now.getTime() + delay }); return id; },
        clearTimeout: id => timers.delete(id),
    });
    async function moduleFor(name, parent = root + '/entry.js') {
        if (name.startsWith('zosLoader:')) name = name.slice('zosLoader:'.length).replace('[pf]', shape);
        const id = name.startsWith('.') ? resolve(dirname(parent), name.endsWith('.js') ? name : name + '.js') : name;
        if (modules.has(id)) return modules.get(id);
        const exports = mocks[id];
        const module = exports ? new vm.SyntheticModule(Object.keys(exports), function () {
            for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
        }, { context, identifier: id }) : new vm.SourceTextModule(await readFile(id, 'utf8'), { context, identifier: id });
        modules.set(id, module); return module;
    }
    async function load(path) {
        const module = await moduleFor(resolve(root, path));
        if (module.status === 'unlinked') await module.link((name, parent) => moduleFor(name, parent.identifier));
        if (module.status === 'linked') await module.evaluate();
        return module.namespace;
    }
    await load('app.js');
    function boot(options) {
        app = { ...appDefinition, globalData: structuredClone(appDefinition.globalData) };
        app.onCreate(options);
    }
    boot();
    function destroyPage() {
        if (current) current.page.onDestroy?.();
        current = null; keyCallback = null; gestureCallback = null; scroll = null;
    }
    async function mount(route) {
        pageBuilds++;
        if (!definitions.has(route.url)) {
            capturedPage = null;
            await load(route.url + '.js');
            assert.ok(capturedPage, `Page registered for ${route.url}`);
            definitions.set(route.url, capturedPage);
        }
        const definition = definitions.get(route.url);
        const page = { ...definition, state: structuredClone(definition.state) };
        current = { page, widgets: [], route };
        page.onInit?.(route.params);
        page.build(route.params);
        if (isReminder(route) && current.widgets.some(w => w.type === 'TEXT')) {
            reminders.push({ at: new Date(device.now), texts: texts(),
                interactive: current.widgets.filter(w => Object.keys(w.handlers).length || w.click_func).length,
                brightTime: current.brightTime });
        }
    }
    async function flush() {
        while (navigation.length) {
            const action = navigation.shift();
            destroyPage();
            if (action.type === 'push') stack.push(action.route);
            else stack.pop();
            if (stack.length) await mount(stack.at(-1));
        }
    }
    async function open(url) {
        destroyPage(); stack.length = 0; stack.push({ url }); await mount(stack[0]);
    }
    function texts() { return current?.widgets.filter(w => w.type === 'TEXT').map(w => w.text) || []; }
    function control(label) {
        const found = current?.widgets.find(w => w.type === 'TEXT' &&
            (label instanceof RegExp ? label.test(w.text) : w.text === label || w.text.startsWith(label + '\n')) && w.handlers.SELECT);
        assert.ok(found, `Action ${String(label)} exists on screen:\n${texts().join('\n')}`);
        return found;
    }
    function rowWidgets(label) {
        const labelWidget = current.widgets.find(w => w.type === 'TEXT' && w.text === label);
        assert.ok(labelWidget, `Label ${label} is visible`);
        const bg = current.widgets.find(w => w.type === 'FILL_RECT' && w.w === width &&
            labelWidget.y >= w.y && labelWidget.y < w.y + w.h && w.h === scroll.height);
        assert.ok(bg, `List row for ${label}`);
        return current.widgets.filter(w => w.y >= bg.y && w.y < bg.y + bg.h ||
            w.type === 'CIRCLE' && w.center_y >= bg.y && w.center_y < bg.y + bg.h);
    }
    async function fire(alarm, { cold = true } = {}) {
        device.alarms.delete(alarm.id); // OS consumes one-shot timers before opening the app.
        if (cold) { destroyPage(); stack.length = 0; timers.clear(); boot({ param: alarm.param }); }
        navigation.push({ type: 'push', route: { url: alarm.url } });
        if (!cold) navigation.at(-1).route.params = alarm.param;
        await flush();
    }
    function nextAlarm() { return [...device.alarms.values()].sort((a, b) => a.time - b.time || a.id - b.id)[0]; }
    async function advanceTo(target) {
        const end = target.getTime();
        assert.ok(end >= device.now.getTime(), 'Clock moves forward');
        while (true) {
            const alarm = nextAlarm();
            const timer = [...timers.entries()].sort((a, b) => a[1].time - b[1].time)[0];
            const alarmAt = alarm ? Math.max(alarm.time * 1000, device.now.getTime()) : Infinity;
            const timerAt = timer ? Math.max(timer[1].time, device.now.getTime()) : Infinity;
            if (Math.min(alarmAt, timerAt) > end) break;
            device.now = new Date(Math.min(alarmAt, timerAt));
            if (timerAt <= alarmAt) { timers.delete(timer[0]); timer[1].fn(); await flush(); }
            else await fire(alarm);
        }
        device.now = new Date(end);
    }
    return {
        reminders, vibrations, messages,
        get pageBuildCount() { return pageBuilds; }, get scrollIndex() { return scrollIndex; }, get redrawCount() { return redraws; },
        checkboxState(label) {
            const group = rowWidgets(label).find(w => w.type === 'CHECKBOX_GROUP');
            assert.ok(group, `Checkbox for ${label}`); return !!group.children[0].selected;
        },
        async tapCheckbox(label) {
            const group = rowWidgets(label).find(w => w.type === 'CHECKBOX_GROUP');
            assert.ok(group, `Checkbox for ${label}`);
            group.check_func(group, 0, !group.children[0].selected); await flush();
        },
        row(label) { return rowWidgets(label).filter(w => w.type === 'TEXT').map(w => w.text).join('\n'); },
        switchState(label) {
            const track = rowWidgets(label).find(w => w.type === 'FILL_RECT' && w.radius);
            assert.ok(track, `Switch for ${label}`); return track.color === 0x078bd1;
        },
        appearance(label) {
            const widgets = rowWidgets(label).map(w => ({ ...w }));
            return { title: widgets.find(w => w.type === 'TEXT'), subtitle: widgets.filter(w => w.type === 'TEXT')[1],
                chevron: widgets.find(w => w.src === 'image/chevron_right.png'),
                track: widgets.find(w => w.type === 'FILL_RECT' && w.radius), knob: widgets.find(w => w.type === 'CIRCLE') };
        },
        get picker() {
            const picker = current.widgets.find(w => w.type === 'WIDGET_PICKER');
            assert.ok(picker, 'System picker is open');
            return { title: picker.title, hours: Array.from(picker.data_config[0].data_array),
                minutes: Array.from(picker.data_config[1].data_array),
                initialHour: picker.data_config[0].init_val_index,
                initialMinute: picker.data_config[1].init_val_index };
        },
        async pressTick() {
            const tick = current.widgets.find(w => w.src === 'image/ic_confirm_64px.png' && w.handlers.SELECT);
            assert.ok(tick, 'The visible tick has an action bound to it');
            tick.handlers.SELECT(); await flush();
        },
        async pressBackKey() { keyCallback?.(4, 3); await flush(); },
        async swipeBack() { gestureCallback?.(5); await flush(); },
        async choosePickerColumn(column, index) {
            const picker = current.widgets.find(w => w.type === 'WIDGET_PICKER');
            assert.ok(picker, 'System picker is open');
            assert.ok(index >= 0 && index < picker.data_config[column].data_array.length, 'Index exists in the system picker');
            picker.picker_cb(picker, 2, column, index); await flush();
        },
        async pickTime(time) {
            const [hour, minute] = time.split(':').map(Number);
            const picker = current.widgets.find(w => w.type === 'WIDGET_PICKER');
            assert.ok(picker, 'System picker is open');
            const minuteIndex = [0, 15, 30, 45].indexOf(minute);
            assert.ok(minuteIndex >= 0, 'Only quarter-hour minutes can be selected');
            picker.picker_cb(picker, 2, 0, hour);
            picker.picker_cb(picker, 2, 1, minuteIndex); await flush();
            const tick = current.widgets.find(w => w.src === 'image/ic_confirm_64px.png' && w.handlers.SELECT);
            assert.ok(tick, 'The picker has an explicit tick action');
            tick.handlers.SELECT(); await flush();
        },
        get radioOptions() {
            const group = current.widgets.find(w => w.type === 'RADIO_GROUP');
            return group ? group.children.map(w => ({ selected: !!w.selected, size: w.w, x: group.x })) : [];
        },
        get scene() {
            return current.widgets.map(w => {
                const copy = {};
                for (const key of ['type', 'x', 'y', 'w', 'h', 'text', 'text_size', 'text_style', 'color', 'align_h', 'align_v', 'radius', 'center_x', 'center_y', 'src', 'angle', 'selected']) {
                    if (w[key] !== undefined) copy[key] = w[key];
                }
                if (w.parent) { copy.x += w.parent.x; copy.y += w.parent.y; }
                return copy;
            });
        },
        get screen() { return texts(); }, get route() { return current?.route.url; },
        get nextReminderAt() { const alarm = [...device.alarms.values()].filter(isReminder).sort((a, b) => a.time - b.time)[0]; return alarm ? new Date(alarm.time * 1000) : null; },
        get alarmCount() { return device.alarms.size; },
        get persistentAlarms() { return [...device.alarms.values()].every(alarm => alarm.store === true); },
        get textBounds() { return current.widgets.filter(w => w.type === 'TEXT').map(({ x, y, w, h }) => ({ x, y, w, h })); },
        openSettings: () => open(SETTINGS), openHome: () => open(HOME),
        async tap(label) { control(label).handlers.SELECT(); await flush(); },
        async selectWithCrown(label) {
            const w = control(label);
            const firstRow = current.widgets.find(w => w.type === 'FILL_RECT' && w.w === width && w.h === scroll.height);
            scroll.modeParams.on_page(Math.floor((w.y - firstRow.y) / scroll.height));
            assert.equal(keyCallback(1, 3), true); await flush();
        },
        async back() {
            if (current?.widgets.some(w => w.type === 'WIDGET_PICKER')) keyCallback?.(4, 3);
            else navigation.push({ type: 'back' });
            await flush();
        },
        advanceTo,
        async elapse(ms) { await advanceTo(new Date(device.now.getTime() + ms)); },
        closeApp() { destroyPage(); stack.length = 0; timers.clear(); },
        async restart() { destroyPage(); timers.clear(); return createWatch({ shape, language, device }); },
        sleepUntil(target) { assert.ok(target >= device.now); destroyPage(); stack.length = 0; timers.clear(); device.now = new Date(target); },
        async deliverOverdueAlarm() { const alarm = nextAlarm(); assert.ok(alarm && alarm.time * 1000 <= device.now); await fire(alarm); await advanceTo(device.now); },
        failNextAlarmCreation() { failNextAlarm = true; },
        async deliverSavedAlarm(alarm) { await fire(alarm); await advanceTo(device.now); },
        async deliverNextReminderInForeground() {
            const alarm = [...device.alarms.values()].filter(isReminder).sort((a, b) => a.time - b.time)[0];
            assert.ok(alarm);
            device.now = new Date(alarm.time * 1000);
            await fire(alarm, { cold: false });
        },
        captureNextAlarm() { return structuredClone([...device.alarms.values()].filter(isReminder)[0]); },
        async providePrayerTimes(times) {
            const { createPrayerMonthCache } = await load('utils/prayer-cache.js');
            const year = device.now.getFullYear(), month = device.now.getMonth() + 1;
            const days = Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => ({
                timings: { Fajr: '06:00', Sunrise: '07:00', Dhuhr: '12:00', Asr: '15:00', Maghrib: '17:00', Isha: '19:00', ...times },
                date: { gregorian: { date: `${String(index + 1).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}` },
                    hijri: { day: '01', month: { number: 6 }, year: '1448' } },
            }));
            device.storage.set('location', JSON.stringify({ latitude: 51.1, longitude: -0.18, city: 'Crawley' }));
            device.storage.set('prayerMonth', JSON.stringify(createPrayerMonthCache(days, year, month)));
        },
        async runPendingTasks() { await advanceTo(device.now); },
    };
}
