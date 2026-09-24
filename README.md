# 卡面设计工作台 · Card Design Studio

一个纯前端的银行卡卡面设计工具,内置 99 家银行 Logo、7 个卡组织标识、12 种卡等级字样，支持图层编辑与高清导出。带法律声明门禁和后台管理,可配置备案信息、友链与声明文案。

提供两种部署方式:**PHP 虚拟主机版**(本目录)和 [Cloudflare Workers 版](#方案-bcloudflare-workers)。两者功能完全一致,PHP 版不需要 Node 环境,上传即用。

---

## 功能特性

**设计器**
- ISO 7810 ID-1 标准卡面,1536 × 969 px,比例 1.586:1,导出所见即所得
- 99 家银行 Logo,按 14 个国家 / 地区分类;Logo 支持彩色 / 黑色 / 白色一键切换
- 7 个卡组织标识、12 种卡等级字样(Classic / Platinum / Infinite / World Elite 等)
- 随机卡面一键换背景(可调外部图源,失败自动回退内置素材)
- 12 款预设渐变 / 自定义双色渐变 / 纯色 / 上传图片背景
- 图层系统:任意素材、文字、图片自由叠加,支持上移下移、隐藏、删除
- 元素编辑:拖拽、缩放、旋转、不透明度、描边、方向键微调
- 上传 Logo 一键去底(容差可调)、参考图叠加对照(不参与导出)
- 导出 1536 × 969 PNG

**站点功能**
- 法律声明门禁:首次访问须同意条款;后台更新声明后所有访客需重新确认
- 后台管理:友链、ICP 备案、公安备案、法律声明
- 页脚自动展示备案号(带工信部 / 公安部链接)

---

## 环境要求

| 项目 | 要求 |
|------|------|
| PHP | 5.6+(需 `hash_hmac`、`hash_equals`、`json` 扩展,主流主机默认开启) |
| 可写目录 | `api/data/`(存放配置,首次保存时自动生成 `config.json`) |
| Web 服务器 | Apache / LiteSpeed(支持 `.htaccess`);Nginx 需手动添加规则 |

实测环境:PHP 8.2 本地通过;生产验证于 kangle 3.5 虚拟主机。代码未使用 PHP 7+ 专属语法,PHP 5.6 亦可运行。

---

## 方案 A:PHP 虚拟主机(推荐)

### 1. 获取文件

**从 GitHub 获取** —— 仓库里就是解压好的源文件,clone 下来直接用,不需要解压任何东西:

```bash
git clone https://github.com/<你的用户名>/card-design-studio.git
cd card-design-studio
# 部署只需 public/ 目录下的内容
```

仓库体积约 27 MB(1090 个卡面素材),首次 clone 稍慢。`public/` 里的东西才是要上传的部分。

**不想用 Git** —— 在 Releases 页面下载下面两个压缩包:

### 2. 上传文件

卡面素材有 1090 个、约 25 MB,打包后超过部分主机的单文件上限,因此拆成两个包分发:

| 包 | 体积 | 内容 |
|------|------|------|
| `card-studio-part1-cn.zip` | 16.4 MB | 全部程序代码 + 中国大陆卡面素材 |
| `card-studio-part2-overseas.zip` | 9.4 MB | 海外(台美日港英等)卡面素材 |

**两个包都要传**,解压到同一个目录合并即可:

```bash
unzip -o card-studio-part1-cn.zip      -d 网站根目录/
unzip -o card-studio-part2-overseas.zip -d 网站根目录/
```

用文件管理器上传的话,解压后把**包内的内容**(不是包文件夹本身)全部放进站点根目录,第二个包提示覆盖时选「是」——两包的 `manifest.js` 相同,覆盖无影响。

合并后的目录结构:

```
网站根目录/
├── .htaccess        ← 隐藏文件,必须上传
├── index.php
├── admin.php
├── style.css
├── js/
├── assets/
└── api/
```

> 只传 part1 也能跑,只是看不到海外卡面。如果用独立子域,传到你希望的子域根目录即可。

### 3. 修改后台密码

编辑 `api/lib.php` 第 9 行:

```php
const ADMIN_PASSWORD = 'admin123';   // 改成你自己的密码
```

**务必修改**,否则任何人都能进后台。

### 4. 确认目录可写

确保 `api/data/` 目录可写(0755 或 0777)。后台保存配置时会在这里生成 `config.json`。

### 5. 访问

- 前台:`https://你的域名/`
- 后台:`https://你的域名/admin` 或 `/admin.php`

### 6. 验证(可选)

访问 `https://你的域名/api/selfcheck.php`,返回 `"ok":true` 表示环境正常。若某项为 `false`,会给出具体提示。

---

## 方案 B:Cloudflare Workers

适合没有 PHP 主机的情况,永久免费(Workers + KV 均在免费额度内)。

```bash
npm install
npx wrangler login
npx wrangler kv namespace create CONFIG   # 把输出的 id 填入 wrangler.jsonc
```

修改 `wrangler.jsonc` 里的 `ADMIN_PASSWORD`,然后:

```bash
npm run deploy
```

完成后通过 `https://card-design-studio.<子域>.workers.dev` 访问。

> Workers 版源码在 `src/index.js`,配置文件 `wrangler.jsonc`。本地开发用 `npm run dev`。

---

## 后台管理

登录后可以配置:

| 项目 | 说明 |
|------|------|
| 友情链接 | 名称 + URL,可添加多条 |
| ICP 备案 | 备案号,自动链接工信部 |
| 公安备案 | 备案号,自动链接公安部 |
| 法律声明 | 前台门禁展示的条款正文 |

修改法律声明后,所有访客需要重新勾选同意才能进入。

---

## 常见问题

**后台能登录,但点保存提示「登录已失效」**

这是最常见的问题。PHP 以 FastCGI / CGI 模式运行时,服务器会剥离 `Authorization` 请求头,导致鉴权失败。

解决办法:确认根目录的 `.htaccess` 已正确上传并生效,其中这两条规则是关键:

```apache
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

程序已内置 `X-Admin-Token` 自定义头作为兜底,正常情况下即使 `.htaccess` 不生效也能保存。若两者都失效,检查主机是否启用了 `mod_setenvif` 和 `mod_rewrite`。

**改了文件但页面没变化**

浏览器缓存了旧的 JS/CSS。PHP 版已给静态资源加了 `?v=文件修改时间` 的缓存戳,正常会自动失效。仍无效时清一次浏览器缓存,或确认主机没有开启「静态资源长期缓存」。

**随机卡面按钮没反应**

该接口需要服务器向外请求图源。部分虚拟主机会禁用外部请求(`allow_url_fopen` 关闭)。失败时会自动回退到内置素材库随机一张,不影响使用。可在 `api/selfcheck.php` 里查看 `outboundFetch` 项确认。

**使用子域访问时连接被重置**

如果子域的 DNS 指向 CDN(如 EdgeOne、Cloudflare),必须在 CDN 控制台完成域名接入,只配 DNS 是不够的 —— 表现为 TCP 和 TLS 都能连通,但一发 HTTP 请求就被 RST。

接入后若卡面程序装在主域的某个子目录,还需在 CDN 侧配置两项:

- **回源 HOST** 改为已绑定的主域名(虚拟主机靠 Host 头识别站点)
- **回源 URL 重写 → 增加路径前缀**,填你的子目录名(如 `/card`)

**导出图片模糊**

导出固定为 1536 × 969。如需更高分辨率,可修改 `js/app.js` 中的导出倍率。

---

## 目录结构

```
├── .htaccess              # Apache/LiteSpeed 规则(入口、鉴权头透传、缓存、禁止下载配置)
├── index.php              # 前台:法律声明门禁 + 设计器 + 页脚
├── admin.php              # 后台管理
├── style.css
├── js/
│   ├── logos.js           # 素材库(银行/卡组织/等级 SVG)
│   ├── app.js             # 前台逻辑(渲染/交互/导出/配置)
│   └── admin.js           # 后台逻辑
├── assets/
│   ├── logos/             # Logo 资源与清单
│   └── cardfaces/         # 1090 个卡面素材(约 25 MB)
└── api/
    ├── lib.php            # 配置读写 + 鉴权(密码在这里改)
    ├── config.php         # GET  读取配置
    ├── random-card.php    # GET  随机卡面代理
    ├── selfcheck.php      # GET  环境自检
    ├── admin/
    │   ├── login.php      # POST 登录
    │   └── config.php     # POST 保存配置
    └── data/              # 配置存放目录(需可写)
```

## API 一览

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/config.php` | GET | 读取站点配置(公开) |
| `/api/admin/login.php` | POST | 登录 `{password}` → `{token}` |
| `/api/admin/config.php` | POST | 保存配置(需 token) |
| `/api/random-card.php` | GET | 随机卡面图片代理 |
| `/api/selfcheck.php` | GET | 环境自检 |

---

## 声明

- 内置银行与卡组织标识均为**示意性自绘图形**(品牌色 + 名称文字),非官方注册商标图形,仅供个人设计效果图使用
- 请勿将生成的卡面用于伪造银行卡或其他违法用途
- 用户上传与生成的内容由用户自行负责
