# Scratch Card — Shopify Section

An interactive **scratch card** section for Shopify, built as a single `.liquid` file with embedded Liquid, CSS, and JavaScript. Customers scratch a designated area with their mouse or finger to reveal an image, then fill out a form to claim a prize.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Installation](#installation)
- [Shopify Editor Settings](#shopify-editor-settings)
- [Project Structure](#project-structure)
- [Technical Architecture](#technical-architecture)
- [User Flow](#user-flow)
- [External API (Optional)](#external-api-optional)
- [Development](#development)
- [License](#license)

---

## How It Works

1. After a **configurable delay** (default 5s), a fullscreen overlay appears with the scratch card centered
2. The user scratches the defined area with mouse (desktop) or finger (mobile)
3. When **60%** (configurable) of the area is scratched, the image is revealed with a smooth animation
4. A form modal appears requesting name, phone, and email
5. Data is sent **natively to Shopify** (`{% form 'customer' %}`), with an optional parallel send to an external API
6. A **cooldown** (default 2 days) prevents the same visitor from seeing the scratch card again

---

## Installation

### 1. Upload the section

1. In Shopify admin, go to **Online Store > Themes > Actions > Edit code**
2. In the `sections/` folder, click **Add a new section**
3. Name it `scratch-card` and paste the contents of `scratch-card.liquid`
4. Save

### 2. Add it to your template

**Via the visual editor:**
1. Go to **Customize** in your theme
2. Add the **Scratch Card** block to any section
3. Configure options in the sidebar

**Via code:**
```liquid
{% section 'scratch-card' %}
```

### 3. Upload the reference image

1. Go to **Settings > Files**, upload a reference image (recommended: **1536×1024px**)
2. Select it in the **Card image** field in the section settings

---

## Shopify Editor Settings

### "Image" tab
| Field | Description |
|-------|-------------|
| **Card image** | The image displayed inside the card (recommended: 1536×1024px) |

### "Text over image" tab
| Field | Description |
|-------|-------------|
| **Title** | Text shown above the card (optional) |
| **Description** | Text below the title (optional) |

### "Background" tab
| Field | Description | Default |
|-------|-------------|---------|
| **Background image** | Optional. If empty, uses solid color only | — |
| **Image blur** | Blur applied to the background image (0–30px) | 4px |
| **Color opacity** | Transparency of the color overlay (0–100%) | 85% |

### "Scratch area coordinates" tab
Fields to position the scratchable area over the card image. Values are in pixels based on the reference image (1536×1024px).

### "Behavior" tab
| Field | Default |
|-------|---------|
| Show delay | 5s |
| Cooldown between shows | 2 days |
| Reveal threshold | 60% |
| Canvas blur strength | 18px |
| Brush size | 40px |

### "Form" tab
Configure placeholders, error messages, and enable/disable name and phone fields.

### "Modal text" tab
Customize all text displayed in the form and success screen.

### "External API (optional)" tab
Enable to also send data to an external REST endpoint in parallel with the Shopify submission.

---

## Project Structure

```
cipher/
  README.md                 ← This documentation
  LICENSE.md                ← Restricted use license
  front-end/
    scratch-card.liquid     ← Complete Shopify section (Liquid + CSS + JS)
    image.png               ← Reference image for coordinates
```

---

## Technical Architecture

### HTML Hierarchy (with background image)

```
#scratch-popup (fixed, initially hidden, z-index: 99999)
└── .scratch-overlay (fixed, flex, background: rgba via color_extract)
    ├── ::before (z-index: -1, image + blur) — ONLY if bg_image is set
    ├── <button .scratch-close> (position: absolute, top-right)
    └── .scratch-inner (relative, z-index: 1)
        ├── .card-text (title + description, optional)
        └── .card-wrap
            ├── <img> (card image)
            └── .scratch-area
                └── <canvas> (scratch layer)
```

### Visual Layers (bottom to top)

1. **`::before` pseudo-element** — background image with `filter: blur()` (only if configured)
2. **`.scratch-overlay`'s `background: rgba()`** — solid color + opacity via `color_extract`
3. **`.scratch-inner`** — card content (text + image + canvas)

### Canvas

- A **main canvas** renders the cropped image with blur + "SCRATCH HERE" text
- A **mask canvas** (offscreen) tracks the scratched percentage via white pixels
- `destination-out` composite mode erases the scratched area on both canvases
- The reveal uses `requestAnimationFrame` with a 200ms animation, progressively reducing the blur

### Submission

- Native Shopify form: `{% form 'customer', id: form_id %}`
- `form_id` pre-computed via Liquid to avoid "Invalid form type" error
- JS validation before submission (name non-empty, phone ≥ 10 digits, valid email)
- `localStorage.setItem('scratch_submitted_<id>', timestamp)` saved before submit
- Optional: parallel `fetch()` to external API before `emailForm.submit()`

### Colors & Opacity

- Shopify's `color_extract` extracts RGB values from the hex color
- `times: 1.0 | divided_by: 100` converts the percentage (85) to decimal (0.85)
- Result is applied as inline `rgba(R, G, B, A)` on `.scratch-overlay`

### Cooldown

- Key: `scratch_submitted_<section.id>` in `localStorage`
- Value: submission timestamp in ms
- Compared with `Date.now() - cooldown` in `init()`; if within cooldown, the section does not render

---

## User Flow

```
[Page loads]
    │
    ▼
[Check localStorage]
    │
    ├── Cooldown active → ❌ Shows nothing
    │
    └── Cooldown expired or missing → ✅ Proceed
        │
        ▼
    [Wait SHOW_DELAY (5s)]
        │
        ▼
    [Overlay appears with fadeIn animation]
        │
        ▼
    [User scratches the canvas]
        │
        ├── Clicked X or outside → Close overlay
        │
        └── Reached REVEAL_THRESHOLD (60%)
            │
            ▼
        [Reveal animation (200ms)]
            │
            ▼
        [Popup closes, form modal opens]
            │
            ▼
        [User fills and submits]
            │
            ├── Validation fails → Shows field error
            │
            └── Validation OK
                │
                ▼
            [Save timestamp to localStorage]
                │
                ▼
            [If external API enabled → fetch()]
                │
                ▼
            [emailForm.submit() → Shopify]
                │
                ▼
            [Page reloads / redirects]
```

---

## External API (Optional)

When enabled, the section sends a `POST` to the configured URL before submitting the Shopify form:

```json
POST {api_url}
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Customer Name",
  "phone": "(11) 99999-9999",
  "source": "scratch_card"
}
```

The API response is logged to the console but **does not block** the flow — the Shopify form is submitted regardless of the result.

---

## Development

### How it was built

1. **Prototyping** — Standalone HTML/CSS/JS version to test canvas logic, coordinates, and touch events
2. **Shopify migration** — Converted to Liquid with section schema and `{% form 'customer' %}`
3. **Bug fixes** — Canvas CORS (offscreen mask canvas), "Invalid form type" (pre-computed form_id), "Missing CAPTCHA" (native form), blocked scroll (closeAll)
4. **Customizations** — Configurable background (image + blur + opacity), colors, text, coordinates
5. **Optimization** — Animation reduced from 600ms to 200ms, opacity calculated via CSS without problematic Liquid floats

### Prerequisites

- Shopify theme compatible with `.liquid` sections (any Online Store 2.0 theme)
- Reference image for coordinate alignment

---

## License

This project has **restricted commercial use**. See [LICENSE.md](./LICENSE.md) for full details.

Personal and educational use: ✅ Allowed  
Commercial use: ❌ Prohibited without prior authorization
