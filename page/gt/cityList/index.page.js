import { createWidget, widget, event } from "@zos/ui";
import { push, back } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
    TITLE_STYLE,
    ADD_BTN_STYLE,
    CITY_ROW_HEIGHT,
    CITY_START_Y,
    BOTTOM_PADDING,
    EMPTY_STYLE,
    getCityRowBgStyle,
    getCityTextStyle,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("cityList-page");

Page(
    BasePage({
        state: {
            cities: [],
            activeCity: null,
        },

        onInit() {
            logger.debug("cityList page onInit");
        },

        build() {
            logger.debug("cityList page build");

            // Load data
            this.loadCities();

            // Title
            createWidget(widget.TEXT, TITLE_STYLE);

            if (this.state.cities.length === 0) {
                // Empty state
                createWidget(widget.TEXT, EMPTY_STYLE);

                // Add button centered
                createWidget(widget.BUTTON, {
                    ...ADD_BTN_STYLE,
                    y: EMPTY_STYLE.y + EMPTY_STYLE.h + CITY_ROW_HEIGHT / 2,
                    click_func: () => {
                        push({ url: "page/gt/search/index.page" });
                    },
                });
            } else {
                // City list
                for (let i = 0; i < this.state.cities.length; i++) {
                    const city = this.state.cities[i];
                    const isActive =
                        this.state.activeCity &&
                        this.state.activeCity.city.toLowerCase() === city.city.toLowerCase();
                    const rowY = CITY_START_Y + i * CITY_ROW_HEIGHT;

                    const bg = createWidget(
                        widget.FILL_RECT,
                        getCityRowBgStyle(rowY, isActive)
                    );

                    const text = createWidget(widget.TEXT, {
                        ...getCityTextStyle(rowY, isActive),
                        text: city.city + (isActive ? " ✓" : ""),
                    });

                    // Tap to select
                    const selectCity = () => {
                        localStorage.setItem("activeCity", JSON.stringify(city));
                        // Clear cached prayer data so home page fetches new data
                        localStorage.removeItem("prayerData");
                        back();
                    };

                    bg.addEventListener(event.CLICK_DOWN, selectCity);
                    text.addEventListener(event.CLICK_DOWN, selectCity);
                }

                // Add button below list
                const addBtnY = CITY_START_Y + this.state.cities.length * CITY_ROW_HEIGHT + CITY_ROW_HEIGHT / 4;
                createWidget(widget.BUTTON, {
                    ...ADD_BTN_STYLE,
                    y: addBtnY,
                    click_func: () => {
                        push({ url: "page/gt/search/index.page" });
                    },
                });

                // Bottom spacer
                createWidget(widget.FILL_RECT, {
                    x: 0,
                    y: addBtnY + ADD_BTN_STYLE.h,
                    w: 1,
                    h: BOTTOM_PADDING,
                    color: 0x000000,
                    alpha: 0,
                });
            }
        },

        loadCities() {
            try {
                const stored = localStorage.getItem("cities");
                if (stored) {
                    this.state.cities = JSON.parse(stored);
                }
            } catch (e) {
                logger.error("Error loading cities: " + e.message);
            }

            try {
                const active = localStorage.getItem("activeCity");
                if (active) {
                    this.state.activeCity = JSON.parse(active);
                }
            } catch (e) {
                logger.error("Error loading active city: " + e.message);
            }
        },

        onDestroy() {
            logger.debug("cityList page onDestroy");
        },
    })
);
