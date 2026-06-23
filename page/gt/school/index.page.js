import { createWidget, deleteWidget, widget, prop, event, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { onKey, offKey, KEY_HOME, KEY_SELECT, KEY_EVENT_CLICK } from "@zos/interaction";
import { setScrollMode, SCROLL_MODE_SWIPER } from "@zos/page";
import { BasePage } from "@zeppos/zml/base-page";
import { isRtl, t } from "../../../utils/i18n";
import { getPrayerSchool, setPrayerSchool } from "../../../utils/prayer-settings";
import {
    TITLE_STYLE,
    SCHOOL_OPTIONS,
    SCROLL_ITEM_COUNT,
    BOTTOM_PADDING,
    SCROLL_ITEM_HEIGHT,
    RADIO_GROUP_STYLE,
    getSchoolRowBgStyle,
    getSchoolRowTextStyle,
    getSchoolRowHitStyle,
    getStateButtonStyle,
    getFocusLineTopStyle,
    getFocusLineBottomStyle,
    getInfoTextStyle,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        state: {
            optionWidgets: [],
            titleWidget: null,
            radioGroup: null,
            stateButtons: [],
            focusTop: null,
            focusBottom: null,
            focusIndex: 0,
            selectedIndex: null,
            updatingRadio: false,
        },

        build() {
            setPageBrightTime({ brightTime: 30000 });

            const { screenShape } = getDeviceInfo();
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            setScrollMode({
                mode: SCROLL_MODE_SWIPER,
                options: {
                    height: SCROLL_ITEM_HEIGHT,
                    count: SCROLL_ITEM_COUNT,
                    modeParams: {
                        crown_enable: true,
                        on_page: (pageIndex) => {
                            this.setFocusedIndex(pageIndex);
                        },
                    },
                },
            });

            createWidget(widget.PAGE_SCROLLBAR);
            this.state.titleWidget = createWidget(widget.TEXT, {
                ...TITLE_STYLE,
                text: t("school"),
            });

            this.renderOptions();
            this.registerSelectionKey();
        },

        clearOptions() {
            for (const w of this.state.optionWidgets) {
                deleteWidget(w);
            }
            this.state.optionWidgets = [];
            this.state.radioGroup = null;
            this.state.stateButtons = [];
            this.state.focusTop = null;
            this.state.focusBottom = null;
        },

        trackOptionWidget(w) {
            this.state.optionWidgets.push(w);
            return w;
        },

        renderOptions() {
            this.clearOptions();

            for (let i = 0; i < SCHOOL_OPTIONS.length; i++) {
                this.renderOptionRow(SCHOOL_OPTIONS[i], i);
            }

            this.renderFocusIndicator();

            this.state.radioGroup = this.trackOptionWidget(createWidget(widget.RADIO_GROUP, {
                ...RADIO_GROUP_STYLE,
                select_src: "image/dot_select.png",
                unselect_src: "image/dot_unselect.png",
                check_func: (group, index, checked) => {
                    if (checked && !this.state.updatingRadio) {
                        this.selectIndex(index, false);
                    }
                },
            }));

            for (let i = 0; i < SCHOOL_OPTIONS.length; i++) {
                this.state.stateButtons[i] = this.state.radioGroup.createWidget(widget.STATE_BUTTON, getStateButtonStyle(i));
            }

            const selectedIndex = this.getSelectedIndex();
            if (this.state.stateButtons[selectedIndex]) {
                this.state.updatingRadio = true;
                try {
                    this.state.radioGroup.setProperty(prop.INIT, this.state.stateButtons[selectedIndex]);
                } finally {
                    this.state.updatingRadio = false;
                }
            }

            this.renderInfoText();

            this.trackOptionWidget(createWidget(widget.FILL_RECT, {
                x: 0,
                y: BOTTOM_PADDING.y,
                w: 1,
                h: BOTTOM_PADDING.h,
                color: 0x000000,
                alpha: 0,
            }));
        },

        renderInfoText() {
            this.trackOptionWidget(createWidget(widget.TEXT, {
                ...getInfoTextStyle(isRtl()),
                text: t("schoolInfo"),
            }));
        },

        renderOptionRow(option, index) {
            const rowBg = this.trackOptionWidget(createWidget(widget.FILL_RECT, getSchoolRowBgStyle(index)));
            const rowText = this.trackOptionWidget(createWidget(widget.TEXT, {
                ...getSchoolRowTextStyle(index),
                text: t(option.labelKey),
            }));
            const rowHit = this.trackOptionWidget(createWidget(widget.FILL_RECT, getSchoolRowHitStyle(index)));

            for (const w of [rowBg, rowText, rowHit]) {
                w.addEventListener(event.SELECT, () => {
                    this.selectIndex(index);
                });
            }
        },

        renderFocusIndicator() {
            this.state.focusIndex = 0;
            this.state.focusTop = this.trackOptionWidget(createWidget(widget.IMG, {
                ...getFocusLineTopStyle(this.state.focusIndex),
                src: "image/focus_line_top.png",
            }));
            this.state.focusBottom = this.trackOptionWidget(createWidget(widget.IMG, {
                ...getFocusLineBottomStyle(this.state.focusIndex),
                src: "image/focus_line_bottom.png",
            }));
        },

        getSelectedIndex() {
            if (this.state.selectedIndex !== null && this.state.selectedIndex >= 0 && this.state.selectedIndex < SCHOOL_OPTIONS.length) {
                return this.state.selectedIndex;
            }

            const school = getPrayerSchool();
            for (let i = 0; i < SCHOOL_OPTIONS.length; i++) {
                if (SCHOOL_OPTIONS[i].value === school) {
                    return i;
                }
            }
            return 0;
        },

        setFocusedIndex(index) {
            const nextIndex = Math.max(0, Math.min(SCROLL_ITEM_COUNT - 1, index));
            if (nextIndex === this.state.focusIndex) {
                return;
            }

            this.state.focusIndex = nextIndex;
            if (nextIndex >= SCHOOL_OPTIONS.length) {
                return;
            }
            if (this.state.focusTop) {
                this.state.focusTop.setProperty(prop.MORE, getFocusLineTopStyle(nextIndex));
            }
            if (this.state.focusBottom) {
                this.state.focusBottom.setProperty(prop.MORE, getFocusLineBottomStyle(nextIndex));
            }
        },

        registerSelectionKey() {
            onKey({
                callback: (key, keyEvent) => {
                    const isCrownKey = key === KEY_HOME || key === KEY_SELECT;
                    if (isCrownKey && keyEvent === KEY_EVENT_CLICK) {
                        if (this.state.focusIndex < SCHOOL_OPTIONS.length) {
                            this.selectIndex(this.state.focusIndex);
                            return true;
                        }
                        return false;
                    }
                    return false;
                },
            });
        },

        selectIndex(index, updateRadio = true) {
            const nextIndex = Math.max(0, Math.min(SCHOOL_OPTIONS.length - 1, index));
            this.state.selectedIndex = nextIndex;
            setPrayerSchool(SCHOOL_OPTIONS[nextIndex].value);
            if (updateRadio && this.state.radioGroup && this.state.stateButtons[nextIndex]) {
                this.state.updatingRadio = true;
                try {
                    this.state.radioGroup.setProperty(prop.CHECKED, this.state.stateButtons[nextIndex]);
                } finally {
                    this.state.updatingRadio = false;
                }
            }
        },

        onDestroy() {
            offKey();
            this.clearOptions();
        },
    })
);
