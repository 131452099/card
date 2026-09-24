/* ============================================================
 * 卡面设计工作台 主逻辑
 * 画布坐标系:1536 × 969(ISO 7810 ID-1),圆角 ≈ 57px(3.18mm)
 * ============================================================ */
(function () {
  "use strict";

  const CARD_W = 1536, CARD_H = 969, RADIUS = 57;
  const A = window.CardAssets;

  const canvas = document.getElementById("card");
  const ctx = canvas.getContext("2d");
  const measure = document.createElement("canvas").getContext("2d");

  const FONTS = {
    sans:    "system-ui,'PingFang SC','Microsoft YaHei',sans-serif",
    yahei:   "'Microsoft YaHei','PingFang SC',sans-serif",
    hei:     "'SimHei','Heiti SC',sans-serif",
    song:    "'SimSun','Songti SC',serif",
    fang:    "'FangSong','STFangsong',serif",
    kai:     "'KaiTi','Kaiti SC','STKaiti',serif",
    li:      "'LiSu','STLiti',serif",
    xkai:    "'STXingkai','Xingkai SC',cursive",
    yuan:    "'YouYuan','Yuanti SC','Microsoft YaHei',sans-serif",
    shu:     "'STHupo','Hupo SC','Microsoft YaHei',sans-serif",
    eng:     "'Arial Black',Arial,sans-serif",
    arial:   "Arial,Helvetica,sans-serif",
    georgia: "Georgia,'Times New Roman',serif",
    times:   "'Times New Roman',Times,serif",
    impact:  "Impact,'Arial Black',sans-serif",
    mono:    "Consolas,'JetBrains Mono','Courier New',monospace",
    comic:   "'Comic Sans MS','Chalkboard SE',cursive",
  };
  /* 下拉选项:(值, 名称, 分组) */
  const FONT_OPTS = [
    ["sans", "黑体(无衬线)", "zh"], ["yahei", "微软雅黑", "zh"], ["hei", "黑体 SimHei", "zh"],
    ["song", "宋体", "zh"], ["fang", "仿宋", "zh"], ["kai", "楷体", "zh"],
    ["li", "隶书", "zh"], ["xkai", "行楷", "zh"], ["yuan", "幼圆", "zh"], ["shu", "琥珀(粗)", "zh"],
    ["eng", "西文粗黑", "en"], ["arial", "Arial", "en"], ["georgia", "Georgia", "en"],
    ["times", "Times", "en"], ["impact", "Impact", "en"], ["mono", "等宽 Consolas", "en"],
    ["comic", "手写 Comic", "en"],
  ];
  const fontOptionsHTML = (sel) => {
    const opt = ([v, n]) => `<option value="${v}"${v === sel ? " selected" : ""} style="font-family:${FONTS[v]}">${n}</option>`;
    return `<optgroup label="中文字体">${FONT_OPTS.filter((o) => o[2] === "zh").map(opt).join("")}</optgroup>` +
      `<optgroup label="西文字体">${FONT_OPTS.filter((o) => o[2] === "en").map(opt).join("")}</optgroup>`;
  };

  /* ---------------- 状态 ---------------- */
  const state = {
    bg: { type: "color", colors: ["#141E30", "#243B55"], angle: 135, color: "#ffffff", image: null, imgScale: 1, imgX: 0, imgY: 0 },
    layers: [],          // 底 → 顶
    selectedId: null,
    country: "cn",
    refImage: null, refVisible: false, refOpacity: 0.4,
    zoom: 1,
  };
  let layerSeq = 1;

  function newLayer(p) {
    return Object.assign({
      id: layerSeq++, type: "image", name: "图层",
      img: null, rawImg: null, tol: 24,
      srcId: null, tint: null, origImg: null,
      x: 0.5, y: 0.5, w: 360, rotation: 0, opacity: 1,
      strokeW: 0, strokeColor: "#ffffff",
      text: "文字", font: "sans", fontSize: 64, color: "#ffffff",
      bold: true, italic: false, letterSpacing: 0,
      visible: true,
    }, p);
  }
  const sel = () => state.layers.find((l) => l.id === state.selectedId) || null;

  /* ---------------- Logo 图片缓存 ---------------- */
  const svgURL = (s) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
  const logoCache = new Map();

  function itemSvg(item) {
    if (item.kind === "bank") return A.bankSvg(item);
    if (item.kind === "tier") return A.tierSvg(item);
    return item.svg();
  }

  /* 真实 logo 文件(从卡面抠取,透明背景),优先于内置矢量示意图形 */
  function realLogoFile(item) {
    const m = window.REAL_LOGOS || {};
    return m[item.id] || null;
  }

  function getLogoImage(item) {
    if (logoCache.has(item.id)) return logoCache.get(item.id);
    const file = realLogoFile(item);
    const p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => { /* 文件缺失时回退内置矢量图形 */
        const fb = new Image();
        fb.onload = () => resolve(fb);
        fb.onerror = reject;
        fb.src = svgURL(itemSvg(item));
      };
      img.src = file ? "assets/logos/" + file : svgURL(itemSvg(item));
    });
    logoCache.set(item.id, p);
    return p;
  }

  function buildCatalog() {
    const banks = A.banks.map((b) => Object.assign({ kind: "bank" }, b));
    const orgs = A.orgs.map((o) => Object.assign({ kind: "org" }, o));
    const tiers = A.tiers.map((t) => Object.assign({ kind: "tier" }, t));
    return { banks, orgs, tiers, all: banks.concat(orgs, tiers) };
  }
  const CATALOG = buildCatalog();
  const findItem = (id) => CATALOG.all.find((i) => i.id === id);

  /* ---------------- 工具 ---------------- */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 2000);
  }

  function fontOf(l) {
    return `${l.italic ? "italic " : ""}${l.bold ? "700" : "400"} ${l.fontSize}px ${FONTS[l.font] || FONTS.sans}`;
  }
  function textSize(l) {
    measure.font = fontOf(l);
    if ("letterSpacing" in measure) measure.letterSpacing = l.letterSpacing + "px";
    const w = measure.measureText(l.text || " ").width;
    if ("letterSpacing" in measure) measure.letterSpacing = "0px";
    return { w, h: l.fontSize * 1.1 };
  }
  function imgSize(l) {
    const img = l.img;
    if (!img) return { w: l.w, h: l.w * 0.4 };
    return { w: l.w, h: l.w * (img.naturalHeight || img.height) / (img.naturalWidth || img.width) };
  }
  function layerSize(l) { return l.type === "text" ? textSize(l) : imgSize(l); }

  /* 描边剪影(纯色形状) */
  function getSilhouette(l) {
    const key = l.strokeColor + "|" + Math.round(l.w);
    if (l._silKey === key && l._sil) return l._sil;
    const src = l.img;
    const sw = 480, sh = Math.max(1, Math.round(480 * (src.height / src.width)));
    const c = document.createElement("canvas");
    c.width = sw; c.height = sh;
    const x = c.getContext("2d");
    x.drawImage(src, 0, 0, sw, sh);
    x.globalCompositeOperation = "source-in";
    x.fillStyle = l.strokeColor;
    x.fillRect(0, 0, sw, sh);
    l._sil = c; l._silKey = key;
    return c;
  }

  /* ---------------- 渲染 ---------------- */
  function drawCard(c, opts) {
    const o = opts || {};
    c.clearRect(0, 0, CARD_W, CARD_H);
    c.save();
    rr(c, 0, 0, CARD_W, CARD_H, RADIUS);
    c.clip();
    drawBg(c);
    for (const l of state.layers) if (l.visible) drawLayer(c, l);
    c.restore();
    if (o.ref !== false && state.refVisible && state.refImage) {
      c.save();
      c.globalAlpha = state.refOpacity;
      drawCover(c, state.refImage);
      c.restore();
    }
    if (o.selection !== false) drawSelection(c);
  }

  function drawBg(c) {
    const bg = state.bg;
    if (bg.type === "color") {
      c.fillStyle = bg.color;
      c.fillRect(0, 0, CARD_W, CARD_H);
    } else if (bg.type === "image" && bg.image) {
      c.fillStyle = "#222";
      c.fillRect(0, 0, CARD_W, CARD_H);
      drawCover(c, bg.image, bg.imgScale, bg.imgX / 100 * 0.6, bg.imgY / 100 * 0.6);
    } else {
      const rad = (bg.angle * Math.PI) / 180;
      const cx = CARD_W / 2, cy = CARD_H / 2;
      const len = Math.abs(CARD_W * Math.cos(rad)) + Math.abs(CARD_H * Math.sin(rad));
      const g = c.createLinearGradient(
        cx - Math.cos(rad) * len / 2, cy - Math.sin(rad) * len / 2,
        cx + Math.cos(rad) * len / 2, cy + Math.sin(rad) * len / 2
      );
      const cols = bg.colors.length > 1 ? bg.colors : [bg.colors[0], bg.colors[0]];
      cols.forEach((col, i) => g.addColorStop(i / (cols.length - 1), col));
      c.fillStyle = g;
      c.fillRect(0, 0, CARD_W, CARD_H);
    }
  }

  function drawCover(c, img, scale, ox, oy) {
    const s = Math.max(CARD_W / img.naturalWidth, CARD_H / img.naturalHeight) * (scale || 1);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    c.drawImage(img, (CARD_W - w) / 2 + (ox || 0) * CARD_W, (CARD_H - h) / 2 + (oy || 0) * CARD_H, w, h);
  }

  function drawLayer(c, l) {
    const cx = l.x * CARD_W, cy = l.y * CARD_H;
    c.save();
    c.translate(cx, cy);
    c.rotate((l.rotation * Math.PI) / 180);
    c.globalAlpha = l.opacity;
    if (l.type === "text") {
      c.font = fontOf(l);
      if ("letterSpacing" in c) c.letterSpacing = l.letterSpacing + "px";
      c.textAlign = "center";
      c.textBaseline = "middle";
      if (l.strokeW > 0) {
        c.lineWidth = l.strokeW * 2;
        c.strokeStyle = l.strokeColor;
        c.lineJoin = "round";
        c.strokeText(l.text, 0, 0);
      }
      c.fillStyle = l.color;
      c.fillText(l.text, 0, 0);
      if ("letterSpacing" in c) c.letterSpacing = "0px";
    } else if (l.img) {
      const { w, h } = imgSize(l);
      if (l.strokeW > 0) {
        const sil = getSilhouette(l);
        const R = l.strokeW;
        for (let i = 0; i < 16; i++) {
          const a = (i * Math.PI) / 8;
          c.drawImage(sil, -w / 2 + Math.cos(a) * R, -h / 2 + Math.sin(a) * R, w, h);
        }
      }
      c.drawImage(l.img, -w / 2, -h / 2, w, h);
    }
    c.restore();
  }

  function drawSelection(c) {
    const l = sel();
    if (!l || !l.visible) return;
    const { w, h } = layerSize(l);
    const cx = l.x * CARD_W, cy = l.y * CARD_H;
    c.save();
    c.translate(cx, cy);
    c.rotate((l.rotation * Math.PI) / 180);
    c.strokeStyle = "#f6821f";
    c.lineWidth = 3;
    c.setLineDash([12, 8]);
    c.strokeRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12);
    c.setLineDash([]);
    c.fillStyle = "#f6821f";
    c.strokeStyle = "#fff";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(w / 2 + 6, h / 2 + 6, 15, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
  }

  function render() { drawCard(ctx); }

  /* ---------------- 命中检测与交互 ---------------- */
  function toCard(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * CARD_W) / r.width,
      y: ((e.clientY - r.top) * CARD_H) / r.height,
    };
  }

  function hitLayer(px, py) {
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const l = state.layers[i];
      if (!l.visible) continue;
      const dx = px - l.x * CARD_W, dy = py - l.y * CARD_H;
      const a = (-l.rotation * Math.PI) / 180;
      const rx = dx * Math.cos(a) - dy * Math.sin(a);
      const ry = dx * Math.sin(a) + dy * Math.cos(a);
      const { w, h } = layerSize(l);
      if (Math.abs(rx) <= w / 2 + 10 && Math.abs(ry) <= h / 2 + 10) return l;
    }
    return null;
  }

  function handlePos(l) {
    const { w, h } = layerSize(l);
    const a = (l.rotation * Math.PI) / 180;
    const lx = w / 2 + 6, ly = h / 2 + 6;
    return {
      x: l.x * CARD_W + lx * Math.cos(a) - ly * Math.sin(a),
      y: l.y * CARD_H + lx * Math.sin(a) + ly * Math.cos(a),
    };
  }

  let drag = null;
  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", (e) => {
    const p = toCard(e);
    const l = sel();
    if (l && l.visible) {
      const hp = handlePos(l);
      if (Math.hypot(p.x - hp.x, p.y - hp.y) < 26) {
        drag = { mode: "scale", layer: l, d0: Math.max(8, Math.hypot(p.x - l.x * CARD_W, p.y - l.y * CARD_H)), w0: l.type === "text" ? l.fontSize : l.w };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    const hit = hitLayer(p.x, p.y);
    state.selectedId = hit ? hit.id : null;
    if (hit) {
      drag = {
        mode: "move", layer: hit,
        ox: p.x - hit.x * CARD_W, oy: p.y - hit.y * CARD_H,
      };
      canvas.setPointerCapture(e.pointerId);
    }
    renderLayers();
    renderProps();
    render();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = toCard(e);
    const l = drag.layer;
    if (drag.mode === "move") {
      l.x = clamp((p.x - drag.ox) / CARD_W, -0.25, 1.25);
      l.y = clamp((p.y - drag.oy) / CARD_H, -0.25, 1.25);
    } else {
      const d = Math.max(8, Math.hypot(p.x - l.x * CARD_W, p.y - l.y * CARD_H));
      const k = clamp(d / drag.d0, 0.05, 30);
      if (l.type === "text") l.fontSize = clamp(Math.round(drag.w0 * k), 10, 400);
      else l.w = clamp(Math.round(drag.w0 * k), 24, 2200);
    }
    syncPropsLive();
    render();
  });

  const endDrag = () => { drag = null; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  window.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    const l = sel();
    if (!l) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      removeLayer(l.id);
      e.preventDefault();
    }
    const step = e.shiftKey ? 0.002 : 0.012;
    if (e.key === "ArrowLeft") { l.x -= step; e.preventDefault(); }
    if (e.key === "ArrowRight") { l.x += step; e.preventDefault(); }
    if (e.key === "ArrowUp") { l.y -= step; e.preventDefault(); }
    if (e.key === "ArrowDown") { l.y += step; e.preventDefault(); }
    syncPropsLive();
    render();
  });

  /* ---------------- 图层操作 ---------------- */
  function addLayer(l) {
    state.layers.push(l);
    state.selectedId = l.id;
    renderLayers();
    renderProps();
    render();
    return l;
  }

  function removeLayer(id) {
    state.layers = state.layers.filter((l) => l.id !== id);
    if (state.selectedId === id) state.selectedId = null;
    renderLayers();
    renderProps();
    render();
  }

  /* 依据宽高比自适应放置宽度:近方形(App 图标/徽章)用小尺寸,横版 wordmark 用原尺寸 */
  function fitLogoW(img, baseW) {
    const w0 = img.naturalWidth || img.width || 0;
    const h0 = img.naturalHeight || img.height || 0;
    const ratio = w0 ? h0 / w0 : 0.4;
    return ratio > 0.75 ? Math.round(baseW * 0.5) : baseW;
  }

  /* 素材染色:为素材图层设置任意颜色(不透明素材将整体着色) */
  const tintedCache = new Map();
  /* 将透明背景 logo 图像染为纯色 */
  function tintImage(img, color) {
    const s = Math.min(1, 960 / (img.naturalWidth || img.width || 960));
    const w = Math.max(1, Math.round((img.naturalWidth || img.width) * s));
    const h = Math.max(1, Math.round((img.naturalHeight || img.height) * s));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0, w, h);
    x.globalCompositeOperation = "source-in";
    x.fillStyle = color;
    x.fillRect(0, 0, w, h);
    return c;
  }
  function applyLayerTint(l) {
    if (!l.srcId || !l.img) return;
    if (!l.origImg) l.origImg = l.img;
    if (!l.tint) { l.img = l.origImg; return; }
    const key = l.srcId + "|" + l.tint;
    if (!tintedCache.has(key)) {
      try { tintedCache.set(key, tintImage(l.origImg, l.tint)); }
      catch { tintedCache.set(key, l.origImg); }
    }
    l.img = tintedCache.get(key);
  }

  async function addAsset(id) {
    const item = findItem(id);
    if (!item) return;
    /* 卡等级:直接作为文字图层添加,字体/颜色/字号/字间距均可编辑 */
    if (item.kind === "tier") {
      addLayer(newLayer({
        type: "text", name: item.name, text: item.text,
        font: "georgia", bold: true, fontSize: 56,
        letterSpacing: 12, color: item.color,
        x: 0.5, y: 0.3,
      }));
      toast(`已添加:${item.name}`);
      return;
    }
    try {
      const img = await getLogoImage(item);
      let opt = { img, name: item.name, srcId: item.id };
      if (item.kind === "bank") Object.assign(opt, { x: 0.18, y: 0.15, w: fitLogoW(img, 400) });
      else if (item.id === "mastercard") Object.assign(opt, { x: 0.82, y: 0.84, w: fitLogoW(img, 300) });
      else if (item.id === "visa") Object.assign(opt, { x: 0.8, y: 0.85, w: fitLogoW(img, 300) });
      else if (item.id === "unionpay") Object.assign(opt, { x: 0.8, y: 0.84, w: fitLogoW(img, 250) });
      else if (item.id === "amex") Object.assign(opt, { x: 0.82, y: 0.85, w: fitLogoW(img, 210) });
      else if (item.id === "jcb") Object.assign(opt, { x: 0.82, y: 0.85, w: fitLogoW(img, 220) });
      else if (item.id === "discover") Object.assign(opt, { x: 0.8, y: 0.85, w: fitLogoW(img, 320) });
      else if (item.id === "diners") Object.assign(opt, { x: 0.8, y: 0.85, w: fitLogoW(img, 280) });
      addLayer(newLayer(opt));
      toast(`已添加:${item.name}`);
    } catch (err) {
      toast("素材加载失败");
    }
  }

  function addTextLayer() {
    addLayer(newLayer({
      type: "text", name: "文字",
      text: "白金卡", x: 0.5, y: 0.8, fontSize: 72, color: "#ffffff",
      font: "eng", bold: true,
    }));
  }

  /* ---------------- 上传处理 ---------------- */
  function loadFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
      img.onerror = () => { reject(); URL.revokeObjectURL(url); };
      img.src = url;
    });
  }

  async function onUploadLogos(files) {
    for (const f of files) {
      if (!/^image\//.test(f.type) && !/\.svg$/i.test(f.name)) continue;
      try {
        const img = await loadFile(f);
        const w = clamp(img.naturalWidth * 0.5, 120, 700);
        addLayer(newLayer({ img, rawImg: img, name: f.name.replace(/\.[^.]+$/, ""), w, x: 0.5, y: 0.5 }));
      } catch { toast(`无法读取:${f.name}`); }
    }
    if (files.length) toast("素材已添加到卡面");
  }

  /* 去除底色 */
  function removeBackground(l) {
    const src = l.rawImg || l.img;
    const w = Math.min(src.naturalWidth || src.width, 1000);
    const h = Math.round((src.naturalHeight || src.height) * (w / (src.naturalWidth || src.width)));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.drawImage(src, 0, 0, w, h);
    let data;
    try { data = x.getImageData(0, 0, w, h); } catch { toast("该图片无法处理(跨域限制)"); return; }
    const p = data.data;
    const r0 = p[0], g0 = p[1], b0 = p[2];
    const t = l.tol * 6.8;
    for (let i = 0; i < p.length; i += 4) {
      if (Math.abs(p[i] - r0) + Math.abs(p[i + 1] - g0) + Math.abs(p[i + 2] - b0) <= t) p[i + 3] = 0;
    }
    x.putImageData(data, 0, 0);
    l.img = c;
    l._sil = null;
    render();
    toast("已去除底色");
  }
  function restoreImage(l) {
    if (l.rawImg) { l.img = l.rawImg; l._sil = null; render(); toast("已还原原图"); }
  }

  /* ---------------- UI:标签页 ---------------- */
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      $$(".tab-page").forEach((p) => p.classList.toggle("active", p.id === "tab-" + btn.dataset.tab));
    });
  });

  /* ---------------- UI:背景 ---------------- */
  function buildPresetGrid() {
    const grid = $("#presetGrid");
    A.presets.forEach((p, i) => {
      const d = document.createElement("button");
      d.className = "preset" + (i === 0 ? " active" : "");
      d.style.background = `linear-gradient(${p.angle}deg, ${p.colors.join(", ")})`;
      d.innerHTML = `<span>${p.name}</span>`;
      d.addEventListener("click", () => {
        state.bg.type = "gradient";
        state.bg.colors = p.colors.slice();
        state.bg.angle = p.angle;
        syncBgUI();
        render();
      });
      grid.appendChild(d);
    });
  }

  function syncBgUI() {
    const bg = state.bg;
    $$('input[name="bgType"]').forEach((r) => (r.checked = r.value === bg.type));
    $("#bgGradientBox").hidden = bg.type !== "gradient";
    $("#bgColorBox").hidden = bg.type !== "color";
    $("#bgImageBox").hidden = bg.type !== "image";
    if (bg.type === "gradient") {
      $("#gradA").value = bg.colors[0];
      $("#gradB").value = bg.colors[bg.colors.length - 1];
      $("#gradAngle").value = bg.angle;
      $("#gradAngleVal").textContent = bg.angle + "°";
      $$(".preset").forEach((el, i) => {
        const p = A.presets[i];
        el.classList.toggle("active", p.colors.join() === bg.colors.join() && p.angle === bg.angle);
      });
    }
    if (bg.type === "color") $("#bgColorInput").value = bg.color;
    if (bg.type === "image") {
      $("#bgScale").value = Math.round(bg.imgScale * 100);
      $("#bgScaleVal").textContent = bg.imgScale.toFixed(2) + "×";
      $("#bgOffX").value = Math.round(bg.imgX);
      $("#bgOffY").value = Math.round(bg.imgY);
    }
  }

  $$('input[name="bgType"]').forEach((r) =>
    r.addEventListener("change", () => {
      state.bg.type = r.value;
      if (r.value !== "image") { currentFaceFile = null; renderFaceLibrary(); }
      syncBgUI();
      render();
    })
  );
  $("#gradA").addEventListener("input", (e) => {
    state.bg.colors = [e.target.value, state.bg.colors[state.bg.colors.length - 1]];
    syncBgUI(); render();
  });
  $("#gradB").addEventListener("input", (e) => {
    state.bg.colors = [state.bg.colors[0], e.target.value];
    syncBgUI(); render();
  });
  $("#gradAngle").addEventListener("input", (e) => {
    state.bg.angle = +e.target.value;
    $("#gradAngleVal").textContent = state.bg.angle + "°";
    render();
  });
  $("#bgColorInput").addEventListener("input", (e) => { state.bg.color = e.target.value; render(); });
  $("#bgImgInput").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      state.bg.image = await loadFile(f);
      state.bg.imgScale = 1; state.bg.imgX = 0; state.bg.imgY = 0;
      syncBgUI(); render();
    } catch { toast("图片读取失败"); }
  });
  $("#bgScale").addEventListener("input", (e) => {
    state.bg.imgScale = +e.target.value / 100;
    $("#bgScaleVal").textContent = state.bg.imgScale.toFixed(2) + "×";
    render();
  });
  $("#bgOffX").addEventListener("input", (e) => { state.bg.imgX = +e.target.value; render(); });
  $("#bgOffY").addEventListener("input", (e) => { state.bg.imgY = +e.target.value; render(); });
  $("#bgClear").addEventListener("click", () => {
    state.bg.image = null;
    render();
    toast("已清空背景图片");
  });

  /* ---------------- UI:素材网格 ---------------- */
  function buildAssetGrid(el, items) {
    el.innerHTML = "";
    if (!items.length) {
      el.innerHTML = '<div class="loading">该地区暂未收录</div>';
      return;
    }
    items.forEach((item) => {
      const b = document.createElement("button");
      b.className = "asset-item" + (item.wide ? " wide" : "");
      b.title = "点击添加到卡面";
      const img = document.createElement("img");
      const file = realLogoFile(item);
      img.src = file ? "assets/logos/" + file : svgURL(itemSvg(item));
      img.alt = item.name;
      b.appendChild(img);
      b.addEventListener("click", () => addAsset(item.id));
      el.appendChild(b);
    });
  }

  /* ---------------- 卡面素材库(国家 → 银行 → 卡面) ---------------- */
  /* 真实卡面,已居中裁为 ISO 7810 ID-1 比例;点击即铺满整张卡,上层可继续叠加卡组织/文字 */
  const FACES = window.CARD_FACES || {};
  let currentFaceFile = null;

  const countryName = (c) => (A.countries.find((x) => x.id === c) || {}).name || c;
  const allFacesOf = (c) => (FACES[c] || []).reduce((arr, b) => arr.concat(b.items.map((it) => Object.assign({ bank: b.bank }, it))), []);

  function buildFaceCountryChips() {
    const box = $("#faceCountryChips");
    if (!box) return;
    box.innerHTML = "";
    A.countries.forEach((c) => {
      if (!(FACES[c.id] || []).length) return;   /* 无卡面素材的地区不显示 */
      const chip = document.createElement("button");
      chip.className = "chip" + (c.id === state.country ? " active" : "");
      chip.textContent = c.name;
      chip.addEventListener("click", () => {
        state.country = c.id;
        expandedBanks.clear();
        buildFaceCountryChips();
        renderFaceLibrary();
        /* 国家切换 → 整套卡面随之更换 */
        if ($("#faceFollow") && $("#faceFollow").checked) randomCountryFace();
      });
      box.appendChild(chip);
    });
  }

  const expandedBanks = new Set();          /* 已展开的银行(国家|银行名) */
  const bankKey = (bank) => state.country + "|" + bank;

  function renderFaceLibrary() {
    const box = $("#faceLibrary");
    if (!box) return;
    const banks = FACES[state.country] || [];
    box.innerHTML = "";
    if (!banks.length) {
      box.innerHTML = '<div class="loading">该地区暂无卡面素材</div>';
      return;
    }
    /* 默认全部收起,点银行名才展开 */
    const hint = document.createElement("div");
    hint.className = "loading";
    hint.textContent = "点击银行名展开该行卡面 · 共 " + banks.length + " 家银行";
    box.appendChild(hint);

    banks.forEach((b) => {
      const key = bankKey(b.bank);
      const open = expandedBanks.has(key);
      const sec = document.createElement("div");
      sec.className = "bank-group" + (open ? " open" : "");

      const title = document.createElement("button");
      title.className = "bank-title";
      title.type = "button";
      title.title = open ? "收起" : "展开";
      title.innerHTML = `<span class="arrow">${open ? "▾" : "▸"}</span>` +
        `<span class="bank-name">${b.bank}</span><span class="bank-count">${b.items.length} 张</span>`;
      title.addEventListener("click", () => {
        if (expandedBanks.has(key)) expandedBanks.delete(key);
        else expandedBanks.add(key);
        renderFaceLibrary();
      });
      sec.appendChild(title);
      if (!open) { box.appendChild(sec); return; }

      const grid = document.createElement("div");
      grid.className = "face-grid";
      b.items.forEach((it) => {
        it.bank = b.bank;
        const cell = document.createElement("button");
        cell.className = "face-item" + (it.file === currentFaceFile ? " active" : "");
        cell.title = `${b.bank} · ${it.name}`;
        const img = document.createElement("img");
        img.src = "assets/cardfaces/" + it.thumb;
        img.alt = it.name;
        img.loading = "lazy";
        const tag = document.createElement("span");
        tag.className = "face-tag";
        tag.textContent = it.name;
        cell.appendChild(img);
        cell.appendChild(tag);
        cell.addEventListener("click", () => applyFace(it));
        grid.appendChild(cell);
      });
      sec.appendChild(grid);
      box.appendChild(sec);
    });
  }

  async function applyFace(f) {
    if (!f) return;
    try {
      const img = await loadImageFromURL("assets/cardfaces/" + f.file);
      state.bg.type = "image";
      state.bg.image = img;
      state.bg.imgScale = 1;
      state.bg.imgX = 0;
      state.bg.imgY = 0;
      currentFaceFile = f.file;
      if (f.bank) expandedBanks.add(bankKey(f.bank));   /* 保持所属银行展开 */
      $$('input[name="bgType"]').forEach((r) => (r.checked = r.value === "image"));
      syncBgUI();
      renderFaceLibrary();
      render();
      toast("已应用卡面:" + f.name);
    } catch { toast("卡面加载失败"); }
  }

  function randomCountryFace() {
    const list = allFacesOf(state.country);
    if (!list.length) return;
    applyFace(list[Math.floor(Math.random() * list.length)]);
  }

  function clearFace() {
    state.bg.image = null;
    state.bg.type = "gradient";
    currentFaceFile = null;
    $$('input[name="bgType"]').forEach((r) => (r.checked = r.value === "gradient"));
    syncBgUI();
    renderFaceLibrary();
    render();
  }

  if ($("#faceRandom")) $("#faceRandom").addEventListener("click", randomCountryFace);
  if ($("#faceClear")) $("#faceClear").addEventListener("click", clearFace);

  $("#btnAddText").addEventListener("click", addTextLayer);
  $("#uploadLogo").addEventListener("change", (e) => { onUploadLogos(Array.from(e.target.files)); e.target.value = ""; });

  /* 拖拽上传 */
  function bindDrop(zone, onFiles) {
    ["dragover", "dragenter"].forEach((ev) =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("dragover"); })
    );
    ["dragleave", "drop"].forEach((ev) =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("dragover"); })
    );
    zone.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files || []).filter((f) => /image|svg/.test(f.type + f.name));
      if (files.length) onFiles(files);
    });
  }
  bindDrop($("#canvasWrap"), (files) => onUploadLogos(files));
  $$(".tab-page .upload-area").forEach((z) => bindDrop(z, (files) => onUploadLogos(files)));

  /* ---------------- UI:图层面板 ---------------- */
  const ICONS = {
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  };

  function renderLayers() {
    const box = $("#layerList");
    box.innerHTML = "";
    if (!state.layers.length) {
      box.innerHTML = '<div class="empty">暂无图层,先去「素材」页添加</div>';
      return;
    }
    [...state.layers].reverse().forEach((l) => {
      const row = document.createElement("div");
      row.className = "layer-item" + (l.id === state.selectedId ? " active" : "");
      const tag = l.type === "text" ? "文字" : l.rawImg ? "图片" : "素材";
      row.innerHTML = `
        <span class="l-tag">${tag}</span>
        <span class="l-name">${l.type === "text" ? (l.text || "(空)") : l.name}</span>
        <button class="icon-btn" data-act="eye" title="显示/隐藏">${l.visible ? ICONS.eye : ICONS.eyeOff}</button>
        <button class="icon-btn" data-act="up" title="上移一层">${ICONS.up}</button>
        <button class="icon-btn" data-act="down" title="下移一层">${ICONS.down}</button>
        <button class="icon-btn danger" data-act="del" title="删除">${ICONS.del}</button>`;
      row.addEventListener("click", (e) => {
        const act = e.target.closest("[data-act]")?.dataset.act;
        const i = state.layers.indexOf(l);
        if (act === "del") { removeLayer(l.id); return; }
        if (act === "eye") { l.visible = !l.visible; renderLayers(); render(); return; }
        if (act === "up" && i < state.layers.length - 1) { state.layers.splice(i + 1, 0, state.layers.splice(i, 1)[0]); }
        if (act === "down" && i > 0) { state.layers.splice(i - 1, 0, state.layers.splice(i, 1)[0]); }
        state.selectedId = l.id;
        renderLayers(); renderProps(); render();
      });
      box.appendChild(row);
    });
  }

  /* ---------------- UI:属性面板 ---------------- */
  function renderProps() {
    const box = $("#propsBox");
    const l = sel();
    if (!l) {
      box.innerHTML = '<div class="empty">点击卡面或图层列表选中元素后编辑属性</div>';
      return;
    }
    const isText = l.type === "text";
    const hasRaw = !!l.rawImg;
    box.innerHTML = `
      <div class="props-card">
        <div class="props-title">
          <span>${isText ? "文字属性" : "图片属性"}</span>
          <button class="btn small ghost" id="pDelete">删除图层</button>
        </div>
        ${
          isText
            ? `<div class="field-row"><label class="field wide"><span>内容</span><input type="text" id="pText" value="${(l.text || "").replace(/"/g, "&quot;")}" /></label></div>
        <div class="field-row">
          <label class="field"><span>字体</span><select id="pFont">${fontOptionsHTML(l.font)}</select></label>
          <label class="field"><span>颜色</span><input type="color" id="pColor" value="${l.color}" /></label>
        </div>
        <div class="field-row">
          <label class="field wide"><span>字号 <b id="pFontSizeVal">${l.fontSize}</b></span><input type="range" id="pFontSize" min="10" max="300" value="${l.fontSize}" /></label>
        </div>
        <div class="field-row">
          <label class="switch"><input type="checkbox" id="pBold" ${l.bold ? "checked" : ""} /><span class="slider"></span>粗体</label>
          <label class="switch"><input type="checkbox" id="pItalic" ${l.italic ? "checked" : ""} /><span class="slider"></span>斜体</label>
        </div>
        <div class="field-row">
          <label class="field wide"><span>字距 <b id="pLsVal">${l.letterSpacing}</b></span><input type="range" id="pLs" min="0" max="40" value="${l.letterSpacing}" /></label>
        </div>`
            : `<div class="field-row">
          <label class="field wide"><span>宽度 <b id="pWVal">${l.w}</b></span><input type="range" id="pW" min="24" max="2200" value="${l.w}" /></label>
        </div>
        ${
          hasRaw
            ? `<div class="field-row"><label class="field wide"><span>去底容差 <b id="pTolVal">${l.tol}</b></span><input type="range" id="pTol" min="0" max="100" value="${l.tol}" /></label></div>
        <div class="field-row">
          <button class="btn small" id="pDebase">去除底色</button>
          <button class="btn small ghost" id="pRestore">还原原图</button>
        </div>`
            : ""
        }
        ${
          l.srcId
            ? `<div class="field-row">
          <label class="field"><span>素材颜色</span><input type="color" id="pTint" value="${l.tint || "#ffffff"}" title="为素材着色,不透明素材将整体着色" /></label>
          <label class="field"><span>&nbsp;</span><button class="btn small ghost block" id="pTintReset">恢复原图色</button></label>
        </div>`
            : ""
        }`
        }
        <div class="field-row">
          <label class="field"><span>水平位置 <b id="pXVal">${Math.round(l.x * 100)}%</b></span><input type="range" id="pX" min="-25" max="125" value="${Math.round(l.x * 100)}" /></label>
          <label class="field"><span>垂直位置 <b id="pYVal">${Math.round(l.y * 100)}%</b></span><input type="range" id="pY" min="-25" max="125" value="${Math.round(l.y * 100)}" /></label>
        </div>
        <div class="field-row">
          <label class="field"><span>旋转 <b id="pRotVal">${l.rotation}°</b></span><input type="range" id="pRot" min="-180" max="180" value="${l.rotation}" /></label>
          <label class="field"><span>不透明度 <b id="pOpVal">${Math.round(l.opacity * 100)}%</b></span><input type="range" id="pOp" min="5" max="100" value="${Math.round(l.opacity * 100)}" /></label>
        </div>
        <div class="field-row">
          <label class="field"><span>描边宽度 <b id="pSwVal">${l.strokeW}</b></span><input type="range" id="pSw" min="0" max="30" value="${l.strokeW}" /></label>
          <label class="field"><span>描边颜色</span><input type="color" id="pSc" value="${l.strokeColor}" /></label>
        </div>
      </div>`;

    /* 绑定 */
    const on = (id, ev, fn) => box.querySelector("#" + id)?.addEventListener(ev, fn);
    on("pDelete", "click", () => removeLayer(l.id));
    if (isText) {
      on("pText", "input", (e) => { l.text = e.target.value; renderLayers(); render(); });
      on("pFont", "change", (e) => { l.font = e.target.value; render(); });
      on("pColor", "input", (e) => { l.color = e.target.value; render(); });
      on("pFontSize", "input", (e) => { l.fontSize = +e.target.value; $("#pFontSizeVal").textContent = l.fontSize; render(); });
      on("pBold", "change", (e) => { l.bold = e.target.checked; render(); });
      on("pItalic", "change", (e) => { l.italic = e.target.checked; render(); });
      on("pLs", "input", (e) => { l.letterSpacing = +e.target.value; $("#pLsVal").textContent = l.letterSpacing; render(); });
    } else {
      on("pW", "input", (e) => { l.w = +e.target.value; $("#pWVal").textContent = l.w; render(); });
      on("pTol", "input", (e) => { l.tol = +e.target.value; $("#pTolVal").textContent = l.tol; });
      on("pDebase", "click", () => removeBackground(l));
      on("pRestore", "click", () => restoreImage(l));
      on("pTint", "input", (e) => { l.tint = e.target.value; applyLayerTint(l); render(); });
      on("pTintReset", "click", () => { l.tint = null; applyLayerTint(l); renderProps(); render(); });
    }
    on("pX", "input", (e) => { l.x = +e.target.value / 100; $("#pXVal").textContent = e.target.value + "%"; render(); });
    on("pY", "input", (e) => { l.y = +e.target.value / 100; $("#pYVal").textContent = e.target.value + "%"; render(); });
    on("pRot", "input", (e) => { l.rotation = +e.target.value; $("#pRotVal").textContent = l.rotation + "°"; render(); });
    on("pOp", "input", (e) => { l.opacity = +e.target.value / 100; $("#pOpVal").textContent = e.target.value + "%"; render(); });
    on("pSw", "input", (e) => { l.strokeW = +e.target.value; $("#pSwVal").textContent = l.strokeW; render(); });
    on("pSc", "input", (e) => { l.strokeColor = e.target.value; render(); });
    if (isText) { const s = box.querySelector("#pFont"); if (s) s.value = l.font; }
  }

  /* 拖动时同步属性面板数值(不重建 DOM) */
  function syncPropsLive() {
    const l = sel();
    if (!l) return;
    const set = (id, val) => { const el = $("#" + id); if (el && document.activeElement !== el) el.value = val; };
    const setT = (id, val) => { const el = $("#" + id); if (el) el.textContent = val; };
    set("pX", Math.round(l.x * 100)); setT("pXVal", Math.round(l.x * 100) + "%");
    set("pY", Math.round(l.y * 100)); setT("pYVal", Math.round(l.y * 100) + "%");
    if (l.type === "text") { set("pFontSize", l.fontSize); setT("pFontSizeVal", l.fontSize); }
    else { set("pW", l.w); setT("pWVal", l.w); }
  }

  /* ---------------- 参考图 ---------------- */
  $("#refInput").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      state.refImage = await loadFile(f);
      state.refVisible = true;
      $("#refToggle").checked = true;
      render();
    } catch { toast("参考图读取失败"); }
  });
  $("#refToggle").addEventListener("change", (e) => { state.refVisible = e.target.checked; render(); });
  $("#refOpacity").addEventListener("input", (e) => { state.refOpacity = +e.target.value / 100; render(); });
  $("#refClear").addEventListener("click", () => { state.refImage = null; state.refVisible = false; $("#refToggle").checked = false; render(); });

  /* ---------------- 缩放 ---------------- */
  function applyZoom() {
    canvas.style.width = state.zoom * 100 + "%";
    canvas.style.maxWidth = state.zoom > 1 ? "none" : "100%";
    canvas.style.margin = "auto";
    $("#zoomVal").textContent = Math.round(state.zoom * 100) + "%";
  }
  $("#zoomIn").addEventListener("click", () => { state.zoom = clamp(+(state.zoom + 0.1).toFixed(2), 0.5, 3); applyZoom(); });
  $("#zoomOut").addEventListener("click", () => { state.zoom = clamp(+(state.zoom - 0.1).toFixed(2), 0.5, 3); applyZoom(); });
  $("#zoomReset").addEventListener("click", () => { state.zoom = 1; applyZoom(); });

  /* ---------------- 导出 ---------------- */
  $("#btnExport").addEventListener("click", () => {
    const ec = document.createElement("canvas");
    ec.width = CARD_W; ec.height = CARD_H;
    drawCard(ec.getContext("2d"), { selection: false, ref: false });
    const a = document.createElement("a");
    a.download = "card-design-" + new Date().toISOString().slice(0, 10) + ".png";
    a.href = ec.toDataURL("image/png");
    a.click();
    toast("已导出 PNG(1536 × 969)");
  });

  /* ---------------- 随机卡面 API ---------------- */
  /* 二次元图源本身可用,但不返回 CORS 头,跨域图片会污染 canvas 导致导出失败。
     静态部署(无 /api 接口)时经公共转发取图,转发会补 Access-Control-Allow-Origin,
     因此必须以 crossOrigin 方式加载,保证导出 PNG 正常。 */
  const ANIME_SRC = "https://a.600060.xyz";
  const CORS_PROXY = "https://api.allorigins.win/raw?url=";

  function loadImageFromURL(url, withCORS) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (withCORS) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  $("#btnRandomCard").addEventListener("click", async () => {
    const btn = $("#btnRandomCard");
    btn.disabled = true;
    try {
      /* 1) 同源 PHP 代理 api/random-card.php  2) 公共转发补 CORS  3) 直连图源 */
      let img;
      try { img = await loadImageFromURL("api/random-card.php?r=" + Date.now()); }
      catch {
        try { img = await loadImageFromURL(CORS_PROXY + encodeURIComponent(ANIME_SRC + "?r=" + Date.now()), true); }
        catch { img = await loadImageFromURL(ANIME_SRC + "?r=" + Date.now(), true); }
      }
      state.bg.type = "image";
      state.bg.image = img;
      state.bg.imgScale = 1; state.bg.imgX = 0; state.bg.imgY = 0;
      currentFaceFile = null;   /* 与素材库选中态互斥 */
      $$('input[name="bgType"]').forEach((r) => (r.checked = r.value === "image"));
      try {
        syncBgUI();
        renderFaceLibrary();
        render();
      } catch (err) {
        console.error("render error:", err);
        toast("渲染异常:" + (err && err.message ? err.message : err));
      }
      toast("已更换随机卡面");
    } catch (err) {
      console.error("random card load error:", err);
      toast("随机卡面获取失败(静态部署无 /api 接口,可配置 Nginx 反代图源)");
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------------- 站点配置 / 法律声明门禁 ---------------- */
  /* 安全存储:预览 iframe / 隐私模式下 localStorage 可能被禁用,
   * 访问会抛 SecurityError,此时退化为内存存储(仅本次会话有效) */
  const memStore = {};
  let ls = null;
  try {
    const probe = "__probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    ls = window.localStorage;
  } catch { ls = null; }
  const storage = {
    get(k) {
      try { if (ls) return ls.getItem(k); } catch {}
      return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : null;
    },
    set(k, v) {
      memStore[k] = String(v);
      try { if (ls) ls.setItem(k, String(v)); } catch {}
    },
  };

  const FALLBACK_CONFIG = {
    links: [], icp: "", icpUrl: "https://beian.miit.gov.cn/",
    police: "", policeUrl: "https://beian.gov.cn/",
    legal: "本工具仅用于银行卡卡面的个人设计与效果演示。内置银行及卡组织标识来源于维基百科公开条目,其商标权与版权归各机构所有,本站与任何银行或卡组织无关联;请勿将生成内容用于伪造银行卡或其他违法用途,用户上传与生成的内容由用户自行负责。",
    legalVersion: 1,
    themeColor: "#050608",
    footer: { github: "", wechat: "", siteName: "卡面设计工作台", siteUrl: "https://600060.xyz" },
  };
  let SITE_CONFIG = FALLBACK_CONFIG;
  let appStarted = false;

  async function loadSiteConfig() {
    try {
      const r = await fetch("api/config.php");
      if (r.ok) SITE_CONFIG = Object.assign({}, FALLBACK_CONFIG, await r.json());
    } catch { /* 离线时使用默认配置 */ }
    applyTheme();
    renderFooter();
  }

  /* 应用主题色(后台可配置) */
  function applyTheme() {
    const color = (SITE_CONFIG && SITE_CONFIG.themeColor) || FALLBACK_CONFIG.themeColor;
    document.documentElement.style.setProperty("--bg", color);
  }

  function renderFooter() {
    const linksBox = $("#footerLinks");
    linksBox.innerHTML = "";
    /* 联系与版权行:GitHub / 微信 / © 年份 站点(链接到站点地址,年份随时间更新) */
    const f = (SITE_CONFIG && SITE_CONFIG.footer) || FALLBACK_CONFIG.footer;
    const extra = [];
    if (f.github) {
      const gh = document.createElement("a");
      gh.className = "ft-contact";
      gh.href = f.github;
      gh.target = "_blank";
      gh.rel = "noopener";
      gh.title = "GitHub";
      gh.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.05 11.05 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .31.21.67.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg><span>GitHub</span>';
      extra.push(gh);
    }
    if (f.wechat) {
      const wx = document.createElement("button");
      wx.className = "ft-contact as-link";
      wx.title = "点击复制微信号";
      wx.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M8.69 3.5C4.98 3.5 2 6.05 2 9.2c0 1.77.95 3.34 2.44 4.4l-.61 1.83 2.13-1.07c.55.15 1.13.24 1.73.26-.1-.4-.16-.82-.16-1.24 0-2.93 2.75-5.3 6.14-5.3.21 0 .41.01.61.03C13.87 5.54 11.57 3.5 8.69 3.5zM6.6 7.3c.47 0 .85.38.85.85s-.38.85-.85.85-.85-.38-.85-.85.38-.85.85-.85zm4.18 0c.47 0 .85.38.85.85s-.38.85-.85.85-.85-.38-.85-.85.38-.85.85-.85zM13.87 9.3c-2.83 0-5.13 1.99-5.13 4.44 0 2.45 2.3 4.44 5.13 4.44.51 0 1-.07 1.47-.19l1.83.92-.52-1.56c1.3-.82 2.15-2.11 2.15-3.61 0-2.45-2.1-4.44-4.93-4.44zm-1.5 2.1c.39 0 .7.31.7.7s-.31.7-.7.7-.7-.31-.7-.7.31-.7.7-.7zm3 0c.39 0 .7.31.7.7s-.31.7-.7.7-.7-.31-.7-.7.31-.7.7-.7z"/></svg><span>微信:' + f.wechat.replace(/[<>&"]/g, "") + "</span>";
      wx.addEventListener("click", () => {
        try { navigator.clipboard.writeText(f.wechat).then(() => toast("微信号已复制:" + f.wechat), () => {}); } catch {}
      });
      extra.push(wx);
    }
    if (extra.length) {
      const box = document.createElement("span");
      box.className = "ft-extras";
      extra.forEach((el) => box.appendChild(el));
      linksBox.appendChild(box);
    }
    if (SITE_CONFIG.links && SITE_CONFIG.links.length) {
      const label = document.createElement("span");
      label.className = "fl-label";
      label.textContent = "友情链接:";
      linksBox.appendChild(label);
      SITE_CONFIG.links.forEach((l) => {
        const a = document.createElement("a");
        a.href = l.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = l.name;
        linksBox.appendChild(a);
      });
    }
    /* 版权行:年份随系统时间自动更新(2026、2027…) */
    const cr = $("#copyrightLink");
    cr.href = f.siteUrl || "#";
    cr.target = "_blank";
    cr.rel = "noopener";
    cr.textContent = "© " + new Date().getFullYear() + " " + (f.siteName || "卡面设计工作台");
    const icp = $("#icpLink");
    if (SITE_CONFIG.icp) {
      icp.hidden = false;
      icp.href = SITE_CONFIG.icpUrl || "https://beian.miit.gov.cn/";
      icp.textContent = SITE_CONFIG.icp;
    }
    const police = $("#policeLink");
    if (SITE_CONFIG.police) {
      police.hidden = false;
      police.href = SITE_CONFIG.policeUrl || "https://beian.gov.cn/";
      $("#policeText").textContent = SITE_CONFIG.police;
    }
    $("#siteFooter").hidden = false;
  }

  function showLegalGate() {
    $("#legalBody").textContent = SITE_CONFIG.legal || FALLBACK_CONFIG.legal;
    $("#legalActions").hidden = false;
    $("#legalDenied").hidden = true;
    $("#legalAgree").checked = false;
    $("#legalAccept").disabled = true;
    $("#legalGate").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function bindLegalGate() {
    $("#legalAgree").addEventListener("change", (e) => { $("#legalAccept").disabled = !e.target.checked; });
    $("#legalAccept").addEventListener("click", () => {
      /* 先放行进入,再持久化同意记录(存储失败不影响访问) */
      $("#legalGate").hidden = true;
      document.body.style.overflow = "";
      storage.set("cardLegalVersion", String(SITE_CONFIG.legalVersion));
      startApp();
    });
    $("#legalDecline").addEventListener("click", () => {
      $("#legalActions").hidden = true;
      $("#legalDenied").hidden = false;
    });
    $("#legalBack").addEventListener("click", () => {
      $("#legalActions").hidden = false;
      $("#legalDenied").hidden = true;
    });
    $("#legalLink").addEventListener("click", showLegalGate);
  }

  /* ---------------- 初始化 ---------------- */
  function startApp() {
    if (appStarted) return;
    appStarted = true;
    document.body.style.overflow = "";

    try {
      buildPresetGrid();
      buildFaceCountryChips();
      buildAssetGrid($("#orgGrid"), CATALOG.orgs);
      buildAssetGrid($("#tierGrid"), CATALOG.tiers);
      renderFaceLibrary();
      syncBgUI();
      renderLayers();
      renderProps();
      applyZoom();
    } catch (err) {
      console.error(err);
      toast("初始化失败:" + (err && err.message ? err.message : err));
    }

    /* 预载素材矢量图(仅缓存,不再预置任何图层:初始卡面保持空白) */
    (async () => {
      await Promise.all(CATALOG.all.filter((i) => i.kind !== "tier").map((item) => getLogoImage(item).catch(() => null)));
    })();
  }

  async function init() {
    await loadSiteConfig();
    bindLegalGate();
    const accepted = storage.get("cardLegalVersion");
    if (accepted !== String(SITE_CONFIG.legalVersion)) {
      showLegalGate(); /* 未同意法律声明,禁止访问主页 */
      return;
    }
    startApp();
  }

  init();
})();
