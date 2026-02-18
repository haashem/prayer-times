import { createWidget, widget, align } from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import {
    getParaStyle,
    PARA_HEIGHT,
    PARA_GAP,
    PARA_START_Y,
    TITLE_FONT_SIZE,
    TITLE_HEIGHT,
    BOTTOM_PADDING,
} from "zosLoader:./index.page.[pf].layout.js";

Page(
    BasePage({
        build() {
            createWidget(widget.PAGE_SCROLLBAR);

            // Title
            createWidget(widget.TEXT, {
                ...getParaStyle(PARA_START_Y),
                text: "Prayer Times",
                text_size: TITLE_FONT_SIZE,
                color: 0xffffff,
                h: TITLE_HEIGHT,
                align_h: align.CENTER_H,
            });

            let y = PARA_START_Y + TITLE_HEIGHT + PARA_GAP;
            createWidget(widget.TEXT, {
                ...getParaStyle(y),
                h: PARA_HEIGHT,
                text:
                    "This app detects your location and fetches accurate local prayer times.\n\n" +
                    "For the best results:\n" +
                    "• Connect to Wi-Fi\n" +
                    "• Disconnect from VPN\n" +
                    "• Turn off iCloud Private\n" +
                    "  Relay",
            });
            y += PARA_HEIGHT + PARA_GAP;

            // Bottom spacer
            createWidget(widget.FILL_RECT, {
                x: 0,
                y: y,
                w: 1,
                h: BOTTOM_PADDING,
                color: 0x000000,
                alpha: 0,
            });
        },
    })
);
