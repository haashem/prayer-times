# Adhkar reminders

Open Settings → Adhkar. Reminders are off initially. Enabling selects all six
phrases if none are selected. The Collection section is directly below the reminder settings on the Adhkar
page. Each Arabic phrase and its translated meaning has an inline checkbox for
inclusion in the reminder sequence; there are no collection or phrase subpages.
Disabling the final phrase turns reminders off and explains why.

Schedules are every 30, 60 or 120 minutes, or three editable daily times
(default 09:00, 14:00, 20:00). The daily active window defaults to 08:00–22:00,
including both endpoints. Intervals are anchored at the window start and restart
each day. Start must precede end; overnight windows are intentionally unsupported.
Daily times must be distinct and inside the window when using the daily mode.
The three daily time rows appear only in daily mode. Switching back preserves
the saved times; if an interval-mode window change excluded them, three evenly
spaced times inside the new window are restored.

Time selection uses Zepp's API 3.0 `WIDGET_PICKER`, with hours 00–23 and minutes
00, 15, 30, 45. Wheel selections update a draft only. The visible tick validates
and saves the complete draft, then returns, including when neither wheel changed.
Hardware Back and right-swipe Back cancel without saving. Start time, End time and each daily time row push the dedicated
`page/gt/adhkar-time-picker/index.page` route with the selected setting ID.
Tick saves and pops that page; hardware Back or a right-swipe pops without saving.
The adhkar list reloads saved values and restores focus/scroll to the selected row.
Selection callbacks are not treated as completion events.
Invalid choices leave the picker open and the existing setting/alarm unchanged.
Older individual-minute values are rounded to the nearest quarter hour, with
collisions repaired so preferences remain editable.

Each reminder shows Arabic and the app-language meaning and returns after 5 seconds.
It uses `VIBRATOR_SCENE_NOTIFICATION`, matching regular prayer alerts. The watch Back button dismisses it immediately; there is no onscreen dismiss button.
There are no counts or completion states. It does not inspect or suppress prayer
alerts. Reading the collection does not advance the reminder sequence.

## Watch design

Adhkar reuses the existing Settings, Prayer Alerts and Time Format layout
functions and assets. Titles use the existing white heading style. Navigation
rows have leading labels, muted secondary values and trailing chevrons; reminder
settings use the existing blue/gray switches. Schedule choices use native
`RADIO_GROUP` / `STATE_BUTTON` widgets and the app's radio images. Crown focus
uses the same top/bottom focus assets as the other settings screens. Controls,
alignment and chevrons mirror for RTL languages.

Single-line and two-line row titles share the 36px settings typography;
subtitles are 32px. The collection always shows Arabic as the primary text and
the app-language meaning as its subtitle, with a native checkbox on each row. Two-line labels and values are
separate text widgets, with reserved control space. Overflowing row titles and subtitles use native scrolling text, so the full phrase and translation can be read. The reminder presents a large Arabic phrase and muted translation using the full screen, without repetition counts or completion tracking. Its heading,
Arabic phrase and translation wrap into at most two lines; font sizes adapt using
native text measurements rather than scrolling or clipping.
Acceptance scenarios compare these visible controls with the app's existing
Settings appearance on round/square and English/Arabic screens.

## Persistence and delivery

`utils/adhkar.js` owns versioned local storage for settings, the next persistent
one-shot alarm, a schedule revision, and the next phrase. Only one adhkar alarm
is retained. No location, prayer cache, or network connection is needed.
The alert page schedules the next occurrence before displaying content. It
advances the cursor only after creating both content widgets. Removed phrases
are skipped without resetting the cursor; restarts preserve it.

Old schedule tokens, duplicate deliveries and reminders over 60 seconds late do
not display or advance the cursor. Late deliveries schedule the next future
occurrence, without a backlog. Opening/resuming Home recovers expired or failed
schedules and reconciles timezone changes. Local calendar arithmetic handles
month/year and DST transitions; nonexistent local times are skipped.

Zepp passes alarm parameters through app `onCreate`, so `app.js` retains a pending
adhkar payload for the alert page, independently of prayer payloads.

## Alert border

The alert uses the Woven Ribbon design: two thin continuous strands in the app’s
warm gold (`#D4A843`) around a pure-black center. Round and rounded-square assets
are rendered by `scripts/generate_adhkar_border.py`. The background is a static,
non-interactive image behind all text and scales to the device bounds. Prayer
alerts reuse the same asset through `utils/alert-background.js`, including Fajr
with its existing dismiss control. No change
to the five-second timeout, Back dismissal, or two-line text fitting.

## Content provenance

Arabic phrases and the English meanings were checked against:

- [Sahih Muslim 2137a](https://sunnah.com/muslim:2137a): Subhan Allah,
  Alhamdulillah, Allahu akbar, La ilaha illa Allah.
- [Sahih Muslim 2702a](https://sunnah.com/muslim:2702a): seeking forgiveness.
- [Sahih Muslim 2691](https://sunnah.com/muslim:2691): Subhan Allahi wa bihamdihi.

`utils/adhkar-content.js` retains a reference and URL per phrase. The app does
not reproduce repetition counts or reward claims from those narrations, and
the user's chosen schedule is not presented as a prescribed religious routine.
The ten language catalogs contain short authored meanings (Arabic uses an
explanation); Arabic with Latin digits uses the Arabic catalog. Independent
native-speaker and religious editorial review has not been performed.

## Validation

[The acceptance suite](../tests/adhkar.acceptance.test.mjs) exercises the real
Settings entry, screen controls, route parameters, app startup, storage, content
and alarm delivery together. It does not call adhkar scheduling functions or
replace page state. Only Zepp APIs and the unavailable phone transport are
simulated in [the watch driver](../tests/helpers/watch.mjs). Expected translations
are fixed test fixtures rather than values imported from the production catalog.

| Behaviour | Acceptance scenarios |
| --- | --- |
| Explicit opt-in and initial defaults | Navigate from Settings using touch/crown; inspect the initial window, three times and six selected phrases; enable and receive the first reminder. |
| All four schedules | Deliver the three daily reminders and each interval schedule; edit waking hours and verify delivery at the boundaries and next morning. |
| Saved settings | Choose all three daily times through the system picker, restart the runtime, and receive reminders at the saved times. |
| Selection and rotation | Toggle a subset directly in the collection, read content without advancing rotation, restart between deliveries, restore all phrases, and cycle past the final phrase. |
| Disabled reminders | Turn off the master switch or final phrase, check the explanation, reject an already queued alarm, and re-enable. |
| Reminder display | Check the exact Arabic and translated text, notification vibration, hardware Back dismissal with timer cleanup, and automatic return after 5 seconds, including from an open app. |
| Missed and outdated delivery | Deliver overdue, superseded and duplicate alarms; verify no backlog or rotation until a reminder displays. Recover failed/expired schedules by reopening Home. |
| Prayer overlap | Schedule real prayer alerts at the same time and five minutes later; verify both alerts display and future adhkar continue. |
| Picker navigation | Press the visible tick without moving wheels; select both wheels then confirm or cancel using hardware Back/right swipe; reopen and verify settings input still works; assert all five time rows push the dedicated page and pop back with their original scroll/focus position. |
| Local time and validation | Offer only quarter-hour minutes, cancel unfinished selections, reject conflicting/out-of-window choices; deliver across year/DST boundaries and skip nonexistent spring times. |
| Languages and shapes | Enable from Settings and read all six Arabic/meaning pairs in every language option on both screen shapes. |

Before release, verify on physical round and square watches:

- Arabic shaping, diacritics, font coverage and wrapping in every language.
- Notification vibration and automatic return after 5 seconds.
- Delivery after reboot, while the app is closed, and under DND/sleep modes.
- Back-to-back and simultaneous prayer/adhkar alerts. No priority policy is
  imposed by this feature; actual arbitration belongs to the watch OS.
- Clock/timezone changes while the app is closed and recovery on reopening.

Zepp API references: [persistent alarms](https://docs.zepp.com/docs/reference/device-app-api/newAPI/alarm/set/),
[page scrolling](https://docs.zepp.com/docs/reference/device-app-api/newAPI/page/setScrollMode/).
