import { createWidget, deleteWidget, widget, prop, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { BasePage } from "@zeppos/zml/base-page";
import {
    TITLE_STYLE,
    LANGUAGE_OPTIONS,
    BOTTOM_PADDING,
    RADIO_GROUP_STYLE,
    getLanguageRowBgStyle,
    getLanguageRowTextStyle,
    getStateButtonStyle,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        state: {
            optionWidgets: [],
            radioGroup: null,
            stateButtons: [],
        },

        build() {
            setPageBrightTime({ brightTime: 30000 });

            const { screenShape } = getDeviceInfo();
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            createWidget(widget.PAGE_SCROLLBAR);
            createWidget(widget.TEXT, {
                ...TITLE_STYLE,
                text: "Language",
            });

            this.renderOptions();
        },

        clearOptions() {
            for (const w of this.state.optionWidgets) {
                deleteWidget(w);
            }
            this.state.optionWidgets = [];
            this.state.radioGroup = null;
            this.state.stateButtons = [];
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
            this.trackOptionWidget(createWidget(widget.FILL_RECT, getLanguageRowBgStyle(index)));
            this.trackOptionWidget(createWidget(widget.TEXT, {
                ...getLanguageRowTextStyle(index),
                text: option.label,
            }));
        },

        getSelectedIndex() {
            for (let i = 0; i < LANGUAGE_OPTIONS.length; i++) {
                if (LANGUAGE_OPTIONS[i].value === "english") {
                    return i;
                }
            }
            return 0;
        },

        onDestroy() {
            this.clearOptions();
        },
    })
);
