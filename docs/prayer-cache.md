# Prayer Time Cache

## Goal

The app should keep working offline until the end of the cached month, while keeping watch-side startup and widget resume fast.

The slow path to avoid is storing a full API-shaped monthly JSON array and then parsing/searching it on every app or widget load.

## Storage Model

The monthly prayer cache is stored under an unversioned local storage key:

```js
prayerMonth
```

There are no cache versions or legacy readers. Previous storage entries are ignored, so users fetch fresh dates after this update. A separate `prayerToday` snapshot speeds up home-page loading.

The value is a compact monthly cache:

```js
{
  year: "2026",
  month: "06",
  days: 30,
  records: "...",
  nextMonthFirst: "...",
  hijriBefore: "...",
  hijriAfter: "..."
}
```

`records` is a fixed-width string. Each day uses one 32-character record:

```text
Fajr Sunrise Dhuhr Asr Maghrib Isha HijriDay HijriMonth HijriYear
HHMM HHMM    HHMM  HHMM HHMM    HHMM  DD       MM         YYYY
```

Example conceptual record:

```text
04120503131217442116224503121447
```

This means:

- Fajr: `04:12`
- Sunrise: `05:03`
- Dhuhr: `13:12`
- Asr: `17:44`
- Maghrib: `21:16`
- Isha: `22:45`
- Hijri day: `03`
- Hijri month: `12`
- Hijri year: `1447`

## Lookup

The watch does not search the month.

For today:

```js
offset = (day - 1) * RECORD_SIZE
record = records.slice(offset, offset + RECORD_SIZE)
```

For tomorrow:

- If today is not the last cached day, use `day * RECORD_SIZE`.
- If today is the last cached day, decode `nextMonthFirst`.

This keeps the widget load path cheap: one `localStorage.getItem`, one `JSON.parse` of a small object, and one or two string slices.

## Writer Flow

The phone-side service makes one AlAdhan `calendar/from/{start}/to/{end}` request for the current month plus two days on either side. It verifies that the entire date range is present and consecutive, strips each API day to the fields needed by the UI, and packs the current month with `createPrayerMonthCache`.

The four boundary Hijri dates are retained in `hijriBefore` and `hijriAfter`. The first day of the next month also retains its prayer times in `nextMonthFirst` for the offline next-prayer calculation. No separate daily or adjacent-month requests are made. Incomplete or invalid responses return an error without writing a new cache.

## Reader Flow

The home page and widgets call:

```js
getPrayerWindow(cache, new Time())
```

The helper returns:

```js
{
  today,
  tomorrow
}
```

The decoded objects use the UI render shape:

```js
{
  timings: {
    Fajr: "04:12",
    Sunrise: "05:03",
    Dhuhr: "13:12",
    Asr: "17:44",
    Maghrib: "21:16",
    Isha: "22:45"
  },
  date: {
    gregorian: { date: "09-06-2026" },
    hijri: {
      day: "03",
      month: { number: 12, en: "Dhu al-Hijjah" },
      year: "1447"
    }
  }
}
```

Keeping this shape means the UI rendering code does not need to know about the compact storage format.

## Why Not One Key Per Day

Splitting the month into 30 or 31 storage entries creates too many watch-side writes and storage operations. On Zepp OS that can be expensive enough to crash or stall the app.

One compact monthly key keeps writes simple and makes reads direct.

## Important Files

- `utils/prayer-cache.js`: cache packing and decoding.
- `app-side/index.js`: fetches and writes the compact cache payload.
- `page/gt/home/index.page.js`: reads today from the compact cache.
- `app-widget/gt/index.js`: reads today/tomorrow for the card widget.
- `secondary-widget/gt/index.js`: reads today/tomorrow for the secondary widget.
