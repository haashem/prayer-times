import { createWidget, widget, event, prop } from "@zos/ui";
import { push, back, replace } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
    TITLE_STYLE,
    ADD_BTN_STYLE,
    CITY_ROW_HEIGHT,
    CITY_ROW_GAP,
    CITY_START_Y,
    BOTTOM_PADDING,
    EMPTY_STYLE,
    COLORS,
    DELETE_BTN_WIDTH,
    getCityRowBgStyle,
    getCityTextStyle,
    getDeleteBtnBgStyle,
    getDeleteBtnTextStyle,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("cityList-page");
const SWIPE_THRESHOLD = 40; // px needed to trigger swipe

Page(
    BasePage({
        state: {
            cities: [],
            activeCity: null,
            swipedIndex: -1,  // Which row is currently showing delete
            rows: [],         // Widget references per row
        },

        onInit() {
            logger.debug("cityList page onInit");
        },

        build() {
            logger.debug("cityList page build");

            // Scroll indicator
            createWidget(widget.PAGE_SCROLLBAR);

            this.loadCities();

            // Title
            createWidget(widget.TEXT, TITLE_STYLE);

            if (this.state.cities.length === 0) {
                createWidget(widget.TEXT, EMPTY_STYLE);
                createWidget(widget.BUTTON, {
                    ...ADD_BTN_STYLE,
                    y: EMPTY_STYLE.y + EMPTY_STYLE.h + CITY_ROW_HEIGHT / 2,
                    click_func: () => {
                        push({ url: "page/gt/search/index.page" });
                    },
                });
            } else {
                this.buildCityList();
            }
        },

        buildCityList() {
            for (let i = 0; i < this.state.cities.length; i++) {
                const city = this.state.cities[i];
                const isActive =
                    this.state.activeCity &&
                    this.state.activeCity.city.toLowerCase() === city.city.toLowerCase();
                const rowY = CITY_START_Y + i * CITY_ROW_HEIGHT;

                // Delete button (behind the row, hidden off-screen right)
                const delBg = createWidget(widget.FILL_RECT, getDeleteBtnBgStyle(rowY));
                const delText = createWidget(widget.TEXT, getDeleteBtnTextStyle(rowY));

                // City row (on top)
                const bgStyle = getCityRowBgStyle(rowY, isActive);
                const bg = createWidget(widget.FILL_RECT, bgStyle);

                const textStyle = {
                    ...getCityTextStyle(rowY, isActive),
                    text: city.city + (isActive ? " ✓" : ""),
                };
                const text = createWidget(widget.TEXT, textStyle);

                // Store row widget refs and original positions
                this.state.rows.push({
                    bg, text, delBg, delText,
                    origBgX: bgStyle.x,
                    origBgW: bgStyle.w,
                    origTextX: textStyle.x,
                    origTextW: textStyle.w,
                    delBgX: bgStyle.x + bgStyle.w - DELETE_BTN_WIDTH, // Where delete btn sits when revealed
                });

                // Swipe detection
                let startX = 0;
                let swiped = false;

                const onDown = (e) => {
                    startX = e.x;
                    swiped = false;
                };

                const onMove = (e) => {
                    const delta = e.x - startX;
                    if (delta < -SWIPE_THRESHOLD) {
                        swiped = true;
                    }
                };

                const onUp = () => {
                    if (swiped) {
                        // Close any other open row first
                        if (this.state.swipedIndex !== -1 && this.state.swipedIndex !== i) {
                            this.closeRow(this.state.swipedIndex);
                        }
                        this.openRow(i);
                    } else {
                        // Normal tap
                        if (this.state.swipedIndex !== -1) {
                            // Close any open row
                            this.closeRow(this.state.swipedIndex);
                        } else {
                            // Select city
                            localStorage.setItem("activeCity", JSON.stringify(city));
                            localStorage.removeItem("prayerData");
                            back();
                        }
                    }
                };

                bg.addEventListener(event.CLICK_DOWN, onDown);
                bg.addEventListener(event.MOVE, onMove);
                bg.addEventListener(event.CLICK_UP, onUp);
                text.addEventListener(event.CLICK_DOWN, onDown);
                text.addEventListener(event.MOVE, onMove);
                text.addEventListener(event.CLICK_UP, onUp);

                // Delete button tap
                const onDelete = () => {
                    this.deleteCity(i);
                };
                delBg.addEventListener(event.CLICK_DOWN, onDelete);
                delText.addEventListener(event.CLICK_DOWN, onDelete);
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
        },

        openRow(index) {
            const row = this.state.rows[index];
            if (!row) return;
            this.state.swipedIndex = index;

            // Slide row content left to reveal delete button
            const shift = DELETE_BTN_WIDTH;
            row.bg.setProperty(prop.MORE, {
                x: row.origBgX - shift,
                w: row.origBgW,
            });
            row.text.setProperty(prop.MORE, {
                x: row.origTextX - shift,
                w: row.origTextW,
            });

            // Move delete button into visible area
            row.delBg.setProperty(prop.MORE, { x: row.delBgX });
            row.delText.setProperty(prop.MORE, { x: row.delBgX });
        },

        closeRow(index) {
            const row = this.state.rows[index];
            if (!row) return;
            this.state.swipedIndex = -1;

            // Restore row to original position
            row.bg.setProperty(prop.MORE, {
                x: row.origBgX,
                w: row.origBgW,
            });
            row.text.setProperty(prop.MORE, {
                x: row.origTextX,
                w: row.origTextW,
            });

            // Hide delete button off-screen
            const bgStyle = getDeleteBtnBgStyle(0);
            row.delBg.setProperty(prop.MORE, { x: bgStyle.x });
            row.delText.setProperty(prop.MORE, { x: bgStyle.x });
        },

        deleteCity(index) {
            const city = this.state.cities[index];
            logger.debug("Deleting city: " + city.city);

            // Remove from array
            this.state.cities.splice(index, 1);
            localStorage.setItem("cities", JSON.stringify(this.state.cities));

            // If deleted city was active, pick another or clear
            if (
                this.state.activeCity &&
                this.state.activeCity.city.toLowerCase() === city.city.toLowerCase()
            ) {
                if (this.state.cities.length > 0) {
                    localStorage.setItem("activeCity", JSON.stringify(this.state.cities[0]));
                } else {
                    localStorage.removeItem("activeCity");
                }
                localStorage.removeItem("prayerData");
            }

            // Re-render by navigating to self
            replace({ url: "page/gt/cityList/index.page" });
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
