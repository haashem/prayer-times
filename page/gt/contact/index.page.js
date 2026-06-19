import { createWidget, widget, prop, setStatusBarVisible } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { BasePage } from "@zeppos/zml/base-page";
import { t } from "../../../utils/i18n";
import {
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
    TITLE_STYLE,
    QR_STYLE,
    EMAIL_STYLE,
    CONTENT_HEIGHT,
    BOTTOM_PADDING,
} from "zosLoader:./index.page.[pf].layout.js";

const CONTACT_EMAIL_QR_CONTENT = "mailto:hashemp206@yahoo.com?subject=Prayer%20Times%20App";
const CONTACT_EMAIL = "hashemp206@yahoo.com";

Page(
    BasePage({
        build() {
            setPageBrightTime({ brightTime: 30000 });

            const { screenShape } = getDeviceInfo();
            if (screenShape === SCREEN_SHAPE_SQUARE) {
                setStatusBarVisible(false);
            }

            const pageBg = createWidget(widget.FILL_RECT, {
                x: 0,
                y: 0,
                w: DEVICE_WIDTH,
                h: DEVICE_HEIGHT,
                color: 0x000000,
            });
            createWidget(widget.PAGE_SCROLLBAR);
            createWidget(widget.TEXT, {
                ...TITLE_STYLE,
                text: t("contactUs"),
            });
            createWidget(widget.QRCODE, {
                ...QR_STYLE,
                content: CONTACT_EMAIL_QR_CONTENT,
            });
            createWidget(widget.TEXT, {
                ...EMAIL_STYLE,
                text: CONTACT_EMAIL,
            });
            createWidget(widget.FILL_RECT, {
                x: 0,
                y: CONTENT_HEIGHT,
                w: 1,
                h: BOTTOM_PADDING,
                color: 0x000000,
                alpha: 0,
            });
            pageBg.setProperty(prop.MORE, {
                x: 0,
                y: 0,
                w: DEVICE_WIDTH,
                h: CONTENT_HEIGHT + BOTTOM_PADDING,
                color: 0x000000,
            });
        },
    })
);
