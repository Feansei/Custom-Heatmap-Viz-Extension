'use strict';

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SETTINGS_KEY = 'appData';
  const NO_DATA_COLOR = '#cbcbcb';
  const AGG_FUNCS = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'COUNTD', 'MEDIAN'];
  const TOGGLE_MODES = ['clear', 'keep', 'all'];
  const DEFAULT_TOOLTIP_TEMPLATE = '{name}\n{agg}: {value} ({matched}/{total} matched)';

  const ICONS = {
    gear: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>',
    lockClosed: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>',
    lockOpen: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.4-2.2"></path></svg>',
    pencil: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
    trash: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>',
    close: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>',
    smooth: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c4-10 12-10 16-14"></path></svg>',
    eye: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"></path><path d="M10.6 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-3.4 4.1M6.5 6.6C3.4 8.6 1 12 1 12s4 7 11 7a10.6 10.6 0 0 0 5-1.2"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
  };

  const state = {
    worksheet: null,
    imageSrc: null,
    imageSourceType: 'none',

    // A "group" is the data/config unit: matched values, aggregation, palette, tooltip,
    // per-group filter target sheets, and what happens on a second click.
    // { id, name, matchValues:[], aggregation:'AVG', palette:{steps:[...]},
    //   tooltipTemplate:string, targetSheets:string, toggleMode:'clear'|'keep'|'all' }
    groups: [],

    // A "shape" is a drawn polygon that points at a group. Multiple shapes can share a group.
    // { id, groupId, points:[{x,y}], smooth:boolean }
    shapes: [],

    dataMap: {},               // normalized key -> { raw, formatted, tupleId, regionLabel, rowCount? }
    opacity: 0.65,
    locked: false,
    forceLocked: false,
    sidebarCollapsed: false,
    zoom: 1,
    theme: 'light',
    canvasBgColor: null,
    canvasBgImage: '',
    regionFieldName: null,
    filterTargetSheets: '',      // global default target sheets, used when a group has none of its own
    activeGroupId: null,          // which group's filter is currently applied (for click-to-toggle)
    showStatusNotifications: true,
    showLegend: true,
    hoverGroupId: null,          // transient, not persisted — drives the legend while hovering

    mode: 'view',                  // 'view' | 'draw'
    drawingPoints: [],
    editingShapeId: null,           // shape being redrawn
    drawTargetGroupId: null,         // set => finishing this draw adds a shape to this existing group
    configGroupId: null
  };

  let els = {};
  let saveTimer = null;

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
    els = {
      statusBar: document.getElementById('statusBar'),
      fileInput: document.getElementById('fileInput'),
      imageUrlInput: document.getElementById('imageUrlInput'),
      loadUrlBtn: document.getElementById('loadUrlBtn'),
      clearImageBtn: document.getElementById('clearImageBtn'),
      addRegionBtn: document.getElementById('addRegionBtn'),
      finishRegionBtn: document.getElementById('finishRegionBtn'),
      cancelRegionBtn: document.getElementById('cancelRegionBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
      lockToggleBtn: document.getElementById('lockToggleBtn'),
      sidebarToggle: document.getElementById('sidebarToggle'),
      zoomRange: document.getElementById('zoomRange'),
      zoomInBtn: document.getElementById('zoomInBtn'),
      zoomOutBtn: document.getElementById('zoomOutBtn'),
      zoomLabel: document.getElementById('zoomLabel'),
      canvasArea: document.getElementById('canvasArea'),
      imageWrap: document.getElementById('imageWrap'),
      emptyState: document.getElementById('emptyState'),
      bgImage: document.getElementById('bgImage'),
      overlay: document.getElementById('overlay'),
      drawHint: document.getElementById('drawHint'),
      namePrompt: document.getElementById('namePrompt'),
      regionNameInput: document.getElementById('regionNameInput'),
      regionNameSave: document.getElementById('regionNameSave'),
      regionNameCancel: document.getElementById('regionNameCancel'),
      tooltip: document.getElementById('tooltip'),
      dataHint: document.getElementById('dataHint'),
      activeFilterHint: document.getElementById('activeFilterHint'),
      opacityRange: document.getElementById('opacityRange'),
      regionList: document.getElementById('regionList'),
      regionCount: document.getElementById('regionCount'),
      clearSelectionBtn: document.getElementById('clearSelectionBtn'),
      configModal: document.getElementById('configModal'),
      configTitle: document.getElementById('configTitle'),
      configBody: document.getElementById('configBody'),
      configCloseBtn: document.getElementById('configCloseBtn'),
      settingsModal: document.getElementById('settingsModal'),
      settingsCloseBtn: document.getElementById('settingsCloseBtn'),
      themeLightBtn: document.getElementById('themeLightBtn'),
      themeDarkBtn: document.getElementById('themeDarkBtn'),
      canvasBgColorInput: document.getElementById('canvasBgColorInput'),
      canvasBgImageInput: document.getElementById('canvasBgImageInput'),
      canvasBgClearBtn: document.getElementById('canvasBgClearBtn'),
      filterTargetSheetsInput: document.getElementById('filterTargetSheetsInput'),
      showStatusToggle: document.getElementById('showStatusToggle'),
      showAllRegionsBtn: document.getElementById('showAllRegionsBtn'),
      legendControl: document.getElementById('legendControl'),
      legendTitle: document.getElementById('legendTitle'),
      legendGradient: document.getElementById('legendGradient'),
      legendMin: document.getElementById('legendMin'),
      legendMax: document.getElementById('legendMax'),
      showLegendToggle: document.getElementById('showLegendToggle'),
      copyConfigBtn: document.getElementById('copyConfigBtn'),
      pasteConfigBtn: document.getElementById('pasteConfigBtn'),
      transferModal: document.getElementById('transferModal'),
      transferTitle: document.getElementById('transferTitle'),
      transferHint: document.getElementById('transferHint'),
      transferTextarea: document.getElementById('transferTextarea'),
      transferCopyBtn: document.getElementById('transferCopyBtn'),
      transferApplyBtn: document.getElementById('transferApplyBtn'),
      transferCloseBtn: document.getElementById('transferCloseBtn')
    };
  }

  function wireStaticUi() {
    els.fileInput.addEventListener('change', onFileChosen);
    els.loadUrlBtn.addEventListener('click', onLoadUrl);
    els.clearImageBtn.addEventListener('click', onClearImage);

    els.addRegionBtn.addEventListener('click', () => startDrawing(null));
    els.finishRegionBtn.addEventListener('click', finishDrawing);
    els.cancelRegionBtn.addEventListener('click', cancelDrawing);

    els.overlay.addEventListener('click', onOverlayClick);

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
      renderShapes();
      persist();
    });

    els.clearSelectionBtn.addEventListener('click', clearActiveFilterManually);

    els.lockToggleBtn.addEventListener('click', () => {
      state.locked = !state.locked;
      if (state.mode === 'draw') cancelDrawing();
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

    els.settingsBtn.addEventListener('click', () => els.settingsModal.classList.remove('hidden'));
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
      applyCanvasBackground();
      persist();
    });

    els.filterTargetSheetsInput.addEventListener('change', () => {
      state.filterTargetSheets = els.filterTargetSheetsInput.value.trim();
      persist();
    });

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

    els.copyConfigBtn.addEventListener('click', openExportModal);
    els.pasteConfigBtn.addEventListener('click', openImportModal);
    els.transferCloseBtn.addEventListener('click', () => els.transferModal.classList.add('hidden'));
    els.transferCopyBtn.addEventListener('click', copyTransferTextToClipboard);
    els.transferApplyBtn.addEventListener('click', applyImportedConfig);

    els.configCloseBtn.addEventListener('click', closeConfigModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.mode === 'draw') cancelDrawing();
    });
  }

  function applySettingsToUi() {
    els.opacityRange.value = state.opacity;
    els.canvasBgColorInput.value = state.canvasBgColor || '#ebebeb';
    els.canvasBgImageInput.value = state.canvasBgImage || '';
    els.filterTargetSheetsInput.value = state.filterTargetSheets || '';
    els.showStatusToggle.checked = state.showStatusNotifications;
    els.showLegendToggle.checked = state.showLegend;
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
    if (state.canvasBgColor) els.canvasArea.style.backgroundColor = state.canvasBgColor;
    else els.canvasArea.style.backgroundColor = '';
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
    els.zoomRange.value = state.zoom;
    els.zoomLabel.textContent = Math.round(state.zoom * 100) + '%';
    if (state.mode === 'draw') renderShapes();
  }

  function detectViewingMode() {
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

  // ---------- Settings persistence (with migration from the old single-region format) ----------

  function loadSettings() {
    try {
      const raw = tableau.extensions.settings.get(SETTINGS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);

      state.imageSrc = data.imageSrc || null;
      state.imageSourceType = data.imageSourceType || 'none';
      state.opacity = typeof data.opacity === 'number' ? data.opacity : state.opacity;
      state.locked = !!data.locked;
      state.sidebarCollapsed = !!data.sidebarCollapsed;
      state.theme = data.theme === 'dark' ? 'dark' : 'light';
      state.canvasBgColor = data.canvasBgColor || null;
      state.canvasBgImage = data.canvasBgImage || '';
      state.filterTargetSheets = data.filterTargetSheets || '';
      state.showStatusNotifications = typeof data.showStatusNotifications === 'boolean' ? data.showStatusNotifications : true;
      state.showLegend = typeof data.showLegend === 'boolean' ? data.showLegend : true;

      if (Array.isArray(data.groups) || Array.isArray(data.shapes)) {
        state.groups = (data.groups || []).map(normalizeGroup);
        state.shapes = (data.shapes || []).map(normalizeShape);
      } else if (Array.isArray(data.regions)) {
        // Migrate from the earlier one-shape-per-region format: each old region becomes a
        // group with exactly one shape, so nothing already configured is lost.
        state.groups = data.regions.map(r => normalizeGroup({
          id: r.id, name: r.name, matchValues: r.matchValues, aggregation: r.aggregation,
          palette: r.palette, tooltipTemplate: r.tooltipTemplate, targetSheets: '', toggleMode: 'clear'
        }));
        state.shapes = data.regions.map(r => normalizeShape({
          id: r.id + '_s1', groupId: r.id, points: r.points, smooth: r.smooth
        }));
      }
    } catch (e) {
      console.error('Could not read saved settings', e);
    }
  }

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
      valueSuffix: typeof g.valueSuffix === 'string' ? g.valueSuffix : ''
    };
  }
  function normalizeShape(s) {
    return { id: s.id, groupId: s.groupId, points: s.points || [], smooth: !!s.smooth };
  }
  function defaultPalette() {
    return { steps: [{ value: 0, color: '#2b6cb0' }, { value: 50, color: '#f7fafc' }, { value: 100, color: '#e53e3e' }] };
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const payload = {
        imageSrc: state.imageSrc,
        imageSourceType: state.imageSourceType,
        groups: state.groups,
        shapes: state.shapes,
        opacity: state.opacity,
        locked: state.locked,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        canvasBgColor: state.canvasBgColor,
        canvasBgImage: state.canvasBgImage,
        filterTargetSheets: state.filterTargetSheets,
        showStatusNotifications: state.showStatusNotifications,
        showLegend: state.showLegend
      };
      try {
        tableau.extensions.settings.set(SETTINGS_KEY, JSON.stringify(payload));
        await tableau.extensions.settings.saveAsync();
        setStatus('Saved to workbook', false);
      } catch (e) {
        setStatus('Could not save — the embedded image may be too large for workbook settings. Try "Load URL" instead of uploading the file.', true);
      }
    }, 350);
  }

  function setStatus(msg, isError) {
    if (!state.showStatusNotifications) return;
    els.statusBar.textContent = msg;
    els.statusBar.classList.remove('hidden', 'ok');
    if (!isError) els.statusBar.classList.add('ok');
    clearTimeout(setStatus._t);
    setStatus._t = setTimeout(() => els.statusBar.classList.add('hidden'), isError ? 6000 : 2000);
  }

  // ---------- Copy / paste configuration (image + regions + settings, as text) ----------

  function buildConfigPayload() {
    return {
      imageSrc: state.imageSrc,
      imageSourceType: state.imageSourceType,
      groups: state.groups,
      shapes: state.shapes,
      opacity: state.opacity,
      canvasBgColor: state.canvasBgColor,
      canvasBgImage: state.canvasBgImage,
      filterTargetSheets: state.filterTargetSheets
    };
  }

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

  function applyImportedConfig() {
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
    if (!confirm('This replaces the current image and all regions with the pasted configuration. Continue?')) return;

    state.imageSrc = data.imageSrc || null;
    state.imageSourceType = data.imageSourceType || 'none';
    state.groups = (data.groups || []).map(normalizeGroup);
    state.shapes = (data.shapes || []).map(normalizeShape);
    state.opacity = typeof data.opacity === 'number' ? data.opacity : state.opacity;
    state.canvasBgColor = data.canvasBgColor || null;
    state.canvasBgImage = data.canvasBgImage || '';
    state.filterTargetSheets = data.filterTargetSheets || '';
    state.activeGroupId = null;
    state.hoverGroupId = null;

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

  function onClearImage() {
    if (state.shapes.length && !confirm('Clear the image? Existing regions will remain but will have nothing to sit on until you load a new image.')) return;
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
  }

  // ---------- Drawing shapes ----------

  function startDrawing(targetGroupId) {
    if (!state.imageSrc) return;
    state.mode = 'draw';
    state.drawingPoints = [];
    state.editingShapeId = null;
    state.drawTargetGroupId = targetGroupId || null;
    els.overlay.classList.add('drawing');
    els.addRegionBtn.classList.add('hidden');
    els.finishRegionBtn.classList.remove('hidden');
    els.cancelRegionBtn.classList.remove('hidden');
    els.drawHint.classList.remove('hidden');
    renderShapes();
  }

  function redrawShape(shapeId) {
    if (!state.imageSrc) return;
    state.mode = 'draw';
    state.drawingPoints = [];
    state.editingShapeId = shapeId;
    state.drawTargetGroupId = null;
    els.overlay.classList.add('drawing');
    els.addRegionBtn.classList.add('hidden');
    els.finishRegionBtn.classList.remove('hidden');
    els.cancelRegionBtn.classList.remove('hidden');
    els.drawHint.classList.remove('hidden');
    renderShapes();
  }

  function exitDrawMode() {
    state.mode = 'view';
    state.drawTargetGroupId = null;
    els.overlay.classList.remove('drawing');
    els.addRegionBtn.classList.remove('hidden');
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

  function onOverlayClick(e) {
    if (state.mode !== 'draw') return;
    const rect = els.overlay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    state.drawingPoints.push({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
    renderShapes();
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
      state.shapes.push({ id: 'sh' + Date.now() + Math.floor(Math.random() * 1000), groupId: state.drawTargetGroupId, points: state.drawingPoints.slice(), smooth: false });
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
    const groupId = 'g' + Date.now() + Math.floor(Math.random() * 1000);
    state.groups.push({
      id: groupId, name: name, matchValues: [], aggregation: 'AVG',
      palette: defaultPalette(), tooltipTemplate: DEFAULT_TOOLTIP_TEMPLATE,
      targetSheets: '', toggleMode: 'clear', visible: true, valuePrefix: '', valueSuffix: ''
    });
    state.shapes.push({ id: 'sh' + Date.now() + Math.floor(Math.random() * 1000), groupId: groupId, points: state.drawingPoints.slice(), smooth: false });
    state.drawingPoints = [];
    hideNamePrompt();
    exitDrawMode();
    persist();
    setStatus('Region created — open ⚙ to assign data values.', false);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ---------- Sidebar: group list with nested shapes ----------

  function renderGroupList() {
    els.regionCount.textContent = state.groups.length ? `(${state.groups.length})` : '';
    els.showAllRegionsBtn.classList.toggle('hidden', !state.groups.some(g => !g.visible));
    if (!state.groups.length) {
      els.regionList.innerHTML = '<p class="hint">No regions yet. Draw one on the image.</p>';
      return;
    }
    els.regionList.innerHTML = '';
    state.groups.forEach((group) => {
      const val = getGroupValue(group);
      const color = val ? colorForPaletteValue(val.raw, group.palette.steps) : NO_DATA_COLOR;
      const isActive = state.activeGroupId === group.id;
      const memberShapes = state.shapes.filter(s => s.groupId === group.id);

      const card = document.createElement('div');
      card.className = 'group-card' + (isActive ? ' active-filter' : '');

      const row = document.createElement('div');
      row.className = 'region-row' + (isActive ? ' selected' : '') + (group.visible ? '' : ' dim');
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-pressed', String(isActive));

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
      actions.appendChild(iconBtn('gear', 'Data values, aggregation, filter behavior & tooltip', () => openConfigModal(group.id)));
      actions.appendChild(iconBtn('copy', 'Duplicate this region\'s config (as a new, shapeless region)', () => duplicateGroup(group.id)));
      actions.appendChild(iconBtn('trash', 'Delete region (and all its shapes)', () => deleteGroup(group.id), true));

      row.appendChild(swatch);
      row.appendChild(info);
      row.appendChild(actions);
      row.addEventListener('click', () => handleGroupClick(group.id));
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGroupClick(group.id); } });
      row.addEventListener('mouseenter', () => highlightGroup(group.id, true));
      row.addEventListener('mouseleave', () => highlightGroup(group.id, false));
      card.appendChild(row);

      const shapeList = document.createElement('div');
      shapeList.className = 'shape-list';
      memberShapes.forEach((shape, idx) => {
        const sRow = document.createElement('div');
        sRow.className = 'shape-row';
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

        sRow.appendChild(iconBtn('pencil', 'Redraw this shape', () => redrawShape(shape.id)));
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
      if (el) el.style.opacity = on ? '1' : '';
    });
  }

  function deleteGroup(groupId) {
    if (state.activeGroupId === groupId) clearActiveFilterManually();
    state.groups = state.groups.filter(g => g.id !== groupId);
    state.shapes = state.shapes.filter(s => s.groupId !== groupId);
    renderShapes();
    persist();
  }

  function duplicateGroup(groupId) {
    const source = state.groups.find(g => g.id === groupId);
    if (!source) return;
    // Copies configuration (aggregation, palette, tooltip, filter behavior, format) but
    // deliberately not matched values or shapes — those are what typically need to differ
    // between otherwise-identical regions (e.g. several rooms with the same setup).
    const clone = normalizeGroup({
      id: 'g' + Date.now() + Math.floor(Math.random() * 1000),
      name: source.name + ' Copy',
      matchValues: [],
      aggregation: source.aggregation,
      palette: JSON.parse(JSON.stringify(source.palette)),
      tooltipTemplate: source.tooltipTemplate,
      targetSheets: source.targetSheets,
      toggleMode: source.toggleMode,
      visible: true,
      valuePrefix: source.valuePrefix,
      valueSuffix: source.valueSuffix
    });
    state.groups.push(clone);
    renderShapes();
    persist();
    setStatus(`Duplicated "${source.name}" as "${clone.name}" — draw a shape and add data values for it.`, false);
  }

  function deleteShape(shapeId) {
    const shape = state.shapes.find(s => s.id === shapeId);
    if (!shape) return;
    const groupId = shape.groupId;
    state.shapes = state.shapes.filter(s => s.id !== shapeId);
    const remaining = state.shapes.filter(s => s.groupId === groupId).length;
    if (remaining === 0) {
      // A region with zero shapes has nothing to draw or click — drop it too.
      if (state.activeGroupId === groupId) clearActiveFilterManually();
      state.groups = state.groups.filter(g => g.id !== groupId);
      setStatus('Last shape removed, so the region was deleted too.', false);
    }
    renderShapes();
    persist();
  }

  // ---------- Click-to-filter (apply on first click, per-region behavior on the next) ----------

  function handleGroupClick(groupId) {
    if (state.mode === 'draw') return;
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    if (state.activeGroupId !== groupId) {
      activateGroupFilter(group);
    } else {
      toggleOffGroupFilter(group);
    }
  }

  function getGroupTargetSheets(group) {
    const own = (group.targetSheets || '').split(',').map(s => s.trim()).filter(Boolean);
    if (own.length) return own;
    return (state.filterTargetSheets || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  async function activateGroupFilter(group) {
    if (!state.regionFieldName) { setStatus('No Region ID field is set on the Marks card yet.', true); return; }
    const targetSheets = getGroupTargetSheets(group);
    if (!targetSheets.length) {
      setStatus(`"${group.name}" has no target worksheets — set them in its ⚙ panel or as a default in Settings.`, true);
      return;
    }
    const val = getGroupValue(group);
    if (!val) { setStatus(`"${group.name}" has no matching data to filter on.`, true); return; }
    const values = Array.from(new Set(val.tuples.map(t => t.regionLabel).filter(Boolean)));
    if (!values.length) { setStatus(`"${group.name}" has no matching data to filter on.`, true); return; }

    try {
      // applyFilterAsync necessarily targets this worksheet first; immediately retarget to only
      // the intended sheets (excluding this one) so the extension's own view stays unfiltered.
      await state.worksheet.applyFilterAsync(state.regionFieldName, values, tableau.FilterUpdateType.Replace, { isExcludeMode: false });
      const filters = await state.worksheet.getFiltersAsync();
      const catFilter = filters.find(f => f.fieldName === state.regionFieldName);
      if (catFilter && typeof catFilter.setAppliedWorksheetsAsync === 'function') {
        await catFilter.setAppliedWorksheetsAsync(targetSheets);
        state.activeGroupId = group.id;
        renderShapes();
        setStatus(`"${group.name}" filtering: ${targetSheets.join(', ')}.`, false);
      } else {
        await state.worksheet.clearFilterAsync(state.regionFieldName);
        setStatus("Couldn't retarget the filter to other sheets, so it wasn't applied.", true);
      }
    } catch (e) {
      try { await state.worksheet.clearFilterAsync(state.regionFieldName); } catch (e2) { /* ignore */ }
      setStatus('Could not apply filter: ' + e, true);
    }
  }

  async function toggleOffGroupFilter(group) {
    const targetSheets = getGroupTargetSheets(group);
    try {
      if (group.toggleMode === 'keep') {
        setStatus(`"${group.name}" filter kept as-is.`, false);
        return;
      }
      if (group.toggleMode === 'all') {
        if (state.regionFieldName && targetSheets.length) {
          await state.worksheet.applyFilterAsync(state.regionFieldName, [], tableau.FilterUpdateType.All, { isExcludeMode: false });
          const filters = await state.worksheet.getFiltersAsync();
          const catFilter = filters.find(f => f.fieldName === state.regionFieldName);
          if (catFilter && typeof catFilter.setAppliedWorksheetsAsync === 'function') {
            await catFilter.setAppliedWorksheetsAsync(targetSheets);
          }
        }
        state.activeGroupId = null;
        renderShapes();
        setStatus(`"${group.name}": showing all values on ${targetSheets.join(', ') || 'target sheets'}.`, false);
        return;
      }
      // 'clear' (default): release the filter from wherever it's applied.
      await releaseActiveFilter();
      state.activeGroupId = null;
      renderShapes();
      setStatus(`"${group.name}" filter cleared.`, false);
    } catch (e) {
      setStatus('Could not update filter: ' + e, true);
    }
  }

  async function releaseActiveFilter() {
    if (!state.regionFieldName) return;
    try {
      const filters = await state.worksheet.getFiltersAsync();
      const catFilter = filters.find(f => f.fieldName === state.regionFieldName);
      if (catFilter && typeof catFilter.setAppliedWorksheetsAsync === 'function') {
        await catFilter.setAppliedWorksheetsAsync([]);
      }
    } catch (e) { /* ignore */ }
    try { await state.worksheet.clearFilterAsync(state.regionFieldName); } catch (e) { /* ignore */ }
  }

  async function clearActiveFilterManually() {
    await releaseActiveFilter();
    state.activeGroupId = null;
    renderShapes();
    try { await state.worksheet.clearSelectedMarksAsync(); } catch (e) { /* ignore */ }
    setStatus('Active filter cleared.', false);
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

  function renderConfigModal() {
    const group = state.groups.find(g => g.id === state.configGroupId);
    if (!group) return;
    els.configTitle.textContent = 'Configure: ' + group.name;
    els.configBody.innerHTML = '';

    // --- Data values group ---
    const dataSection = document.createElement('div');
    dataSection.className = 'modal-section';
    dataSection.innerHTML = '<h4>Data values in this region</h4><p class="hint">These values are matched against your Region ID field. They are completely independent of the region\'s name.</p>';

    const chipList = document.createElement('div');
    chipList.className = 'chip-list';
    group.matchValues.forEach((v, idx) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = v;
      const rm = document.createElement('button');
      rm.innerHTML = ICONS.close;
      rm.title = 'Remove';
      rm.setAttribute('aria-label', 'Remove value ' + v);
      rm.addEventListener('click', () => { group.matchValues.splice(idx, 1); renderConfigModal(); persist(); });
      chip.appendChild(rm);
      chipList.appendChild(chip);
    });
    dataSection.appendChild(chipList);

    const addRow = document.createElement('div');
    addRow.className = 'chip-add-row';
    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.placeholder = 'Write the name of your discrete value here';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-subtle';
    addBtn.textContent = '+ Add';
    const addValue = () => {
      const v = addInput.value.trim();
      if (!v) return;
      if (group.matchValues.some(x => x.toLowerCase() === v.toLowerCase())) { addInput.value = ''; return; }
      group.matchValues.push(v);
      renderConfigModal();
      persist();
    };
    addBtn.addEventListener('click', addValue);
    addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addValue(); });
    addRow.appendChild(addInput);
    addRow.appendChild(addBtn);
    dataSection.appendChild(addRow);

    const aggRow = document.createElement('div');
    aggRow.className = 'agg-row';
    const aggLabel = document.createElement('label');
    aggLabel.textContent = 'Aggregation';
    const aggSelect = document.createElement('select');
    AGG_FUNCS.forEach((fn) => {
      const opt = document.createElement('option');
      opt.value = fn; opt.textContent = fn;
      if (group.aggregation === fn) opt.selected = true;
      aggSelect.appendChild(opt);
    });
    aggSelect.addEventListener('change', () => { group.aggregation = aggSelect.value; renderShapes(); persist(); });
    aggRow.appendChild(aggLabel);
    aggRow.appendChild(aggSelect);
    dataSection.appendChild(aggRow);

    const aggHint = document.createElement('p');
    aggHint.className = 'hint';
    aggHint.style.marginTop = '6px';
    aggHint.textContent = 'COUNT sums a "Row Count" field from the Marks card if you\'ve added one; otherwise it counts matched values.';
    dataSection.appendChild(aggHint);

    const formatRow = document.createElement('div');
    formatRow.className = 'field-row';
    formatRow.style.marginTop = '10px';
    const prefixInput = document.createElement('input');
    prefixInput.type = 'text';
    prefixInput.placeholder = 'Prefix (e.g. $)';
    prefixInput.style.width = '70px';
    prefixInput.value = group.valuePrefix;
    prefixInput.addEventListener('change', () => { group.valuePrefix = prefixInput.value; renderShapes(); persist(); });
    const suffixInput = document.createElement('input');
    suffixInput.type = 'text';
    suffixInput.placeholder = 'Suffix (e.g. kWh)';
    suffixInput.style.flex = '1';
    suffixInput.value = group.valueSuffix;
    suffixInput.addEventListener('change', () => { group.valueSuffix = suffixInput.value; renderShapes(); persist(); });
    const formatLabel = document.createElement('span');
    formatLabel.className = 'field-label';
    formatLabel.textContent = 'Format';
    formatRow.appendChild(formatLabel);
    formatRow.appendChild(prefixInput);
    formatRow.appendChild(suffixInput);
    dataSection.appendChild(formatRow);

    els.configBody.appendChild(dataSection);

    // --- Filtering behavior ---
    const filterSection = document.createElement('div');
    filterSection.className = 'modal-section';
    filterSection.innerHTML = '<h4>Filtering</h4>';

    const targetRow = document.createElement('div');
    targetRow.className = 'field-row';
    const targetLabel = document.createElement('span');
    targetLabel.className = 'field-label';
    targetLabel.textContent = 'Target sheets';
    const targetInput = document.createElement('input');
    targetInput.type = 'text';
    targetInput.placeholder = 'Uses Settings default if blank';
    targetInput.style.flex = '1';
    targetInput.value = group.targetSheets;
    targetInput.addEventListener('change', () => { group.targetSheets = targetInput.value.trim(); persist(); });
    targetRow.appendChild(targetLabel);
    targetRow.appendChild(targetInput);
    filterSection.appendChild(targetRow);

    const targetHint = document.createElement('p');
    targetHint.className = 'hint';
    targetHint.style.marginTop = '4px';
    targetHint.textContent = 'Comma-separated worksheet names this region filters when clicked. Leave blank to use the default from ⚙ Settings.';
    filterSection.appendChild(targetHint);

    const toggleRow = document.createElement('div');
    toggleRow.className = 'field-row';
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'field-label';
    toggleLabel.textContent = 'On 2nd click';
    const toggleSelect = document.createElement('select');
    toggleSelect.style.flex = '1';
    [
      ['clear', 'Fully unapply the filter'],
      ['keep', 'Keep the current filter'],
      ['all', 'Select all values in the field']
    ].forEach(([val, label]) => {
      const opt = document.createElement('option');
      opt.value = val; opt.textContent = label;
      if (group.toggleMode === val) opt.selected = true;
      toggleSelect.appendChild(opt);
    });
    toggleSelect.addEventListener('change', () => { group.toggleMode = toggleSelect.value; persist(); });
    toggleRow.appendChild(toggleLabel);
    toggleRow.appendChild(toggleSelect);
    filterSection.appendChild(toggleRow);

    els.configBody.appendChild(filterSection);

    // --- Tooltip ---
    const tooltipSection = document.createElement('div');
    tooltipSection.className = 'modal-section';
    tooltipSection.innerHTML = '<h4>Tooltip text</h4><p class="hint">Use {name}, {agg}, {value}, {matched}, {total} as placeholders.</p>';
    const tooltipTextarea = document.createElement('textarea');
    tooltipTextarea.className = 'tooltip-editor';
    tooltipTextarea.rows = 3;
    tooltipTextarea.value = group.tooltipTemplate;
    tooltipTextarea.addEventListener('change', () => { group.tooltipTemplate = tooltipTextarea.value || DEFAULT_TOOLTIP_TEMPLATE; persist(); });
    tooltipSection.appendChild(tooltipTextarea);
    const resetTooltipBtn = document.createElement('button');
    resetTooltipBtn.className = 'btn btn-subtle';
    resetTooltipBtn.style.marginTop = '6px';
    resetTooltipBtn.textContent = 'Reset to default';
    resetTooltipBtn.addEventListener('click', () => { group.tooltipTemplate = DEFAULT_TOOLTIP_TEMPLATE; tooltipTextarea.value = DEFAULT_TOOLTIP_TEMPLATE; persist(); });
    tooltipSection.appendChild(resetTooltipBtn);
    els.configBody.appendChild(tooltipSection);

    // --- Diverging color steps ---
    const paletteSection = document.createElement('div');
    paletteSection.className = 'modal-section';
    paletteSection.innerHTML = '<h4>Diverging color steps</h4><p class="hint">Set a color for each value breakpoint. Colors blend smoothly between steps.</p>';
    const preview = document.createElement('div');
    preview.className = 'palette-preview';
    preview.style.background = paletteGradientCss(group.palette.steps);
    paletteSection.appendChild(preview);

    const sortedSteps = group.palette.steps.slice().sort((a, b) => a.value - b.value);
    sortedSteps.forEach((step) => {
      const row = document.createElement('div');
      row.className = 'step-row';
      const label = document.createElement('span');
      label.className = 'row-label';
      label.textContent = 'Value';
      const valInput = document.createElement('input');
      valInput.type = 'number';
      valInput.value = step.value;
      valInput.addEventListener('change', () => { step.value = parseFloat(valInput.value) || 0; renderConfigModal(); persist(); });
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = step.color;
      colorInput.addEventListener('input', () => { step.color = colorInput.value; renderShapes(); updatePreviewOnly(group); });
      colorInput.addEventListener('change', () => persist());
      const removeBtn = iconBtn('close', 'Remove step', () => {
        if (group.palette.steps.length <= 2) { setStatus('Keep at least 2 color steps.', true); return; }
        group.palette.steps = group.palette.steps.filter(s => s !== step);
        renderConfigModal(); persist();
      }, true);
      row.appendChild(label); row.appendChild(valInput); row.appendChild(colorInput); row.appendChild(removeBtn);
      paletteSection.appendChild(row);
    });
    group.palette.steps = sortedSteps;

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
      renderConfigModal(); persist();
    });
    const autoSpaceBtn = document.createElement('button');
    autoSpaceBtn.className = 'btn btn-subtle';
    autoSpaceBtn.textContent = 'Auto-space to data range';
    autoSpaceBtn.addEventListener('click', () => {
      const range = getGlobalValueRange();
      if (!range) { setStatus('No data available yet to auto-space against.', true); return; }
      const n = group.palette.steps.length;
      group.palette.steps.forEach((s, i) => { s.value = Math.round((range.min + (range.max - range.min) * (i / (n - 1))) * 100) / 100; });
      renderConfigModal(); persist();
    });
    stepActions.appendChild(addStepBtn);
    stepActions.appendChild(autoSpaceBtn);
    paletteSection.appendChild(stepActions);
    els.configBody.appendChild(paletteSection);
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

  // ---------- SVG rendering ----------

  function renderShapes() {
    els.overlay.innerHTML = '';
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.innerHTML =
      '<pattern id="hatchPattern" width="3" height="3" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<rect width="3" height="3" fill="#e6e6e6"></rect>' +
      '<line x1="0" y1="0" x2="0" y2="3" stroke="#cbcbcb" stroke-width="1"></line>' +
      '</pattern>';
    els.overlay.appendChild(defs);

    state.shapes.forEach((shape) => {
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

      let cls = 'region-poly' + (val ? '' : ' no-data');
      if (state.activeGroupId === group.id) cls += ' selected';
      shapeEl.setAttribute('class', cls);
      shapeEl.setAttribute('data-shape-id', shape.id);
      shapeEl.setAttribute('data-group-id', group.id);
      if (val) shapeEl.setAttribute('fill', colorForPaletteValue(val.raw, group.palette.steps));
      shapeEl.setAttribute('fill-opacity', state.opacity);

      shapeEl.addEventListener('mousemove', (e) => onShapeMouseMove(e, group, val));
      shapeEl.addEventListener('mouseleave', onShapeMouseLeave);
      shapeEl.addEventListener('click', () => handleGroupClick(group.id));

      els.overlay.appendChild(shapeEl);
    });

    if (state.mode === 'draw' && state.drawingPoints.length) {
      const dotR = clamp(0.6 / state.zoom, 0.15, 1.2);
      const strokeW = clamp(0.3 / state.zoom, 0.08, 0.6);
      const lineW = clamp(0.4 / state.zoom, 0.1, 0.8);
      if (state.drawingPoints.length > 1) {
        const line = document.createElementNS(SVG_NS, 'polyline');
        line.setAttribute('points', state.drawingPoints.map(p => `${p.x},${p.y}`).join(' '));
        line.setAttribute('class', 'draw-line');
        line.style.strokeWidth = lineW;
        els.overlay.appendChild(line);
      }
      state.drawingPoints.forEach((p) => {
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', dotR);
        c.setAttribute('class', 'draw-point');
        c.style.strokeWidth = strokeW;
        els.overlay.appendChild(c);
      });
    }

    renderGroupList();
    updateActiveFilterHint();
    renderLegend();
  }

  function updateActiveFilterHint() {
    if (state.activeGroupId) {
      const g = state.groups.find(x => x.id === state.activeGroupId);
      els.activeFilterHint.textContent = g
        ? `Active: "${g.name}". Click it again to ${g.toggleMode === 'keep' ? 'do nothing (kept)' : g.toggleMode === 'all' ? 'select all values' : 'clear the filter'}.`
        : 'Click a region on the image to filter with it.';
    } else {
      els.activeFilterHint.textContent = 'Click a region on the image to filter with it. Click the same region again to toggle it off (behavior configurable per region in ⚙).';
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
  // Shows the color scale for whichever region is hovered, falling back to the currently
  // active (filtered) region, or hidden entirely if neither and no data to show a scale for.

  function renderLegend() {
    if (!state.showLegend) { els.legendControl.classList.add('hidden'); return; }
    const groupId = state.hoverGroupId || state.activeGroupId;
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
    const tokens = {
      name: group.name,
      agg: val ? val.aggregation : '',
      value: val ? val.formatted : '—',
      matched: val ? String(val.matchedCount) : '0',
      total: val ? String(val.totalCount) : String(group.matchValues.length)
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
    els.tooltip.style.left = (e.clientX + 12) + 'px';
    els.tooltip.style.top = (e.clientY + 12) + 'px';
    els.tooltip.classList.remove('hidden');
  }
  function hideCustomTooltip() { els.tooltip.classList.add('hidden'); }

  // ---------- Color scale ----------

  function getGlobalValueRange() {
    const vals = Object.values(state.dataMap).map(v => v.raw).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) return null;
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
    keys.forEach((k) => {
      const hit = state.dataMap[k.trim().toLowerCase()];
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
    try {
      const mapping = await getFieldMapping(state.worksheet);
      state.regionFieldName = mapping.region || null;

      if (!mapping.region || !mapping.value) {
        state.dataMap = {};
        els.dataHint.classList.remove('hidden');
        els.dataHint.textContent = !mapping.region && !mapping.value
          ? 'Drag a discrete field onto Region ID and a measure onto Value on the Marks card.'
          : (!mapping.region ? 'Drag a discrete field onto Region ID on the Marks card.' : 'Drag a measure onto Value on the Marks card.');
        renderShapes();
        return;
      }
      els.dataHint.classList.add('hidden');

      const reader = await state.worksheet.getSummaryDataReaderAsync(undefined, { ignoreSelection: true });
      const dataTable = await reader.getAllPagesAsync();
      await reader.releaseAsync();

      const regionColIdx = dataTable.columns.findIndex(c => c.fieldName === mapping.region);
      const valueColIdx = dataTable.columns.findIndex(c => c.fieldName === mapping.value);
      const rowCountColIdx = mapping.rowcount ? dataTable.columns.findIndex(c => c.fieldName === mapping.rowcount) : -1;
      const totalRowCount = typeof dataTable.totalRowCount === 'number' ? dataTable.totalRowCount : dataTable.data.length;

      const map = {};
      if (regionColIdx !== -1 && valueColIdx !== -1) {
        dataTable.data.forEach((row, idx) => {
          const regionLabel = String(row[regionColIdx].formattedValue || row[regionColIdx].value || '');
          const key = regionLabel.trim().toLowerCase();
          if (!key) return;
          const tupleId = totalRowCount - idx;
          const entry = { raw: Number(row[valueColIdx].value), formatted: row[valueColIdx].formattedValue, tupleId: tupleId, regionLabel: regionLabel.trim() };
          if (rowCountColIdx !== -1) entry.rowCount = Number(row[rowCountColIdx].value);
          map[key] = entry;
        });
      }
      state.dataMap = map;
      renderShapes();
    } catch (e) {
      console.error('Error refreshing data', e);
      setStatus('Could not read worksheet data: ' + e, true);
    }
  }
})();
