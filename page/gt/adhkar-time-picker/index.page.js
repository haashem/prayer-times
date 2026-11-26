import { LAYOUT } from "zosLoader:./index.page.[pf].layout.js";
import { createWidget, deleteWidget, widget, event, setStatusBarVisible } from '@zos/ui';
import { back } from '@zos/router';
import { setPageBrightTime } from '@zos/display';
import { createModal, onKey, offKey, onGesture, offGesture, GESTURE_RIGHT, KEY_BACK, KEY_SELECT, KEY_EVENT_CLICK } from '@zos/interaction';
import { BasePage } from '@zeppos/zml/base-page';
import { t, localizeDigits } from '../../../utils/i18n';
import { getAdhkarSettings, saveAdhkarSettings } from '../../../utils/adhkar';
import { timeLabel } from '../../../utils/adhkar-ui';

const MINUTES = [0, 15, 30, 45];

function windowHint(id, settings) {
    const dailyTimes = settings.mode === 'daily' ? settings.times : [];
    if (id === 'start') {
        const latest = Math.min(settings.end - 15, ...dailyTimes);
        return timeLabel(0) + ' – ' + timeLabel(latest);
    }
    if (id === 'end') {
        const earliest = Math.max(settings.start + 15, ...dailyTimes);
        return timeLabel(earliest) + ' – ' + timeLabel(23 * 60 + 45);
    }
    return '';
}

function initialState() {
    return { id: 'start', settings: null, picker: null, pickerWidgets: [], pickerClosing: false };
}

Page(BasePage({
    state: initialState(),
    onInit(params) {
        // Page definitions can survive navigation; discard the previous visit's
        // closing flags and references to destroyed widgets.
        this.state = initialState();
        try {
            const data = typeof params === 'string' ? JSON.parse(params) : params;
            const id = data && data.id;
            if (id === 'start' || id === 'end' || [0, 1, 2].indexOf(id) !== -1) this.state.id = id;
        } catch (e) { /* Invalid routes use the start-time picker. */ }
    },
    build() {
        this.state.settings = getAdhkarSettings();
        if (LAYOUT.square) setStatusBarVisible(false);
        setPageBrightTime({ brightTime: 30000 });
        this.renderTimePicker();
    },
    timeValue() {
        const id = this.state.id;
        return id === 'start' || id === 'end' ? this.state.settings[id] : this.state.settings.times[Number(id)] || 0;
    },
    renderTimePicker() {
        const value = this.timeValue();
        const id = this.state.id;
        const title = id === 'start' ? t('adhkarStart') : id === 'end' ? t('adhkarEnd')
            : t('adhkarTimes') + ' ' + localizeDigits(Number(id) + 1);
        let hour = Math.floor(value / 60);
        let minute = value % 60;
        const confirm = () => {
            if (this.state.pickerClosing) return;
            const next = { ...this.state.settings, times: this.state.settings.times.slice() };
            if (id === 'start' || id === 'end') next[id] = hour * 60 + minute;
            else next.times[Number(id)] = hour * 60 + minute;
            if (!saveAdhkarSettings(next)) { this.message('adhkarInvalidTime'); return; }
            this.closeTimePicker();
        };
        this.state.picker = createWidget(widget.WIDGET_PICKER, {
            title, subtitle: windowHint(id, this.state.settings), nb_of_columns: 2, init_col_index: 0,
            normal_color: 0x4a4a4d, select_color: 0x078bd1,
            done_icon: 'image/ic_confirm_64px.png',
            data_config: [
                { data_array: Array.from({ length: 24 }, (_, index) => localizeDigits(('0' + index).slice(-2))),
                    init_val_index: hour, connector: ':', support_loop: true,
                    font_size: 64, select_font_size: 80, connector_font_size: 64 },
                { data_array: MINUTES.map(value => localizeDigits(('0' + value).slice(-2))),
                    init_val_index: MINUTES.indexOf(minute), support_loop: true,
                    font_size: 64, select_font_size: 80 },
            ],
            picker_cb: (picker, eventType, column, index) => {
                // The native tick sends just (picker, 2). A selection includes
                // both the column and item index, even when its event type is 2.
                if (eventType === 2 && column === undefined && index === undefined) {
                    confirm();
                    return;
                }
                if ((eventType !== 1 && eventType !== 2) || !Number.isInteger(index)) return;
                if (column === 0 && index >= 0 && index < 24) hour = index;
                else if (column === 1 && index >= 0 && index < MINUTES.length) minute = MINUTES[index];
            },
        });
        const confirmButton = createWidget(widget.BUTTON, { ...LAYOUT.pickerConfirmButton, text: '', click_func: confirm });
        const tick = createWidget(widget.IMG, { ...LAYOUT.pickerConfirmIcon, src: 'image/ic_confirm_64px.png' });
        tick.addEventListener(event.SELECT, confirm);
        this.state.pickerWidgets = [confirmButton, tick];

        // Native full-screen widgets can install input listeners. Zepp allows
        // one listener per kind, so release those before registering ours.
        offKey();
        onKey({ callback: (key, keyEvent) => {
            if (keyEvent !== KEY_EVENT_CLICK) return false;
            if (key === KEY_BACK) { this.closeTimePicker(); return true; }
            if (key === KEY_SELECT) { confirm(); return true; }
            return false;
        } });
        offGesture();
        onGesture({ callback: (gesture) => {
            if (gesture !== GESTURE_RIGHT) return false;
            this.closeTimePicker(); return true;
        } });
    },
    closeTimePicker() {
        if (this.state.pickerClosing) return;
        this.state.pickerClosing = true;
        back();
    },
    releaseTimePicker() {
        if (!this.state.picker) return;
        const picker = this.state.picker;
        this.state.picker = null;
        offKey(); offGesture();
        deleteWidget(picker);
        for (const widget of this.state.pickerWidgets) deleteWidget(widget);
        this.state.pickerWidgets = [];
    },

    message(key) { createModal({ content: t(key), show: true, autoHide: true, okButton: 'image/ic_confirm_64px.png' }); },
    onDestroy() { this.releaseTimePicker(); },
}));
