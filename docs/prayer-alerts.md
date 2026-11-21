# Prayer alert vibration

Settings → Prayer Alerts → Vibration offers three saved choices:

- **Notification:** existing notification vibration for regular prayers and the existing continuous Fajr alarm, with its five-minute limit.
- **Strong:** the strong-reminder vibration preset.
- **Continuous:** vibration repeats until the user dismisses the alert. There is no automatic vibration timeout for this choice.

The selected option applies only to Dhuhr, Asr, Maghrib, and Isha. Fajr always retains its existing continuous vibration, alarm sound, dismiss control, and five-minute limit. Regular default/strong alerts still close after ten seconds. Continuous alerts show the same dismiss control as Fajr; hardware Back also dismisses them. Dismissal or leaving the page stops vibration and sound and clears pending timers.

The choice persists across restarts and takes effect when the next alert opens. It does not change prayer enablement, prayer times, schedules, or Adhkar vibration.

Native radio controls, touch/crown selection, translations, and RTL layouts follow the existing settings screens. Acceptance tests drive the real Settings pages and scheduled prayer alerts on both shapes, checking defaults, persistence, selected system modes, timeout behavior, and both dismissal paths. Motor intensity and pulse timing require physical-watch verification.

System patterns: https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Vibrator/

Selecting any choice previews its vibration immediately, including reselecting the current choice. Preview stops after three seconds, when another choice is selected, or when leaving the page. Opening the picker does not start a preview.

Strong uses `VIBRATOR_SCENE_STRONG_REMINDER` and Continuous uses `VIBRATOR_SCENE_TIMER`, in both previews and regular prayer alerts. Fajr continues to use its original timer preset.
