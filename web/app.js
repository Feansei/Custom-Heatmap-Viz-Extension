'use strict';

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SETTINGS_KEY = 'appData';
  const NO_DATA_COLOR = '#cbcbcb';
  const AGG_FUNCS = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'COUNTD', 'MEDIAN'];
  const AGG_HINTS = {
    SUM: 'Total of the matched values.',
    AVG: 'Average of the matched values.',
    MIN: 'Smallest matched value.',
    MAX: 'Largest matched value.',
    COUNT: 'Number of matched values — or, if a field is on Row Count, the total of that field.',
    COUNTD: 'Number of distinct measure values among the matched values.',
    MEDIAN: 'Median of the matched values.'
  };
  const TOGGLE_MODES = ['clear', 'keep', 'all'];
  const LABEL_MODES = ['off', 'name', 'value', 'both'];
  const DEFAULT_TOOLTIP_TEMPLATE = '{name}\n{agg}: {value} ({matched}/{total} matched)';
  const TOOLTIP_TOKENS = [
    ['name', 'Region name'],
    ['agg', 'Aggregation'],
    ['value', 'Computed value'],
    ['matched', 'Values found in data'],
    ['total', 'Values assigned'],
    ['values', 'List of matched values'],
    ['missing', 'Assigned values not in data'],
    ['min', 'Lowest matched value'],
    ['max', 'Highest matched value'],
    ['sum', 'Sum of matched values'],
    ['avg', 'Average of matched values'],
    ['count', 'Number of matched values'],
    ['rowcount', 'Total of Row Count field'],
    ['field', 'Region ID field name'],
    ['measure', 'Value field name']
  ];
  const ELLIPSE_POINTS = 36;
  const SNAP_PX = 10;

  const ICONS = {
    gear: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>',
    lockClosed: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>',
    lockOpen: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.4-2.2"></path></svg>',
    pencil: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
    nodes: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6l14 2-3 11L6 17z"></path><rect x="3" y="4" width="4" height="4" fill="currentColor"></rect><rect x="17" y="6" width="4" height="4" fill="currentColor"></rect><rect x="14" y="17" width="4" height="4" fill="currentColor"></rect><rect x="4" y="15" width="4" height="4" fill="currentColor"></rect></svg>',
    trash: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>',
    close: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>',
    smooth: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c4-10 12-10 16-14"></path></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"></path><path d="M10.6 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-3.4 4.1M6.5 6.6C3.4 8.6 1 12 1 12s4 7 11 7a10.6 10.6 0 0 0 5-1.2"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    grip: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="9" cy="6" r="1.6"></circle><circle cx="15" cy="6" r="1.6"></circle><circle cx="9" cy="12" r="1.6"></circle><circle cx="15" cy="12" r="1.6"></circle><circle cx="9" cy="18" r="1.6"></circle><circle cx="15" cy="18" r="1.6"></circle></svg>',
    refresh: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"></path><path d="M20 4v7h-7"></path></svg>'
  };

  const state = {
    worksheet: null,
    imageSrc: null,
    imageSourceType: 'none',

    // A "group" (shown to users as a "region") is the data/config unit.
    groups: [],
    // A "shape" is a drawn polygon that points at a group. Multiple shapes can share a group.
    // { id, groupId, points:[{x,y}], smooth:boolean }
    shapes: [],

    dataMap: {},               // normalized key -> { raw, formatted, regionLabel, rowCount? }
    opacity: 0.65,
    locked: false,
    forceLocked: false,
    sidebarCollapsed: false,
    zoom: 1,
    theme: 'light',
    canvasBgColor: null,
    canvasBgImage: '',
    regionFieldName: null,
    valueFieldName: null,
    filterTargetSheets: '',     // global default target sheets
    showStatusNotifications: true,
    showLegend: true,

    // Region appearance
    borderColor: '#000000',
    borderWidth: 1.5,
    noDataStyle: 'hatch',
    noDataColor: NO_DATA_COLOR,

    // Labels
    labelMode: 'off',
    labelSize: 12,
    labelColor: '#1f1f1f',
    labelHalo: true,

    // Click actions
    knownSheets: [],            // worksheet names detected as filter-compatible
    paramName: '',              // parameter to change on click ('' = none)
    paramValueSource: 'name',   // 'name' | 'value'

    // Transient (not persisted)
    activeGroupIds: [],          // current click selection (ctrl/cmd+click adds)
    paramOriginal: undefined,    // parameter value before this extension changed it
    paramNames: [],              // parameter list fetched from Tableau
    hoverGroupId: null,
    searchText: '',

    mode: 'view',                  // 'view' | 'draw' | 'edit'
    drawTool: 'polygon',           // 'polygon' | 'rect' | 'ellipse'
    drawingPoints: [],
    dragStart: null,               // rect/ellipse drag origin
    cursorPt: null,                // polygon rubber-band preview
    editingShapeId: null,          // shape being redrawn
    editPointsShapeId: null,       // shape whose vertices are being edited
    drawTargetGroupId: null,       // set => finishing this draw adds a shape to this existing group
    configGroupId: null
  };

  let els = {};
  let saveTimer = null;
  let dataSeq = 0;
  let pointerDrag = null;          // active vertex/shape drag in edit mode
  let cardDrag = null;             // active sidebar reorder drag

  window.onload = function () {
    cacheEls();
    wireStaticUi();
    preventBrowserZoom();

    tableau.extensions.initializeAsync().then(
      () => {
        state.worksheet = tableau.extensions.worksheetContent.worksheet;
        loadSettings();
        applySettingsToUi();
        detectViewingMode();
        applyLockUi();
        applySidebarUi();
        applyTheme();
        applyCanvasBackground();
        setZoom(1);

        state.worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, onDataChanged);
        onDataChanged();
        refreshParameterList();

        renderImage();
        renderShapes();
      },
      (err) => setStatus('Failed to initialize extension: ' + err, true)
    );
  };

  // ---------- Prevent ctrl+scroll / pinch page zoom from resizing the extension ----------

  function preventBrowserZoom() {
    window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => { if (e.ctrlKey) e.preventDefault(); });
  }

  // ---------- Element caching ----------

  function cacheEls() {
    const ids = [
      'statusBar', 'fileInput', 'imageUrlInput', 'loadUrlBtn', 'clearImageBtn', 'addRegionBtn',
      'drawTools', 'toolPolygonBtn', 'toolRectBtn', 'toolEllipseBtn', 'undoPointBtn',
      'finishRegionBtn', 'cancelRegionBtn', 'doneEditBtn', 'settingsBtn', 'lockToggleBtn',
      'sidebarToggle', 'zoomRange', 'zoomInBtn', 'zoomOutBtn', 'zoomLabel', 'canvasArea',
      'imageWrap', 'emptyState', 'bgImage', 'overlay', 'labelLayer', 'handleLayer', 'drawHint',
      'namePrompt', 'regionNameInput', 'regionNameSave', 'regionNameCancel', 'tooltip', 'dataHint',
      'dataSummary', 'activeFilterHint', 'opacityRange', 'opacityLabel', 'regionList', 'regionCount',
      'regionSearchInput', 'clearSelectionBtn', 'configModal', 'configTitle', 'configBody',
      'configCloseBtn', 'settingsModal', 'settingsCloseBtn', 'themeLightBtn', 'themeDarkBtn',
      'canvasBgColorInput', 'canvasBgImageInput', 'canvasBgClearBtn', 'borderColorInput',
      'borderWidthInput', 'noDataStyleSelect', 'noDataColorInput', 'labelModeSelect',
      'labelSizeInput', 'labelColorInput', 'labelHaloToggle', 'defaultSheetsPicker', 'paramSelect',
      'paramRefreshBtn', 'paramValueSourceSelect', 'showStatusToggle', 'showAllRegionsBtn',
      'legendControl', 'legendTitle', 'legendGradient', 'legendMin', 'legendMax', 'showLegendToggle',
      'copyConfigBtn', 'pasteConfigBtn', 'transferModal', 'transferTitle', 'transferHint',
      'transferTextarea', 'transferCopyBtn', 'transferApplyBtn', 'transferCloseBtn',
      'confirmModal', 'confirmTitle', 'confirmMessage', 'confirmOkBtn', 'confirmCancelBtn'
    ];
    els = {};
    ids.forEach(id => { els[id] = document.getElementById(id); });
  }

  function wireStaticUi() {
    els.fileInput.addEventListener('change', onFileChosen);
    els.loadUrlBtn.addEventListener('click', onLoadUrl);
    els.imageUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') onLoadUrl(); });
    els.clearImageBtn.addEventListener('click', onClearImage);

    // Keeps the overlay layers' pixel size locked to the rendered image (see syncOverlaySize()).
    els.bgImage.addEventListener('load', () => { syncOverlaySize(); renderLabels(); });
    if (window.ResizeObserver) {
      new ResizeObserver(() => { syncOverlaySize(); renderLabels(); renderHandles(); }).observe(els.bgImage);
    } else {
      window.addEventListener('resize', () => { syncOverlaySize(); renderLabels(); renderHandles(); });
    }

    els.addRegionBtn.addEventListener('click', () => startDrawing(null));
    els.finishRegionBtn.addEventListener('click', finishDrawing);
    els.cancelRegionBtn.addEventListener('click', cancelDrawing);
    els.undoPointBtn.addEventListener('click', undoLastPoint);
    els.doneEditBtn.addEventListener('click', exitEditPoints);
    [els.toolPolygonBtn, els.toolRectBtn, els.toolEllipseBtn].forEach(btn => {
      btn.addEventListener('click', () => setDrawTool(btn.dataset.tool));
    });

    els.overlay.addEventListener('click', onOverlayClick);
    els.overlay.addEventListener('pointerdown', onOverlayPointerDown);
    els.overlay.addEventListener('mousemove', onOverlayMouseMove);
    els.overlay.addEventListener('mouseleave', () => { if (state.cursorPt) { state.cursorPt = null; updateRubberBand(); } });
    els.overlay.addEventListener('contextmenu', (e) => {
      if (state.mode === 'draw' && state.drawTool === 'polygon') { e.preventDefault(); undoLastPoint(); }
    });
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);

    els.regionNameSave.addEventListener('click', confirmNewGroupName);
    els.regionNameCancel.addEventListener('click', () => {
      hideNamePrompt();
      state.drawingPoints = [];
      exitDrawMode();
    });
    els.regionNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmNewGroupName();
      if (e.key === 'Escape') els.regionNameCancel.click();
    });

    els.opacityRange.addEventListener('input', () => {
      state.opacity = parseFloat(els.opacityRange.value);
      els.opacityLabel.textContent = Math.round(state.opacity * 100) + '%';
      renderOverlay();
      persist();
    });

    els.clearSelectionBtn.addEventListener('click', clearActiveFilterManually);

    els.lockToggleBtn.addEventListener('click', () => {
      state.locked = !state.locked;
      if (state.mode === 'draw') cancelDrawing();
      if (state.mode === 'edit') exitEditPoints();
      applyLockUi();
      persist();
    });

    els.sidebarToggle.addEventListener('click', () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      applySidebarUi();
      persist();
    });

    els.zoomRange.addEventListener('input', () => setZoom(parseFloat(els.zoomRange.value)));
    els.zoomInBtn.addEventListener('click', () => setZoom(state.zoom + 0.1));
    els.zoomOutBtn.addEventListener('click', () => setZoom(state.zoom - 0.1));

    els.settingsBtn.addEventListener('click', openSettings);
    els.settingsCloseBtn.addEventListener('click', () => els.settingsModal.classList.add('hidden'));
    els.themeLightBtn.addEventListener('click', () => setTheme('light'));
    els.themeDarkBtn.addEventListener('click', () => setTheme('dark'));

    els.canvasBgColorInput.addEventListener('input', () => {
      state.canvasBgColor = els.canvasBgColorInput.value;
      applyCanvasBackground();
      persist();
    });
    els.canvasBgImageInput.addEventListener('change', () => {
      state.canvasBgImage = els.canvasBgImageInput.value.trim();
      applyCanvasBackground();
      persist();
    });
    els.canvasBgClearBtn.addEventListener('click', () => {
      state.canvasBgColor = null;
      state.canvasBgImage = '';
      els.canvasBgImageInput.value = '';
      els.canvasBgColorInput.value = '#ebebeb';
      applyCanvasBackground();
      persist();
    });

    // Region appearance
    els.borderColorInput.addEventListener('input', () => { state.borderColor = els.borderColorInput.value; renderOverlay(); });
    els.borderColorInput.addEventListener('change', persist);
    els.borderWidthInput.addEventListener('change', () => {
      const v = parseFloat(els.borderWidthInput.value);
      state.borderWidth = isNaN(v) ? 1.5 : clamp(v, 0, 8);
      els.borderWidthInput.value = state.borderWidth;
      renderOverlay(); persist();
    });
    els.noDataStyleSelect.addEventListener('change', () => { state.noDataStyle = els.noDataStyleSelect.value; applyNoDataUi(); renderShapes(); persist(); });
    els.noDataColorInput.addEventListener('input', () => { state.noDataColor = els.noDataColorInput.value; renderShapes(); });
    els.noDataColorInput.addEventListener('change', persist);

    // Labels
    els.labelModeSelect.addEventListener('change', () => { state.labelMode = els.labelModeSelect.value; renderLabels(); persist(); });
    els.labelSizeInput.addEventListener('change', () => {
      const v = parseInt(els.labelSizeInput.value, 10);
      state.labelSize = isNaN(v) ? 12 : clamp(v, 8, 36);
      els.labelSizeInput.value = state.labelSize;
      renderLabels(); persist();
    });
    els.labelColorInput.addEventListener('input', () => { state.labelColor = els.labelColorInput.value; renderLabels(); });
    els.labelColorInput.addEventListener('change', persist);
    els.labelHaloToggle.addEventListener('change', () => { state.labelHalo = els.labelHaloToggle.checked; renderLabels(); persist(); });

    // Parameters
    els.paramSelect.addEventListener('change', async () => {
      await restoreParameter();
      state.paramName = els.paramSelect.value;
      state.paramOriginal = undefined;
      persist();
    });
    els.paramRefreshBtn.addEventListener('click', () => refreshParameterList(true));
    els.paramValueSourceSelect.addEventListener('change', () => { state.paramValueSource = els.paramValueSourceSelect.value; persist(); });

    els.showStatusToggle.addEventListener('change', () => {
      state.showStatusNotifications = els.showStatusToggle.checked;
      if (!state.showStatusNotifications) els.statusBar.classList.add('hidden');
      persist();
    });

    els.showAllRegionsBtn.addEventListener('click', () => {
      state.groups.forEach(g => { g.visible = true; });
      renderShapes();
      persist();
    });

    els.showLegendToggle.addEventListener('change', () => {
      state.showLegend = els.showLegendToggle.checked;
      renderLegend();
      persist();
    });

    els.regionSearchInput.addEventListener('input', () => {
      state.searchText = els.regionSearchInput.value.trim().toLowerCase();
      renderGroupList();
    });

    els.copyConfigBtn.addEventListener('click', openExportModal);
    els.pasteConfigBtn.addEventListener('click', openImportModal);
    els.transferCloseBtn.addEventListener('click', () => els.transferModal.classList.add('hidden'));
    els.transferCopyBtn.addEventListener('click', copyTransferTextToClipboard);
    els.transferApplyBtn.addEventListener('click', applyImportedConfig);

    els.configCloseBtn.addEventListener('click', closeConfigModal);

    document.addEventListener('keydown', onGlobalKeyDown);
  }

  function onGlobalKeyDown(e) {
    const tag = (e.target && e.target.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (e.key === 'Escape') {
      if (!els.confirmModal.classList.contains('hidden')) return; // handled by the dialog
      if (state.mode === 'draw') { cancelDrawing(); return; }
      if (state.mode === 'edit') { exitEditPoints(); return; }
    }
    if (typing) return;
    if (state.mode === 'draw' && state.drawTool === 'polygon') {
      if (e.key === 'Backspace' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        undoLastPoint();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        finishDrawing();
      }
    }
  }

  function applySettingsToUi() {
    els.opacityRange.value = state.opacity;
    els.opacityLabel.textContent = Math.round(state.opacity * 100) + '%';
    els.canvasBgColorInput.value = state.canvasBgColor || '#ebebeb';
    els.canvasBgImageInput.value = state.canvasBgImage || '';
    els.showStatusToggle.checked = state.showStatusNotifications;
    els.showLegendToggle.checked = state.showLegend;
    els.borderColorInput.value = state.borderColor;
    els.borderWidthInput.value = state.borderWidth;
    els.noDataStyleSelect.value = state.noDataStyle;
    els.noDataColorInput.value = state.noDataColor;
    els.labelModeSelect.value = state.labelMode;
    els.labelSizeInput.value = state.labelSize;
    els.labelColorInput.value = state.labelColor;
    els.labelHaloToggle.checked = state.labelHalo;
    els.paramValueSourceSelect.value = state.paramValueSource;
    applyNoDataUi();
    renderParamSelect();
    renderDefaultSheetsPicker();
  }

  function applyNoDataUi() {
    els.noDataColorInput.classList.toggle('hidden', state.noDataStyle !== 'solid');
  }

  function openSettings() {
    applySettingsToUi();
    els.settingsModal.classList.remove('hidden');
    refreshParameterList();
  }

  // ---------- In-app confirmation dialog ----------

  function confirmDialog(message, okLabel, title) {
    return new Promise((resolve) => {
      els.confirmTitle.textContent = title || 'Are you sure?';
      els.confirmMessage.textContent = message;
      els.confirmOkBtn.textContent = okLabel || 'Continue';
      els.confirmModal.classList.remove('hidden');
      const done = (result) => {
        els.confirmModal.classList.add('hidden');
        els.confirmOkBtn.removeEventListener('click', onOk);
        els.confirmCancelBtn.removeEventListener('click', onCancel);
        document.removeEventListener('keydown', onKey, true);
        resolve(result);
      };
      const onOk = () => done(true);
      const onCancel = () => done(false);
      const onKey = (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); done(false); }
        if (e.key === 'Enter') { e.preventDefault(); done(true); }
      };
      els.confirmOkBtn.addEventListener('click', onOk);
      els.confirmCancelBtn.addEventListener('click', onCancel);
      document.addEventListener('keydown', onKey, true);
      setTimeout(() => els.confirmOkBtn.focus(), 0);
    });
  }

  // ---------- Theme / settings ----------

  function setTheme(theme) {
    state.theme = theme;
    applyTheme();
    persist();
  }
  function applyTheme() {
    document.getElementById('app').setAttribute('data-theme', state.theme);
    els.themeLightBtn.classList.toggle('active', state.theme === 'light');
    els.themeDarkBtn.classList.toggle('active', state.theme === 'dark');
  }

  function applyCanvasBackground() {
    els.canvasArea.style.backgroundColor = state.canvasBgColor || '';
    if (state.canvasBgImage) {
      els.canvasArea.style.backgroundImage = `url("${state.canvasBgImage.replace(/"/g, '\\"')}")`;
      els.canvasArea.style.backgroundSize = 'cover';
      els.canvasArea.style.backgroundPosition = 'center';
      els.canvasArea.style.backgroundRepeat = 'no-repeat';
    } else {
      els.canvasArea.style.backgroundImage = '';
    }
  }

  function applySidebarUi() {
    const app = document.getElementById('app');
    app.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
    els.sidebarToggle.innerHTML = state.sidebarCollapsed ? ICONS.chevronLeft : ICONS.chevronRight;
    els.sidebarToggle.title = state.sidebarCollapsed ? 'Show panel' : 'Hide panel';
  }

  function setZoom(z) {
    state.zoom = clamp(Math.round(z * 100) / 100, 0.5, 3);
    els.imageWrap.style.transform = `scale(${state.zoom})`;
    els.imageWrap.style.setProperty('--zoom', state.zoom);
    els.zoomRange.value = state.zoom;
    els.zoomLabel.textContent = Math.round(state.zoom * 100) + '%';
  }

  function detectViewingMode() {
    // Tableau reports the mode once, at initialization.
    try {
      const mode = tableau.extensions.environment.mode;
      if (mode === tableau.ExtensionMode.Viewing) state.forceLocked = true;
    } catch (e) { /* not available in this context */ }
  }

  function applyLockUi() {
    const app = document.getElementById('app');
    const effectiveLocked = state.locked || state.forceLocked;
    app.classList.toggle('locked', effectiveLocked);
    app.classList.toggle('viewer', state.forceLocked);
    els.lockToggleBtn.innerHTML = effectiveLocked ? ICONS.lockOpen : ICONS.lockClosed;
    els.lockToggleBtn.title = effectiveLocked ? 'Show editing controls' : 'Hide editing controls (for dashboards)';
  }

  // ---------- Settings persistence ----------

  function loadSettings() {
    try {
      const raw = tableau.extensions.settings.get(SETTINGS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      applyPayload(data, true);
    } catch (e) {
      console.error('Could not read saved settings', e);
    }
  }

  // Applies a saved/imported payload to state. includeUiPrefs also restores per-viewer UI
  // preferences (theme, lock, collapsed panel, notifications, legend) that aren't transferred.
  function applyPayload(data, includeUiPrefs) {
    state.imageSrc = data.imageSrc || null;
    state.imageSourceType = data.imageSourceType || 'none';
    state.opacity = typeof data.opacity === 'number' ? data.opacity : 0.65;
    state.canvasBgColor = data.canvasBgColor || null;
    state.canvasBgImage = data.canvasBgImage || '';
    state.filterTargetSheets = data.filterTargetSheets || '';

    state.borderColor = isHex(data.borderColor) ? data.borderColor : '#000000';
    state.borderWidth = typeof data.borderWidth === 'number' ? clamp(data.borderWidth, 0, 8) : 1.5;
    state.noDataStyle = data.noDataStyle === 'solid' ? 'solid' : 'hatch';
    state.noDataColor = isHex(data.noDataColor) ? data.noDataColor : NO_DATA_COLOR;
    state.labelMode = LABEL_MODES.includes(data.labelMode) ? data.labelMode : 'off';
    state.labelSize = typeof data.labelSize === 'number' ? clamp(data.labelSize, 8, 36) : 12;
    state.labelColor = isHex(data.labelColor) ? data.labelColor : '#1f1f1f';
    state.labelHalo = typeof data.labelHalo === 'boolean' ? data.labelHalo : true;
    state.knownSheets = Array.isArray(data.knownSheets) ? data.knownSheets.filter(s => typeof s === 'string') : [];
    state.paramName = typeof data.paramName === 'string' ? data.paramName : '';
    state.paramValueSource = data.paramValueSource === 'value' ? 'value' : 'name';

    if (includeUiPrefs) {
      state.locked = !!data.locked;
      state.sidebarCollapsed = !!data.sidebarCollapsed;
      state.theme = data.theme === 'dark' ? 'dark' : 'light';
      state.showStatusNotifications = typeof data.showStatusNotifications === 'boolean' ? data.showStatusNotifications : true;
      state.showLegend = typeof data.showLegend === 'boolean' ? data.showLegend : true;
    }

    if (Array.isArray(data.groups) || Array.isArray(data.shapes)) {
      state.groups = (data.groups || []).map(normalizeGroup);
      state.shapes = (data.shapes || []).map(normalizeShape);
    } else if (Array.isArray(data.regions)) {
      // Migrate from the earlier one-shape-per-region format.
      state.groups = data.regions.map(r => normalizeGroup({
        id: r.id, name: r.name, matchValues: r.matchValues, aggregation: r.aggregation,
        palette: r.palette, tooltipTemplate: r.tooltipTemplate, targetSheets: '', toggleMode: 'clear'
      }));
      state.shapes = data.regions.map(r => normalizeShape({
        id: r.id + '_s1', groupId: r.id, points: r.points, smooth: r.smooth
      }));
    } else {
      state.groups = [];
      state.shapes = [];
    }
  }

  function isHex(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }

  function normalizeGroup(g) {
    return {
      id: g.id,
      name: g.name,
      matchValues: Array.isArray(g.matchValues) ? g.matchValues.slice() : [],
      aggregation: AGG_FUNCS.includes(g.aggregation) ? g.aggregation : 'AVG',
      palette: g.palette && Array.isArray(g.palette.steps) && g.palette.steps.length ? g.palette : defaultPalette(),
      tooltipTemplate: typeof g.tooltipTemplate === 'string' ? g.tooltipTemplate : DEFAULT_TOOLTIP_TEMPLATE,
      targetSheets: typeof g.targetSheets === 'string' ? g.targetSheets : '',
      toggleMode: TOGGLE_MODES.includes(g.toggleMode) ? g.toggleMode : 'clear',
      visible: typeof g.visible === 'boolean' ? g.visible : true,
      valuePrefix: typeof g.valuePrefix === 'string' ? g.valuePrefix : '',
      valueSuffix: typeof g.valueSuffix === 'string' ? g.valueSuffix : '',
      labelVisible: typeof g.labelVisible === 'boolean' ? g.labelVisible : true,
      opacity: typeof g.opacity === 'number' ? clamp(g.opacity, 0.05, 1) : null,
      paramValue: typeof g.paramValue === 'string' ? g.paramValue : ''
    };
  }
  function normalizeShape(s) {
    return { id: s.id, groupId: s.groupId, points: s.points || [], smooth: !!s.smooth };
  }
  function defaultPalette() {
    return { steps: [{ value: 0, color: '#2b6cb0' }, { value: 50, color: '#f7fafc' }, { value: 100, color: '#e53e3e' }] };
  }
  function newId(prefix) { return prefix + Date.now() + Math.floor(Math.random() * 1000); }

  function buildConfigPayload() {
    return {
      imageSrc: state.imageSrc,
      imageSourceType: state.imageSourceType,
      groups: state.groups,
      shapes: state.shapes,
      opacity: state.opacity,
      canvasBgColor: state.canvasBgColor,
      canvasBgImage: state.canvasBgImage,
      filterTargetSheets: state.filterTargetSheets,
      borderColor: state.borderColor,
      borderWidth: state.borderWidth,
      noDataStyle: state.noDataStyle,
      noDataColor: state.noDataColor,
      labelMode: state.labelMode,
      labelSize: state.labelSize,
      labelColor: state.labelColor,
      labelHalo: state.labelHalo,
      knownSheets: state.knownSheets,
      paramName: state.paramName,
      paramValueSource: state.paramValueSource
    };
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      // Settings can't be saved while a published view is being viewed, so don't try.
      if (state.forceLocked) return;
      const payload = Object.assign(buildConfigPayload(), {
        locked: state.locked,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        showStatusNotifications: state.showStatusNotifications,
        showLegend: state.showLegend
      });
      try {
        tableau.extensions.settings.set(SETTINGS_KEY, JSON.stringify(payload));
        await tableau.extensions.settings.saveAsync();
        setStatus('Saved to workbook', false);
      } catch (e) {
        const big = state.imageSourceType === 'embedded';
        setStatus('Could not save to the workbook' + (big ? ' — the uploaded image may be too large. Try "Load URL" or a smaller image.' : ': ' + errText(e)), true);
      }
    }, 350);
  }

  function errText(e) { return (e && (e.message || e.toString())) || String(e); }

  function setStatus(msg, isError) {
    if (!state.showStatusNotifications) return;
    els.statusBar.textContent = msg;
    els.statusBar.classList.remove('hidden', 'ok');
    if (!isError) els.statusBar.classList.add('ok');
    clearTimeout(setStatus._t);
    setStatus._t = setTimeout(() => els.statusBar.classList.add('hidden'), isError ? 6000 : 2000);
  }

  // ---------- Copy / paste configuration ----------

  function openExportModal() {
    els.settingsModal.classList.add('hidden');
    els.transferTitle.textContent = 'Copy Configuration';
    els.transferHint.textContent = 'Copy this text and paste it into another instance of this extension (via Paste Config) to bring over the same image, regions, and settings.';
    els.transferTextarea.value = JSON.stringify(buildConfigPayload());
    els.transferTextarea.readOnly = true;
    els.transferCopyBtn.classList.remove('hidden');
    els.transferApplyBtn.classList.add('hidden');
    els.transferModal.classList.remove('hidden');
    els.transferTextarea.focus();
    els.transferTextarea.select();
  }

  function openImportModal() {
    els.settingsModal.classList.add('hidden');
    els.transferTitle.textContent = 'Paste Configuration';
    els.transferHint.textContent = 'Paste a configuration copied from another instance of this extension, then click Apply. This replaces the current image and all regions.';
    els.transferTextarea.value = '';
    els.transferTextarea.readOnly = false;
    els.transferCopyBtn.classList.add('hidden');
    els.transferApplyBtn.classList.remove('hidden');
    els.transferModal.classList.remove('hidden');
    els.transferTextarea.focus();
  }

  async function copyTransferTextToClipboard() {
    try {
      await navigator.clipboard.writeText(els.transferTextarea.value);
      setStatus('Copied to clipboard.', false);
    } catch (e) {
      els.transferTextarea.select();
      setStatus('Could not access the clipboard automatically — text is selected, use Ctrl/Cmd+C.', true);
    }
  }

  async function applyImportedConfig() {
    let data;
    try {
      data = JSON.parse(els.transferTextarea.value);
    } catch (e) {
      setStatus('That text is not valid configuration JSON.', true);
      return;
    }
    if (!data || (!Array.isArray(data.groups) && !Array.isArray(data.shapes))) {
      setStatus('That configuration is missing regions/shapes data.', true);
      return;
    }
    const ok = await confirmDialog('This replaces the current image and all regions with the pasted configuration.', 'Replace', 'Apply configuration?');
    if (!ok) return;

    await clearSelectionState();
    applyPayload(data, false);
    applySettingsToUi();
    applyCanvasBackground();
    renderImage();
    renderShapes();
    els.transferModal.classList.add('hidden');
    persist();
    setStatus('Configuration applied.', false);
  }

  // ---------- Image loading ----------

  function onFileChosen(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.imageSrc = reader.result;
      state.imageSourceType = 'embedded';
      renderImage();
      persist();
    };
    reader.onerror = () => setStatus('Could not read that image file.', true);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function onLoadUrl() {
    const url = els.imageUrlInput.value.trim();
    if (!url) return;
    state.imageSrc = url;
    state.imageSourceType = 'url';
    renderImage();
    persist();
  }

  async function onClearImage() {
    if (state.shapes.length) {
      const ok = await confirmDialog('Existing regions will remain but will have nothing to sit on until you load a new image.', 'Clear Image', 'Clear the image?');
      if (!ok) return;
    }
    state.imageSrc = null;
    state.imageSourceType = 'none';
    renderImage();
    persist();
  }

  function renderImage() {
    if (state.imageSrc) {
      els.bgImage.src = state.imageSrc;
      els.bgImage.classList.remove('hidden');
      els.emptyState.classList.add('hidden');
      els.addRegionBtn.disabled = false;
    } else {
      els.bgImage.removeAttribute('src');
      els.bgImage.classList.add('hidden');
      els.emptyState.classList.remove('hidden');
      els.addRegionBtn.disabled = true;
    }
    syncOverlaySize();
  }

  // Keeps the SVG overlay and the HTML label/handle layers locked to the rendered <img> size.
  function syncOverlaySize() {
    const layers = [els.overlay, els.labelLayer, els.handleLayer];
    if (!state.imageSrc || !els.bgImage.clientWidth || !els.bgImage.clientHeight) {
      layers.forEach(l => { l.style.width = ''; l.style.height = ''; });
      return;
    }
    layers.forEach(l => {
      l.style.width = els.bgImage.clientWidth + 'px';
      l.style.height = els.bgImage.clientHeight + 'px';
    });
  }

  // ---------- Geometry helpers ----------

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Converts a pointer event to overlay percentage coordinates (0–100).
  function eventToPct(e) {
    const rect = els.overlay.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100)
    };
  }
  // Distance in on-screen pixels between two percentage points.
  function pxDistance(a, b) {
    const rect = els.overlay.getBoundingClientRect();
    const dx = (a.x - b.x) / 100 * rect.width, dy = (a.y - b.y) / 100 * rect.height;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function rectPoints(a, b) {
    const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x), y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
    return [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }];
  }
  function ellipsePoints(a, b) {
    const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, rx = Math.abs(b.x - a.x) / 2, ry = Math.abs(b.y - a.y) / 2;
    const pts = [];
    for (let i = 0; i < ELLIPSE_POINTS; i++) {
      const t = (i / ELLIPSE_POINTS) * Math.PI * 2;
      pts.push({ x: round3(cx + rx * Math.cos(t)), y: round3(cy + ry * Math.sin(t)) });
    }
    return pts;
  }
  function round3(v) { return Math.round(v * 1000) / 1000; }

  // Area-weighted centroid, computed in pixel space so non-square images are handled correctly.
  function shapeCentroid(points) {
    const rect = els.overlay.getBoundingClientRect();
    const w = rect.width || 100, h = rect.height || 100;
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, n = points.length; i < n; i++) {
      const p = points[i], q = points[(i + 1) % n];
      const px = p.x * w, py = p.y * h, qx = q.x * w, qy = q.y * h;
      const f = px * qy - qx * py;
      a += f; cx += (px + qx) * f; cy += (py + qy) * f;
    }
    if (Math.abs(a) < 1e-6) {
      const avg = points.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
      return { x: avg.x / points.length, y: avg.y / points.length };
    }
    a *= 0.5;
    return { x: (cx / (6 * a)) / w, y: (cy / (6 * a)) / h };
  }

  // Index of the edge closest to point p (pixel space); the new point is inserted after it.
  function nearestEdgeIndex(points, p) {
    const rect = els.overlay.getBoundingClientRect();
    const w = rect.width || 100, h = rect.height || 100;
    let best = 0, bestD = Infinity;
    for (let i = 0, n = points.length; i < n; i++) {
      const a = points[i], b = points[(i + 1) % n];
      const ax = a.x * w, ay = a.y * h, bx = b.x * w, by = b.y * h, px = p.x * w, py = p.y * h;
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
      const ex = ax + t * dx - px, ey = ay + t * dy - py;
      const d = ex * ex + ey * ey;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  // ---------- Drawing shapes ----------

  function setDrawTool(tool) {
    state.drawTool = tool;
    state.drawingPoints = [];
    state.dragStart = null;
    [els.toolPolygonBtn, els.toolRectBtn, els.toolEllipseBtn].forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    updateDrawChrome();
    renderOverlay();
  }

  function enterDrawMode() {
    if (state.mode === 'edit') exitEditPoints();
    state.mode = 'draw';
    state.drawingPoints = [];
    state.dragStart = null;
    hideCustomTooltip();
    els.overlay.classList.add('drawing');
    els.addRegionBtn.classList.add('hidden');
    els.drawTools.classList.remove('hidden');
    els.finishRegionBtn.classList.remove('hidden');
    els.cancelRegionBtn.classList.remove('hidden');
    els.drawHint.classList.remove('hidden');
    updateDrawChrome();
    renderShapes();
  }

  function updateDrawChrome() {
    const poly = state.drawTool === 'polygon';
    els.undoPointBtn.classList.toggle('hidden', !(state.mode === 'draw' && poly));
    els.undoPointBtn.disabled = !state.drawingPoints.length;
    els.finishRegionBtn.classList.toggle('hidden', !(state.mode === 'draw' && poly));
    els.finishRegionBtn.disabled = state.drawingPoints.length < 3;
    if (state.mode === 'draw') {
      els.drawHint.innerHTML = poly
        ? 'Click to place points (at least 3). Click the <strong>first point</strong> or press <strong>Enter</strong> to finish. <strong>Backspace</strong> or right-click removes the last point.'
        : `Click and drag on the image to draw a ${state.drawTool === 'rect' ? 'rectangle' : 'ellipse'}.`;
    } else if (state.mode === 'edit') {
      els.drawHint.innerHTML = 'Drag a point to move it. Drag the shape to move all of it. <strong>Double-click</strong> the shape to add a point, <strong>Alt+click</strong> or double-click a point to remove it.';
    }
  }

  function startDrawing(targetGroupId) {
    if (!state.imageSrc) return;
    state.editingShapeId = null;
    state.drawTargetGroupId = targetGroupId || null;
    enterDrawMode();
  }

  function redrawShape(shapeId) {
    if (!state.imageSrc) return;
    state.editingShapeId = shapeId;
    state.drawTargetGroupId = null;
    enterDrawMode();
  }

  function exitDrawMode() {
    state.mode = 'view';
    state.drawTargetGroupId = null;
    state.dragStart = null;
    state.cursorPt = null;
    els.overlay.classList.remove('drawing');
    els.addRegionBtn.classList.remove('hidden');
    els.drawTools.classList.add('hidden');
    els.undoPointBtn.classList.add('hidden');
    els.finishRegionBtn.classList.add('hidden');
    els.cancelRegionBtn.classList.add('hidden');
    els.drawHint.classList.add('hidden');
    renderShapes();
  }

  function cancelDrawing() {
    state.drawingPoints = [];
    state.editingShapeId = null;
    exitDrawMode();
  }

  function undoLastPoint() {
    if (state.mode !== 'draw' || !state.drawingPoints.length) return;
    state.drawingPoints.pop();
    updateDrawChrome();
    renderOverlay();
  }

  function onOverlayClick(e) {
    if (state.mode !== 'draw' || state.drawTool !== 'polygon') return;
    const p = eventToPct(e);
    // Clicking near the first point closes the shape.
    if (state.drawingPoints.length >= 3 && pxDistance(p, state.drawingPoints[0]) <= SNAP_PX) {
      finishDrawing();
      return;
    }
    state.drawingPoints.push(p);
    updateDrawChrome();
    renderOverlay();
  }

  function onOverlayMouseMove(e) {
    if (state.mode === 'draw' && state.drawTool === 'polygon' && state.drawingPoints.length) {
      state.cursorPt = eventToPct(e);
      updateRubberBand();
    }
  }

  function onOverlayPointerDown(e) {
    if (e.button !== 0) return;
    if (state.mode === 'draw' && state.drawTool !== 'polygon') {
      e.preventDefault();
      state.dragStart = eventToPct(e);
      state.drawingPoints = [];
      pointerDrag = { kind: 'shapeDraw' };
    }
  }

  function onWindowPointerMove(e) {
    if (cardDrag) { onCardDragMove(e); return; }
    if (!pointerDrag) return;
    const p = eventToPct(e);
    if (pointerDrag.kind === 'shapeDraw') {
      state.drawingPoints = state.drawTool === 'rect' ? rectPoints(state.dragStart, p) : ellipsePoints(state.dragStart, p);
      renderOverlay();
      return;
    }
    const shape = state.shapes.find(s => s.id === state.editPointsShapeId);
    if (!shape) return;
    pointerDrag.moved = true;
    if (pointerDrag.kind === 'vertex') {
      shape.points[pointerDrag.index] = { x: round3(p.x), y: round3(p.y) };
    } else if (pointerDrag.kind === 'move') {
      const dx = p.x - pointerDrag.start.x, dy = p.y - pointerDrag.start.y;
      // Keep the whole shape inside the image.
      const xs = pointerDrag.orig.map(q => q.x), ys = pointerDrag.orig.map(q => q.y);
      const cdx = clamp(dx, -Math.min(...xs), 100 - Math.max(...xs));
      const cdy = clamp(dy, -Math.min(...ys), 100 - Math.max(...ys));
      shape.points = pointerDrag.orig.map(q => ({ x: round3(q.x + cdx), y: round3(q.y + cdy) }));
    }
    renderOverlay();
  }

  function onWindowPointerUp(e) {
    if (cardDrag) { onCardDragEnd(); return; }
    if (!pointerDrag) return;
    const drag = pointerDrag;
    pointerDrag = null;
    if (drag.kind === 'shapeDraw') {
      const p = eventToPct(e);
      const tiny = pxDistance(state.dragStart, p) < 6 ||
        Math.abs(p.x - state.dragStart.x) < 0.3 || Math.abs(p.y - state.dragStart.y) < 0.3;
      if (tiny) {
        state.drawingPoints = [];
        state.dragStart = null;
        renderOverlay();
        setStatus('Click and drag to draw the shape.', true);
        return;
      }
      state.drawingPoints = state.drawTool === 'rect' ? rectPoints(state.dragStart, p) : ellipsePoints(state.dragStart, p);
      state.dragStart = null;
      finishDrawing();
      return;
    }
    if (drag.moved) persist();
  }

  function finishDrawing() {
    if (state.drawingPoints.length < 3) {
      setStatus('Add at least 3 points before finishing the shape.', true);
      return;
    }
    if (state.editingShapeId) {
      const shape = state.shapes.find(s => s.id === state.editingShapeId);
      if (shape) {
        shape.points = state.drawingPoints.slice();
        state.drawingPoints = [];
        state.editingShapeId = null;
        exitDrawMode();
        persist();
        return;
      }
    }
    if (state.drawTargetGroupId) {
      const group = state.groups.find(g => g.id === state.drawTargetGroupId);
      state.shapes.push({ id: newId('sh'), groupId: state.drawTargetGroupId, points: state.drawingPoints.slice(), smooth: false });
      state.drawingPoints = [];
      exitDrawMode();
      persist();
      setStatus(group ? `Shape added to "${group.name}".` : 'Shape added.', false);
      return;
    }
    showNamePrompt();
  }

  function showNamePrompt() {
    els.regionNameInput.value = '';
    els.namePrompt.classList.remove('hidden');
    setTimeout(() => els.regionNameInput.focus(), 0);
  }
  function hideNamePrompt() { els.namePrompt.classList.add('hidden'); }

  function confirmNewGroupName() {
    const name = els.regionNameInput.value.trim();
    if (!name) { els.regionNameInput.focus(); return; }
    const groupId = newId('g');
    state.groups.push(normalizeGroup({ id: groupId, name: name }));
    state.shapes.push({ id: newId('sh'), groupId: groupId, points: state.drawingPoints.slice(), smooth: false });
    state.drawingPoints = [];
    hideNamePrompt();
    exitDrawMode();
    persist();
    setStatus('Region created — open ⚙ to assign data values.', false);
  }

  // ---------- Editing points of an existing shape ----------

  function startEditPoints(shapeId) {
    if (state.mode === 'draw') cancelDrawing();
    const shape = state.shapes.find(s => s.id === shapeId);
    if (!shape) return;
    const group = state.groups.find(g => g.id === shape.groupId);
    if (group && !group.visible) group.visible = true;
    state.mode = 'edit';
    state.editPointsShapeId = shapeId;
    hideCustomTooltip();
    els.addRegionBtn.classList.add('hidden');
    els.doneEditBtn.classList.remove('hidden');
    els.drawHint.classList.remove('hidden');
    updateDrawChrome();
    renderShapes();
  }

  function exitEditPoints() {
    if (state.mode !== 'edit') return;
    state.mode = 'view';
    state.editPointsShapeId = null;
    pointerDrag = null;
    els.addRegionBtn.classList.remove('hidden');
    els.doneEditBtn.classList.add('hidden');
    els.drawHint.classList.add('hidden');
    renderShapes();
    persist();
  }

  function removeVertex(shape, index) {
    if (shape.points.length <= 3) { setStatus('A shape needs at least 3 points.', true); return; }
    shape.points.splice(index, 1);
    renderOverlay();
    persist();
  }

  // ---------- Sidebar: group list with nested shapes ----------

  function groupMatchesSearch(group) {
    if (!state.searchText) return true;
    const q = state.searchText;
    return group.name.toLowerCase().includes(q) || group.matchValues.some(v => v.toLowerCase().includes(q));
  }

  function renderGroupList() {
    els.regionCount.textContent = state.groups.length ? `(${state.groups.length})` : '';
    els.showAllRegionsBtn.classList.toggle('hidden', !state.groups.some(g => !g.visible));
    if (!state.groups.length) {
      els.regionList.innerHTML = '<p class="hint">No regions yet. Draw one on the image.</p>';
      return;
    }
    els.regionList.innerHTML = '';
    const searching = !!state.searchText;
    const visibleGroups = state.groups.filter(groupMatchesSearch);
    if (!visibleGroups.length) {
      els.regionList.innerHTML = '<p class="hint">No regions match your search.</p>';
      return;
    }

    visibleGroups.forEach((group) => {
      const val = getGroupValue(group);
      const color = val ? colorForPaletteValue(val.raw, group.palette.steps) : noDataSwatch();
      const isActive = state.activeGroupIds.includes(group.id);
      const memberShapes = state.shapes.filter(s => s.groupId === group.id);

      const card = document.createElement('div');
      card.className = 'group-card' + (isActive ? ' active-filter' : '');
      card.dataset.groupId = group.id;

      const row = document.createElement('div');
      row.className = 'region-row' + (isActive ? ' selected' : '') + (group.visible ? '' : ' dim');
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-pressed', String(isActive));

      if (!searching) {
        const grip = document.createElement('span');
        grip.className = 'drag-grip';
        grip.title = 'Drag to reorder (regions lower in the list are drawn on top)';
        grip.innerHTML = ICONS.grip;
        grip.addEventListener('click', (e) => e.stopPropagation());
        grip.addEventListener('pointerdown', (e) => onCardDragStart(e, card, group.id));
        row.appendChild(grip);
      }

      const swatch = document.createElement('div');
      swatch.className = 'region-swatch';
      swatch.style.background = color;

      const info = document.createElement('div');
      info.className = 'region-info';

      const nameInput = document.createElement('input');
      nameInput.className = 'region-name-input';
      nameInput.value = group.name;
      nameInput.setAttribute('aria-label', 'Region name');
      nameInput.addEventListener('click', (e) => e.stopPropagation());
      nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') nameInput.blur(); });
      nameInput.addEventListener('change', () => {
        group.name = nameInput.value.trim() || group.name;
        renderShapes();
        persist();
      });

      const valueLabel = document.createElement('div');
      valueLabel.className = 'region-value';
      valueLabel.textContent = val
        ? `${val.aggregation}: ${val.formatted} (${val.matchedCount}/${val.totalCount} matched)`
        : (group.matchValues.length ? 'No matching data' : 'No values assigned');

      info.appendChild(nameInput);
      info.appendChild(valueLabel);

      const actions = document.createElement('div');
      actions.className = 'region-actions';
      const visBtn = iconBtn(group.visible ? 'eye' : 'eyeOff', group.visible ? 'Hide this region on the image' : 'Show this region on the image', () => {
        group.visible = !group.visible;
        renderShapes();
        persist();
      });
      if (!group.visible) visBtn.classList.add('toggle-on');
      actions.appendChild(visBtn);
      actions.appendChild(iconBtn('gear', 'Data values, colors, click actions & tooltip', () => openConfigModal(group.id)));
      actions.appendChild(iconBtn('copy', 'Duplicate this region\'s settings (as a new, shapeless region)', () => duplicateGroup(group.id)));
      actions.appendChild(iconBtn('trash', 'Delete region (and all its shapes)', () => deleteGroup(group.id), true));

      row.appendChild(swatch);
      row.appendChild(info);
      row.appendChild(actions);
      row.addEventListener('click', (e) => handleGroupClick(group.id, e.ctrlKey || e.metaKey));
      row.addEventListener('keydown', (e) => {
        if (e.target !== row) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGroupClick(group.id, e.ctrlKey || e.metaKey); }
      });
      row.addEventListener('mouseenter', () => highlightGroup(group.id, true));
      row.addEventListener('mouseleave', () => highlightGroup(group.id, false));
      card.appendChild(row);

      const shapeList = document.createElement('div');
      shapeList.className = 'shape-list';
      memberShapes.forEach((shape, idx) => {
        const sRow = document.createElement('div');
        sRow.className = 'shape-row' + (state.editPointsShapeId === shape.id ? ' editing' : '');
        const label = document.createElement('span');
        label.className = 'shape-label';
        label.textContent = `Shape ${idx + 1}`;
        sRow.appendChild(label);

        const smoothBtn = iconBtn('smooth', 'Smooth corners', () => {
          shape.smooth = !shape.smooth;
          renderShapes();
          persist();
        });
        if (shape.smooth) smoothBtn.classList.add('toggle-on');
        sRow.appendChild(smoothBtn);

        const editBtn = iconBtn('nodes', 'Edit points (drag, add, remove)', () => {
          if (state.editPointsShapeId === shape.id) exitEditPoints(); else startEditPoints(shape.id);
        });
        if (state.editPointsShapeId === shape.id) editBtn.classList.add('toggle-on');
        editBtn.disabled = !state.imageSrc;
        sRow.appendChild(editBtn);
        sRow.appendChild(iconBtn('pencil', 'Redraw this shape from scratch', () => redrawShape(shape.id)));
        sRow.appendChild(iconBtn('trash', 'Delete this shape', () => deleteShape(shape.id), true));
        shapeList.appendChild(sRow);
      });
      card.appendChild(shapeList);

      const addRow = document.createElement('div');
      addRow.className = 'add-shape-row';
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-subtle';
      addBtn.textContent = '+ Add Shape to This Region';
      addBtn.disabled = !state.imageSrc;
      addBtn.addEventListener('click', () => startDrawing(group.id));
      addRow.appendChild(addBtn);
      card.appendChild(addRow);

      els.regionList.appendChild(card);
    });
  }

  // Pointer-based drag-to-reorder for region cards.
  function onCardDragStart(e, card, groupId) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    cardDrag = { card, groupId };
    card.classList.add('dragging');
    document.body.classList.add('reordering');
  }
  function onCardDragMove(e) {
    const cards = Array.from(els.regionList.querySelectorAll('.group-card')).filter(c => c !== cardDrag.card);
    let before = null;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) { before = c; break; }
    }
    if (before) els.regionList.insertBefore(cardDrag.card, before);
    else els.regionList.appendChild(cardDrag.card);
  }
  function onCardDragEnd() {
    const order = Array.from(els.regionList.querySelectorAll('.group-card')).map(c => c.dataset.groupId);
    cardDrag.card.classList.remove('dragging');
    document.body.classList.remove('reordering');
    cardDrag = null;
    const byId = {};
    state.groups.forEach(g => { byId[g.id] = g; });
    const reordered = order.map(id => byId[id]).filter(Boolean);
    if (reordered.length === state.groups.length) state.groups = reordered;
    renderShapes();
    persist();
  }

  function iconBtn(iconName, title, onClick, danger) {
    const btn = document.createElement('button');
    btn.className = 'icon-btn' + (danger ? ' danger' : '');
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.innerHTML = ICONS[iconName] || '';
    btn.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return btn;
  }

  function highlightGroup(groupId, on) {
    state.shapes.filter(s => s.groupId === groupId).forEach(s => {
      const el = els.overlay.querySelector(`[data-shape-id="${s.id}"]`);
      if (el) el.classList.toggle('hl', on);
    });
  }

  async function deleteGroup(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    const ok = await confirmDialog(`"${group.name}" and all of its shapes will be removed.`, 'Delete', 'Delete region?');
    if (!ok) return;
    if (state.activeGroupIds.includes(groupId)) await deselectGroup(groupId);
    if (state.editPointsShapeId && state.shapes.some(s => s.id === state.editPointsShapeId && s.groupId === groupId)) exitEditPoints();
    state.groups = state.groups.filter(g => g.id !== groupId);
    state.shapes = state.shapes.filter(s => s.groupId !== groupId);
    renderShapes();
    persist();
  }

  function duplicateGroup(groupId) {
    const source = state.groups.find(g => g.id === groupId);
    if (!source) return;
    // Copies configuration but not matched values, shapes, or parameter value — those
    // usually differ between otherwise-identical regions.
    const clone = normalizeGroup({
      id: newId('g'),
      name: source.name + ' Copy',
      matchValues: [],
      aggregation: source.aggregation,
      palette: JSON.parse(JSON.stringify(source.palette)),
      tooltipTemplate: source.tooltipTemplate,
      targetSheets: source.targetSheets,
      toggleMode: source.toggleMode,
      visible: true,
      valuePrefix: source.valuePrefix,
      valueSuffix: source.valueSuffix,
      labelVisible: source.labelVisible,
      opacity: source.opacity
    });
    const idx = state.groups.indexOf(source);
    state.groups.splice(idx + 1, 0, clone);
    renderShapes();
    persist();
    setStatus(`Duplicated "${source.name}" as "${clone.name}" — draw a shape and add data values for it.`, false);
  }

  async function deleteShape(shapeId) {
    const shape = state.shapes.find(s => s.id === shapeId);
    if (!shape) return;
    const groupId = shape.groupId;
    const remaining = state.shapes.filter(s => s.groupId === groupId && s.id !== shapeId).length;
    if (remaining === 0) {
      const group = state.groups.find(g => g.id === groupId);
      const ok = await confirmDialog(`This is the last shape in "${group ? group.name : 'this region'}", so the region will be deleted too.`, 'Delete', 'Delete shape?');
      if (!ok) return;
    }
    if (state.editPointsShapeId === shapeId) exitEditPoints();
    state.shapes = state.shapes.filter(s => s.id !== shapeId);
    if (remaining === 0) {
      if (state.activeGroupIds.includes(groupId)) await deselectGroup(groupId);
      state.groups = state.groups.filter(g => g.id !== groupId);
    }
    renderShapes();
    persist();
  }

  // ---------- Click actions: filter + parameter, with ctrl/cmd+click multi-select ----------

  function handleGroupClick(groupId, additive) {
    if (state.mode !== 'view') return;
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    const current = state.activeGroupIds.slice();

    if (additive) {
      if (current.includes(groupId)) {
        deselectGroup(groupId);
      } else {
        applySelection(current.concat(groupId), group);
      }
      return;
    }
    if (current.length === 1 && current[0] === groupId) {
      toggleOffGroup(group);
    } else {
      applySelection([groupId], group);
    }
  }

  async function deselectGroup(groupId) {
    const rest = state.activeGroupIds.filter(id => id !== groupId);
    if (!rest.length) {
      await clearSelectionState();
      renderShapes();
      return;
    }
    const lastGroup = state.groups.find(g => g.id === rest[rest.length - 1]);
    await applySelection(rest, lastGroup);
  }

  function parseSheetList(csv) {
    return (csv || '').split(',').map(s => s.trim()).filter(Boolean);
  }
  function getGroupTargetSheets(group) {
    const own = parseSheetList(group.targetSheets);
    return own.length ? own : parseSheetList(state.filterTargetSheets);
  }

  function groupFilterValues(group) {
    const val = getGroupValue(group);
    if (!val) return [];
    return val.tuples.map(t => t.regionLabel).filter(Boolean);
  }

  async function applySelection(groupIds, clickedGroup) {
    const groups = groupIds.map(id => state.groups.find(g => g.id === id)).filter(Boolean);
    if (!groups.length) { await clearSelectionState(); renderShapes(); return; }

    const targets = Array.from(new Set(groups.flatMap(getGroupTargetSheets)));
    const hasParam = !!state.paramName;
    if (!targets.length && !hasParam) {
      setStatus(`"${clickedGroup.name}" has nothing to do on click — set target worksheets (in its ⚙ panel or Settings) or a parameter in Settings.`, true);
      return;
    }

    const messages = [];
    let anySuccess = false;

    if (targets.length) {
      if (!state.regionFieldName) {
        setStatus('No Region ID field is set on the Marks card yet.', true);
        return;
      }
      const values = Array.from(new Set(groups.flatMap(groupFilterValues)));
      if (!values.length) {
        setStatus(groups.length > 1 ? 'None of the selected regions have matching data to filter on.' : `"${clickedGroup.name}" has no matching data to filter on.`, true);
        if (!hasParam) return;
        await releaseActiveFilter();
      } else {
        const ok = await applyCategoricalFilter(values, targets);
        if (!ok) return;
        anySuccess = true;
        messages.push(`filtering ${targets.join(', ')}`);
      }
    } else {
      // Switching to a region with no target sheets: release any filter that was applied.
      await releaseActiveFilter();
    }

    if (hasParam) {
      const pv = await setParameterForGroup(clickedGroup);
      if (pv != null) { anySuccess = true; messages.push(`${state.paramName} = ${pv}`); }
    }

    if (anySuccess) {
      state.activeGroupIds = groups.map(g => g.id);
      renderShapes();
      const who = groups.length > 1 ? `${groups.length} regions` : `"${groups[0].name}"`;
      setStatus(`${who}: ${messages.join(' · ')}.`, false);
    }
  }

  // Applies a categorical filter on the Region ID field to the target sheets only.
  async function applyCategoricalFilter(values, targetSheets) {
    try {
      // applyFilterAsync necessarily targets this worksheet first; immediately retarget to only
      // the intended sheets (excluding this one) so the extension's own view stays unfiltered.
      await state.worksheet.applyFilterAsync(state.regionFieldName, values, tableau.FilterUpdateType.Replace, { isExcludeMode: false });
      const catFilter = await findRegionFilter();
      if (catFilter && typeof catFilter.setAppliedWorksheetsAsync === 'function') {
        await catFilter.setAppliedWorksheetsAsync(targetSheets);
        return true;
      }
      await state.worksheet.clearFilterAsync(state.regionFieldName);
      setStatus("Couldn't retarget the filter to other sheets, so it wasn't applied.", true);
      return false;
    } catch (e) {
      try { await state.worksheet.clearFilterAsync(state.regionFieldName); } catch (e2) { /* ignore */ }
      const msg = errText(e);
      const bad = targetSheets.filter(s => state.knownSheets.length && !state.knownSheets.includes(s));
      setStatus('Could not apply filter: ' + msg + (bad.length ? ` (check sheet name${bad.length > 1 ? 's' : ''}: ${bad.join(', ')})` : ''), true);
      return false;
    }
  }

  async function findRegionFilter() {
    const filters = await state.worksheet.getFiltersAsync();
    return filters.find(f => f.fieldName === state.regionFieldName) || null;
  }

  async function toggleOffGroup(group) {
    const targetSheets = getGroupTargetSheets(group);
    try {
      if (group.toggleMode === 'keep') {
        setStatus(`"${group.name}" kept as-is.`, false);
        return;
      }
      if (group.toggleMode === 'all') {
        if (state.regionFieldName && targetSheets.length) {
          await state.worksheet.applyFilterAsync(state.regionFieldName, [], tableau.FilterUpdateType.All, { isExcludeMode: false });
          const catFilter = await findRegionFilter();
          if (catFilter && typeof catFilter.setAppliedWorksheetsAsync === 'function') {
            await catFilter.setAppliedWorksheetsAsync(targetSheets);
          }
        }
        await restoreParameter();
        state.activeGroupIds = [];
        renderShapes();
        setStatus(`"${group.name}": showing all values on ${targetSheets.join(', ') || 'target sheets'}.`, false);
        return;
      }
      // 'clear' (default): release the filter and restore the parameter.
      await clearSelectionState();
      renderShapes();
      setStatus(`"${group.name}" cleared.`, false);
    } catch (e) {
      setStatus('Could not update filter: ' + errText(e), true);
    }
  }

  async function releaseActiveFilter() {
    if (!state.regionFieldName) return;
    try {
      const catFilter = await findRegionFilter();
      if (!catFilter) return;
      if (typeof catFilter.setAppliedWorksheetsAsync === 'function') {
        try { await catFilter.setAppliedWorksheetsAsync([]); } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
    try { await state.worksheet.clearFilterAsync(state.regionFieldName); } catch (e) { /* ignore */ }
  }

  async function clearSelectionState() {
    if (state.activeGroupIds.length) await releaseActiveFilter();
    await restoreParameter();
    state.activeGroupIds = [];
  }

  async function clearActiveFilterManually() {
    await releaseActiveFilter();
    await restoreParameter();
    state.activeGroupIds = [];
    renderShapes();
    try { await state.worksheet.clearSelectedMarksAsync(); } catch (e) { /* ignore */ }
    setStatus('Selection cleared.', false);
  }

  // ---------- Parameters ----------

  async function refreshParameterList(announce) {
    if (!state.worksheet || typeof state.worksheet.getParametersAsync !== 'function') return;
    try {
      const params = await state.worksheet.getParametersAsync();
      state.paramNames = params.map(p => p.name).sort((a, b) => a.localeCompare(b));
      renderParamSelect();
      if (announce) setStatus(`Found ${state.paramNames.length} parameter${state.paramNames.length === 1 ? '' : 's'}.`, false);
    } catch (e) {
      if (announce) setStatus('Could not read parameters: ' + errText(e), true);
    }
  }

  function renderParamSelect() {
    const sel = els.paramSelect;
    sel.innerHTML = '';
    const none = document.createElement('option');
    none.value = ''; none.textContent = 'None';
    sel.appendChild(none);
    const names = state.paramNames.slice();
    if (state.paramName && !names.includes(state.paramName)) names.unshift(state.paramName);
    names.forEach(n => {
      const o = document.createElement('option');
      o.value = n; o.textContent = n + (state.paramNames.length && !state.paramNames.includes(n) ? ' (not found)' : '');
      sel.appendChild(o);
    });
    sel.value = state.paramName;
    els.paramValueSourceSelect.disabled = !state.paramName;
  }

  function defaultParamValueFor(group) {
    if (state.paramValueSource === 'value') {
      const val = getGroupValue(group);
      if (val && val.tuples.length) return val.tuples[0].regionLabel;
      if (group.matchValues.length) return group.matchValues[0];
    }
    return group.name;
  }
  function paramValueFor(group) {
    return (group.paramValue && group.paramValue.trim()) ? group.paramValue.trim() : defaultParamValueFor(group);
  }

  // Sets the configured parameter from a region. Returns the value set, or null on failure.
  async function setParameterForGroup(group) {
    try {
      const param = await state.worksheet.findParameterAsync(state.paramName);
      if (!param) { setStatus(`Parameter "${state.paramName}" wasn't found.`, true); return null; }
      const wanted = paramValueFor(group);
      let toSet = wanted;
      const allow = param.allowableValues;
      if (allow && allow.type === tableau.ParameterValueType.List && Array.isArray(allow.allowableValues)) {
        const lw = String(wanted).toLowerCase();
        const hit = allow.allowableValues.find(v => String(v.formattedValue).toLowerCase() === lw || String(v.value).toLowerCase() === lw);
        if (!hit) { setStatus(`"${wanted}" isn't one of the allowed values for parameter "${state.paramName}".`, true); return null; }
        toSet = hit.value;
      }
      if (state.paramOriginal === undefined) state.paramOriginal = param.currentValue ? param.currentValue.value : null;
      await param.changeValueAsync(toSet);
      return wanted;
    } catch (e) {
      setStatus(`Could not set parameter "${state.paramName}": ${errText(e)}`, true);
      return null;
    }
  }

  async function restoreParameter() {
    if (state.paramOriginal === undefined || !state.paramName) { state.paramOriginal = undefined; return; }
    const original = state.paramOriginal;
    state.paramOriginal = undefined;
    try {
      const param = await state.worksheet.findParameterAsync(state.paramName);
      if (param && original !== null) await param.changeValueAsync(original);
    } catch (e) { /* ignore */ }
  }

  // ---------- Worksheet discovery for the target-sheet picker ----------

  // There's no public API that lists worksheets from a Viz Extension, but Tableau's shared-filter
  // model (the same one behind "Apply to Worksheets") lists every worksheet the Region ID field
  // can filter. We read it through the bundled library's filter service. If that ever becomes
  // unavailable, the picker still accepts typed names.
  async function detectWorksheets() {
    if (!state.regionFieldName) throw new Error('Add a field to Region ID on the Marks card first.');
    let filter = await findRegionFilter();
    let created = false;
    if (!filter) {
      await state.worksheet.applyFilterAsync(state.regionFieldName, [], tableau.FilterUpdateType.All, { isExcludeMode: false });
      created = true;
      filter = await findRegionFilter();
    }
    try {
      const registry = window.__tableauApiServiceRegistry && filter && window.__tableauApiServiceRegistry[filter._registryId];
      const service = registry && registry.getService('filter-service');
      if (!service || typeof service.executeGetAppliedWorksheets !== 'function') throw new Error('Sheet list is not available in this version of Tableau.');
      const model = await service.executeGetAppliedWorksheets(filter.worksheetName, filter.fieldId, 'getAppliedWorksheetsAsync');
      const own = state.worksheet.name;
      const names = (model && model.worksheets ? model.worksheets : [])
        .filter(w => w.isEnabled || w.isSelected)
        .map(w => w.worksheetName)
        .filter(n => n && n !== own);
      return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    } finally {
      if (created) { try { await state.worksheet.clearFilterAsync(state.regionFieldName); } catch (e) { /* ignore */ } }
    }
  }

  async function refreshKnownSheets(rerender) {
    try {
      setStatus('Looking for worksheets…', false);
      state.knownSheets = await detectWorksheets();
      persist();
      setStatus(state.knownSheets.length
        ? `Found ${state.knownSheets.length} worksheet${state.knownSheets.length === 1 ? '' : 's'} that can be filtered.`
        : 'No other worksheets use this field yet. Add sheets to a dashboard or type a name.', !state.knownSheets.length);
    } catch (e) {
      setStatus('Could not list worksheets: ' + errText(e) + ' You can still type sheet names.', true);
    }
    if (rerender) rerender();
  }

  // A chip-based multi-select of worksheet names, stored as a comma-separated string.
  function buildSheetPicker(container, getCsv, setCsv, emptyHint) {
    const render = () => {
      container.innerHTML = '';
      container.className = 'sheet-picker';
      const selected = parseSheetList(getCsv());

      const chips = document.createElement('div');
      chips.className = 'chip-list';
      if (!selected.length && emptyHint) {
        const h = document.createElement('span');
        h.className = 'hint';
        h.textContent = emptyHint;
        chips.appendChild(h);
      }
      selected.forEach((name) => {
        const chip = document.createElement('span');
        const unknown = state.knownSheets.length && !state.knownSheets.includes(name);
        chip.className = 'chip' + (unknown ? ' missing' : '');
        if (unknown) chip.title = 'This sheet wasn\'t found among worksheets that use the Region ID field. Check the spelling.';
        chip.textContent = name;
        const rm = document.createElement('button');
        rm.innerHTML = ICONS.close;
        rm.title = 'Remove';
        rm.setAttribute('aria-label', 'Remove sheet ' + name);
        rm.addEventListener('click', () => { setCsv(selected.filter(s => s !== name).join(', ')); render(); });
        chip.appendChild(rm);
        chips.appendChild(chip);
      });
      container.appendChild(chips);

      const row = document.createElement('div');
      row.className = 'chip-add-row';
      const sel = document.createElement('select');
      sel.className = 'grow';
      const available = state.knownSheets.filter(s => !selected.includes(s));
      const first = document.createElement('option');
      first.value = '';
      first.textContent = state.knownSheets.length
        ? (available.length ? 'Add a worksheet…' : 'All found worksheets added')
        : 'Click “Find sheets” to list worksheets';
      sel.appendChild(first);
      available.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
      sel.disabled = !available.length;
      sel.addEventListener('change', () => {
        if (!sel.value) return;
        setCsv(selected.concat(sel.value).join(', '));
        render();
      });
      const findBtn = document.createElement('button');
      findBtn.className = 'btn btn-subtle';
      findBtn.innerHTML = ICONS.refresh + ' Find sheets';
      findBtn.title = 'List worksheets that use the Region ID field';
      findBtn.addEventListener('click', () => refreshKnownSheets(render));
      row.appendChild(sel);
      row.appendChild(findBtn);
      container.appendChild(row);

      const manual = document.createElement('div');
      manual.className = 'chip-add-row';
      manual.style.marginTop = '6px';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Or type a worksheet name';
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-subtle';
      addBtn.textContent = '+ Add';
      const addTyped = () => {
        const v = input.value.trim().replace(/,/g, ' ');
        if (!v) return;
        if (!selected.includes(v)) setCsv(selected.concat(v).join(', '));
        render();
      };
      addBtn.addEventListener('click', addTyped);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTyped(); });
      manual.appendChild(input);
      manual.appendChild(addBtn);
      container.appendChild(manual);
    };
    render();
  }

  function renderDefaultSheetsPicker() {
    buildSheetPicker(els.defaultSheetsPicker,
      () => state.filterTargetSheets,
      (csv) => { state.filterTargetSheets = csv; persist(); },
      'No default worksheets yet.');
  }

  // ---------- Region (group) config modal ----------

  function openConfigModal(groupId) {
    state.configGroupId = groupId;
    renderConfigModal();
    els.configModal.classList.remove('hidden');
  }
  function closeConfigModal() {
    state.configGroupId = null;
    els.configModal.classList.add('hidden');
    renderShapes();
    persist();
  }

  function section(title, hint) {
    const s = document.createElement('div');
    s.className = 'modal-section';
    const h = document.createElement('h4');
    h.textContent = title;
    s.appendChild(h);
    if (hint) {
      const p = document.createElement('p');
      p.className = 'hint';
      p.textContent = hint;
      s.appendChild(p);
    }
    return s;
  }
  function fieldRow(labelText) {
    const row = document.createElement('div');
    row.className = 'field-row';
    const l = document.createElement('span');
    l.className = 'field-label';
    l.textContent = labelText;
    row.appendChild(l);
    return row;
  }

  // Which regions each normalized data value is already assigned to.
  function assignmentIndex() {
    const idx = {};
    state.groups.forEach(g => g.matchValues.forEach(v => {
      const k = v.trim().toLowerCase();
      (idx[k] = idx[k] || []).push(g);
    }));
    return idx;
  }

  function renderConfigModal() {
    const group = state.groups.find(g => g.id === state.configGroupId);
    if (!group) return;
    const scrollTop = els.configBody.parentElement.scrollTop;
    els.configTitle.textContent = 'Configure: ' + group.name;
    els.configBody.innerHTML = '';

    // --- Data values ---
    const dataSection = section('Data values in this region', 'Pick values from your Region ID field. They are independent of the region\'s name.');
    const chipList = document.createElement('div');
    chipList.className = 'chip-list';
    group.matchValues.forEach((v, idx) => {
      const chip = document.createElement('span');
      const found = !!state.dataMap[v.trim().toLowerCase()];
      chip.className = 'chip' + (found || !Object.keys(state.dataMap).length ? '' : ' missing');
      if (!found && Object.keys(state.dataMap).length) chip.title = 'Not in the current data (check spelling or filters)';
      chip.textContent = v;
      const rm = document.createElement('button');
      rm.innerHTML = ICONS.close;
      rm.title = 'Remove';
      rm.setAttribute('aria-label', 'Remove value ' + v);
      rm.addEventListener('click', () => { group.matchValues.splice(idx, 1); renderConfigModal(); renderShapes(); persist(); });
      chip.appendChild(rm);
      chipList.appendChild(chip);
    });
    dataSection.appendChild(chipList);
    dataSection.appendChild(buildValuePicker(group));

    const aggRow = fieldRow('Aggregation');
    const aggSelect = document.createElement('select');
    aggSelect.className = 'grow';
    AGG_FUNCS.forEach((fn) => {
      const opt = document.createElement('option');
      opt.value = fn; opt.textContent = fn;
      if (group.aggregation === fn) opt.selected = true;
      aggSelect.appendChild(opt);
    });
    const aggHint = document.createElement('p');
    aggHint.className = 'hint indent';
    aggHint.textContent = AGG_HINTS[group.aggregation];
    aggSelect.addEventListener('change', () => {
      group.aggregation = aggSelect.value;
      aggHint.textContent = AGG_HINTS[group.aggregation];
      renderShapes(); persist();
    });
    aggRow.appendChild(aggSelect);
    dataSection.appendChild(aggRow);
    dataSection.appendChild(aggHint);

    const formatRow = fieldRow('Format');
    const prefixInput = document.createElement('input');
    prefixInput.type = 'text';
    prefixInput.placeholder = 'Prefix (e.g. $)';
    prefixInput.style.width = '90px';
    prefixInput.value = group.valuePrefix;
    prefixInput.addEventListener('change', () => { group.valuePrefix = prefixInput.value; renderShapes(); persist(); });
    const suffixInput = document.createElement('input');
    suffixInput.type = 'text';
    suffixInput.placeholder = 'Suffix (e.g. kWh)';
    suffixInput.className = 'grow';
    suffixInput.value = group.valueSuffix;
    suffixInput.addEventListener('change', () => { group.valueSuffix = suffixInput.value; renderShapes(); persist(); });
    formatRow.appendChild(prefixInput);
    formatRow.appendChild(suffixInput);
    dataSection.appendChild(formatRow);
    els.configBody.appendChild(dataSection);

    // --- Colors ---
    const paletteSection = section('Colors', 'Set a color for each value breakpoint. Colors blend smoothly between steps.');
    const preview = document.createElement('div');
    preview.className = 'palette-preview';
    preview.style.background = paletteGradientCss(group.palette.steps);
    paletteSection.appendChild(preview);

    const sortedSteps = group.palette.steps.slice().sort((a, b) => a.value - b.value);
    group.palette.steps = sortedSteps;
    sortedSteps.forEach((step) => {
      const row = document.createElement('div');
      row.className = 'step-row';
      const label = document.createElement('span');
      label.className = 'row-label';
      label.textContent = 'Value';
      const valInput = document.createElement('input');
      valInput.type = 'number';
      valInput.value = step.value;
      valInput.addEventListener('change', () => {
        const v = parseFloat(valInput.value);
        step.value = isNaN(v) ? 0 : v;
        renderConfigModal(); renderShapes(); persist();
      });
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = step.color;
      colorInput.addEventListener('input', () => { step.color = colorInput.value; renderShapes(); updatePreviewOnly(group); });
      colorInput.addEventListener('change', () => persist());
      const removeBtn = iconBtn('close', 'Remove step', () => {
        if (group.palette.steps.length <= 2) { setStatus('Keep at least 2 color steps.', true); return; }
        group.palette.steps = group.palette.steps.filter(s => s !== step);
        renderConfigModal(); renderShapes(); persist();
      }, true);
      row.appendChild(label); row.appendChild(valInput); row.appendChild(colorInput); row.appendChild(removeBtn);
      paletteSection.appendChild(row);
    });

    const stepActions = document.createElement('div');
    stepActions.className = 'step-actions';
    const addStepBtn = document.createElement('button');
    addStepBtn.className = 'btn btn-subtle';
    addStepBtn.textContent = '+ Add Step';
    addStepBtn.addEventListener('click', () => {
      if (group.palette.steps.length >= 9) { setStatus('Maximum of 9 color steps.', true); return; }
      const steps = group.palette.steps;
      const last = steps[steps.length - 1];
      const secondLast = steps[steps.length - 2] || { value: last.value - 10 };
      steps.push({ value: last.value + (last.value - secondLast.value || 10), color: '#a0aec0' });
      renderConfigModal(); renderShapes(); persist();
    });
    stepActions.appendChild(addStepBtn);
    paletteSection.appendChild(stepActions);

    const spaceLabel = document.createElement('p');
    spaceLabel.className = 'hint';
    spaceLabel.style.margin = '10px 0 4px';
    spaceLabel.textContent = 'Auto-space the steps evenly across:';
    paletteSection.appendChild(spaceLabel);
    const spaceActions = document.createElement('div');
    spaceActions.className = 'step-actions';
    const autoAllBtn = document.createElement('button');
    autoAllBtn.className = 'btn';
    autoAllBtn.textContent = 'All data';
    autoAllBtn.title = 'Lowest to highest value across all data on the Marks card';
    autoAllBtn.addEventListener('click', () => autoSpace(group, getGlobalValueRange(), 'No data available yet to auto-space against.'));
    const autoRegionsBtn = document.createElement('button');
    autoRegionsBtn.className = 'btn';
    autoRegionsBtn.textContent = 'All regions\' values';
    autoRegionsBtn.title = 'Lowest to highest computed value across every region';
    autoRegionsBtn.addEventListener('click', () => autoSpace(group, getRegionsValueRange(), 'At least two regions need data with different values.'));
    const autoThisBtn = document.createElement('button');
    autoThisBtn.className = 'btn';
    autoThisBtn.textContent = 'This region\'s values';
    autoThisBtn.title = 'Lowest to highest of the data values matched by this region';
    autoThisBtn.addEventListener('click', () => autoSpace(group, getGroupValueRange(group), 'This region needs at least two matched values that differ.'));
    spaceActions.appendChild(autoAllBtn);
    spaceActions.appendChild(autoRegionsBtn);
    spaceActions.appendChild(autoThisBtn);
    paletteSection.appendChild(spaceActions);
    els.configBody.appendChild(paletteSection);

    // --- Display ---
    const displaySection = section('Display');
    const labelToggle = document.createElement('label');
    labelToggle.className = 'checkbox-row';
    const labelCb = document.createElement('input');
    labelCb.type = 'checkbox';
    labelCb.checked = group.labelVisible;
    labelCb.addEventListener('change', () => { group.labelVisible = labelCb.checked; renderLabels(); persist(); });
    labelToggle.appendChild(labelCb);
    labelToggle.appendChild(document.createTextNode(' Show label on image'));
    displaySection.appendChild(labelToggle);
    if (state.labelMode === 'off') {
      const lh = document.createElement('p');
      lh.className = 'hint indent-cb';
      lh.textContent = 'Labels are currently turned off for all regions in Settings → Labels on image.';
      displaySection.appendChild(lh);
    }

    const opRow = fieldRow('Opacity');
    const opCb = document.createElement('input');
    opCb.type = 'checkbox';
    opCb.title = 'Use a custom opacity for this region';
    opCb.checked = group.opacity !== null;
    const opRange = document.createElement('input');
    opRange.type = 'range';
    opRange.min = '0.05'; opRange.max = '1'; opRange.step = '0.05';
    opRange.className = 'grow';
    opRange.value = group.opacity !== null ? group.opacity : state.opacity;
    opRange.disabled = group.opacity === null;
    const opVal = document.createElement('span');
    opVal.className = 'range-val';
    const updOpLabel = () => { opVal.textContent = group.opacity === null ? 'Default' : Math.round(group.opacity * 100) + '%'; };
    updOpLabel();
    opCb.addEventListener('change', () => {
      group.opacity = opCb.checked ? parseFloat(opRange.value) : null;
      opRange.disabled = !opCb.checked;
      updOpLabel(); renderOverlay(); persist();
    });
    opRange.addEventListener('input', () => { group.opacity = parseFloat(opRange.value); updOpLabel(); renderOverlay(); });
    opRange.addEventListener('change', persist);
    opRow.appendChild(opCb);
    opRow.appendChild(opRange);
    opRow.appendChild(opVal);
    displaySection.appendChild(opRow);
    els.configBody.appendChild(displaySection);

    // --- Click actions ---
    const clickSection = section('Click actions');
    const tLabel = document.createElement('label');
    tLabel.textContent = 'Target sheets';
    clickSection.appendChild(tLabel);
    const tHint = document.createElement('p');
    tHint.className = 'hint';
    tHint.style.marginBottom = '6px';
    const defaults = parseSheetList(state.filterTargetSheets);
    tHint.textContent = 'Worksheets this region filters when clicked. Leave empty to use the default from Settings' +
      (defaults.length ? ` (currently: ${defaults.join(', ')}).` : ' (none set).');
    clickSection.appendChild(tHint);
    const pickerHost = document.createElement('div');
    clickSection.appendChild(pickerHost);
    buildSheetPicker(pickerHost, () => group.targetSheets, (csv) => { group.targetSheets = csv; persist(); }, 'Using the default worksheets.');

    const toggleRow = fieldRow('On 2nd click');
    toggleRow.style.marginTop = '12px';
    const toggleSelect = document.createElement('select');
    toggleSelect.className = 'grow';
    [
      ['clear', 'Clear the filter (and restore the parameter)'],
      ['keep', 'Keep the current filter'],
      ['all', 'Select all values in the field']
    ].forEach(([val, label]) => {
      const opt = document.createElement('option');
      opt.value = val; opt.textContent = label;
      if (group.toggleMode === val) opt.selected = true;
      toggleSelect.appendChild(opt);
    });
    toggleSelect.addEventListener('change', () => { group.toggleMode = toggleSelect.value; persist(); });
    toggleRow.appendChild(toggleSelect);
    clickSection.appendChild(toggleRow);

    const pRow = fieldRow('Parameter');
    const pInput = document.createElement('input');
    pInput.type = 'text';
    pInput.className = 'grow';
    pInput.value = group.paramValue;
    pInput.disabled = !state.paramName;
    pInput.placeholder = state.paramName ? `Default: ${defaultParamValueFor(group)}` : 'Choose a parameter in Settings first';
    pInput.addEventListener('change', () => { group.paramValue = pInput.value; persist(); });
    pRow.appendChild(pInput);
    clickSection.appendChild(pRow);
    const pHint = document.createElement('p');
    pHint.className = 'hint indent';
    pHint.textContent = state.paramName
      ? `Value sent to "${state.paramName}" when this region is clicked. Leave blank for the default.`
      : 'Set a parameter under Settings → Click actions to use this.';
    clickSection.appendChild(pHint);
    els.configBody.appendChild(clickSection);

    // --- Tooltip ---
    const tooltipSection = section('Tooltip text', 'The first line is the title. Click a placeholder to insert it.');
    const tokenList = document.createElement('div');
    tokenList.className = 'token-list';
    const tooltipTextarea = document.createElement('textarea');
    tooltipTextarea.className = 'tooltip-editor';
    tooltipTextarea.rows = 3;
    tooltipTextarea.value = group.tooltipTemplate;
    tooltipTextarea.addEventListener('change', () => { group.tooltipTemplate = tooltipTextarea.value || DEFAULT_TOOLTIP_TEMPLATE; persist(); });
    TOOLTIP_TOKENS.forEach(([key, desc]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'token';
      b.textContent = `{${key}}`;
      b.title = desc;
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', () => {
        const ta = tooltipTextarea;
        const start = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
        const end = ta.selectionEnd != null ? ta.selectionEnd : ta.value.length;
        const ins = `{${key}}`;
        ta.value = ta.value.slice(0, start) + ins + ta.value.slice(end);
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + ins.length;
        group.tooltipTemplate = ta.value;
        persist();
      });
      tokenList.appendChild(b);
    });
    tooltipSection.appendChild(tokenList);
    tooltipSection.appendChild(tooltipTextarea);
    const resetTooltipBtn = document.createElement('button');
    resetTooltipBtn.className = 'btn btn-subtle';
    resetTooltipBtn.style.marginTop = '6px';
    resetTooltipBtn.textContent = 'Reset to default';
    resetTooltipBtn.addEventListener('click', () => { group.tooltipTemplate = DEFAULT_TOOLTIP_TEMPLATE; tooltipTextarea.value = DEFAULT_TOOLTIP_TEMPLATE; persist(); });
    tooltipSection.appendChild(resetTooltipBtn);
    els.configBody.appendChild(tooltipSection);

    els.configBody.parentElement.scrollTop = scrollTop;
  }

  // Searchable dropdown of Region ID values from the data, plus free-text entry.
  function buildValuePicker(group) {
    const wrap = document.createElement('div');
    wrap.className = 'value-picker';
    const row = document.createElement('div');
    row.className = 'chip-add-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = Object.keys(state.dataMap).length ? 'Search values from your data…' : 'Type a value (no data on the Marks card yet)';
    input.setAttribute('aria-label', 'Add a data value');
    input.autocomplete = 'off';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-subtle';
    addBtn.textContent = '+ Add';
    row.appendChild(input);
    row.appendChild(addBtn);
    wrap.appendChild(row);

    const list = document.createElement('div');
    list.className = 'value-options hidden';
    list.setAttribute('role', 'listbox');
    wrap.appendChild(list);

    let options = [];
    let highlighted = -1;

    const addValue = (v) => {
      v = (v || '').trim();
      if (!v) return;
      if (group.matchValues.some(x => x.toLowerCase() === v.toLowerCase())) return;
      group.matchValues.push(v);
      persist();
      renderShapes();
      renderConfigModal();
      // Keep the picker open for adding several values in a row.
      const again = els.configBody.querySelector('.value-picker input');
      if (again) { again.focus(); }
    };

    const refresh = () => {
      const q = input.value.trim().toLowerCase();
      const assigned = assignmentIndex();
      const mine = new Set(group.matchValues.map(v => v.trim().toLowerCase()));
      options = Object.entries(state.dataMap)
        .filter(([k]) => !mine.has(k))
        .filter(([k, e]) => !q || k.includes(q) || String(e.regionLabel).toLowerCase().includes(q))
        .sort((a, b) => a[1].regionLabel.localeCompare(b[1].regionLabel, undefined, { numeric: true }))
        .slice(0, 300)
        .map(([k, e]) => ({ key: k, entry: e, others: (assigned[k] || []).filter(g => g.id !== group.id) }));
      list.innerHTML = '';
      if (!Object.keys(state.dataMap).length) { list.classList.add('hidden'); return; }
      if (!options.length) {
        const empty = document.createElement('div');
        empty.className = 'value-empty';
        empty.textContent = q ? 'No matching values — press Enter to add it anyway.' : 'All values are already in this region.';
        list.appendChild(empty);
      }
      options.forEach((o, i) => {
        const item = document.createElement('div');
        item.className = 'value-option' + (i === highlighted ? ' hl' : '');
        item.setAttribute('role', 'option');
        const name = document.createElement('span');
        name.className = 'vo-name';
        name.textContent = o.entry.regionLabel;
        const meta = document.createElement('span');
        meta.className = 'vo-meta';
        meta.textContent = o.entry.formatted != null ? String(o.entry.formatted) : '';
        item.appendChild(name);
        if (o.others.length) {
          const tag = document.createElement('span');
          tag.className = 'vo-tag';
          tag.textContent = 'in ' + o.others.map(g => g.name).join(', ');
          item.appendChild(tag);
        }
        item.appendChild(meta);
        item.addEventListener('mousedown', (e) => e.preventDefault());
        item.addEventListener('click', () => addValue(o.entry.regionLabel));
        list.appendChild(item);
      });
      list.classList.remove('hidden');
    };

    input.addEventListener('focus', () => { highlighted = -1; refresh(); });
    input.addEventListener('input', () => { highlighted = input.value ? 0 : -1; refresh(); });
    input.addEventListener('blur', () => setTimeout(() => list.classList.add('hidden'), 120));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlighted = Math.min(options.length - 1, highlighted + 1); refresh(); scrollHl(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlighted = Math.max(-1, highlighted - 1); refresh(); scrollHl(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlighted >= 0 && options[highlighted]) addValue(options[highlighted].entry.regionLabel);
        else addValue(input.value);
      } else if (e.key === 'Escape') { list.classList.add('hidden'); e.stopPropagation(); }
    });
    addBtn.addEventListener('click', () => addValue(input.value));

    function scrollHl() {
      const el = list.querySelector('.value-option.hl');
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
    return wrap;
  }

  function autoSpace(group, range, errMsg) {
    if (!range || range.min === range.max) { setStatus(errMsg, true); return; }
    const n = group.palette.steps.length;
    group.palette.steps.forEach((s, i) => { s.value = Math.round((range.min + (range.max - range.min) * (i / (n - 1))) * 100) / 100; });
    renderConfigModal(); renderShapes(); persist();
    setStatus(`Color steps spread from ${formatGroupValue(group, range.min)} to ${formatGroupValue(group, range.max)}.`, false);
  }

  function updatePreviewOnly(group) {
    const preview = els.configBody.querySelector('.palette-preview');
    if (preview) preview.style.background = paletteGradientCss(group.palette.steps);
  }
  function paletteGradientCss(steps) {
    const sorted = steps.slice().sort((a, b) => a.value - b.value);
    if (sorted.length < 2) return sorted[0] ? sorted[0].color : NO_DATA_COLOR;
    const min = sorted[0].value, max = sorted[sorted.length - 1].value;
    const span = max - min || 1;
    const stops = sorted.map(s => `${s.color} ${((s.value - min) / span) * 100}%`);
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }

  // ---------- Shape smoothing (Catmull-Rom -> cubic Bezier, closed loop) ----------

  function smoothedPathD(points) {
    const n = points.length;
    if (n < 3) return null;
    const p = points;
    let d = `M ${p[0].x} ${p[0].y} `;
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6;
      d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
    }
    return d + 'Z';
  }

  // ---------- Rendering ----------

  function renderShapes() {
    renderOverlay();
    renderGroupList();
    if (state.regionFieldName && state.valueFieldName) updateDataSummary();
    updateActiveFilterHint();
    renderLegend();
  }

  function noDataSwatch() {
    return state.noDataStyle === 'solid' ? state.noDataColor : 'repeating-linear-gradient(45deg, #e6e6e6 0 3px, #cbcbcb 3px 4px)';
  }

  // Draws shapes, in-progress drawing, labels, and edit handles. Doesn't touch the sidebar,
  // so it's cheap enough to call on every pointer move while dragging.
  function renderOverlay() {
    els.overlay.innerHTML = '';
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.innerHTML =
      '<pattern id="hatchPattern" width="3" height="3" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<rect width="3" height="3" fill="#e6e6e6"></rect>' +
      '<line x1="0" y1="0" x2="0" y2="3" stroke="#cbcbcb" stroke-width="1"></line>' +
      '</pattern>';
    els.overlay.appendChild(defs);
    els.overlay.style.setProperty('--bw', state.borderWidth + 'px');
    els.overlay.style.setProperty('--bc', state.borderColor);

    // Regions lower in the list are drawn on top.
    const order = {};
    state.groups.forEach((g, i) => { order[g.id] = i; });
    const shapes = state.shapes.slice().sort((a, b) => (order[a.groupId] ?? 0) - (order[b.groupId] ?? 0));
    if (state.editPointsShapeId) {
      // The shape being edited always sits on top so it can be grabbed.
      const i = shapes.findIndex(s => s.id === state.editPointsShapeId);
      if (i > -1) shapes.push(shapes.splice(i, 1)[0]);
    }

    shapes.forEach((shape) => {
      if (state.editingShapeId === shape.id) return;
      const group = state.groups.find(g => g.id === shape.groupId);
      if (!group || !group.visible) return; // hidden regions are skipped entirely, so clicks pass through
      const val = getGroupValue(group);

      let shapeEl;
      if (shape.smooth && shape.points.length >= 3) {
        shapeEl = document.createElementNS(SVG_NS, 'path');
        shapeEl.setAttribute('d', smoothedPathD(shape.points));
      } else {
        shapeEl = document.createElementNS(SVG_NS, 'polygon');
        shapeEl.setAttribute('points', shape.points.map(p => `${p.x},${p.y}`).join(' '));
      }

      const isEditing = state.editPointsShapeId === shape.id;
      let cls = 'region-poly';
      if (!val) cls += state.noDataStyle === 'solid' ? ' no-data-solid' : ' no-data';
      if (state.activeGroupIds.includes(group.id)) cls += ' selected';
      if (isEditing) cls += ' editing';
      else if (state.mode === 'edit') cls += ' inert';
      if (state.borderWidth === 0) cls += ' no-border';
      shapeEl.setAttribute('class', cls);
      shapeEl.setAttribute('data-shape-id', shape.id);
      shapeEl.setAttribute('data-group-id', group.id);
      if (val) shapeEl.setAttribute('fill', colorForPaletteValue(val.raw, group.palette.steps));
      else if (state.noDataStyle === 'solid') shapeEl.setAttribute('fill', state.noDataColor);
      shapeEl.setAttribute('fill-opacity', group.opacity !== null ? group.opacity : state.opacity);

      if (isEditing) {
        shapeEl.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          pointerDrag = { kind: 'move', start: eventToPct(e), orig: shape.points.map(p => ({ x: p.x, y: p.y })), moved: false };
        });
        shapeEl.addEventListener('dblclick', (e) => {
          const p = eventToPct(e);
          const i = nearestEdgeIndex(shape.points, p);
          shape.points.splice(i + 1, 0, { x: round3(p.x), y: round3(p.y) });
          renderOverlay();
          persist();
        });
      } else if (state.mode === 'view') {
        shapeEl.addEventListener('mousemove', (e) => onShapeMouseMove(e, group, val));
        shapeEl.addEventListener('mouseleave', onShapeMouseLeave);
        shapeEl.addEventListener('click', (e) => handleGroupClick(group.id, e.ctrlKey || e.metaKey));
      }

      els.overlay.appendChild(shapeEl);
    });

    // In-progress drawing preview
    if (state.mode === 'draw' && state.drawingPoints.length) {
      if (state.drawTool === 'polygon') {
        if (state.drawingPoints.length > 1) {
          const line = document.createElementNS(SVG_NS, 'polyline');
          line.setAttribute('points', state.drawingPoints.map(p => `${p.x},${p.y}`).join(' '));
          line.setAttribute('class', 'draw-line');
          els.overlay.appendChild(line);
        }
      } else {
        const preview = document.createElementNS(SVG_NS, 'polygon');
        preview.setAttribute('points', state.drawingPoints.map(p => `${p.x},${p.y}`).join(' '));
        preview.setAttribute('class', 'draw-preview');
        els.overlay.appendChild(preview);
      }
    }
    const rubber = document.createElementNS(SVG_NS, 'line');
    rubber.setAttribute('id', 'rubberBand');
    rubber.setAttribute('class', 'draw-line rubber');
    els.overlay.appendChild(rubber);
    updateRubberBand();

    renderLabels();
    renderHandles();
  }

  function updateRubberBand() {
    const r = els.overlay.querySelector('#rubberBand');
    if (!r) return;
    const pts = state.drawingPoints;
    if (state.mode !== 'draw' || state.drawTool !== 'polygon' || !pts.length || !state.cursorPt) {
      r.setAttribute('visibility', 'hidden');
      return;
    }
    const last = pts[pts.length - 1];
    let target = state.cursorPt;
    if (pts.length >= 3 && pxDistance(target, pts[0]) <= SNAP_PX) target = pts[0];
    r.setAttribute('x1', last.x); r.setAttribute('y1', last.y);
    r.setAttribute('x2', target.x); r.setAttribute('y2', target.y);
    r.setAttribute('visibility', 'visible');
    const first = els.handleLayer.querySelector('.handle.first');
    if (first) first.classList.toggle('snap', target === pts[0]);
  }

  // HTML handles (not SVG) so they stay perfectly round and a constant on-screen size,
  // regardless of the image's aspect ratio or zoom level.
  function renderHandles() {
    els.handleLayer.innerHTML = '';
    let pts = null, editable = false;
    if (state.mode === 'draw' && state.drawTool === 'polygon') pts = state.drawingPoints;
    if (state.mode === 'edit') {
      const shape = state.shapes.find(s => s.id === state.editPointsShapeId);
      if (shape) { pts = shape.points; editable = true; }
    }
    if (!pts || !pts.length) return;
    const shape = editable ? state.shapes.find(s => s.id === state.editPointsShapeId) : null;
    pts.forEach((p, i) => {
      const h = document.createElement('div');
      h.className = 'handle' + (editable ? ' editable' : '') + (!editable && i === 0 ? ' first' : '') + (!editable && i === 0 && pts.length >= 3 ? ' closable' : '');
      h.style.left = p.x + '%';
      h.style.top = p.y + '%';
      if (editable) {
        h.title = 'Drag to move · Alt+click or double-click to remove';
        h.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          if (e.altKey) { removeVertex(shape, i); return; }
          pointerDrag = { kind: 'vertex', index: i, moved: false };
        });
        h.addEventListener('dblclick', (e) => { e.stopPropagation(); removeVertex(shape, i); });
      } else if (i === 0 && pts.length >= 3) {
        h.title = 'Click to close the shape';
        h.addEventListener('click', (e) => { e.stopPropagation(); finishDrawing(); });
      }
      els.handleLayer.appendChild(h);
    });
  }

  function renderLabels() {
    els.labelLayer.innerHTML = '';
    if (state.labelMode === 'off' || !state.imageSrc) return;
    els.labelLayer.style.setProperty('--label-size', state.labelSize + 'px');
    els.labelLayer.style.setProperty('--label-color', state.labelColor);
    els.labelLayer.classList.toggle('halo', state.labelHalo);
    els.labelLayer.classList.toggle('halo-dark', state.labelHalo && luminance(state.labelColor) > 0.55);
    state.shapes.forEach((shape) => {
      if (state.editingShapeId === shape.id || shape.points.length < 3) return;
      const group = state.groups.find(g => g.id === shape.groupId);
      if (!group || !group.visible || !group.labelVisible) return;
      const val = getGroupValue(group);
      const c = shapeCentroid(shape.points);
      const el = document.createElement('div');
      el.className = 'region-label';
      el.style.left = c.x + '%';
      el.style.top = c.y + '%';
      if (state.labelMode === 'name' || state.labelMode === 'both') {
        const n = document.createElement('div');
        n.className = 'rl-name';
        n.textContent = group.name;
        el.appendChild(n);
      }
      if (state.labelMode === 'value' || state.labelMode === 'both') {
        const v = document.createElement('div');
        v.className = 'rl-value';
        v.textContent = val ? val.formatted : '—';
        el.appendChild(v);
      }
      els.labelLayer.appendChild(el);
    });
  }

  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  function updateActiveFilterHint() {
    const ids = state.activeGroupIds;
    if (ids.length === 1) {
      const g = state.groups.find(x => x.id === ids[0]);
      els.activeFilterHint.textContent = g
        ? `Selected: "${g.name}". Click it again to ${g.toggleMode === 'keep' ? 'keep the filter' : g.toggleMode === 'all' ? 'select all values' : 'clear'}.`
        : '';
    } else if (ids.length > 1) {
      const names = ids.map(id => (state.groups.find(g => g.id === id) || {}).name).filter(Boolean);
      els.activeFilterHint.textContent = `Selected ${names.length} regions: ${names.join(', ')}. Ctrl/Cmd+click a region to add or remove it.`;
    } else {
      els.activeFilterHint.textContent = 'Click a region to filter with it. Ctrl/Cmd+click to select several. Click the same region again to toggle it off.';
    }
  }

  // ---------- Tooltips ----------

  function onShapeMouseMove(e, group, val) {
    showCustomTooltip(e, group, val);
    if (state.hoverGroupId !== group.id) {
      state.hoverGroupId = group.id;
      renderLegend();
    }
  }
  function onShapeMouseLeave() {
    hideCustomTooltip();
    state.hoverGroupId = null;
    renderLegend();
  }

  // ---------- On-canvas legend ----------

  function renderLegend() {
    if (!state.showLegend) { els.legendControl.classList.add('hidden'); return; }
    const ids = state.activeGroupIds;
    const groupId = state.hoverGroupId || ids[ids.length - 1];
    const group = groupId ? state.groups.find(g => g.id === groupId) : null;
    if (!group || !group.palette.steps.length) { els.legendControl.classList.add('hidden'); return; }

    const sorted = group.palette.steps.slice().sort((a, b) => a.value - b.value);
    els.legendTitle.textContent = group.name;
    els.legendGradient.style.background = paletteGradientCss(group.palette.steps);
    els.legendMin.textContent = formatGroupValue(group, sorted[0].value);
    els.legendMax.textContent = formatGroupValue(group, sorted[sorted.length - 1].value);
    els.legendControl.classList.remove('hidden');
  }

  function fillTooltipTemplate(template, group, val) {
    const tuples = val ? val.tuples : [];
    const raws = tuples.map(t => t.raw);
    const fmt = (n) => (n == null || isNaN(n)) ? '—' : formatGroupValue(group, n);
    const found = new Set(tuples.map(t => t.regionLabel.toLowerCase()));
    const hasRowCount = tuples.some(t => typeof t.rowCount === 'number' && !isNaN(t.rowCount));
    const tokens = {
      name: group.name,
      agg: val ? val.aggregation : '',
      value: val ? val.formatted : '—',
      matched: val ? String(val.matchedCount) : '0',
      total: val ? String(val.totalCount) : String(group.matchValues.length),
      values: tuples.map(t => t.regionLabel).join(', ') || '—',
      missing: group.matchValues.filter(v => !found.has(v.trim().toLowerCase())).join(', ') || 'none',
      min: raws.length ? fmt(Math.min(...raws)) : '—',
      max: raws.length ? fmt(Math.max(...raws)) : '—',
      sum: raws.length ? fmt(raws.reduce((a, b) => a + b, 0)) : '—',
      avg: raws.length ? fmt(raws.reduce((a, b) => a + b, 0) / raws.length) : '—',
      count: String(raws.length),
      rowcount: hasRowCount ? formatNumber(tuples.reduce((a, t) => a + (typeof t.rowCount === 'number' ? t.rowCount : 0), 0)) : '—',
      field: state.regionFieldName || '',
      measure: state.valueFieldName || ''
    };
    return template.replace(/\{(\w+)\}/g, (m, key) => (key in tokens ? tokens[key] : m));
  }

  function showCustomTooltip(e, group, val) {
    els.tooltip.innerHTML = '';
    let text;
    if (val) text = fillTooltipTemplate(group.tooltipTemplate || DEFAULT_TOOLTIP_TEMPLATE, group, val);
    else if (!group.matchValues.length) text = `${group.name}\nNo values assigned — configure via ⚙`;
    else text = `${group.name}\nNo matching data`;

    const lines = text.split('\n');
    const title = document.createElement('div');
    title.className = 'tt-title';
    title.textContent = lines[0];
    els.tooltip.appendChild(title);
    if (lines.length > 1) {
      const sub = document.createElement('div');
      sub.className = 'tt-sub';
      sub.style.whiteSpace = 'pre-line';
      sub.textContent = lines.slice(1).join('\n');
      els.tooltip.appendChild(sub);
    }
    els.tooltip.classList.remove('hidden');
    // Keep the tooltip inside the extension's frame.
    const tw = els.tooltip.offsetWidth, th = els.tooltip.offsetHeight;
    let left = e.clientX + 12, top = e.clientY + 12;
    if (left + tw > window.innerWidth - 4) left = e.clientX - tw - 12;
    if (top + th > window.innerHeight - 4) top = e.clientY - th - 12;
    els.tooltip.style.left = Math.max(4, left) + 'px';
    els.tooltip.style.top = Math.max(4, top) + 'px';
  }
  function hideCustomTooltip() { els.tooltip.classList.add('hidden'); }

  // ---------- Color scale ----------

  function getGlobalValueRange() {
    const vals = Object.values(state.dataMap).map(v => v.raw).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) return null;
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }
  function getRegionsValueRange() {
    const vals = state.groups.map(getGroupValue).filter(Boolean).map(v => v.raw).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) return null;
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }
  function getGroupValueRange(group) {
    const val = getGroupValue(group);
    if (!val) return null;
    const vals = val.tuples.map(t => t.raw);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }
  function colorForPaletteValue(raw, steps) {
    if (raw == null || isNaN(raw) || !steps || !steps.length) return NO_DATA_COLOR;
    const sorted = steps.slice().sort((a, b) => a.value - b.value);
    if (sorted.length === 1) return sorted[0].color;
    if (raw <= sorted[0].value) return sorted[0].color;
    if (raw >= sorted[sorted.length - 1].value) return sorted[sorted.length - 1].color;
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (raw >= a.value && raw <= b.value) {
        const t = a.value === b.value ? 0 : (raw - a.value) / (b.value - a.value);
        return lerpColor(a.color, b.color, t);
      }
    }
    return sorted[sorted.length - 1].color;
  }
  function lerpColor(hexA, hexB, t) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    const r = Math.round(a.r + (b.r - a.r) * t), g = Math.round(a.g + (b.g - a.g) * t), bl = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r},${g},${bl})`;
  }
  function hexToRgb(hex) {
    hex = (hex || '#888888').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function formatNumber(n) {
    if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
    return String(Math.round(n * 100) / 100);
  }
  function formatGroupValue(group, raw) {
    return `${group.valuePrefix || ''}${formatNumber(raw)}${group.valueSuffix || ''}`;
  }

  // ---------- Aggregation ----------

  function aggregate(tuples, fn) {
    if (!tuples.length) return null;
    const values = tuples.map(t => t.raw);
    switch (fn) {
      case 'SUM': return values.reduce((a, b) => a + b, 0);
      case 'AVG': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'MIN': return Math.min(...values);
      case 'MAX': return Math.max(...values);
      case 'COUNT': {
        const hasRowCount = tuples.some(t => typeof t.rowCount === 'number' && !isNaN(t.rowCount));
        return hasRowCount ? tuples.reduce((a, t) => a + (typeof t.rowCount === 'number' ? t.rowCount : 0), 0) : tuples.length;
      }
      case 'COUNTD': return new Set(values).size;
      case 'MEDIAN': {
        const sorted = values.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }
      default: return values.reduce((a, b) => a + b, 0) / values.length;
    }
  }

  // ---------- Group -> data resolution ----------

  function getGroupValue(group) {
    const keys = group.matchValues || [];
    if (!keys.length) return null;
    const tuples = [];
    const seen = new Set();
    keys.forEach((k) => {
      const nk = k.trim().toLowerCase();
      if (seen.has(nk)) return;
      seen.add(nk);
      const hit = state.dataMap[nk];
      if (hit && typeof hit.raw === 'number' && !isNaN(hit.raw)) tuples.push(hit);
    });
    if (!tuples.length) return null;
    const fn = group.aggregation || 'AVG';
    const result = aggregate(tuples, fn);
    return { raw: result, formatted: formatGroupValue(group, result), matchedCount: tuples.length, totalCount: keys.length, tuples, aggregation: fn };
  }

  // ---------- Tableau data binding ----------

  async function getFieldMapping(worksheet) {
    const visualSpec = await worksheet.getVisualSpecificationAsync();
    const marksCard = visualSpec.marksSpecifications[visualSpec.activeMarksSpecificationIndex];
    const mapping = {};
    for (const encoding of marksCard.encodings) if (encoding.field) mapping[encoding.id] = encoding.field.name;
    return mapping;
  }

  async function onDataChanged() {
    // Rapid-fire change events can resolve out of order; only the latest one is applied.
    const seq = ++dataSeq;
    try {
      const mapping = await getFieldMapping(state.worksheet);
      if (seq !== dataSeq) return;
      state.regionFieldName = mapping.region || null;
      state.valueFieldName = mapping.value || null;

      if (!mapping.region || !mapping.value) {
        state.dataMap = {};
        els.dataHint.classList.remove('hidden');
        els.dataSummary.classList.add('hidden');
        els.dataHint.textContent = !mapping.region && !mapping.value
          ? 'Drag a discrete field onto Region ID and a measure onto Value on the Marks card.'
          : (!mapping.region ? 'Drag a discrete field onto Region ID on the Marks card.' : 'Drag a measure onto Value on the Marks card.');
        renderShapes();
        return;
      }
      els.dataHint.classList.add('hidden');

      const reader = await state.worksheet.getSummaryDataReaderAsync(undefined, { ignoreSelection: true });
      // getAllPagesAsync() can throw when the sheet momentarily has zero summary rows — e.g.
      // right as it's dropped onto a dashboard. Treat that as "no data yet" rather than an error.
      let dataTable;
      if (reader.pageCount > 0) {
        try {
          dataTable = await reader.getAllPagesAsync();
        } catch (pageErr) {
          console.warn('getAllPagesAsync failed on a non-empty reader, treating as no data:', pageErr);
          dataTable = { columns: reader.columns, data: [] };
        }
      } else {
        dataTable = { columns: reader.columns, data: [] };
      }
      await reader.releaseAsync();
      if (seq !== dataSeq) return;

      const regionColIdx = dataTable.columns.findIndex(c => c.fieldName === mapping.region);
      const valueColIdx = dataTable.columns.findIndex(c => c.fieldName === mapping.value);
      const rowCountColIdx = mapping.rowcount ? dataTable.columns.findIndex(c => c.fieldName === mapping.rowcount) : -1;

      const map = {};
      if (regionColIdx !== -1 && valueColIdx !== -1) {
        dataTable.data.forEach((row) => {
          const regionLabel = String(row[regionColIdx].formattedValue || row[regionColIdx].value || '');
          const key = regionLabel.trim().toLowerCase();
          if (!key) return;
          const entry = { raw: Number(row[valueColIdx].value), formatted: row[valueColIdx].formattedValue, regionLabel: regionLabel.trim() };
          if (rowCountColIdx !== -1) entry.rowCount = Number(row[rowCountColIdx].value);
          map[key] = entry;
        });
      }
      state.dataMap = map;
      renderShapes();
      if (state.configGroupId && !els.configModal.classList.contains('hidden')) {
        // Refresh "missing value" markers without stealing focus from an input.
        const active = document.activeElement;
        if (!active || !els.configBody.contains(active)) renderConfigModal();
      }
    } catch (e) {
      console.error('Error refreshing data', e);
      setStatus('Could not read worksheet data: ' + errText(e), true);
    }
  }

  function updateDataSummary() {
    const keys = Object.keys(state.dataMap);
    const assigned = assignmentIndex();
    const unassigned = keys.filter(k => !assigned[k]).length;
    els.dataSummary.textContent = `${keys.length} value${keys.length === 1 ? '' : 's'} in ${state.regionFieldName}` +
      (keys.length ? ` · ${unassigned} not assigned to a region` : '');
    els.dataSummary.classList.remove('hidden');
  }
})();
