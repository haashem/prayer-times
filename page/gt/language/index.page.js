import { createWidget, deleteWidget, widget, prop, event, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { onKey, offKey, KEY_HOME, KEY_SELECT, KEY_EVENT_CLICK, KEY_EVENT_PRESS, KEY_EVENT_RELEASE } from "@zos/interaction";
import { setScrollMode, swipeToIndex, SCROLL_ANIMATION_NONE, SCROLL_MODE_SWIPER } from "@zos/page";
import { BasePage } from "@zeppos/zml/base-page";
import {
    TITLE_STYLE,
    LANGUAGE_OPTIONS,
    BOTTOM_PADDING,
    SCROLL_ITEM_HEIGHT,
    RADIO_GROUP_STYLE,
    getLanguageRowBgStyle,
    getLanguageRowTextStyle,
    getLanguageRowHitStyle,
    getStateButtonStyle,
    getFocusLineTopStyle,
    getFocusLineBottomStyle,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        state: {
            optionWidgets: [],
            radioGroup: null,
            stateButtons: [],
            focusTop: null,
            focusBottom: null,
            focusIndex: 0,
            selectedIndex: 2,
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
                    count: LANGUAGE_OPTIONS.length,
                    modeParams: {
                        crown_enable: true,
                        on_page: (pageIndex) => {
                            this.setFocusedIndex(pageIndex);
                        },
                    },
                },
            });

            createWidget(widget.PAGE_SCROLLBAR);
            createWidget(widget.TEXT, {
                ...TITLE_STYLE,
                text: "Language",
            });

            this.renderOptions();
            this.registerSelectionKey();
            swipeToIndex({
                index: this.getSelectedIndex(),
                animation: SCROLL_ANIMATION_NONE,
            });
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

            for (let i = 0; i < LANGUAGE_OPTIONS.length; i++) {
                const option = LANGUAGE_OPTIONS[i];
                this.renderOptionRow(option, i);
            }

            this.renderFocusIndicator();

            this.state.radioGroup = this.trackOptionWidget(createWidget(widget.RADIO_GROUP, {
                ...RADIO_GROUP_STYLE,
                select_src: "image/dot_select.png",
                unselect_src: "image/dot_unselect.png",
            }));

            for (let i = 0; i < LANGUAGE_OPTIONS.length; i++) {
                this.state.stateButtons[i] = this.state.radioGroup.createWidget(widget.STATE_BUTTON, getStateButtonStyle(i));
            }

            const selectedIndex = this.getSelectedIndex();
            if (this.state.stateButtons[selectedIndex]) {
                this.state.radioGroup.setProperty(prop.INIT, this.state.stateButtons[selectedIndex]);
            }

            this.trackOptionWidget(createWidget(widget.FILL_RECT, {
                x: 0,
                y: BOTTOM_PADDING.y,
                w: 1,
                h: BOTTOM_PADDING.h,
                color: 0x000000,
                alpha: 0,
            }));
        },

        renderOptionRow(option, index) {
            const rowBg = this.trackOptionWidget(createWidget(widget.FILL_RECT, getLanguageRowBgStyle(index)));
            const rowText = this.trackOptionWidget(createWidget(widget.TEXT, {
                ...getLanguageRowTextStyle(index),
                text: option.label,
            }));
            const rowHit = this.trackOptionWidget(createWidget(widget.FILL_RECT, getLanguageRowHitStyle(index)));

            for (const w of [rowBg, rowText, rowHit]) {
                w.addEventListener(event.SELECT, () => {
                    this.selectIndex(index);
                });
            }
        },

        renderFocusIndicator() {
            this.state.focusIndex = this.getSelectedIndex();
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
            if (this.state.selectedIndex >= 0 && this.state.selectedIndex < LANGUAGE_OPTIONS.length) {
                return this.state.selectedIndex;
            }

            for (let i = 0; i < LANGUAGE_OPTIONS.length; i++) {
                if (LANGUAGE_OPTIONS[i].value === "english") {
                    return i;
                }
            }
            return 0;
        },

        setFocusedIndex(index) {
            const nextIndex = Math.max(0, Math.min(LANGUAGE_OPTIONS.length - 1, index));
            if (nextIndex === this.state.focusIndex) {
                return;
            }

            this.state.focusIndex = nextIndex;
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
                    const isSelectEvent =
                        keyEvent === KEY_EVENT_CLICK;
                    if (isCrownKey && isSelectEvent) {
                        this.selectIndex(this.state.focusIndex);
                        return true;
                    }
                    return false;
                },
            });
        },

        selectIndex(index) {
            const nextIndex = Math.max(0, Math.min(LANGUAGE_OPTIONS.length - 1, index));
            this.state.selectedIndex = nextIndex;
            if (this.state.radioGroup && this.state.stateButtons[nextIndex]) {
                this.state.radioGroup.setProperty(prop.CHECKED, this.state.stateButtons[nextIndex]);
            }
        },

        onDestroy() {
            offKey();
            this.clearOptions();
        },
    })
);
