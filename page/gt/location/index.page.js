import { createWidget, deleteWidget, widget, prop, event, setStatusBarVisible } from "@zos/ui";
import { back } from "@zos/router";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { onKey, offKey, KEY_HOME, KEY_SELECT, KEY_EVENT_CLICK } from "@zos/interaction";
import { setScrollMode, SCROLL_MODE_SWIPER } from "@zos/page";
import { localStorage } from "@zos/storage";
import { BasePage } from "@zeppos/zml/base-page";
import { isRtl, t } from "../../../utils/i18n";
import { getLocationKey, persistLocationChoice } from "../../../utils/location-storage";
import {
    TITLE_STYLE,
    SCROLL_ITEM_HEIGHT,
    getRowBgStyle,
    getRowTextStyle,
    getRowHitStyle,
    getRadioGroupStyle,
    getStateButtonStyle,
    getFocusLineTopStyle,
    getFocusLineBottomStyle,
    getFooterStyle,
    getBottomPaddingStyle,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        state: {
            widgets: [],
            options: [],
            defaultCityKey: "auto",
            radioGroup: null,
            stateButtons: [],
            focusTop: null,
            focusBottom: null,
            focusIndex: 0,
            updatingRadio: false,
            selecting: false,
        },

        build() {
            setPageBrightTime({ brightTime: 30000 });
            const { screenShape } = getDeviceInfo();
            if (screenShape === SCREEN_SHAPE_SQUARE) setStatusBarVisible(false);

            createWidget(widget.PAGE_SCROLLBAR);
            this.track(createWidget(widget.TEXT, {
                ...TITLE_STYLE,
                text: t("location"),
            }));
            this.state.options = [
                { key: "auto", name: t("autoDetect"), city: null },
            ];
            this.state.defaultCityKey = localStorage.getItem("defaultCityKey") || "auto";
            this.registerSelectionKey();
            this.renderOptions();
            this.loadLocations();
        },

        track(w) {
            this.state.widgets.push(w);
            return w;
        },

        clearDynamicWidgets() {
            for (let i = 1; i < this.state.widgets.length; i++) {
                deleteWidget(this.state.widgets[i]);
            }
            this.state.widgets = this.state.widgets.slice(0, 1);
            this.state.radioGroup = null;
            this.state.stateButtons = [];
            this.state.focusTop = null;
            this.state.focusBottom = null;
        },

        loadLocations() {
            this.request({ method: "GET_LOCATION_SETTINGS" })
                .then((data) => {
                    const result = data && data.result ? data.result : {};
                    const cities = Array.isArray(result.cities) ? result.cities.slice(0, 5) : [];
                    this.state.defaultCityKey = result.defaultCityKey || "auto";
                    this.state.options = [
                        { key: "auto", name: t("autoDetect"), city: null },
                    ].concat(
                        cities.map((city) => ({
                            key: getLocationKey(city),
                            name: city.name,
                            city,
                        }))
                    );
                    this.renderOptions();
                })
                .catch(() => {
                    this.state.options = [
                        { key: "auto", name: t("autoDetect"), city: null },
                    ];
                    this.state.defaultCityKey = "auto";
                    this.renderOptions();
                });
        },

        renderOptions() {
            this.clearDynamicWidgets();
            const rtl = isRtl();
            const count = this.state.options.length;

            setScrollMode({
                mode: SCROLL_MODE_SWIPER,
                options: {
                    height: SCROLL_ITEM_HEIGHT,
                    count,
                    modeParams: {
                        crown_enable: true,
                        on_page: (index) => this.setFocusedIndex(index),
                    },
                },
            });

            for (let i = 0; i < count; i++) {
                const option = this.state.options[i];
                const bg = this.track(createWidget(widget.FILL_RECT, getRowBgStyle(i)));
                const label = this.track(createWidget(widget.TEXT, {
                    ...getRowTextStyle(i, rtl),
                    text: option.name,
                }));
                const hit = this.track(createWidget(widget.FILL_RECT, getRowHitStyle(i, rtl)));
                for (const target of [bg, label, hit]) {
                    target.addEventListener(event.SELECT, () => this.selectIndex(i));
                }
            }

            this.state.radioGroup = this.track(createWidget(widget.RADIO_GROUP, {
                ...getRadioGroupStyle(count, rtl),
                select_src: "image/dot_select.png",
                unselect_src: "image/dot_unselect.png",
                check_func: (group, index, checked) => {
                    if (checked && !this.state.updatingRadio) this.selectIndex(index, false);
                },
            }));

            for (let i = 0; i < count; i++) {
                this.state.stateButtons[i] = this.state.radioGroup.createWidget(
                    widget.STATE_BUTTON,
                    getStateButtonStyle(i)
                );
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

            this.state.focusIndex = selectedIndex;
            this.state.focusTop = this.track(createWidget(widget.IMG, {
                ...getFocusLineTopStyle(selectedIndex),
                src: "image/focus_line_top.png",
            }));
            this.state.focusBottom = this.track(createWidget(widget.IMG, {
                ...getFocusLineBottomStyle(selectedIndex),
                src: "image/focus_line_bottom.png",
            }));
            this.track(createWidget(widget.TEXT, {
                ...getFooterStyle(count, rtl),
                text: t("addCitiesInZepp"),
            }));
            this.track(createWidget(widget.FILL_RECT, getBottomPaddingStyle(count)));
        },

        getSelectedIndex() {
            for (let i = 0; i < this.state.options.length; i++) {
                if (this.state.options[i].key === this.state.defaultCityKey) return i;
            }
            return 0;
        },

        setFocusedIndex(index) {
            const maxIndex = Math.max(0, this.state.options.length - 1);
            const nextIndex = Math.max(0, Math.min(maxIndex, index));
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
                    if (isCrownKey && keyEvent === KEY_EVENT_CLICK && this.state.options.length) {
                        this.selectIndex(this.state.focusIndex);
                        return true;
                    }
                    return false;
                },
            });
        },

        selectIndex(index, updateRadio = true) {
            if (this.state.selecting) return;
            const option = this.state.options[index];
            if (!option) return;
            this.state.selecting = true;

            if (updateRadio && this.state.radioGroup && this.state.stateButtons[index]) {
                this.state.updatingRadio = true;
                try {
                    this.state.radioGroup.setProperty(prop.CHECKED, this.state.stateButtons[index]);
                } finally {
                    this.state.updatingRadio = false;
                }
            }

            this.request({
                method: "SET_DEFAULT_LOCATION",
                params: { key: option.key },
            })
                .then(() => {
                    this.persistSelection(option);
                    back();
                })
                .catch(() => {
                    this.state.selecting = false;
                });
        },

        persistSelection(option) {
            persistLocationChoice(option.city, option.key);
        },

        onCall(data) {
            if (data && data.type === "LOCATION_SETTINGS_CHANGED" && !this.state.selecting) {
                this.loadLocations();
            }
        },

        onDestroy() {
            offKey();
            for (const w of this.state.widgets) deleteWidget(w);
            this.state.widgets = [];
        },
    })
);
