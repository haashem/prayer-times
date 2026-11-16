import { LAYOUT } from "zosLoader:./index.page.[pf].layout.js";
import { createWidget, widget, setStatusBarVisible } from '@zos/ui';
import { setPageBrightTime } from '@zos/display';
import { back } from '@zos/router';
import { onKey, offKey, KEY_BACK, KEY_EVENT_CLICK } from '@zos/interaction';
import { Vibrator, VIBRATOR_SCENE_NOTIFICATION } from '@zos/sensor';
import { BasePage } from '@zeppos/zml/base-page';
import { getAppLanguage, t } from '../../../utils/i18n';
import { getAdhkarMeaning } from '../../../utils/adhkar-content';
import { parseAdhkarPayload, prepareAdhkarReminder, markAdhkarDisplayed } from '../../../utils/adhkar';

const ALERT_DURATION_MS = 5000;

Page(BasePage({
    state: { payload: null, timer: null, vibrator: null, built: false, dismissed: false },
    onInit(params) {
        this.state.payload = parseAdhkarPayload(params);
        if (!this.state.payload) {
            const app = getApp();
            const data = app && app._options && app._options.globalData;
            if (data) { this.state.payload = data.pendingAdhkarAlert; data.pendingAdhkarAlert = null; }
        }
    },
    build(params) {
        if (this.state.built) return;
        this.state.built = true;
        const payload = this.state.payload || parseAdhkarPayload(params);
        const item = prepareAdhkarReminder(payload);
        if (!item) { this.state.timer = setTimeout(() => back(), 0); return; }
        if (LAYOUT.square) setStatusBarVisible(false);
        setPageBrightTime({ brightTime: ALERT_DURATION_MS });
        createWidget(widget.IMG, LAYOUT.background);
        const meaning = getAdhkarMeaning(item.id, getAppLanguage());
        createWidget(widget.TEXT, { ...LAYOUT.titleStyle(t('adhkar')), text: t('adhkar') });
        createWidget(widget.TEXT, { ...LAYOUT.arabicStyle(item.arabic), text: item.arabic });
        createWidget(widget.TEXT, { ...LAYOUT.translationStyle(meaning), text: meaning });
        onKey({ callback: (key, keyEvent) => {
            if (key !== KEY_BACK || keyEvent !== KEY_EVENT_CLICK) return false;
            this.dismiss();
            return true;
        } });
        markAdhkarDisplayed(item, payload.occurrenceTime);
        this.state.vibrator = new Vibrator();
        this.state.vibrator.start({ mode: VIBRATOR_SCENE_NOTIFICATION });
        this.state.timer = setTimeout(() => this.dismiss(), ALERT_DURATION_MS);
    },
    dismiss() {
        if (this.state.dismissed) return;
        this.state.dismissed = true;
        this.stopAlert();
        back();
    },
    stopAlert() {
        if (this.state.timer !== null) { clearTimeout(this.state.timer); this.state.timer = null; }
        if (this.state.vibrator) this.state.vibrator.stop();
    },
    onDestroy() { this.stopAlert(); offKey(); },
}));
