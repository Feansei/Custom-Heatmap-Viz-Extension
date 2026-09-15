# Image Heatmap — Tableau Viz Extension

A Tableau **Viz Extension** (requires Tableau 2024.2+) that lets you:

1. Load an image (upload a file or paste a URL).
2. Click to draw polygon "hotspots" over parts of the image and name each one — optionally with
   smoothed, rounded outlines instead of straight edges, and optionally several shapes sharing one
   region (e.g. both biceps in a body diagram).
3. Drag a discrete field onto **Region ID** and a measure onto **Value** on the Marks card (plus an
   optional **Row Count** field for accurate COUNT aggregation).
4. Map **multiple discrete values to one region** and choose how they're aggregated
   (SUM / AVG / MIN / MAX / COUNT / COUNTD / MEDIAN).
5. Give **each region its own diverging color scale** and its own **editable tooltip text**.
6. Click a region to filter other worksheets on the dashboard — with per-region target sheets and
   a configurable "what happens on the second click" behavior.
7. Toggle light/dark mode, customize the canvas background, and show an on-canvas legend from the
   Settings panel.
8. Show/hide individual regions, duplicate a region's configuration, and copy/paste a full
   configuration (image + regions + settings) as text between instances.

Everything (image, regions, groupings, aggregation, tooltips, palettes, theme, canvas background,
legend, lock/panel state) is saved into the workbook via the extension's settings.

---

## 1. Files in this project

```
HeatmapImageVizV2.trex     <- the extension manifest Tableau loads (points at GitHub Pages)
.nojekyll                    <- tells GitHub Pages not to run Jekyll over these files
web/index.html
web/style.css
web/app.js                 <- all extension logic
web/lib/tableau.extensions.1.latest.js   <- already included in this package
```

## 2. Add the extension to a worksheet

Marks card → Mark Type dropdown → **Viz Extensions → Add Extension → Access Local Extensions** →
choose `HeatmapImageVizV2.trex`.

## 3. Basic usage

1. **Choose Image** (or paste a URL + **Load URL**).
2. **+ Draw Region** → click 3+ points around an area → **Finish Shape** → name it. The name is
   just a label — it does not affect your data (see below).
3. Drag a **dimension** onto **Region ID** and a **measure** onto **Value** on the Marks card.
4. Open the ⚙ icon on the region to add matched data values (see below) — a freshly drawn region
   has none by default, so it won't show a color until you do this.
5. Use the pencil icon to redraw a shape, the trash icon to delete, or click the name to rename it.

---

## 4. Feature details

### Region names are never linked to data matching

A region's display **name** and its **matched values** (added in the ⚙ panel) are fully separate,
from the moment you create the region. Naming a region no longer pre-fills a matched value, and
renaming a region — even repeatedly — will never change what it's matched to. If a region isn't
showing color, check the ⚙ panel's "Data values in this region" list, not the name.

> **Manifest note:** each `<encoding>` in the `.trex` must have a unique `<encoding-icon token="...">`
> — reusing a token across encodings causes Tableau to reject the add with *"Cannot use the same
> icon for more than one encoding"* (error code `ED626076`). Region ID uses `text`, Value uses
> `color`, and Row Count uses `hash`.

### Grouping multiple data values into one region, with aggregation (⚙ icon)

Click the ⚙ icon next to a region to open **Configure Region**. Under **Data values in this
region**, add every value from your Region ID field that should belong to this shape (e.g. for a
"Triceps" region: `Bench Press`, `Tricep Pushdown`, `Dips`). Then choose how those values combine
into the region's single value via the **Aggregation** dropdown:

| Aggregation | Behavior |
|---|---|
| SUM | Total of all matched values |
| AVG | Average of all matched values (default) |
| MIN | Smallest matched value |
| MAX | Largest matched value |
| COUNT | Number of matched values |
| COUNTD | Number of *distinct* matched values |
| MEDIAN | Median of all matched values |

The sidebar, the fill color, and the tooltip all read from this exact same computed value, so
they can never disagree with each other.

### Per-region diverging color scale

In the same ⚙ panel, under **Diverging color steps**, each region has its own list of
value → color breakpoints (2–9 steps). Colors blend smoothly between adjacent steps. Edit a step's
value or color directly, add/remove steps, or click **Auto-space to data range** to spread the
current steps evenly across the min/max of whatever data is currently in view. This is per-region,
so two regions can use completely different scales.

### Tooltips are user-editable

Hovering a region shows a tooltip computed the same way as the sidebar and fill color — guaranteed
to always agree with what you see. Earlier versions used Tableau's native per-mark tooltip
(`hoverTupleAsync`), which also enabled Viz-in-Tooltip; that was **removed** because a region
grouping several data values doesn't correspond to any single underlying mark, which was producing
tooltips that didn't match the region's actual computed value.

Open a region's ⚙ panel and edit the **Tooltip text** box directly. Use these placeholders — they
are substituted with live values on every hover:

| Placeholder | Meaning |
|---|---|
| `{name}` | The region's display name |
| `{agg}` | The chosen aggregation (SUM, AVG, etc.) |
| `{value}` | The computed aggregated value |
| `{matched}` | How many of the region's values had data |
| `{total}` | Total number of values assigned to the region |

The first line becomes the tooltip title; further lines (real newlines in the box) show as detail
text below it. **Reset to default** restores `{name}` / `{agg}: {value} ({matched}/{total} matched)`.
Only the wording is customizable — the underlying number always matches the sidebar and fill color.

### COUNT and real row counts (optional "Row Count" encoding)

By default, **COUNT** returns how many of a region's matched values currently have data (the same
number as the "x/y matched" figure) — because a Viz Extension only ever receives Tableau's
*already-aggregated* summary table, not raw rows, so there's no row count to see unless you give it
one explicitly.

Once you add this extension, the Marks card shows **three separate, independent tiles**:

```
Marks card
├── Region ID                ← your dimension
├── Value                     ← your measure
└── Row Count (optional)      ← a COUNT() / Number of Records measure
```

They are siblings — dropping a field on Row Count does not modify or replace Value, and there is no
Color/Size/Label shelf to confuse it with (this isn't a standard chart type). To make COUNT reflect
real underlying rows (e.g. "50 individual workout log entries" rather than "1 matched value"), drag
a `COUNT()` or "Number of Records" field onto the **Row Count** tile specifically — not onto Value.
Once present, COUNT sums those real row counts across a region's matched values. This tile is
entirely optional and only ever affects the COUNT aggregation; everything else works identically
whether or not it's populated.

### Regions are made of groups + shapes — multiple shapes can share one region

A **region** (what you see in the sidebar) is really a data/config unit — matched values,
aggregation, palette, tooltip, and filter behavior — separate from the **shape(s)** drawn on the
image. Most regions have exactly one shape, but a region can have several: click
**+ Add Shape to This Region** on any region's sidebar card, draw another polygon, and it's added
as a second (third, etc.) shape under the *same* region. All of a region's shapes share the same
matched values, color, and filter target — so two disconnected areas of the image (e.g. both
biceps in a body diagram) can be configured once and behave identically no matter which one is
clicked. Each shape still has its own **redraw** (pencil), **delete** (trash), and
**smooth corners** toggle in the sidebar, since geometry is the one thing that's genuinely
per-shape rather than shared.

### Click a region to filter — click it again to toggle off

There's no separate "Apply Filter" button anymore. Click a region (its shape on the image, or its
row in the sidebar) and it immediately filters using its matched values. Click the **same** region
again, and what happens depends on that region's **"On 2nd click"** setting in its ⚙ panel:

| Option | Effect on the second click |
|---|---|
| **Fully unapply the filter** (default) | Filter is cleared entirely — back to showing everything |
| **Keep the current filter** | Nothing changes — the filter stays exactly as applied |
| **Select all values in the field** | Filter is set to include every value in the field (`FilterUpdateType.All`), which shows everything but via an explicit "all selected" filter state rather than no filter at all — useful if a downstream sheet or action distinguishes between the two |

Clicking a *different* region while one is already active replaces the current filter with the new
region's, the same way clicking a different bar in a bar chart would. A dashed outline on the image
(and a highlighted card in the sidebar) always shows which region is currently active.

This is a **direct categorical filter on your Region ID field**, not mark selection — it calls
`Worksheet.applyFilterAsync(...)` with the exact, canonical text values behind the clicked region's
matched data (not what you typed in ⚙, so casing/typos there can't cause a mismatch). An earlier
version used mark selection (`selectTuplesAsync`) plus a manually-configured Filter Action; that
depended on the same tuple-id ordering mechanism responsible for an earlier tooltip bug and was
never fully verified reliable, so it's been replaced with something more transparent.

### Target worksheets — global default, with per-region overrides

**To reach other sheets on the dashboard, no Filter Action is needed at all.** Each region has its
own **Target sheets** field in ⚙ (comma-separated worksheet names) — so not every region has to
filter the same sheets. Leave a region's target sheets blank and it falls back to the
**Default filter target worksheets** list in ⚙ Settings. At least one target — global or
per-region — is required; clicking a region with nowhere to send the filter shows a clear status
message rather than doing nothing silently.

Whichever list applies, `applyFilterAsync` has no choice but to filter *this* worksheet first (a
Viz Extension can't create a filter that skips its own sheet) — but this worksheet is also where
the extension reads its own data from. Filtering it would silently break every *other* region
(they'd suddenly show "no matching data" because their rows had just been filtered out from under
the extension itself). So immediately after applying, the extension calls
`Filter.setAppliedWorksheetsAsync(...)` to retarget the filter to *only* the intended sheets,
explicitly excluding this one — restoring this sheet to the full, unfiltered field so every region
keeps working regardless of what was last filtered. **Clear Active Filter** in the sidebar releases
the filter from wherever it's currently applied, as a manual override regardless of the active
region's own toggle setting.

The status bar reports exactly what happened — which region, which sheets — so you can always tell
whether it actually worked rather than guessing.

### Settings panel

⚙ **Settings** in the top bar has Light/Dark theme controls, canvas background options, the
**default filter target worksheets** list described above, a **Show status notifications** toggle
(see below), and a credit link to
[linkedin.com/in/seanfei](https://www.linkedin.com/in/seanfei/).

### Status notifications are a floating toast, and can be turned off

Save/load/filter messages ("Saved to workbook", "\"Triceps\" filtering: Detail Table.", errors,
etc.) now appear as a small floating notification near the top of the canvas
(`position: fixed`) instead of a bar that pushed the toolbar and drawn regions down every time it
appeared or disappeared — nothing in the layout shifts when it shows up. Turn it off entirely via
**Show status notifications** in ⚙ Settings; note that this also hides error messages, so it's
best left on until things are working the way you expect.

### Show/hide individual regions

Each region has an eye icon in its sidebar row (leftmost of the three action icons) — click it to
hide that region's shape(s) on the image entirely. A hidden region isn't just faded out, it's
skipped from rendering altogether, so it also stops intercepting clicks, which is the main reason
to use this: when drawing several shapes close together or overlapping, hide the ones you're not
currently working with so clicks land on the shape you actually want. Hidden regions still work
normally everywhere else (sidebar row, ⚙ config, data matching) — only their on-image presence is
suppressed. A **Show All** link appears next to the Regions header whenever at least one region is
hidden, as a quick way to bring everything back.

### Collapsing the side panel

A thin `‹`/`›` tab sits between the image and the sidebar — click it to hide or show just the side
panel while keeping the toolbar and image visible. Independent of the lock button; saved with the
workbook.

### Zooming the image

The floating zoom control in the bottom-left of the canvas scales **only the image and its
regions** via a CSS transform — the toolbar and sidebar stay fixed size. While drawing, the vertex
dots and connector line automatically scale inversely with zoom so they stay a small, constant,
precise on-screen size at any zoom level rather than ballooning up when you zoom in to mark fine
detail. The zoom control itself is hidden whenever the editing chrome is locked.

The browser's own zoom gesture (Ctrl+scroll-wheel, or a trackpad pinch) is now blocked inside the
extension, so it can't resize the whole extension or throw off the image's layout — only the
extension's own zoom slider changes anything. This is a JavaScript-level fix
(`preventDefault()` on ctrl-modified wheel/gesture events); it only affects interaction inside the
extension's own iframe, not the rest of the Tableau window.

### Canvas background

Settings → **Canvas background** lets you set a color and/or an optional background image for the
area *behind* the image (not the image itself) — useful for matching a dashboard's background or
just for aesthetics. Leave the image URL blank to use just the color; click **Reset** to go back to
the theme's default gray. Both are saved with the workbook.

### Smoothing region outlines

Open a region's ⚙ panel and check **Smooth corners** under **Shape** to render that region's
outline as a rounded curve through its vertices instead of straight polygon edges — useful for
regions that are meant to be roughly circular/organic rather than angular. This only changes how
the shape is *drawn*; the underlying vertex points you clicked are unchanged, so editing and
redrawing still work the same way. It's a per-region, opt-in toggle (off by default) so existing
regions render exactly as before unless you turn it on.

### Hiding the editing controls on a dashboard

The lock button in the top-right of the canvas hides the toolbar, sidebar, side-panel toggle, and
zoom control, leaving only the image and its colored regions — for when you're placing this on a
dashboard for others to view. This state is saved with the workbook, and is also auto-applied when
Tableau reports the sheet is in true "Viewing" mode (Presentation Mode or a published dashboard).

---

## 4b. Newer features

### On-canvas legend

A floating gradient bar appears in the bottom-right of the canvas showing the color scale for
whichever region you're currently hovering; if you're not hovering anything, it falls back to
showing the scale for the currently active (filtered) region. It reflects the region's configured
**palette breakpoints** (the min/max values you set in ⚙, not the live data range), since that's
the actual domain the color mapping represents. Turn it off via **Show on-canvas legend** in
⚙ Settings. Unlike the zoom control, the legend stays visible even when the editing chrome is
locked — it's meant for dashboard viewers, not just you.

### Per-region value formatting

Each region's ⚙ panel has **Format: Prefix / Suffix** fields — e.g. prefix `$` for currency, or
suffix ` kWh` for a utility reading. These apply everywhere the value is displayed: the sidebar,
the tooltip, and the legend's min/max labels. Purely cosmetic — they don't affect matching,
aggregation, or coloring.

### Show/hide individual regions

Each region's sidebar row has an eye icon (leftmost of the action icons). Toggling it off doesn't
just fade the region — it's skipped from rendering entirely, so it also stops intercepting clicks.
This is the main reason to use it: when drawing several shapes close together or overlapping, hide
the ones you're not currently working with so clicks land on the shape you actually want. Hidden
regions still work normally everywhere else (data matching, filtering, ⚙ config) — only their
on-image presence is suppressed. A **Show All** link appears next to the "Regions" header whenever
at least one region is hidden.

### Duplicate a region's configuration

The copy icon on a region's sidebar row clones its aggregation, palette, tooltip template, target
sheets, toggle behavior, and value format into a brand-new region named "*(original) Copy*".
Deliberately **not** copied: matched values and shapes — those are usually exactly what needs to
differ between otherwise-identical regions (e.g. several rooms sharing one setup but each keyed to
different data values). After duplicating, add matched values via ⚙ and draw a shape for it.

### Copy/paste a full configuration

In ⚙ Settings → **Backup / transfer configuration**: **Copy Config** serializes the current image,
all regions and shapes, and display settings into a block of text (with a "Copy to Clipboard"
button, falling back to manual select if clipboard access isn't available in your context).
**Paste Config** accepts that same text back and applies it — after a confirmation prompt, since it
replaces the current image and every region. Use this to move a configured setup to another
worksheet, or to hand a finished setup to someone else, without redrawing everything by hand.

## 6. Styling

The UI has been restyled against Tableau's own published Extensions guidance:
- Color: [ux_color](https://tableau.github.io/extensions-api/docs/Style_Guidelines/ux_color) — uses
  Tableau's documented gray scale (F1–F9), functional colors (Action Orange for primary actions,
  Attention Red for destructive actions, Go Green for confirmations), and font-opacity system for
  text hierarchy, with a matching dark theme.
- Fonts: [ux_fonts](https://tableau.github.io/extensions-api/docs/Style_Guidelines/ux_fonts) — sans
  serif stack led by Benton Sans (Tableau's own default) with system fallbacks.
- Layout/margins: [ux_layout](https://tableau.github.io/extensions-api/docs/Style_Guidelines/ux_layout) /
  [ux_branding](https://tableau.github.io/extensions-api/docs/Style_Guidelines/ux_branding) —
  12px vertical / 15px horizontal content margins.
- Icon-only buttons use simple line icons instead of emoji, with `aria-label`s and visible focus
  outlines for keyboard/screen-reader use.

This is a good-faith adaptation of Tableau's published design guidelines, not a formal Tableau
Exchange certification review (that requires submitting through Tableau's actual partner process).

---

## Notes & limitations

- **Settings size**: image + regions are stored in the workbook's extension settings, which have a
  practical size limit. For large images, use **Load URL** instead of uploading. You'll see a
  status message if a save fails.
- **Matching**: values are matched to the Region ID field's *formatted* value, trimmed and
  case-insensitive.
- **Selection API** (`selectTuplesAsync`) requires **Tableau 2024.2+** and API library v1.12.0+
  (already bundled in `web/lib/`). Tuple IDs are computed per Tableau's documented rule
  (`tupleId = totalRowCount - rowIndex`), recalculated whenever summary data changes.
- **Reshaping**: regions support redraw-from-scratch (pencil icon) rather than dragging individual
  vertices.
- **Publishing**: to use this on Tableau Server/Cloud, host `web/` on an HTTPS server, update the
  `<url>` in the `.trex` file, and add that URL to the site's Extensions allow-list.
