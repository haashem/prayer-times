# Layout Architecture Guide

> How layout files are structured in this Zepp OS project.

---

## File Naming Convention

Each page has 3 files:

```
page/gt/<pageName>/
  index.page.js          ← Page logic (shared across devices)
  index.page.r.layout.js ← Round screen layout (480×480)
  index.page.s.layout.js ← Square screen layout (390×390)
```

The `.r.` and `.s.` layout files are resolved at build time via:
```js
import { ... } from "zosLoader:./index.page.[pf].layout.js";
```

---

## Layout File Structure

Every layout file should follow this pattern:

```js
import { align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

// 1. Constants (padding, dimensions)
const SIDE_PADDING = px(60);  // Round: 60, Square: 16–24
const CONTENT_WIDTH = DEVICE_WIDTH - SIDE_PADDING * 2;

// 2. Color palette
export const COLORS = { ... };

// 3. Layout metrics (exported for use in page JS)
export const ROW_HEIGHT = px(64);
export const ROW_GAP = px(8);     // 8px gap per design guidelines
export const START_Y = px(150);
export const BOTTOM_PADDING = px(80);

// 4. Static styles (exported as objects)
export const TITLE_STYLE = { ... };

// 5. Dynamic styles (exported as functions)
export function getRowBgStyle(y, isActive) {
  return { ... };
}
```

---

## What to Export vs Keep Private

### Export (used by page JS):
- `DEVICE_WIDTH`, `DEVICE_HEIGHT`
- `COLORS`
- Row metrics: `ROW_HEIGHT`, `START_Y`, `BOTTOM_PADDING`
- Static widget styles: `TITLE_STYLE`, `SEPARATOR_STYLE`, etc.
- Dynamic style functions: `getPrayerRowBgStyle(y, isActive)`

### Keep Private:
- `SIDE_PADDING`, `CONTENT_WIDTH` — only used within layout calculations
- `ROW_GAP` — consumed internally by style functions (bg height = ROW_HEIGHT - ROW_GAP)

---

## Vertical Centering Pattern

When a text widget needs to be vertically centered inside a row:

```js
// ❌ WRONG — text box is shorter than row, text floats to top
export function getTextStyle(y) {
  return {
    y: y,              // Same start as row
    h: px(40),         // But shorter height!
    align_v: align.CENTER_V,  // Centers within 40px, not within 64px row
  };
}

// ✅ CORRECT — text box matches row exactly
export function getTextStyle(y) {
  return {
    y: y - px(4),      // Same origin as background
    h: ROW_HEIGHT,     // Same height as background
    align_v: align.CENTER_V,  // Centers within full row
  };
}
```

**Rule**: Text `y` and `h` must match the background's `y` and `h` for `align_v: CENTER_V` to work correctly.

---

## Round vs Square Differences

| Property          | Round (`.r.`)    | Square (`.s.`)                    |
| ----------------- | ---------------- | --------------------------------- |
| `SIDE_PADDING`    | `px(60)`         | `px(16)`–`px(24)`                 |
| Title alignment   | `CENTER_H`       | `CENTER_H`                        |
| Content alignment | `CENTER_H`       | `LEFT`                            |
| `BOTTOM_PADDING`  | `px(80)`         | `px(40)`                          |
| Button radius     | Capsule (`h/2`)  | Capsule (`h/2`)                   |
| Font sizes        | Larger (Body=32) | Slightly smaller (Subheadline=28) |

---

## Pages in This Project

| Page      | Path                | Purpose                       |
| --------- | ------------------- | ----------------------------- |
| Home      | `page/gt/home/`     | Prayer times display          |
| Search    | `page/gt/search/`   | City search with A-Z keyboard |
| City List | `page/gt/cityList/` | Manage saved cities           |
