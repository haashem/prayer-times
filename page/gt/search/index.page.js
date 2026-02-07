import { createWidget, widget, prop, event } from "@zos/ui";
import { back } from "@zos/router";
import { localStorage } from "@zos/storage";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import {
    DEVICE_WIDTH,
    TITLE_STYLE,
    INPUT_BG_STYLE,
    INPUT_TEXT_STYLE,
    KEYBOARD_ROWS,
    KEYBOARD_START_X,
    KEYBOARD_START_Y,
    KEY_SIZE,
    KEY_GAP,
    KEY_COLS,
    getKeyStyle,
    getKeyTextStyle,
    BACKSPACE_STYLE,
    CLEAR_STYLE,
    SPACE_STYLE,
    SEARCH_BTN_STYLE,
    STATUS_STYLE,
    COLORS,
    BOTTOM_PADDING,
    RESULT_ROW_HEIGHT,
    RESULT_START_Y,
    getResultRowBgStyle,
    getResultTextStyle,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("search-page");

Page(
    BasePage({
        state: {
            inputText: "",
            inputWidget: null,
            statusWidget: null,
            searching: false,
        },

        build() {
            logger.debug("search page build");

            // Scroll indicator
            createWidget(widget.PAGE_SCROLLBAR);

            // Title
            createWidget(widget.TEXT, TITLE_STYLE);

            // Input background
            createWidget(widget.FILL_RECT, INPUT_BG_STYLE);

            // Input text display
            this.state.inputWidget = createWidget(widget.TEXT, {
                ...INPUT_TEXT_STYLE,
                text: "|",
            });

            // Build letter keyboard grid
            this.buildKeyboard();

            // Action buttons
            this.buildActionButtons();

            // Search button
            createWidget(widget.BUTTON, {
                ...SEARCH_BTN_STYLE,
                click_func: () => {
                    this.searchCity();
                },
            });

            // Status text
            this.state.statusWidget = createWidget(widget.TEXT, STATUS_STYLE);

            // Bottom spacer
            createWidget(widget.FILL_RECT, {
                x: 0,
                y: STATUS_STYLE.y + STATUS_STYLE.h,
                w: 1,
                h: BOTTOM_PADDING,
                color: 0x000000,
                alpha: 0,
            });
        },

        buildKeyboard() {
            // QWERTY layout — each row is centered independently
            const fullRowWidth = KEY_COLS * KEY_SIZE + (KEY_COLS - 1) * KEY_GAP;

            for (let r = 0; r < KEYBOARD_ROWS.length; r++) {
                const row = KEYBOARD_ROWS[r];
                const rowWidth = row.length * KEY_SIZE + (row.length - 1) * KEY_GAP;
                // Center this row relative to the full keyboard width
                const rowOffsetX = KEYBOARD_START_X + (fullRowWidth - rowWidth) / 2;
                const rowY = KEYBOARD_START_Y + r * (KEY_SIZE + KEY_GAP);

                for (let c = 0; c < row.length; c++) {
                    const letter = row[c];
                    const x = rowOffsetX + c * (KEY_SIZE + KEY_GAP);

                    const keyBg = createWidget(widget.FILL_RECT, getKeyStyle(x, rowY));
                    const keyText = createWidget(widget.TEXT, {
                        ...getKeyTextStyle(x, rowY),
                        text: letter,
                    });

                    keyText.addEventListener(event.CLICK_DOWN, () => {
                        this.appendLetter(letter);
                    });
                    keyBg.addEventListener(event.CLICK_DOWN, () => {
                        this.appendLetter(letter);
                    });
                }
            }
        },

        buildActionButtons() {
            // Backspace
            createWidget(widget.BUTTON, {
                ...BACKSPACE_STYLE,
                click_func: () => {
                    this.backspace();
                },
            });

            // Clear
            createWidget(widget.BUTTON, {
                ...CLEAR_STYLE,
                click_func: () => {
                    this.clearInput();
                },
            });

            // Space
            createWidget(widget.BUTTON, {
                ...SPACE_STYLE,
                click_func: () => {
                    this.appendLetter(" ");
                },
            });
        },

        appendLetter(letter) {
            this.state.inputText += letter;
            this.updateInputDisplay();
        },

        backspace() {
            if (this.state.inputText.length > 0) {
                this.state.inputText = this.state.inputText.slice(0, -1);
                this.updateInputDisplay();
            }
        },

        clearInput() {
            this.state.inputText = "";
            this.updateInputDisplay();
        },

        updateInputDisplay() {
            const display = this.state.inputText.length > 0
                ? this.state.inputText + "|"
                : "|";
            this.state.inputWidget.setProperty(prop.TEXT, display);
        },

        setStatus(text, color) {
            this.state.statusWidget.setProperty(prop.MORE, {
                text: text,
                color: color || COLORS.statusText,
            });
        },

        searchCity() {
            const query = this.state.inputText.trim();
            if (query.length < 2) {
                this.setStatus("Enter at least 2 letters", COLORS.errorText);
                return;
            }

            if (this.state.searching) return;
            this.state.searching = true;
            this.setStatus("Searching...", COLORS.statusText);

            this.request({
                method: "SEARCH_CITY",
                params: { query },
            })
                .then((data) => {
                    this.state.searching = false;
                    logger.debug("Search result: " + JSON.stringify(data));

                    if (data && data.result && data.result.valid && data.result.cities) {
                        const cities = data.result.cities;
                        this.setStatus("Select a city:", COLORS.successText);
                        this.showResults(cities);
                    } else {
                        this.setStatus(
                            "City not found. Try again.",
                            COLORS.errorText
                        );
                    }
                })
                .catch((err) => {
                    this.state.searching = false;
                    logger.error("Search error: " + JSON.stringify(err));
                    this.setStatus("Search failed. Check\nphone connection.", COLORS.errorText);
                });
        },

        showResults(cities) {
            for (let i = 0; i < cities.length; i++) {
                const city = cities[i];
                const rowY = RESULT_START_Y + i * RESULT_ROW_HEIGHT;
                const label = city.name + ", " + city.country;

                const bg = createWidget(widget.FILL_RECT, getResultRowBgStyle(rowY, i));
                const text = createWidget(widget.TEXT, {
                    ...getResultTextStyle(rowY),
                    text: label,
                });

                const selectCity = () => {
                    this.addCity(city);
                };

                bg.addEventListener(event.CLICK_DOWN, selectCity);
                text.addEventListener(event.CLICK_DOWN, selectCity);
            }

            // Bottom spacer
            const spacerY = RESULT_START_Y + cities.length * RESULT_ROW_HEIGHT;
            createWidget(widget.FILL_RECT, {
                x: 0,
                y: spacerY,
                w: 1,
                h: BOTTOM_PADDING,
                color: 0x000000,
                alpha: 0,
            });
        },

        addCity(city) {
            const cityObj = {
                city: city.name,
                country: city.country || "",
                method: 3,
                latitude: city.latitude,
                longitude: city.longitude,
            };

            // Load existing cities
            let cities = [];
            try {
                const stored = localStorage.getItem("cities");
                if (stored) cities = JSON.parse(stored);
            } catch (e) { }

            // Avoid duplicates
            const exists = cities.some(
                (c) => c.city.toLowerCase() === cityObj.city.toLowerCase()
                    && c.country === cityObj.country
            );

            if (!exists) {
                cities.push(cityObj);
                localStorage.setItem("cities", JSON.stringify(cities));
            }

            // Set as active city & clear cached data
            localStorage.setItem("activeCity", JSON.stringify(cityObj));
            localStorage.removeItem("prayerData");

            this.setStatus("✓ " + cityObj.city + " added!", COLORS.successText);

            setTimeout(() => {
                back();
            }, 800);
        },

        onDestroy() {
            logger.debug("search page onDestroy");
        },
    })
);
