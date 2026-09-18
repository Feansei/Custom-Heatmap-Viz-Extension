# Image Heatmap — Tableau Viz Extension

A Tableau **Viz Extension** (Tableau 2024.2+) that turns any image — a floor plan, body diagram,
map, or similar — into an interactive heatmap. Draw regions on top of the image, bind them to data
on the Marks card, and each region colors itself and can filter the rest of your dashboard when
clicked.

---

## 1. Setup

### Files

```
HeatmapImageVizV2.trex     <- the extension manifest Tableau loads
web/index.html
web/style.css
web/app.js
web/lib/tableau.extensions.1.latest.js
```

### Host the web app

The manifest's `<url>` points to GitHub Pages. If this repo is already published there, no setup
is needed — skip to "Add the extension" below.

To host it yourself:
1. Push this folder to a GitHub repo (files at the repo root, not nested in a subfolder).
2. Repo **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
3. After it deploys, confirm the page loads by opening
   `https://<your-username>.github.io/<repo-name>/web/index.html` in a browser.
4. Update the `<url>` inside `HeatmapImageVizV2.trex` to match that address.

Alternatively, for local testing, serve the folder with any static server
(`npx http-server . -p 8765` or `python -m http.server 8765`) and set `<url>` to
`http://localhost:8765/web/index.html`.

### Add the extension to a worksheet

Marks card → Mark Type dropdown → **Viz Extensions → Add Extension → Access Local Extensions** →
select `HeatmapImageVizV2.trex`.

Every Tableau user who wants to use this needs their own copy of the `.trex` file added this way —
hosting the web app online does not distribute the extension itself. For Tableau Server/Cloud, an
admin also needs to add the hosting domain to the site's allowed Extensions list.

---

## 2. Basic usage

1. **Choose Image** (upload a file) or paste an **Image URL** + **Load URL**.
2. **+ Draw Region** → click at least 3 points around an area on the image → **Finish Shape** →
   give it a name. The name is just a label; it has no effect on data matching.
3. On the Marks card, drag a **dimension** onto **Region ID** and a **measure** onto **Value**.
   There's also an optional **Row Count** tile — see [Aggregation](#aggregation) below.
4. Open the region's ⚙ icon (in the sidebar) and add the data values that belong to it — see
   [Configuring a region](#configuring-a-region).

---

## 3. Regions, shapes, and groups

A **region** (what you manage in the sidebar) is a data/config unit — matched values, color scale,
tooltip, and filter behavior. A **shape** is a polygon drawn on the image. Most regions have one
shape, but a region can have several: click **+ Add Shape to This Region** on any region's sidebar
card to draw another polygon that shares the same data, color, and filter target — useful for two
disconnected areas of the image that should behave identically (e.g. both biceps in a body diagram).

Per-shape controls (in the sidebar, nested under each region):
- **Smooth corners** — renders that shape's outline as a rounded curve through its points instead
  of straight edges.
- **Redraw** (pencil) — re-draw that shape's points from scratch.
- **Delete** (trash) — removes that shape. Deleting a region's last shape deletes the region too.

Per-region controls (sidebar row):
- **Eye icon** — show/hide the region on the image. A hidden region is skipped from rendering
  entirely, so it also stops intercepting clicks — useful when shapes are close together or
  overlapping. A **Show All** link appears next to "Regions" whenever anything is hidden.
- **⚙ (gear)** — opens the region's configuration (below).
- **Copy icon** — duplicates the region's configuration (aggregation, palette, tooltip, target
  sheets, format) into a new region. Matched values and shapes are *not* copied, since those
  usually need to differ between otherwise-identical regions.
- **Trash** — deletes the region and all its shapes.

---

## 4. Configuring a region (⚙)

### Data values
Add every value from your Region ID field that belongs to this region (e.g. a "Triceps" region
might list `Bench Press`, `Tricep Pushdown`, `Dips`). These are matched case-insensitively and are
completely independent of the region's name — renaming a region never affects its matched values.

### Aggregation
Choose how multiple matched values combine into one number: **SUM, AVG, MIN, MAX, COUNT, COUNTD,
MEDIAN**. By default, COUNT counts how many matched values currently have data. To make COUNT
reflect real underlying row counts instead, drag a `COUNT()` or "Number of Records" field onto the
separate **Row Count (optional)** tile on the Marks card (it's independent of Region ID and Value,
not a modifier of either).

### Format
Optional **Prefix** / **Suffix** text (e.g. `$` or `kWh`) applied to the displayed value everywhere
it appears — sidebar, tooltip, and legend.

### Filtering
- **Target sheets** — comma-separated worksheet names this region filters when clicked. Leave
  blank to use the default list from ⚙ Settings. At least one (here or in Settings) is required.
- **On 2nd click** — what happens when you click an already-active region again:
  - *Fully unapply the filter* — clears it
  - *Keep the current filter* — does nothing
  - *Select all values in the field* — explicitly includes every value rather than clearing

### Tooltip text
A custom template shown on hover. Supports placeholders: `{name}`, `{agg}`, `{value}`, `{matched}`,
`{total}`. The first line is the title; further lines show as detail text below it.

### Diverging color steps
A list of value → color breakpoints (2–9 steps). Colors blend smoothly between adjacent steps.
Add/remove steps, edit values and colors directly, or click **Auto-space to data range** to spread
existing steps evenly across the current min/max of all matched data.

---

## 5. Filtering the dashboard

Click a region (its shape on the image, or its sidebar row) to filter — no separate "Apply" button.
It applies a categorical filter to your Region ID field, using the exact underlying values matched
to that region, and pushes it to the region's target worksheets. Click the same region again for
its configured second-click behavior (see above). Clicking a *different* region replaces the active
filter with the new region's. A dashed outline and highlighted sidebar card show which region is
currently active. **Clear Active Filter** in the sidebar releases the filter regardless of the
active region's own second-click setting.

---

## 6. Toolbar and canvas controls

- **Choose Image / Load URL / Clear Image** — set or remove the background image.
- **+ Draw Region / Finish Shape / Cancel** — drawing controls.
- **Lock icon** (top-right of canvas) — hides the toolbar, sidebar, and zoom control, leaving only
  the image and colored regions — for placing on a dashboard. Auto-applies when Tableau reports the
  sheet is in Viewing/Presentation mode.
- **Zoom control** (bottom-left) — scales only the image, not the surrounding UI. Hidden while
  locked. The browser's own Ctrl+scroll / pinch zoom is blocked so it can't resize the extension.
- **Legend** (bottom-right) — shows the color scale of whichever region you're hovering, or the
  active filtered region if none. Stays visible even when locked.
- **Sidebar toggle** (`›` / `‹` tab) — hides just the side panel, independent of the lock.

---

## 7. Settings (⚙ Settings, top bar)

- **Theme** — light or dark.
- **Canvas background** — color and/or image behind the main image (not the image itself).
- **Default filter target worksheets** — fallback used by any region that doesn't set its own.
- **Show status notifications** — toggles the floating save/error messages (off also hides errors).
- **Show on-canvas legend** — toggles the legend described above.
- **Backup / transfer configuration** — **Copy Config** serializes the image, all regions/shapes,
  and display settings as text (with a clipboard button) for moving to another worksheet or sharing
  with someone else. **Paste Config** applies text copied this way, after a confirmation prompt
  (it replaces the current image and all regions).

---

## Notes

- Values are matched to the Region ID field's *formatted* value, trimmed and case-insensitive.
- Large embedded images may exceed the workbook settings size limit — use **Load URL** instead of
  uploading for big images; a status message appears if saving fails.
- Everything (image, regions, shapes, and all settings above) is saved into the workbook.
