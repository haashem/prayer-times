import { LAYOUT } from "zosLoader:./index.page.[pf].layout.js";
import { createWidget, widget, prop, event, align, setStatusBarVisible } from '@zos/ui';
import { push } from '@zos/router';
import { setPageBrightTime } from '@zos/display';
import { createModal, onKey, offKey, KEY_HOME, KEY_SELECT, KEY_EVENT_CLICK } from '@zos/interaction';
import { setScrollMode, swipeToIndex, SCROLL_ANIMATION_NONE, SCROLL_MODE_SWIPER } from '@zos/page';
import { BasePage } from '@zeppos/zml/base-page';
import { t, getAppLanguage, localizeDigits, isRtl } from '../../../utils/i18n';
import { ADHKAR, getAdhkarMeaning } from '../../../utils/adhkar-content';
import { ADHKAR_MODES, getAdhkarSettings, saveAdhkarSettings } from '../../../utils/adhkar';
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from '@zos/device';
import { getAppCache } from '../../../utils/location-storage';

const MODE_KEYS = ['adhkarDaily', 'adhkar30', 'adhkar60', 'adhkar120'];
function timeLabel(value) {
    return localizeDigits(('0' + Math.floor(value / 60)).slice(-2) + ':' + ('0' + value % 60).slice(-2));
}

Page(BasePage({
    state: { view: 'main', id: null, settings: null, rows: [], labels: [], focus: 0, focusTop: null, focusBottom: null, title: null, radioGroup: null, radioButtons: [], updatingRadio: false, updatingCheckbox: false },
    onInit(params) {
        try {
            const data = typeof params === 'string' ? JSON.parse(params) : params;
            if (data) { this.state.view = data.view === 'schedule' ? 'schedule' : 'main'; this.state.id = data.id; }
        } catch (e) { /* Use the main screen for malformed route parameters. */ }
        const cache = getAppCache();
        const saved = cache && cache.adhkarReturnFocus;
        if (saved && saved.view === this.state.view) {
            this.state.focus = saved.index;
            delete cache.adhkarReturnFocus;
        }
    },
    build() {
        this.state.settings = getAdhkarSettings();
        const { screenShape } = getDeviceInfo();
        if (screenShape === SCREEN_SHAPE_SQUARE) setStatusBarVisible(false);
        setPageBrightTime({ brightTime: 30000 });
        this.state.rows = this.makeRows();
        this.rowHeight = LAYOUT.rowHeight;
        setScrollMode({ mode: SCROLL_MODE_SWIPER, options: {
            height: this.rowHeight, count: this.state.rows.length,
            modeParams: { crown_enable: true, on_page: (index) => this.focus(index) },
        } });
        createWidget(widget.PAGE_SCROLLBAR);
        this.state.title = createWidget(widget.TEXT, { ...LAYOUT.TITLE_STYLE, text: this.titleText() });
        this.state.rows.forEach((row, index) => this.renderRow(row, index));
        if (this.state.view === 'schedule') this.renderRadioGroup();
        this.state.focusTop = createWidget(widget.IMG, { ...LAYOUT.focusTop(0, this.rowHeight), src: 'image/focus_line_top.png' });
        this.state.focusBottom = createWidget(widget.IMG, { ...LAYOUT.focusBottom(0, this.rowHeight), src: 'image/focus_line_bottom.png' });
        createWidget(widget.FILL_RECT, LAYOUT.bottom(this.state.rows.length, this.rowHeight));
        this.focus(this.state.focus);
        swipeToIndex({ index: this.state.focus, animation: SCROLL_ANIMATION_NONE });
        this.registerListKeys();
    },
    registerListKeys() {
        offKey();
        onKey({ callback: (key, keyEvent) => {
            if ((key === KEY_HOME || key === KEY_SELECT) && keyEvent === KEY_EVENT_CLICK) {
                const row = this.state.rows[this.state.focus];
                if (row && row.action) row.action();
                return true;
            }
            return false;
        } });
    },
    renderRow(row, index) {
        const rtl = isRtl();
        const kind = row.kind || (row.action ? 'navigation' : 'info');
        const bg = createWidget(widget.FILL_RECT, LAYOUT.row(index, this.rowHeight));
        const label = createWidget(widget.TEXT, { ...LAYOUT.text(index, kind, !!row.subtitle, rtl, this.rowHeight),
            text: row.text(), ...(row.size ? { text_size: row.size } : {}),
            ...(row.arabic ? { align_h: align.RIGHT } : {}),
        });
        const entry = { label };
        const targets = [bg, label];
        if (row.subtitle) {
            entry.subtitle = createWidget(widget.TEXT, { ...LAYOUT.subtitle(index, kind, rtl, this.rowHeight), text: row.subtitle() });
            targets.push(entry.subtitle);
        }
        if (kind === 'navigation') {
            targets.push(createWidget(widget.IMG, { ...LAYOUT.chevron(index, rtl, this.rowHeight), src: 'image/chevron_right.png' }));
        }
        if (kind === 'toggle') {
            entry.track = createWidget(widget.FILL_RECT, LAYOUT.track(index, row.checked(), rtl, this.rowHeight));
            entry.knob = createWidget(widget.CIRCLE, LAYOUT.knob(index, row.checked(), rtl, this.rowHeight));
            targets.push(entry.track, entry.knob);
        }
        if (kind === 'checkbox') {
            entry.checkbox = createWidget(widget.CHECKBOX_GROUP, {
                ...LAYOUT.checkboxGroup(index, rtl),
                select_src: 'image/checkbox_select.png', unselect_src: 'image/checkbox_unselect.png',
                check_func: (group, buttonIndex, checked) => {
                    if (!this.state.updatingCheckbox) row.setChecked(checked);
                },
            });
            entry.checkboxButton = entry.checkbox.createWidget(widget.STATE_BUTTON, LAYOUT.radioButton(0));
            this.state.updatingCheckbox = true;
            try { entry.checkbox.setProperty(prop.INIT, entry.checkboxButton); }
            finally { this.state.updatingCheckbox = false; }
            this.syncCheckbox(entry, row.checked());
        }
        this.state.labels.push(entry);
        if (row.action) {
            for (const w of targets) {
                w.addEventListener(event.CLICK_DOWN, () => bg.setProperty(prop.MORE, { color: 0x101010 }));
                w.addEventListener(event.MOVE, () => bg.setProperty(prop.MORE, { color: 0x000000 }));
                w.addEventListener(event.SELECT, () => {
                    bg.setProperty(prop.MORE, { color: 0x000000 });
                    this.focus(index); row.action();
                });
            }
        }
    },
    renderRadioGroup() {
        this.state.radioGroup = createWidget(widget.RADIO_GROUP, {
            ...LAYOUT.radioGroup(isRtl(), ADHKAR_MODES.length),
            select_src: 'image/dot_select.png', unselect_src: 'image/dot_unselect.png',
            check_func: (group, index, checked) => {
                if (checked && !this.state.updatingRadio) this.state.rows[index].action();
            },
        });
        ADHKAR_MODES.forEach((mode, index) => {
            this.state.radioButtons[index] = this.state.radioGroup.createWidget(widget.STATE_BUTTON, LAYOUT.radioButton(index));
        });
        this.syncRadio();
    },
    syncRadio() {
        if (!this.state.radioGroup) return;
        this.state.updatingRadio = true;
        try {
            this.state.radioGroup.setProperty(prop.INIT, this.state.radioButtons[ADHKAR_MODES.indexOf(this.state.settings.mode)]);
        } finally { this.state.updatingRadio = false; }
    },
    open(view, id) {
        const cache = getAppCache();
        if (cache) cache.adhkarReturnFocus = { view: this.state.view, index: this.state.focus };
        const previewIds = this.state.settings.enabledIds.length
            ? this.state.settings.enabledIds : ADHKAR.map(item => item.id);
        push({
            url: view === 'time' ? 'page/gt/adhkar-time-picker/index.page'
                : view === 'test' ? 'page/gt/adhkar-alert/index.page' : 'page/gt/adhkar/index.page',
            params: JSON.stringify(view === 'time' ? { id } : view === 'test'
                ? { adhkar: true, test: true, id: previewIds[Math.floor(Math.random() * previewIds.length)] } : { view, id }),
        });
    },
    syncCheckbox(entry, checked) {
        this.state.updatingCheckbox = true;
        try { entry.checkbox.setProperty(checked ? prop.CHECKED : prop.UNCHECKED, entry.checkboxButton); }
        finally { this.state.updatingCheckbox = false; }
    },
    setAdhkarChecked(id, checked) {
        const current = this.state.settings;
        const enabledIds = current.enabledIds.filter(value => value !== id);
        if (checked) enabledIds.push(id);
        this.update({ ...current, enabledIds, enabled: current.enabled && enabledIds.length > 0 });
        if (!enabledIds.length) this.message('adhkarEmpty');
    },
    titleText() {
        const view = this.state.view;
        if (view === 'schedule') return t('adhkarSchedule');
        return t('adhkar');
    },
    modeLabel() { return t(MODE_KEYS[ADHKAR_MODES.indexOf(this.state.settings.mode)]); },
    makeRows() {
        const s = this.state.settings;
        if (this.state.view === 'schedule') return ADHKAR_MODES.map((mode, index) => ({
            text: () => t(MODE_KEYS[index]), kind: 'radio',
            action: () => this.selectMode(mode),
        }));
        return [
            { text: () => t('adhkarEnabled'), kind: 'toggle', checked: () => this.state.settings.enabled, action: () => {
                const current = this.state.settings;
                this.update({ ...current, enabled: !current.enabled,
                    enabledIds: current.enabledIds.length ? current.enabledIds : ADHKAR.map((item) => item.id) });
            } },
            { text: () => t('adhkarSchedule'), subtitle: () => this.modeLabel(), action: () => this.open('schedule') },
            { text: () => t('adhkarStart'), subtitle: () => timeLabel(this.state.settings.start), action: () => this.open('time', 'start') },
            { text: () => t('adhkarEnd'), subtitle: () => timeLabel(this.state.settings.end), action: () => this.open('time', 'end') },
            ...(s.mode === 'daily' ? s.times.map((value, index) => ({
                text: () => t('adhkarTimes') + ' ' + localizeDigits(index + 1), subtitle: () => timeLabel(this.state.settings.times[index]),
                action: () => this.open('time', index),
            })) : []),
            { text: () => t('adhkarTest'), action: () => this.open('test') },
            { text: () => t('adhkarCollection'), kind: 'section' },
            ...ADHKAR.map((item) => ({ text: () => item.arabic, subtitle: () => getAdhkarMeaning(item.id, getAppLanguage()),
                kind: 'checkbox', checked: () => this.state.settings.enabledIds.indexOf(item.id) !== -1,
                setChecked: checked => this.setAdhkarChecked(item.id, checked),
                action: () => this.setAdhkarChecked(item.id, this.state.settings.enabledIds.indexOf(item.id) === -1), arabic: true })),
        ];
    },
    selectMode(mode) {
        const next = { ...this.state.settings, mode };
        // Daily controls are hidden in interval mode. If its window changed,
        // bring the three times into that window when returning to daily mode.
        if (mode === 'daily' && next.times.some(time => time < next.start || time > next.end)) {
            next.times = [next.start, Math.floor((next.start + next.end) / 30) * 15, next.end];
        }
        this.update(next);
    },
    update(next) {
        if (!saveAdhkarSettings(next)) { this.message('adhkarInvalidTime'); return; }
        this.state.settings = getAdhkarSettings();
        this.refreshRows();
    },
    refreshRows() {
        this.state.title.setProperty(prop.MORE, { text: this.titleText() });
        this.state.rows.forEach((row, index) => {
            const entry = this.state.labels[index];
            entry.label.setProperty(prop.MORE, { text: row.text() });
            if (entry.subtitle) entry.subtitle.setProperty(prop.MORE, { text: row.subtitle() });
            if (entry.checkbox) this.syncCheckbox(entry, row.checked());
            if (entry.track) {
                entry.track.setProperty(prop.MORE, LAYOUT.track(index, row.checked(), isRtl(), this.rowHeight));
                entry.knob.setProperty(prop.MORE, LAYOUT.knob(index, row.checked(), isRtl(), this.rowHeight));
            }
        });
        this.syncRadio();
    },
    message(key) { createModal({ content: t(key), show: true, autoHide: true, okButton: 'image/ic_confirm_64px.png' }); },
    focus(index) {
        this.state.focus = Math.max(0, Math.min(this.state.rows.length - 1, index));
        const alpha = this.state.rows[this.state.focus].kind === 'section' ? 0 : 255;
        if (this.state.focusTop) this.state.focusTop.setProperty(prop.MORE, { ...LAYOUT.focusTop(this.state.focus, this.rowHeight), alpha });
        if (this.state.focusBottom) this.state.focusBottom.setProperty(prop.MORE, { ...LAYOUT.focusBottom(this.state.focus, this.rowHeight), alpha });
    },
    onDestroy() { offKey(); this.state.labels = []; },
}));
