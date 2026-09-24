/* ============================================================
 * 后台管理逻辑:登录 → 编辑友链 / ICP 备案 / 公安备案 / 法律声明
 * ============================================================ */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);

  /* 安全存储:预览 iframe / 隐私模式下 localStorage 可能被禁用,退化为内存存储 */
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
    remove(k) {
      delete memStore[k];
      try { if (ls) ls.removeItem(k); } catch {}
    },
  };

  let token = storage.get("cardAdminToken") || "";
  let toastTimer;

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 2400);
  }

  /* ---------- 友链行 ---------- */
  function addLinkRow(name, url) {
    const row = document.createElement("div");
    row.className = "link-row";
    row.innerHTML = `
      <input type="text" class="lk-name" placeholder="站点名称" value="${(name || "").replace(/"/g, "&quot;")}" />
      <input type="text" class="lk-url" placeholder="https://…" value="${(url || "").replace(/"/g, "&quot;")}" />
      <button class="icon-btn danger" title="删除">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>`;
    row.querySelector("button").addEventListener("click", () => row.remove());
    $("#linkRows").appendChild(row);
  }

  function readLinks() {
    return Array.from(document.querySelectorAll(".link-row"))
      .map((r) => ({
        name: r.querySelector(".lk-name").value.trim(),
        url: r.querySelector(".lk-url").value.trim(),
      }))
      .filter((l) => l.name && l.url);
  }

  $("#btnAddLink").addEventListener("click", () => addLinkRow("", ""));

  /* 主题色:颜色选择器与文本框双向同步 */
  $("#themeColor").addEventListener("input", (e) => { $("#themeColorText").value = e.target.value; });
  $("#themeColorText").addEventListener("input", (e) => {
    const v = e.target.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) $("#themeColor").value = v;
  });

  /* ---------- 加载配置(公开接口) ---------- */
  async function loadConfig(fill) {
    const r = await fetch("api/config.php");
    if (!r.ok) throw new Error();
    const cfg = await r.json();
    if (fill) {
      $("#linkRows").innerHTML = "";
      (cfg.links || []).forEach((l) => addLinkRow(l.name, l.url));
      if (!(cfg.links || []).length) addLinkRow("", "");
      const f = cfg.footer || {};
      $("#themeColor").value = cfg.themeColor || "#050608";
      $("#themeColorText").value = cfg.themeColor || "#050608";
      $("#ghUrl").value = f.github || "";
      $("#wechat").value = f.wechat || "";
      $("#siteName").value = f.siteName || "卡面设计工作台";
      $("#siteUrl").value = f.siteUrl || "https://600060.xyz";
      $("#icp").value = cfg.icp || "";
      $("#icpUrl").value = cfg.icpUrl || "https://beian.miit.gov.cn/";
      $("#police").value = cfg.police || "";
      $("#policeUrl").value = cfg.policeUrl || "https://beian.gov.cn/";
      $("#legal").value = cfg.legal || "";
    }
    return cfg;
  }

  /* ---------- 登录 / 退出 ---------- */
  async function login() {
    const password = $("#adminPwd").value;
    if (!password) return toast("请输入密码");
    try {
      const r = await fetch("api/admin/login.php", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok) return toast(data.error || "登录失败");
      token = data.token;
      storage.set("cardAdminToken", token);
      enterAdmin();
      toast("登录成功");
    } catch {
      toast("网络错误,请重试");
    }
  }

  function enterAdmin() {
    $("#loginCard").hidden = true;
    $("#adminPanel").hidden = false;
    loadConfig(true).catch(() => toast("配置加载失败"));
  }

  function logout() {
    token = "";
    storage.remove("cardAdminToken");
    $("#adminPanel").hidden = true;
    $("#loginCard").hidden = false;
    $("#adminPwd").value = "";
  }

  $("#btnLogin").addEventListener("click", login);
  $("#adminPwd").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
  $("#btnLogout").addEventListener("click", logout);

  /* ---------- 保存 ---------- */
  $("#btnSave").addEventListener("click", async () => {
    const payload = {
      links: readLinks(),
      themeColor: $("#themeColorText").value.trim() || $("#themeColor").value,
      footer: {
        github: $("#ghUrl").value.trim(),
        wechat: $("#wechat").value.trim(),
        siteName: $("#siteName").value.trim(),
        siteUrl: $("#siteUrl").value.trim(),
      },
      icp: $("#icp").value.trim(),
      icpUrl: $("#icpUrl").value.trim(),
      police: $("#police").value.trim(),
      policeUrl: $("#policeUrl").value.trim(),
      legal: $("#legal").value,
    };
    try {
      const r = await fetch("api/admin/config.php", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: "Bearer " + token, "X-Admin-Token": token },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (r.status === 401) { logout(); return toast("登录已失效,请重新登录"); }
      if (!r.ok) return toast(data.error || "保存失败");
      toast("已保存" + (data.config && data.config.legalVersion !== undefined ? "(法律声明版本 v" + data.config.legalVersion + ")" : ""));
    } catch {
      toast("网络错误,请重试");
    }
  });

  /* ---------- 初始化:有 token 直接进入(保存失败会提示重新登录) ---------- */
  (async function init() {
    if (token) enterAdmin();
    else loadConfig(false).catch(() => {});
  })();
})();
