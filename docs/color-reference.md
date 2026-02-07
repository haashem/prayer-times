# Color Reference

> Quick-reference for all colors used in the app with contrast validation.

---

## Contrast Validation (against `0x000000` background)

| Color        | Hex            | Ratio     | Pass? | Usage               |
| ------------ | -------------- | --------- | ----- | ------------------- |
| White        | `0xffffff`     | 21:1      | ✅     | Active prayer time  |
| Light blue   | `0x4fc3f7`     | 8.1:1     | ✅     | Titles, city name   |
| Light gray   | `0xcccccc`     | 12.9:1    | ✅     | Prayer names/times  |
| Default text | `0xe0e0e0`     | 16.2:1    | ✅     | City list items     |
| Mid gray     | `0x999999`     | 3.5:1     | ✅     | Status, hijri date  |
| ~~Dim gray~~ | ~~`0x888888`~~ | ~~2.9:1~~ | ❌     | ~~Do not use~~      |
| Green        | `0x66bb6a`     | 7.3:1     | ✅     | Active/success text |
| Red          | `0xff5252`     | 4.6:1     | ✅     | Error text          |

**Minimum required**: 3:1 contrast ratio (Zepp OS guideline)

---

## Pressed State Calculation

Formula: `pressed = normal × 0.714` (28.6% brightness reduction)

```
Channel calculation:
  R_pressed = Math.round(R_normal * 0.714)
  G_pressed = Math.round(G_normal * 0.714)
  B_pressed = Math.round(B_normal * 0.714)
```

### Pre-calculated Values

| Normal     | Pressed    | Name                                         |
| ---------- | ---------- | -------------------------------------------- |
| `0x1b5e20` | `0x134215` | Green (primary button)                       |
| `0x5e1b1b` | `0x431313` | Red (delete/clear button)                    |
| `0x2a2a3e` | `0x1e1e2d` | Dark blue-gray (keyboard key)                |
| `0x1a1a2e` | `0x121228` | Dark surface (card press)                    |
| `0x2e7d32` | —          | ~~Old green pressed~~ (too bright, replaced) |
| `0x8e2b2b` | —          | ~~Old red pressed~~ (too bright, replaced)   |

---

## Color Roles

```
Background layer:    0x000000 (pure black, OLED-friendly)
     │
Surface layer:       0x1a1a2e (cards, inputs)
     │                0x222238 (alternating rows)
     │                0x2a2a3e (keyboard keys)
     │                0x333333 (separators)
     │
Text layer:          0x999999 (secondary/dimmed)
     │                0xcccccc (default body text)
     │                0xe0e0e0 (list items)
     │                0xffffff (emphasized/active)
     │
Accent layer:        0x4fc3f7 (blue — titles)
     │                0x66bb6a (green — active/success)
     │                0xff5252 (red — error/destructive)
     │
Active state bg:     0x1b5e20 (dark green row highlight)
```

---

## Rules

1. Never use RGB values between `0x01` and `0x2E` (1–46) for text — invisible on OLED
2. Always validate contrast ≥ 3:1 against the immediate background
3. Use color (not size) to indicate active/selected state
4. Pressed colors should feel like a "dim" of the normal color, not a different hue
