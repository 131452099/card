<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>后台管理 · 卡面设计工作台</title>
<meta name="robots" content="noindex" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f6821f' stroke-width='2'%3E%3Crect x='3' y='11' width='18' height='11' rx='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E" />
<link rel="stylesheet" href="style.css?v=<?php echo @filemtime('style.css'); ?>" />
</head>
<body class="admin-body">

<header class="topbar">
  <div class="brand">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    <div class="brand-text">
      <h1>后台管理</h1>
      <span>卡面设计工作台 · 站点配置</span>
    </div>
  </div>
  <a class="btn small ghost" href="index.php" target="_blank" rel="noopener">查看前台</a>
</header>

<main class="admin-main">

  <!-- 登录 -->
  <div class="admin-card" id="loginCard">
    <h2>管理员登录</h2>
    <p class="admin-tip">默认密码 admin123,可在 wrangler.jsonc 的 ADMIN_PASSWORD 中修改</p>
    <div class="field-row">
      <label class="field wide"><span>管理密码</span><input type="password" id="adminPwd" placeholder="请输入管理密码" autocomplete="current-password" /></label>
    </div>
    <button class="btn primary block" id="btnLogin">登录</button>
  </div>

  <!-- 管理面板 -->
  <div class="admin-card" id="adminPanel" hidden>
    <h2>站点配置</h2>

    <h3>主题与页脚</h3>
    <div class="field-row">
      <label class="field"><span>主页主体颜色</span><input type="color" id="themeColor" value="#050608" title="主页主体背景色" /></label>
      <label class="field"><span>颜色值</span><input type="text" id="themeColorText" placeholder="#050608" maxlength="7" /></label>
    </div>
    <div class="field-row">
      <label class="field"><span>GitHub 主页</span><input type="text" id="ghUrl" placeholder="https://github.com/你的用户名" /></label>
      <label class="field"><span>微信号</span><input type="text" id="wechat" placeholder="例:card2026" /></label>
    </div>
    <div class="field-row">
      <label class="field"><span>版权主体名称</span><input type="text" id="siteName" placeholder="卡面设计工作台" /></label>
      <label class="field"><span>版权链接</span><input type="text" id="siteUrl" placeholder="https://600060.xyz" /></label>
    </div>
    <p class="admin-tip">页脚显示「© 2026 版权主体」,年份随时间自动更新,点击跳转版权链接;GitHub 与微信号留空则不显示</p>

    <h3>友情链接</h3>
    <div id="linkRows" class="link-rows"></div>
    <button class="btn small ghost" id="btnAddLink">＋ 添加友链</button>

    <h3>ICP 备案</h3>
    <div class="field-row">
      <label class="field"><span>备案号</span><input type="text" id="icp" placeholder="例:京ICP备2026000000号" /></label>
      <label class="field"><span>跳转链接</span><input type="text" id="icpUrl" placeholder="https://beian.miit.gov.cn/" /></label>
    </div>

    <h3>公安备案</h3>
    <div class="field-row">
      <label class="field"><span>备案号</span><input type="text" id="police" placeholder="例:京公网安备11000000000000号" /></label>
      <label class="field"><span>跳转链接</span><input type="text" id="policeUrl" placeholder="https://beian.gov.cn/" /></label>
    </div>

    <h3>法律声明</h3>
    <p class="admin-tip">修改并保存后,声明版本号自动 +1,所有访客需重新同意才能访问主页</p>
    <textarea id="legal" rows="10" placeholder="输入法律声明与使用条款…"></textarea>

    <div class="admin-actions">
      <button class="btn ghost" id="btnLogout">退出登录</button>
      <button class="btn primary" id="btnSave">保存配置</button>
    </div>
  </div>
</main>

<div id="toast" class="toast" hidden></div>

<script src="js/admin.js?v=<?php echo @filemtime('js/admin.js'); ?>"></script>
</body>
</html>
