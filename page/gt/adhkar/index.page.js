import { LAYOUT } from "zosLoader:./index.page.[pf].layout.js";
import { createWidget, widget, prop, event, setStatusBarVisible } from '@zos/ui';
import { push } from '@zos/router';
import { setPageBrightTime } from '@zos/display';
import { createModal, onKey, offKey, KEY_HOME, KEY_SELECT, KEY_EVENT_CLICK } from '@zos/interaction';
import { setScrollMode, SCROLL_MODE_SWIPER } from '@zos/page';
import { BasePage } from '@zeppos/zml/base-page';
import { t, getAppLanguage, localizeDigits, isRtl } from '../../../utils/i18n';
import { ADHKAR, getAdhkarMeaning } from '../../../utils/adhkar-content';
import { ADHKAR_MODES, getAdhkarSettings, saveAdhkarSettings } from '../../../utils/adhkar';
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from '@zos/device';

const MODE_KEYS = ['adhkarDaily', 'adhkar30', 'adhkar60', 'adhkar120'];
function timeLabel(value) {
    return localizeDigits(('0' + Math.floor(value / 60)).slice(-2) + ':' + ('0' + value % 60).slice(-2));
}

Page(BasePage({
    state: { view: 'main', id: null, settings: null, rows: [], labels: [], focus: 0, focusTop: null, focusBottom: null, title: null, radioGroup: null, radioButtons: [], updatingRadio: false },
    onInit(params) {
        try {
            const data = typeof params === 'string' ? JSON.parse(params) : params;
            if (data) { this.state.view = data.view || 'main'; this.state.id = data.id; }
        } catch (e) { /* Use the main screen for malformed route parameters. */ }
    },
    build() {
        this.state.settings = getAdhkarSettings();
        const { screenShape } = getDeviceInfo();
        if (screenShape === SCREEN_SHAPE_SQUARE) setStatusBarVisible(false);
        setPageBrightTime({ brightTime: 30000 });
        this.state.rows = this.makeRows();
        this.rowHeight = this.state.view === 'phrase' ? LAYOUT.readingRowHeight : LAYOUT.rowHeight;
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
            ...(kind === 'info' ? { color: row.size === 34 ? 0xffffff : 0xa6a6a6 } : {}),
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
    open(view, id) { push({ url: 'page/gt/adhkar/index.page', params: JSON.stringify({ view, id }) }); },
    titleText() {
        const view = this.state.view;
        if (view === 'time') return timeLabel(this.timeValue());
        if (view === 'schedule') return t('adhkarSchedule');
        if (view === 'collection') return t('adhkarCollection');
        return t('adhkar');
    },
    status(enabled) { return t(enabled ? 'adhkarOn' : 'adhkarOff'); },
    modeLabel() { return t(MODE_KEYS[ADHKAR_MODES.indexOf(this.state.settings.mode)]); },
    makeRows() {
        const s = this.state.settings;
        if (this.state.view === 'schedule') return ADHKAR_MODES.map((mode, index) => ({
            text: () => t(MODE_KEYS[index]), kind: 'radio',
            action: () => this.update({ ...this.state.settings, mode }),
        }));
        if (this.state.view === 'collection') return [
            { text: () => t('adhkarEnableAll'), kind: 'action', action: () => this.update({ ...this.state.settings, enabledIds: ADHKAR.map((item) => item.id) }) },
            ...ADHKAR.map((item) => ({ text: () => item.arabic, subtitle: () => this.status(this.state.settings.enabledIds.indexOf(item.id) !== -1),
                action: () => this.open('phrase', item.id), size: 29 })),
        ];
        if (this.state.view === 'phrase') {
            const item = ADHKAR.find((entry) => entry.id === this.state.id);
            if (!item) return [{ text: () => t('adhkarCollection'), action: () => this.open('collection') }];
            return [
                { text: () => item.arabic, size: 34 },
                { text: () => getAdhkarMeaning(item.id, getAppLanguage()), size: 24 },
                { text: () => item.source, size: 24 },
                { text: () => t('adhkarEnabled'), kind: 'toggle', checked: () => this.state.settings.enabledIds.indexOf(item.id) !== -1, action: () => {
                    const current = this.state.settings;
                    const wasEnabled = current.enabledIds.indexOf(item.id) !== -1;
                    const enabledIds = wasEnabled ? current.enabledIds.filter((id) => id !== item.id) : current.enabledIds.concat([item.id]);
                    this.update({ ...current, enabledIds, enabled: current.enabled && enabledIds.length > 0 });
                    if (!enabledIds.length) this.message('adhkarEmpty');
                } },
            ];
        }
        if (this.state.view === 'time') return [
            { text: () => t('adhkarHour') + ' −', subtitle: () => timeLabel(this.timeValue()), kind: 'action', action: () => this.changeTime(-60, true) },
            { text: () => t('adhkarHour') + ' +', subtitle: () => timeLabel(this.timeValue()), kind: 'action', action: () => this.changeTime(60, true) },
            { text: () => t('adhkarMinute') + ' −', subtitle: () => timeLabel(this.timeValue()), kind: 'action', action: () => this.changeTime(-1, false) },
            { text: () => t('adhkarMinute') + ' +', subtitle: () => timeLabel(this.timeValue()), kind: 'action', action: () => this.changeTime(1, false) },
        ];
        return [
            { text: () => t('adhkarEnabled'), kind: 'toggle', checked: () => this.state.settings.enabled, action: () => {
                const current = this.state.settings;
                this.update({ ...current, enabled: !current.enabled,
                    enabledIds: current.enabledIds.length ? current.enabledIds : ADHKAR.map((item) => item.id) });
            } },
            { text: () => t('adhkarSchedule'), subtitle: () => this.modeLabel(), action: () => this.open('schedule') },
            { text: () => t('adhkarStart'), subtitle: () => timeLabel(this.state.settings.start), action: () => this.open('time', 'start') },
            { text: () => t('adhkarEnd'), subtitle: () => timeLabel(this.state.settings.end), action: () => this.open('time', 'end') },
            ...s.times.map((value, index) => ({
                text: () => t('adhkarTimes') + ' ' + localizeDigits(index + 1), subtitle: () => timeLabel(this.state.settings.times[index]),
                action: () => this.open('time', index),
            })),
            { text: () => t('adhkarCollection'), action: () => this.open('collection') },
        ];
    },
    timeValue() {
        const id = this.state.id;
        return id === 'start' || id === 'end' ? this.state.settings[id] : this.state.settings.times[Number(id)] || 0;
    },
    changeTime(delta, hour) {
        const old = this.timeValue();
        const value = hour ? ((Math.floor(old / 60) + delta / 60 + 24) % 24) * 60 + old % 60
            : Math.floor(old / 60) * 60 + (old % 60 + delta + 60) % 60;
        const next = { ...this.state.settings, times: this.state.settings.times.slice() };
        const id = this.state.id;
        if (id === 'start' || id === 'end') next[id] = value;
        else next.times[Number(id)] = value;
        this.update(next);
    },
    update(next) {
        if (!saveAdhkarSettings(next)) { this.message('adhkarInvalidTime'); return; }
        this.state.settings = getAdhkarSettings();
        this.state.title.setProperty(prop.MORE, { text: this.titleText() });
        this.state.rows.forEach((row, index) => {
            const entry = this.state.labels[index];
            entry.label.setProperty(prop.MORE, { text: row.text() });
            if (entry.subtitle) entry.subtitle.setProperty(prop.MORE, { text: row.subtitle() });
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
        if (this.state.focusTop) this.state.focusTop.setProperty(prop.MORE, LAYOUT.focusTop(this.state.focus, this.rowHeight));
        if (this.state.focusBottom) this.state.focusBottom.setProperty(prop.MORE, LAYOUT.focusBottom(this.state.focus, this.rowHeight));
    },
    onDestroy() { offKey(); this.state.labels = []; },
}));
