import { notify } from "@zos/notification";
import {
    getPrayerNotificationPayloadDisplay,
    isPrayerNotificationCurrent,
    scheduleNextPrayerNotification,
} from "../utils/prayer-notifications";

function parsePayload(params) {
    try {
        return typeof params === "string" ? JSON.parse(params) : params;
    } catch (e) {
        return null;
    }
}

AppService({
    onInit(params) {
        const payload = parsePayload(params);
        if (!payload || payload.prayerKey === "Fajr" ||
            !isPrayerNotificationCurrent(payload.prayerKey, payload.context)) {
            return;
        }

        const display = getPrayerNotificationPayloadDisplay(payload);
        notify({
            title: display.title,
            content: display.content,
            actions: [],
        });

        scheduleNextPrayerNotification(payload.prayerKey, payload.context, new Date());
    },
});
