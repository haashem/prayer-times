import { LAYOUT } from "zosLoader:./index.page.[pf].layout.js";
import { createWidget, widget, setStatusBarVisible } from '@zos/ui';
import { setPageBrightTime } from '@zos/display';
import { back } from '@zos/router';
import { Vibrator, VIBRATOR_SCENE_NOTIFICATION } from '@zos/sensor';
import { BasePage } from '@zeppos/zml/base-page';
import { getAppLanguage, t } from '../../../utils/i18n';
import { getAdhkarMeaning } from '../../../utils/adhkar-content';
import { parseAdhkarPayload, prepareAdhkarReminder, markAdhkarDisplayed } from '../../../utils/adhkar';

Page(BasePage({
    state: { payload: null, timer: null, vibrator: null, built: false },
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
        setPageBrightTime({ brightTime: 15000 });
        const meaning = getAdhkarMeaning(item.id, getAppLanguage());
        createWidget(widget.TEXT, { ...LAYOUT.title, text: t('adhkar') });
        createWidget(widget.TEXT, { ...LAYOUT.arabic, text: item.arabic });
        createWidget(widget.TEXT, { ...LAYOUT.translationStyle(meaning), text: meaning });
        markAdhkarDisplayed(item, payload.occurrenceTime);
        this.state.vibrator = new Vibrator();
        this.state.vibrator.start({ mode: VIBRATOR_SCENE_NOTIFICATION });
        this.state.timer = setTimeout(() => back(), 15000);
    },
    onDestroy() {
        if (this.state.timer !== null) clearTimeout(this.state.timer);
        if (this.state.vibrator) this.state.vibrator.stop();
    },
}));
