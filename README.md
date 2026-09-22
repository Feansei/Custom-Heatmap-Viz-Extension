# Image Heatmap — Tableau Viz Extension

Turn any image — a floor plan, body diagram, store layout, map, or product photo — into an
interactive heatmap. You draw regions on top of the image, link each region to values in your
data, and every region colors itself by your measure. Clicking a region can filter other sheets on
your dashboard and/or change a parameter.

---

## Requirements

- **Tableau Desktop, Server, or Cloud 2024.2 or later** (Viz Extensions support is required).
- The extension manifest file: **`HeatmapImageVizV2.trex`**.
- **Tableau Server / Cloud only:** your site admin must allow this extension on the site's
  Extensions settings before it will load in published workbooks.

---

## Quick start

1. Add the extension as the **Mark Type** on a worksheet.
2. Drag a **dimension** onto **Region ID** and a **measure** onto **Value**.
3. Load an image.
4. Click **+ Draw Region**, draw a shape, and name it.
5. Click the **⚙** icon on the region and pick the data value(s) that belong to it.
6. Choose the **target worksheets** to filter (and optionally a parameter), then click the region.

Each step is explained in detail below.

---

## 1. Add the extension to a worksheet

1. Open (or create) a worksheet.
2. On the **Marks** card, open the **Mark Type** dropdown.
3. Choose **Viz Extensions → Add Extension → Access Local Extensions**.
4. Select **`HeatmapImageVizV2.trex`**.

The mark type now shows **Image Heatmap**, and the extension's editor appears in the view.

---

## 2. Connect your data

The Marks card shows three tiles for this extension:

| Tile | What to drop on it | Required? |
|---|---|---|
| **Region ID** | A discrete dimension whose values identify each area (e.g. `Room`, `Muscle Group`, `Aisle`) | Yes |
| **Value** | The measure used to color each region (e.g. `SUM(Sales)`, `AVG(Temperature)`) | Yes |
| **Row Count (optional)** | A count measure such as `COUNT(...)` or `Number of Records` | No — only used by the **COUNT** aggregation |

Until both Region ID and Value are filled, the **Data** section of the side panel tells you what's
missing. Once they are, it shows how many Region ID values are in the data and how many aren't
assigned to a region yet.

> Regular filters on the Filters shelf work normally — the extension only sees the data that's left
> after they're applied.

---

## 3. Load an image

Use the top toolbar:

- **Choose Image** — upload a file from your computer. The image is saved inside the workbook.
- **Paste an image URL… → Load URL** (or press **Enter**) — use an image hosted online. Only the
  link is saved, which keeps the workbook small. The URL must be reachable by everyone who views
  the workbook.
- **Clear Image** — removes the image. Your regions are kept and reappear when you load a new
  image.

> **Tip:** Workbook settings have a size limit. For large or high-resolution images, use
> **Load URL**, or shrink the file before uploading. If a save fails, you'll see a message
> saying so.

---

## 4. Draw regions

Click **+ Draw Region**, then pick a drawing tool in the toolbar:

| Tool | How to draw |
|---|---|
| **Polygon** | Click to place points (at least 3). Finish by clicking the **first point**, pressing **Enter**, or clicking **Finish Shape**. |
| **Rectangle** | Click and drag on the image. |
| **Ellipse** | Click and drag on the image. |

While drawing a polygon:

- **Backspace**, **Ctrl/Cmd+Z**, right-click, or **Undo Point** removes the last point.
- A dashed line follows your cursor, and the first point grows when you're close enough to close
  the shape.

Press **Esc** or click **Cancel** at any time to discard the shape. When the shape is finished,
enter a name and click **Save Region** (or press **Enter**).

**The region name is only a label.** It does not connect the region to your data — you do that in
the next step. You can rename a region at any time by clicking its name in the side panel.

### Zoom for precise drawing

Use the zoom control in the **bottom-left** of the canvas (50%–300%). Points stay a small,
constant size at any zoom level.

### One region, several shapes

A region can be made of more than one shape — for example, both left and right biceps on a body
diagram, or two separate areas of a warehouse that share one data value.

1. In the side panel, find the region.
2. Click **+ Add Shape to This Region**.
3. Draw the new shape (no name prompt — it joins the existing region).

All shapes in a region share the same data values, color, label, tooltip, and click actions.

### Edit individual shapes

Each shape is listed under its region in the side panel as **Shape 1**, **Shape 2**, etc.:

| Icon | Action |
|---|---|
| Curve | **Smooth corners** — draws the outline as a rounded curve instead of straight edges |
| Points | **Edit points** — adjust the existing outline (see below) |
| Pencil | **Redraw** — draw this shape again from scratch, with any tool |
| Trash | **Delete** this shape (deleting a region's last shape deletes the region, after a confirmation) |

In **Edit points** mode:

- **Drag a point** to move it.
- **Drag the shape** to move the whole shape.
- **Double-click the shape** to add a point on the nearest edge.
- **Alt+click** or **double-click a point** to remove it (a shape keeps at least 3 points).

Click **Done Editing** in the toolbar (or press **Esc**) when you're finished.

---

## 5. Assign data values to a region

A new region has no data attached, so it's drawn with the "no data" style (a gray hatched pattern
by default). To connect it:

1. Click the **⚙** icon on the region in the side panel.
2. Click in the box under **Data values in this region**. A list of the values in your Region ID
   field appears, with each value's measure next to it.
3. Type to search, then click a value (or use the arrow keys and **Enter**). The list stays open so
   you can add several values in a row.
4. Remove a value by clicking the **×** on its chip.

Values already used by another region are tagged with that region's name. You can also type a value
that isn't in the current data and press **Enter** — it's shown with a dashed red outline until
that value appears in the data (for example, after a filter changes).

### Combine multiple values with an aggregation

When a region contains more than one data value, choose how they combine using the
**Aggregation** dropdown:

| Aggregation | Result |
|---|---|
| **SUM** | Total of the matched values |
| **AVG** | Average of the matched values *(default)* |
| **MIN** | Smallest matched value |
| **MAX** | Largest matched value |
| **COUNT** | Number of matched values — or, if a field is on **Row Count**, the total of that field across the matched values |
| **COUNTD** | Number of distinct measure values among the matched values |
| **MEDIAN** | Median of the matched values |

Example: a "Triceps" region with the values `Bench Press`, `Tricep Pushdown`, and `Dips`, using
**SUM**, is colored by the combined total of all three.

The side panel shows each region's result, e.g. `AVG: 42.5 (3/3 matched)`. If fewer values matched
than you added, look for the dashed red chips in ⚙.

### Format the value

Use **Format → Prefix / Suffix** to add units, e.g. prefix `$` or suffix ` kWh`. The format appears
in the side panel, labels, tooltip, and legend.

---

## 6. Set the colors

In the region's ⚙ panel, **Colors** controls how values map to colors.

- Each step is a **value** and a **color**. Colors blend smoothly between steps.
- Values below the lowest step use the lowest color; values above the highest step use the
  highest color.
- **+ Add Step** adds a breakpoint (up to 9). Click **×** to remove one (minimum 2).

**Auto-space the steps** spreads the current steps evenly between a low and high value:

| Button | Range used |
|---|---|
| **All data** | Lowest to highest value on the Marks card |
| **All regions' values** | Lowest to highest *computed* value across every region (best when regions aggregate several values) |
| **This region's values** | Lowest to highest of the values matched by this region |

The default scale is blue (0) → white (50) → red (100), so auto-space it or set step values to fit
your measure. Every region has its own scale.

---

## 7. Display options

**Opacity** — the slider in the side panel's **Display** section sets how much of the image shows
through all regions. To give one region its own opacity, open its ⚙ panel → **Display**, tick the
**Opacity** checkbox, and set the slider.

**Labels on image** — turn labels on in **Settings → Labels on image**, choosing **Region name**,
**Value**, or **Name and value**. Set the font size, color, and whether text gets an outline for
readability. Labels are centered in each shape. To hide one region's label, untick
**Show label on image** in its ⚙ panel.

**Borders and "no data" style** — set these in **Settings → Regions**: border color and width
(0 for no border), and whether regions without data use a hatched pattern or a solid color.

---

## 8. Customize the tooltip

Hover over a region to see its tooltip. To change the wording, open the region's ⚙ panel and edit
**Tooltip text**. Click a placeholder button to insert it at the cursor. Placeholders are replaced
with live values:

| Placeholder | Replaced with |
|---|---|
| `{name}` | Region name |
| `{agg}` | Aggregation (SUM, AVG, …) |
| `{value}` | The region's computed value (with your prefix/suffix) |
| `{matched}` | How many of the region's values were found in the data |
| `{total}` | How many values are assigned to the region |
| `{values}` | Comma-separated list of the matched values |
| `{missing}` | Assigned values that aren't in the current data (or "none") |
| `{min}` / `{max}` | Lowest / highest matched value |
| `{sum}` / `{avg}` | Sum / average of the matched values |
| `{count}` | Number of matched values |
| `{rowcount}` | Total of the Row Count field across matched values |
| `{field}` | Name of the Region ID field |
| `{measure}` | Name of the Value field |

The **first line** is the tooltip title; any further lines appear below it. **Reset to default**
restores:

```
{name}
{agg}: {value} ({matched}/{total} matched)
```

---

## 9. Click actions: filter sheets and change a parameter

Clicking a region (on the image or in the side panel) runs its click actions. No dashboard action
needs to be set up.

### Filter other worksheets

Choose which worksheets are filtered in one or both places:

- **Default for all regions:** **Settings → Click actions → Default filter target worksheets**.
- **Per region:** the region's ⚙ panel → **Click actions → Target sheets**. This overrides the
  default for that region. Leave it empty to use the default.

To pick sheets:

1. Click **Find sheets**. The extension lists every worksheet in the workbook that the Region ID
   field can filter.
2. Choose a sheet from **Add a worksheet…**. Repeat for more sheets.
3. Remove a sheet with the **×** on its chip.

You can also type a worksheet name and click **+ Add**. A name with a dashed red outline wasn't
found among the sheets that can be filtered — check the spelling.

The target worksheets must include the **Region ID field** (use the same data source, or a data
source related to it). The extension's own worksheet is never filtered, so every region keeps its
color while a filter is active.

### Change a parameter

1. In **Settings → Click actions**, choose a **Parameter** (click the refresh icon if you've just
   created one).
2. Choose the **Value sent**: the **Region name**, or the region's **first matched data value**.
3. Optionally, give a region its own value in its ⚙ panel → **Click actions → Parameter**.

For a parameter with a list of allowed values, the value sent must match one of them (upper/lower
case doesn't matter). When the selection is cleared, the parameter goes back to the value it had
before you clicked.

A region can filter, change the parameter, or both. If it has neither target sheets nor a
parameter, clicking it shows a message explaining what to set.

### Select several regions

**Ctrl+click** (Windows) or **Cmd+click** (Mac) a region to add it to the selection, or to remove
it if it's already selected. The filter then includes the values of every selected region, and is
sent to all of their target sheets combined. The parameter is set from the region you clicked last.

### Clicking again

Selected regions have a dashed outline on the image and a highlighted card in the side panel.
A plain click on a **different** region replaces the selection. A plain click on the **only**
selected region does whatever you've chosen under **On 2nd click** in its ⚙ panel:

| Option | What happens |
|---|---|
| **Clear the filter** *(default)* | The filter is removed and the parameter is restored |
| **Keep the current filter** | Nothing changes |
| **Select all values in the field** | The filter stays on with every value selected, and the parameter is restored |

**Clear Selection** in the side panel's **Filtering** section always removes the filter and
restores the parameter.

A short message near the top of the canvas confirms what each click did.

---

## 10. Prepare it for a dashboard

### Hide the editing controls

Click the **lock** button in the top-right corner of the canvas to hide the toolbar, side panel,
and zoom control, leaving only the image, colored regions, and labels. Click it again to bring
them back. This setting is saved with the workbook.

When the workbook is viewed in **Presentation Mode** or as a **published view**, the editing
controls are hidden automatically. Viewers can still hover for tooltips and click (or
Ctrl/Cmd+click) regions.

### Collapse just the side panel

Click the thin **‹ / ›** tab between the image and the side panel to hide or show the panel while
keeping the toolbar visible.

### On-canvas legend

A color bar in the **bottom-right** of the canvas shows the color scale of the region you're
hovering over (or the most recently selected region). It stays visible for dashboard viewers. Turn
it off with **Settings → Display → Show on-canvas legend**.

---

## 11. Managing regions

Each region card in the side panel shows a drag handle, a color swatch, its name, its current
value, and these icons:

| Icon | Action |
|---|---|
| Eye | **Hide / show** the region on the image. Hidden regions can't be clicked, which is handy when shapes overlap. **Show All** (next to the Regions heading) brings them all back. |
| ⚙ | **Configure** data values, aggregation, format, colors, display, click actions, and tooltip |
| Copy | **Duplicate** the region's settings (aggregation, colors, tooltip, target sheets, 2nd-click behavior, format, label and opacity) as a new region below it. The copy has **no shapes, data values, or parameter value** — add those next. |
| Trash | **Delete** the region and all its shapes (after a confirmation) |

- **Search:** type in **Search regions or values…** to show only regions whose name or assigned
  values match.
- **Reorder:** drag a card by its handle (the dotted grip on the left). Regions **lower** in the
  list are drawn **on top** of regions above them, so use this to control which shape is on top
  where shapes overlap. Reordering is turned off while a search is active.
- Hovering a card highlights its shapes on the image.

---

## 12. Settings

Open **Settings** from the top toolbar.

| Section | Settings |
|---|---|
| **Appearance** | Light or Dark theme; canvas color and optional background image URL for the area *behind* your image (**Reset** returns to the default) |
| **Regions** | Border color and width; "no data" style (hatched pattern or solid color) |
| **Labels on image** | What to show (off, name, value, or both), font size, color, and outline |
| **Click actions** | Default filter target worksheets; the parameter to change on click, and which value is sent |
| **Display** | Show or hide status notifications (this also hides error messages) and the on-canvas legend |
| **Backup / transfer** | Copy or paste your full setup (see below) |

### Copy a setup to another worksheet or workbook

1. In the configured extension: **Settings → Copy Config → Copy to Clipboard**.
2. In the other Image Heatmap extension: **Settings → Paste Config**, paste the text, and click
   **Apply**.

This copies the image, all regions and shapes, opacity, canvas background, border, label,
no-data and click-action settings. **Applying replaces the current image and all regions.** It's
also a handy way to keep a backup of your setup.

---

## Keyboard and mouse reference

| Where | Action | Result |
|---|---|---|
| Drawing a polygon | Click / **Enter** / click first point | Add point / finish / finish |
| Drawing a polygon | **Backspace**, **Ctrl/Cmd+Z**, right-click | Remove last point |
| Drawing or editing | **Esc** | Cancel drawing / finish editing |
| Editing points | Drag point / drag shape | Move point / move shape |
| Editing points | Double-click shape / Alt+click point | Add point / remove point |
| Image or side panel | Click / **Ctrl/Cmd+click** a region | Select it / add or remove it from the selection |

---

## Troubleshooting

| What you see | What to check |
|---|---|
| Region shows the "no data" style | No data values are assigned (open ⚙ and add them), or none of them are in the current data. Look for dashed red chips in ⚙. |
| Region shows e.g. `2/3 matched` | One of its values isn't in the current data. It's shown with a dashed red outline in ⚙. |
| Clicking a region doesn't filter anything | Make sure target worksheets are set (in Settings or the region's ⚙ panel), use **Find sheets** to check the names, and confirm those sheets use the Region ID field. |
| **Find sheets** finds nothing | The other worksheets don't use the Region ID field's data source yet. You can still type sheet names. |
| The parameter doesn't change | For a list parameter, the value sent must be one of its allowed values. Set a custom value in the region's ⚙ panel if needed. |
| **+ Draw Region** is grayed out | Load an image first. |
| "Could not save" message | The uploaded image is likely too large to store in the workbook. Use **Load URL** or a smaller image. |
| Colors all look the same | The color steps don't fit your data's range. Open ⚙ and use one of the **Auto-space** buttons, or set step values manually. |
