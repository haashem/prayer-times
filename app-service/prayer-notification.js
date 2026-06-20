import { notify } from "@zos/notification";
import {
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

        notify({
            title: payload.title,
            content: payload.content,
            actions: [
                {
                    text: payload.openLabel,
                    file: "page/gt/home/index.page",
                    param: "",
                },
            ],
        });

        scheduleNextPrayerNotification(payload.prayerKey, payload.context, new Date());
    },
});
