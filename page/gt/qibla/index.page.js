import { createWidget } from "@zos/ui";
import { setPageBrightTime } from "@zos/display";
import { localStorage } from "@zos/storage";
import { createQiblaCompass } from "../home/qibla";

Page({
    build() {
        setPageBrightTime({ brightTime: 60000 });
        let location = null;
        try {
            const stored = localStorage.getItem("location");
            if (stored) location = JSON.parse(stored);
        } catch (_) {}
        this.compass = createQiblaCompass({ createWidget });
        this.compass.build(location);
        if (location) this.compass.startCompass();
    },
    onDestroy() {
        if (this.compass) this.compass.destroy();
    },
});
