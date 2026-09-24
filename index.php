<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>卡面设计工作台 · Card Design Studio</title>
<meta name="description" content="银行卡卡面设计工具,内置银行 Logo 与卡组织标识,遵循 ISO 7810 ID-1 标准" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f6821f' stroke-width='2'%3E%3Crect x='2' y='5' width='20' height='14' rx='2'/%3E%3Cpath d='M2 10h20'/%3E%3C/svg%3E" />
<link rel="stylesheet" href="style.css?v=<?php echo @filemtime('style.css'); ?>" />
</head>
<body>

<header class="topbar">
  <div class="brand">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10.5h20"/></svg>
    <div class="brand-text">
      <h1>卡面设计工作台</h1>
      <span>ISO 7810 ID-1 · 85.60 × 53.98 mm · 圆角 3.18 mm</span>
    </div>
  </div>
  <button id="btnExport" class="btn primary">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    导出 PNG
  </button>
</header>

<main class="layout">

  <!-- 预览区 -->
  <section class="stage">
    <div class="canvas-wrap" id="canvasWrap">
      <canvas id="card" width="1536" height="969"></canvas>
      <div class="stage-hint" id="stageHint">拖拽元素调整位置 · 点击选中 · 右下角手柄缩放</div>
    </div>

    <div class="stage-tools">
      <div class="tool-group">
        <span class="tool-label">参考图</span>
        <label class="btn small ghost file-btn">上传<input type="file" id="refInput" accept="image/*" hidden /></label>
        <label class="switch"><input type="checkbox" id="refToggle" /><span class="slider"></span>显示</label>
        <input type="range" id="refOpacity" min="0" max="100" value="40" title="参考图不透明度" />
        <button class="btn small ghost" id="refClear">移除</button>
      </div>
      <div class="tool-group">
        <span class="tool-label">放大</span>
        <button class="btn small ghost" id="zoomOut" title="缩小">−</button>
        <span id="zoomVal" class="zoom-val">100%</span>
        <button class="btn small ghost" id="zoomIn" title="放大">＋</button>
        <button class="btn small ghost" id="zoomReset">重置</button>
      </div>
    </div>
  </section>

  <!-- 控制面板 -->
  <aside class="panel">
    <nav class="tabs">
      <button class="tab-btn active" data-tab="bg">背景</button>
      <button class="tab-btn" data-tab="assets">素材</button>
      <button class="tab-btn" data-tab="layers">图层</button>
    </nav>

    <!-- 背景 -->
    <div class="tab-page active" id="tab-bg">
      <div class="field-row">
        <label class="seg">
          <input type="radio" name="bgType" value="gradient" /><span>渐变</span>
        </label>
        <label class="seg">
          <input type="radio" name="bgType" value="color" checked /><span>纯色</span>
        </label>
        <label class="seg">
          <input type="radio" name="bgType" value="image" /><span>图片</span>
        </label>
      </div>

      <div id="bgGradientBox" class="sub-box" hidden>
        <h3>预设渐变</h3>
        <div class="preset-grid" id="presetGrid"></div>
        <h3>自定义</h3>
        <div class="field-row">
          <label class="field"><span>起始色</span><input type="color" id="gradA" value="#141e30" /></label>
          <label class="field"><span>结束色</span><input type="color" id="gradB" value="#243b55" /></label>
        </div>
        <div class="field-row">
          <label class="field wide"><span>角度 <b id="gradAngleVal">135°</b></span><input type="range" id="gradAngle" min="0" max="360" value="135" /></label>
        </div>
      </div>

      <div id="bgColorBox" class="sub-box">
        <div class="field-row">
          <label class="field"><span>背景颜色</span><input type="color" id="bgColorInput" value="#ffffff" /></label>
        </div>
      </div>

      <div id="bgImageBox" class="sub-box" hidden>
        <h3>卡面图片</h3>
        <label class="upload-area">点击或拖入图片(JPG / PNG / WebP / SVG)<input type="file" id="bgImgInput" accept="image/*" hidden /></label>        <div class="field-row">
          <label class="field wide"><span>缩放 <b id="bgScaleVal">1.00×</b></span><input type="range" id="bgScale" min="100" max="300" value="100" /></label>
        </div>
        <div class="field-row">
          <label class="field"><span>水平偏移</span><input type="range" id="bgOffX" min="-100" max="100" value="0" /></label>
          <label class="field"><span>垂直偏移</span><input type="range" id="bgOffY" min="-100" max="100" value="0" /></label>
        </div>
        <button class="btn small ghost" id="bgClear">清空图片</button>
        <button class="btn small" id="btnRandomCard" title="从二次元随机图 API 获取一张动漫图片作为卡面">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21"/></svg>
          二次元随机卡面
        </button>
      </div>
    </div>

    <!-- 素材 -->
    <div class="tab-page" id="tab-assets">
      <h3>文字</h3>
      <button class="btn block" id="btnAddText">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        添加文字图层
      </button>

      <h3>卡面素材 · 按国家 / 银行</h3>
      <div class="country-chips" id="faceCountryChips"></div>
      <div class="field-row">
        <button class="btn small ghost" id="faceRandom" title="从当前国家随机换一张卡面">随机一张</button>
        <button class="btn small ghost" id="faceClear">清除卡面</button>
      </div>
      <label class="switch inline"><input type="checkbox" id="faceFollow" checked /><span class="slider"></span>切换国家时自动换卡面</label>
      <div id="faceLibrary"><div class="loading">卡面加载中…</div></div>

      <h3>卡组织</h3>
      <div class="asset-grid" id="orgGrid"></div>

      <h3>卡等级(英文)</h3>
      <div class="asset-grid dark-grid" id="tierGrid"></div>

      <h3>自定义素材</h3>
      <label class="upload-area">上传 Logo(支持多选 · JPG / PNG / WebP / SVG)<input type="file" id="uploadLogo" accept="image/*" multiple hidden /></label>
    </div>

    <!-- 图层与属性 -->
    <div class="tab-page" id="tab-layers">
      <h3>图层</h3>
      <div id="layerList" class="layer-list"><div class="empty">暂无图层,先去「素材」页添加</div></div>
      <div id="propsBox"></div>
    </div>
  </aside>
</main>

<div id="toast" class="toast" hidden></div>

<!-- 页脚:友链 / 备案 / 法律声明 -->
<footer class="footer" id="siteFooter" hidden>
  <div class="footer-inner">
    <div class="footer-links" id="footerLinks"></div>
    <div class="footer-beian">
      <a id="copyrightLink" class="beian-item" target="_blank" rel="noopener"></a>
      <a id="icpLink" class="beian-item" target="_blank" rel="noopener" hidden></a>
      <a id="policeLink" class="beian-item" target="_blank" rel="noopener" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="police-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span id="policeText"></span>
      </a>
      <button id="legalLink" class="beian-item as-link">法律声明</button>
    </div>
  </div>
</footer>

<!-- 法律声明门禁 -->
<div class="legal-gate" id="legalGate" hidden>
  <div class="legal-card">
    <h2>法律声明与使用条款</h2>
    <div class="legal-body" id="legalBody"></div>
    <div id="legalActions" class="legal-actions">
      <label class="legal-check">
        <input type="checkbox" id="legalAgree" />
        <span>我已阅读并同意上述条款,并确认我上传与生成的内容由我自行负责</span>
      </label>
      <div class="legal-btns">
        <button class="btn ghost" id="legalDecline">不同意,退出</button>
        <button class="btn primary" id="legalAccept" disabled>同意并继续</button>
      </div>
    </div>
    <div id="legalDenied" class="legal-denied" hidden>
      <p>您未接受使用条款,无法访问本站。</p>
      <button class="btn" id="legalBack">返回重新阅读</button>
    </div>
  </div>
</div>

<script src="js/logos.js?v=<?php echo @filemtime('js/logos.js'); ?>"></script>
<script src="assets/logos/manifest.js?v=<?php echo @filemtime('assets/logos/manifest.js'); ?>"></script>
<script src="assets/cardfaces/manifest.js?v=<?php echo @filemtime('assets/cardfaces/manifest.js'); ?>"></script>
<script src="js/app.js?v=<?php echo @filemtime('js/app.js'); ?>"></script>
</body>
</html>
