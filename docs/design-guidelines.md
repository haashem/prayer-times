# Zepp OS Design Guidelines

> Reference for building UI layouts on Zepp OS watch apps.
> Source: https://docs.zepp.com/docs/designs/

---

## Device Targets

| Target        | Resolution   | Shape       |
| ------------- | ------------ | ----------- |
| `gt` (round)  | 480 × 480 px | Circular    |
| `gt` (square) | 390 × 390 px | Rectangular |

---

## Typography

### Font Size Scale (480 × 480 round device)

| Style       | Size | Line Height (×1.25) | Usage                              |
| ----------- | ---- | ------------------- | ---------------------------------- |
| LargeTitle  | 48px | 60px                | Hero text, large numbers           |
| Title1      | 40px | 50px                | Primary headings                   |
| Title       | 36px | 45px                | Page titles, city names            |
| Body        | 32px | 40px                | Prayer names/times, main content   |
| Subheadline | 28px | 35px                | Secondary headings, dates          |
| Caption1    | 24px | 30px                | Labels, status text, keyboard keys |

### Rules

- **Line height** = `font_size × 1.25` (used as widget `h` value)
- **Title Case** for main titles (e.g., "My Cities", "Search City")
- **Sentence case** for labels and status messages
- Font sizes should not change based on state (e.g., don't enlarge active prayer text — use color instead)

---

## Colors

### System Color Palette

| Role              | Hex        | Description                      |
| ----------------- | ---------- | -------------------------------- |
| Background        | `0x000000` | Always pure black                |
| Primary accent    | `0x4fc3f7` | Light blue — titles, city name   |
| Secondary text    | `0x999999` | Dimmed info (hijri date, status) |
| Default text      | `0xcccccc` | Prayer names, times              |
| Separator         | `0x333333` | Subtle divider lines             |
| Active background | `0x1b5e20` | Dark green highlight             |
| Active text       | `0x66bb6a` | Green for active/success         |
| Active time       | `0xffffff` | White text on active row         |
| Error             | `0xff5252` | Red for errors, no-data          |
| Card/input bg     | `0x1a1a2e` | Dark card surface                |
| Key bg            | `0x2a2a3e` | Keyboard key surface             |

### Rules

- **Contrast ratio ≥ 3:1** between foreground text and background
- **Avoid RGB values 1–46** (too low grayscale, invisible on OLED)
- `0x888888` on black = 2.9:1 ❌ — use `0x999999` (3.5:1) ✅
- Differentiate states with **color**, not font size changes

### Pressed / Active States

- **Pressed state** = reduce brightness by **~28.6%**
- Calculate: multiply each RGB channel by `0.714`

| Normal     | Pressed    | Context           |
| ---------- | ---------- | ----------------- |
| `0x1b5e20` | `0x134215` | Green button      |
| `0x5e1b1b` | `0x431313` | Red/delete button |
| `0x2a2a3e` | `0x1e1e2d` | Key/space button  |

---

## Layout & Alignment

### Round Screen (480 × 480)

- **Side padding**: `px(60)` — keeps content within circular safe area
- **Content width**: `DEVICE_WIDTH - SIDE_PADDING * 2` = 360px
- **Titles**: center-aligned (`align_h: align.CENTER_H`)
- **Content**: center-aligned (both text and list items)
- Content near top/bottom edges is clipped by the circular mask

### Square Screen (390 × 390)

- **Side padding**: `px(16)` to `px(24)`
- **Titles**: center-aligned
- **Content**: left-aligned (`align_h: align.LEFT`)

---

## List Items

### Spacing

- **8px gap** between list items
- Achieved by: `ROW_HEIGHT` includes the gap; background `h = ROW_HEIGHT - ROW_GAP`
- Export both constants: `CITY_ROW_HEIGHT = px(64)` and `CITY_ROW_GAP = px(8)`

### Row Sizing (Round)

| Element       | Row Height | Gap | Bg Height                        |
| ------------- | ---------- | --- | -------------------------------- |
| Prayer row    | 64px       | 8px | 64px (full, bg extends slightly) |
| City row      | 64px       | 8px | 56px                             |
| Search result | 56px       | 8px | 48px                             |

### Vertical Centering

- Text widget `y` and `h` **must match** the background widget's `y` and `h`
- Use `align_v: align.CENTER_V` on the text widget
- If background has `y: rowY - px(4)`, text must also use `y: rowY - px(4)`
- Never set text `h` to line-height when it needs to center within a taller row

---

## Buttons

### Capsule Buttons

- `radius = height / 2` for pill/capsule shape
- Common heights: `px(44)` to `px(52)`
- Keep text concise (e.g., "Search" not "🔍 Search & Add City")

### Button Sizing (Round)

| Button           | Width           | Height | Radius |
| ---------------- | --------------- | ------ | ------ |
| Primary (Search) | `CONTENT_WIDTH` | 52px   | 26px   |
| Add City         | `CONTENT_WIDTH` | 52px   | 26px   |
| Action (DEL/CLR) | 80–100px        | 44px   | 8px    |

---

## Icons

| Category    | Size | Notes      |
| ----------- | ---- | ---------- |
| Regular     | 64px | Main icons |
| Medium      | 52px | Secondary  |
| Small       | 40px | Inline     |
| Ultra-small | 32px | Minimal    |

- Include **2px transparent safe area** around icon edges

---

## Scrollable Pages

- Use invisible spacer widgets at the bottom to ensure content scrolls past the circular mask:
  ```js
  createWidget(widget.FILL_RECT, {
    x: 0, y: lastY, w: 1, h: BOTTOM_PADDING,
    color: 0x000000, alpha: 0,
  });
  ```
- `BOTTOM_PADDING`: `px(80)` round, `px(40)` square

---

## Pop-up Windows

- Maintain safe distance on both sides
- Center-aligned on round devices
- Avoid covering critical UI elements
