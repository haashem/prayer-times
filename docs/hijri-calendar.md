# Hijri date offset

Settings contains **Hijri Date Adjustment** immediately before Language, with an offset from −2 to +2 days and a preview. There is no calendar selector. The app continues to use AlAdhan's existing `HJCoSA` calendar; the deprecated mathematical calendar is not offered or requested.

Offsets select another day's Hijri date from the API's cached calendar sequence. They never add or subtract directly from the Hijri day number:

- At the end of a 29-day month, +1 selects day 1 of the next month.
- At the end of a 30-day month, +1 also selects day 1 of the next month.
- On day 1, −1 selects the last actual day (29 or 30) of the previous month.
- Hijri year changes follow the same stored date sequence.

For example, the saved API response for September 2026 goes from 29 Rabi al-awwal on September 11 to 1 Rabi al-thani on September 12. Applying +1 to the former displays the latter; no 30 Rabi al-awwal is invented. This also means an offset cannot reproduce a local calendar date that the API's calendar omits.

The preference persists across restarts and locations. Settings and the app widget use one shared formatter. Only the displayed Hijri date changes: prayer times and their raw cache records are never shifted.

## Cache and offline behavior

The cache uses unversioned `prayerMonth` and `prayerToday` storage keys. Prayer records are 32 characters long. The `hijriBefore` and `hijriAfter` strings each hold two adjacent Gregorian days as `DDMMYYYY` Hijri records (16 characters per side). This supports offsets across Gregorian month boundaries offline. The phone makes one `calendar/from/{start}/to/{end}` request covering the current Gregorian month plus two days on either side. For September 2026, the inclusive range is August 30 through October 2 (34 days). The response is checked for a complete, consecutive date range before packing. Only current-month prayer records, the four boundary Hijri dates, and next month's first prayer day are retained. There are no separate boundary requests.


Old cache entries are ignored; users must fetch fresh dates. There is no version metadata, migration, or legacy fallback. If the cached date needed by an offset is unavailable, the date shows a localized unavailable message instead of a guessed date. Returning to the home page does not retry that request. The missing dates remain unavailable until a normal fetch occurs, such as when the current monthly cache expires. Choosing No change displays the original date.

## Verification

`npm test` checks saved API dates, all five offsets, 29/30-day month and year boundaries, persistence, localization, required refetching after the update, date-range request failures, leap years, and mocked round/square watch controls. `zeus build` compiles both layouts. Visual rendering and physical touch/crown behavior require a watch or simulator smoke test.
