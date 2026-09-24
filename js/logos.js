/* ============================================================
 * 素材库:按国家分类的银行 Logo / 卡组织 / 英文卡等级
 * 说明:卡组织标识按官方标准图形矢量绘制(Visa 字标 /
 *       Mastercard 双圆 / 银联三色 / Amex / JCB / Discover /
 *       Diners);银行标识为「行徽示意 + 银行名称」的矢量
 *       wordmark,配色取各行品牌色,不复刻注册商标图形。
 * ============================================================ */
(function () {
  const FONT = "'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif";
  const EN_FONT = "Arial,'Helvetica Neue',Helvetica,sans-serif";

  /* ---------- 大陆头部银行行徽(几何示意,100x100) ---------- */
  const BADGE = {
    /* 工商银行:古钱方框(上下断口) + 「工」 */
    icbc: `<path d="M66 12 H78 Q88 12 88 22 V78 Q88 88 78 88 H66" fill="none" stroke="#C7000B" stroke-width="8"/>
  <path d="M34 88 H22 Q12 88 12 78 V22 Q12 12 22 12 H34" fill="none" stroke="#C7000B" stroke-width="8"/>
  <text x="50" y="50" dy=".36em" text-anchor="middle" font-family="${FONT}" font-size="36" font-weight="700" fill="#C7000B">工</text>`,
    /* 农业银行:古钱圆环 + 方孔 + 麦穗 */
    abc: `<circle cx="50" cy="50" r="40" fill="none" stroke="#00923F" stroke-width="9"/>
  <rect x="38" y="38" width="24" height="24" fill="none" stroke="#00923F" stroke-width="4.5"/>
  <path d="M50 62 V28 M50 42 L39 32 M50 42 L61 32 M50 52 L39 42 M50 52 L61 42" fill="none" stroke="#00923F" stroke-width="5" stroke-linecap="round"/>`,
    /* 中国银行:古钱圆环 + 方孔 + 「中」 */
    boc: `<circle cx="50" cy="50" r="40" fill="none" stroke="#C8102E" stroke-width="9"/>
  <rect x="37" y="37" width="26" height="26" fill="none" stroke="#C8102E" stroke-width="4.5"/>
  <text x="50" y="50" dy=".36em" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="700" fill="#C8102E">中</text>`,
    /* 建设银行:古钱外圆 + 内双弧 */
    ccb: `<circle cx="50" cy="50" r="40" fill="none" stroke="#0066B3" stroke-width="9"/>
  <path d="M30 37 A21 21 0 0 1 70 37" fill="none" stroke="#0066B3" stroke-width="8"/>
  <path d="M30 63 A21 21 0 0 0 70 63" fill="none" stroke="#0066B3" stroke-width="8"/>`,
    /* 交通银行:蓝底白「B」 */
    bocom: `<rect x="10" y="10" width="80" height="80" rx="14" fill="#003C7E"/>
  <text x="50" y="52" dy=".36em" text-anchor="middle" font-family="${EN_FONT}" font-style="italic" font-weight="900" font-size="54" fill="#ffffff">B</text>`,
    /* 招商银行:红色葵花 */
    cmb: `<g fill="#D31145">${[0, 45, 90, 135, 180, 225, 270, 315]
      .map((a) => `<ellipse cx="50" cy="27" rx="6.5" ry="13" transform="rotate(${a} 50 50)"/>`)
      .join("")}<circle cx="50" cy="50" r="7"/></g>`,
    /* 中信银行:红色「中信」印章 */
    citic: `<rect x="8" y="8" width="84" height="84" rx="8" fill="#E60012"/>
  <text x="50" y="50" dy=".36em" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="700" fill="#ffffff">中信</text>`,
    /* 邮储银行:绿色「中」字根系 */
    psbc: `<path d="M32 14 H68 V26 H32 Z M32 74 H68 V86 H32 Z" fill="#007A33"/>
  <path d="M50 14 V86 M28 34 H72 M28 66 H72" stroke="#007A33" stroke-width="8" fill="none"/>
  <circle cx="50" cy="50" r="9" fill="#007A33"/>`,
  };

  /* 银行 wordmark:行徽(无则印章) + 银行名 + 英文名 */
  function bankSvg(b) {
    const badge = BADGE[b.id];
    const nameSize = b.name.length > 5 ? 24 : 28;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="112" viewBox="0 0 420 112">
  ${badge
    ? `<g transform="translate(2 6)">${badge}</g>`
    : `<rect x="8" y="18" width="76" height="76" rx="16" fill="${b.color}"/>
  <text x="46" y="56" dy=".36em" font-family="${FONT}" font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle">${b.char}</text>`}
  <text x="122" y="46" font-family="${FONT}" font-size="${nameSize}" font-weight="700" fill="${b.color}">${b.name}</text>
  <text x="123" y="80" font-family="${EN_FONT}" font-size="16" font-weight="600" letter-spacing="1.2" fill="${b.color}" opacity=".8">${b.en}</text>
</svg>`;
  }

  /* 卡等级 wordmark:罗马体英文字样 */
  function tierSvg(t) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="86" viewBox="0 0 420 86">
  <text x="210" y="43" dy=".36em" font-family="Georgia,'Times New Roman',serif" font-size="40" font-weight="700" letter-spacing="9" fill="${t.color}" text-anchor="middle">${t.text}</text>
</svg>`;
  }

  /* ---------- 国家 / 地区 ---------- */
  const countries = [
    { id: "cn", name: "中国大陆" },
    { id: "hk", name: "中国香港" },
    { id: "tw", name: "中国台湾" },
    { id: "jp", name: "日本" },
    { id: "kr", name: "韩国" },
    { id: "sg", name: "新加坡" },
    { id: "us", name: "美国" },
    { id: "uk", name: "英国" },
    { id: "de", name: "德国" },
    { id: "fr", name: "法国" },
    { id: "eu", name: "其他欧洲" },
    { id: "ca", name: "加拿大" },
    { id: "au", name: "澳大利亚" },
    { id: "other", name: "其他地区" },
  ];

  /* ---------- 银行列表(按国家) ---------- */
  const banks = [
    /* 中国大陆 */
    { id: "icbc", country: "cn", name: "中国工商银行", en: "ICBC", char: "工", color: "#C7000B" },
    { id: "abc", country: "cn", name: "中国农业银行", en: "AGRICULTURAL BANK", char: "农", color: "#00923F" },
    { id: "boc", country: "cn", name: "中国银行", en: "BANK OF CHINA", char: "中", color: "#C8102E" },
    { id: "ccb", country: "cn", name: "中国建设银行", en: "CHINA CONSTRUCTION BANK", char: "建", color: "#0066B3" },
    { id: "bocom", country: "cn", name: "交通银行", en: "BANK OF COMMUNICATIONS", char: "交", color: "#003C7E" },
    { id: "psbc", country: "cn", name: "邮储银行", en: "POSTAL SAVINGS BANK", char: "邮", color: "#007A33" },
    { id: "cmb", country: "cn", name: "招商银行", en: "CHINA MERCHANTS BANK", char: "招", color: "#D31145" },
    { id: "citic", country: "cn", name: "中信银行", en: "CHINA CITIC BANK", char: "信", color: "#E60012" },
    { id: "spdb", country: "cn", name: "浦发银行", en: "SHANGHAI PUDONG DEV BANK", char: "浦", color: "#005BAC" },
    { id: "cmbc", country: "cn", name: "中国民生银行", en: "CHINA MINSHENG BANK", char: "民", color: "#0061AA" },
    { id: "ceb", country: "cn", name: "中国光大银行", en: "CHINA EVERBRIGHT BANK", char: "光", color: "#6B21A8" },
    { id: "cib", country: "cn", name: "兴业银行", en: "INDUSTRIAL BANK", char: "兴", color: "#004395" },
    { id: "pab", country: "cn", name: "平安银行", en: "PING AN BANK", char: "安", color: "#F26522" },
    { id: "cgb", country: "cn", name: "广发银行", en: "CHINA GUANGFA BANK", char: "广", color: "#B01D26" },
    { id: "hxb", country: "cn", name: "华夏银行", en: "HUAXIA BANK", char: "华", color: "#C29B2C" },
    { id: "czb", country: "cn", name: "浙商银行", en: "CZBANK", char: "浙", color: "#0072BC" },
    { id: "nbcb", country: "cn", name: "宁波银行", en: "NINGBO BANK", char: "甬", color: "#00539F" },
    { id: "bob", country: "cn", name: "北京银行", en: "BANK OF BEIJING", char: "京", color: "#C8102E" },
    { id: "bos", country: "cn", name: "上海银行", en: "BANK OF SHANGHAI", char: "沪", color: "#005BAC" },
    { id: "jsb", country: "cn", name: "江苏银行", en: "BANK OF JIANGSU", char: "苏", color: "#00693C" },
    /* 中国香港 */
    { id: "hsbc-hk", country: "hk", name: "汇丰银行", en: "HSBC", char: "汇", color: "#DB0011" },
    { id: "hangseng", country: "hk", name: "恒生银行", en: "HANG SENG BANK", char: "恒", color: "#006B54" },
    { id: "bochk", country: "hk", name: "中银香港", en: "BOC HONG KONG", char: "中", color: "#C8102E" },
    { id: "scb-hk", country: "hk", name: "渣打香港", en: "STANDARD CHARTERED", char: "渣", color: "#00744A" },
    { id: "citi-hk", country: "hk", name: "花旗香港", en: "CITI HONG KONG", char: "花", color: "#003B70" },
    { id: "bea", country: "hk", name: "东亚银行", en: "BANK OF EAST ASIA", char: "东", color: "#DA291C" },
    { id: "dahsing", country: "hk", name: "大新银行", en: "DAH SING BANK", char: "大", color: "#E4002B" },
    /* 中国台湾 */
    { id: "ctbc", country: "tw", name: "中国信托银行", en: "CTBC BANK", char: "信", color: "#009B48" },
    { id: "esun", country: "tw", name: "玉山银行", en: "E.SUN BANK", char: "玉", color: "#007A63" },
    { id: "taishin", country: "tw", name: "台新银行", en: "TAISHIN BANK", char: "新", color: "#D0001C" },
    { id: "cathay", country: "tw", name: "国泰世华银行", en: "CATHAY UNITED BANK", char: "国", color: "#00675C" },
    { id: "firstbk", country: "tw", name: "第一银行", en: "FIRST BANK", char: "一", color: "#007A3D" },
    { id: "mega", country: "tw", name: "兆丰银行", en: "MEGA BANK", char: "兆", color: "#005EAB" },
    { id: "twbk", country: "tw", name: "台湾银行", en: "BANK OF TAIWAN", char: "台", color: "#004B32" },
    /* 日本 */
    { id: "mufg", country: "jp", name: "三菱UFJ银行", en: "MUFG BANK", char: "M", color: "#E60012" },
    { id: "smbc", country: "jp", name: "三井住友银行", en: "SMBC", char: "S", color: "#003A7D" },
    { id: "mizuho", country: "jp", name: "瑞穗银行", en: "MIZUHO BANK", char: "M", color: "#D00057" },
    { id: "japanpost", country: "jp", name: "日本邮政银行", en: "JAPAN POST BANK", char: "J", color: "#C8102E" },
    { id: "rakuten", country: "jp", name: "乐天银行", en: "RAKUTEN BANK", char: "R", color: "#BF0000" },
    { id: "sevenbk", country: "jp", name: "七七银行", en: "SEVEN BANK", char: "7", color: "#00A551" },
    /* 韩国 */
    { id: "shinhan", country: "kr", name: "新韩银行", en: "SHINHAN BANK", char: "S", color: "#1A3E8C" },
    { id: "kb", country: "kr", name: "国民银行", en: "KB KOOKMIN BANK", char: "K", color: "#FFAA00" },
    { id: "woori", country: "kr", name: "友利银行", en: "WOORI BANK", char: "W", color: "#0067AC" },
    { id: "hana", country: "kr", name: "韩亚银行", en: "HANA BANK", char: "H", color: "#00A0B0" },
    { id: "ibk", country: "kr", name: "中小企业银行", en: "IBK", char: "I", color: "#00693C" },
    /* 新加坡 */
    { id: "dbs", country: "sg", name: "星展银行", en: "DBS BANK", char: "D", color: "#ED1A3B" },
    { id: "ocbc", country: "sg", name: "华侨银行", en: "OCBC BANK", char: "O", color: "#D71920" },
    { id: "uob", country: "sg", name: "大华银行", en: "UOB", char: "U", color: "#005EB8" },
    /* 美国 */
    { id: "chase", country: "us", name: "摩根大通", en: "CHASE", char: "C", color: "#117ACA" },
    { id: "bofa", country: "us", name: "美国银行", en: "BANK OF AMERICA", char: "B", color: "#E31837" },
    { id: "citi", country: "us", name: "花旗银行", en: "CITIBANK", char: "C", color: "#003B70" },
    { id: "wellsfargo", country: "us", name: "富国银行", en: "WELLS FARGO", char: "W", color: "#D70926" },
    { id: "amex-bk", country: "us", name: "美国运通银行", en: "AMERICAN EXPRESS", char: "A", color: "#016FD0" },
    { id: "capone", country: "us", name: "第一资本", en: "CAPITAL ONE", char: "C", color: "#00447C" },
    { id: "usbank", country: "us", name: "合众银行", en: "U.S. BANK", char: "U", color: "#0033A0" },
    { id: "marcus", country: "us", name: "高盛银行", en: "MARCUS BY GOLDMAN", char: "M", color: "#64A8D8" },
    /* 英国 */
    { id: "barclays", country: "uk", name: "巴克莱银行", en: "BARCLAYS", char: "B", color: "#00AEEF" },
    { id: "hsbc-uk", country: "uk", name: "汇丰英国", en: "HSBC UK", char: "H", color: "#DB0011" },
    { id: "lloyds", country: "uk", name: "劳埃德银行", en: "LLOYDS BANK", char: "L", color: "#006A4D" },
    { id: "natwest", country: "uk", name: "国民西敏寺", en: "NATWEST", char: "N", color: "#50287C" },
    { id: "santander-uk", country: "uk", name: "桑坦德英国", en: "SANTANDER UK", char: "S", color: "#EC0000" },
    { id: "halifax", country: "uk", name: "哈利法克斯", en: "HALIFAX", char: "H", color: "#008C95" },
    { id: "monzo", country: "uk", name: "Monzo", en: "MONZO", char: "M", color: "#FF4F40" },
    /* 德国 */
    { id: "deutsche", country: "de", name: "德意志银行", en: "DEUTSCHE BANK", char: "D", color: "#0018A8" },
    { id: "commerz", country: "de", name: "德国商业银行", en: "COMMERZBANK", char: "C", color: "#E6B800" },
    { id: "dkb", country: "de", name: "德国信贷银行", en: "DKB", char: "D", color: "#005F61" },
    /* 法国 */
    { id: "bnp", country: "fr", name: "法国巴黎银行", en: "BNP PARIBAS", char: "B", color: "#00A1DF" },
    { id: "socgen", country: "fr", name: "法国兴业银行", en: "SOCIÉTÉ GÉNÉRALE", char: "S", color: "#EC0C0C" },
    { id: "creditagri", country: "fr", name: "法国农业信贷", en: "CRÉDIT AGRICOLE", char: "C", color: "#009640" },
    /* 其他欧洲 */
    { id: "ing", country: "eu", name: "ING集团(荷兰)", en: "ING", char: "I", color: "#FF6200" },
    { id: "rabobank", country: "eu", name: "荷兰合作银行", en: "RABOBANK", char: "R", color: "#005CA9" },
    { id: "santander", country: "eu", name: "桑坦德银行(西班牙)", en: "SANTANDER", char: "S", color: "#EC0000" },
    { id: "bbva", country: "eu", name: "西班牙对外银行", en: "BBVA", char: "B", color: "#004481" },
    { id: "unicredit", country: "eu", name: "联合信贷银行(意大利)", en: "UNICREDIT", char: "U", color: "#E30613" },
    { id: "intesa", country: "eu", name: "联合圣保罗银行(意大利)", en: "INTESA SANPAOLO", char: "I", color: "#004A97" },
    { id: "nordea", country: "eu", name: "北欧联合银行(瑞典)", en: "NORDEA", char: "N", color: "#00A9E0" },
    { id: "danske", country: "eu", name: "丹斯克银行(丹麦)", en: "DANSKE BANK", char: "D", color: "#003D7C" },
    { id: "seb", country: "eu", name: "北欧斯安银行(瑞典)", en: "SEB", char: "S", color: "#00B0B9" },
    /* 加拿大 */
    { id: "rbc", country: "ca", name: "加拿大皇家银行", en: "RBC ROYAL BANK", char: "R", color: "#004B93" },
    { id: "td", country: "ca", name: "道明银行", en: "TD CANADA TRUST", char: "T", color: "#008A4C" },
    { id: "scotia", country: "ca", name: "丰业银行", en: "SCOTIABANK", char: "S", color: "#EC111A" },
    { id: "bmo", country: "ca", name: "蒙特利尔银行", en: "BMO", char: "B", color: "#004C97" },
    { id: "cibc", country: "ca", name: "帝国商业银行", en: "CIBC", char: "C", color: "#9E1B32" },
    /* 澳大利亚 */
    { id: "cba", country: "au", name: "联邦银行", en: "COMMONWEALTH BANK", char: "C", color: "#FFC20E" },
    { id: "westpac", country: "au", name: "西太平洋银行", en: "WESTPAC", char: "W", color: "#D21F26" },
    { id: "anz", country: "au", name: "澳新银行", en: "ANZ", char: "A", color: "#00657F" },
    { id: "nab", country: "au", name: "国民银行", en: "NAB", char: "N", color: "#C3002F" },
    /* 其他地区 */
    { id: "hdfc", country: "other", name: "HDFC银行(印度)", en: "HDFC BANK", char: "H", color: "#004C8F" },
    { id: "icici", country: "other", name: "ICICI银行(印度)", en: "ICICI BANK", char: "I", color: "#EF7C1A" },
    { id: "sbibk", country: "other", name: "印度国家银行", en: "STATE BANK OF INDIA", char: "S", color: "#1B4F8A" },
    { id: "maybank", country: "other", name: "马来亚银行(马来西亚)", en: "MAYBANK", char: "M", color: "#F5A800" },
    { id: "bangkokbk", country: "other", name: "盘古银行(泰国)", en: "BANGKOK BANK", char: "B", color: "#1B3F8F" },
    { id: "kbank", country: "other", name: "开泰银行(泰国)", en: "KRUNGTHAI K Bank", char: "K", color: "#138F3D" },
    { id: "vietcom", country: "other", name: "外贸银行(越南)", en: "VIETCOMBANK", char: "V", color: "#006B3F" },
    { id: "bdo", country: "other", name: "金融银行(菲律宾)", en: "BDO", char: "B", color: "#0057B8" },
    { id: "emiratesnbd", country: "other", name: "阿联酋NBD银行", en: "EMIRATES NBD", char: "E", color: "#00452E" },
    { id: "fab", country: "other", name: "阿布扎比第一银行", en: "FIRST ABU DHABI", char: "F", color: "#AF1E2D" },
    { id: "itaubk", country: "other", name: "伊塔乌银行(巴西)", en: "ITAÚ", char: "I", color: "#EC7000" },
    { id: "bradesco", country: "other", name: "巴西银行", en: "BRADESCO", char: "B", color: "#CC092F" },
  ];

  /* ---------- 卡组织(按官方标准图形绘制) ---------- */
  const orgs = [
    /* Visa:深蓝斜体字标 */
    {
      id: "visa", name: "Visa", wide: true,
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="96" viewBox="0 0 300 96">
  <text x="150" y="48" dy=".36em" font-family="${EN_FONT}" font-style="italic" font-weight="900" font-size="64" fill="#1A1F71" text-anchor="middle" letter-spacing="3">VISA</text>
</svg>`,
    },
    /* Mastercard:红黄双圆(交集橙) */
    {
      id: "mastercard", name: "Mastercard", wide: true,
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
  <defs><clipPath id="mcL"><circle cx="128" cy="72" r="62"/></clipPath></defs>
  <circle cx="128" cy="72" r="62" fill="#EB001B"/>
  <circle cx="192" cy="72" r="62" fill="#F79E1B"/>
  <circle cx="192" cy="72" r="62" fill="#FF5F00" clip-path="url(#mcL)"/>
  <text x="160" y="178" font-family="${EN_FONT}" font-size="30" font-weight="700" fill="#161616" text-anchor="middle" letter-spacing="1">mastercard</text>
</svg>`,
    },
    /* 银联:方版标识(透明背景 + 红蓝绿三色斜块 + UnionPay 银联) */
    {
      id: "unionpay", name: "银联 UnionPay", wide: true,
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="200" viewBox="0 0 460 200">
  <defs><clipPath id="upClip"><rect width="460" height="200" rx="26"/></clipPath></defs>
  <g clip-path="url(#upClip)">
    <path d="M24 14 L170 14 L162 186 L16 186 Z" fill="#E21836"/>
    <path d="M168 14 L308 14 L300 186 L160 186 Z" fill="#00447C"/>
    <path d="M306 14 L444 14 L436 186 L298 186 Z" fill="#00784A"/>
    <text x="230" y="74" text-anchor="middle" font-family="${EN_FONT}" font-style="italic" font-weight="800" font-size="42" fill="#ffffff">UnionPay</text>
    <text x="230" y="150" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="56" fill="#ffffff">银联</text>
  </g>
</svg>`,
    },
    /* Amex:蓝底白字方标 */
    {
      id: "amex", name: "American Express",
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="140" viewBox="0 0 280 140">
  <rect width="280" height="140" rx="10" fill="#016FD0"/>
  <text x="140" y="62" text-anchor="middle" font-family="${EN_FONT}" font-weight="800" font-size="33" fill="#ffffff" letter-spacing="2">AMERICAN</text>
  <text x="140" y="98" text-anchor="middle" font-family="${EN_FONT}" font-weight="800" font-size="33" fill="#ffffff" letter-spacing="2">EXPRESS</text>
</svg>`,
    },
    /* JCB:蓝绿红渐变竖条 + 放射光纹 + 白字 */
    {
      id: "jcb", name: "JCB",
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="110" viewBox="0 0 270 110">
  <defs>
    <linearGradient id="jcbB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0B4EA2"/><stop offset="1" stop-color="#1E7BD7"/></linearGradient>
    <linearGradient id="jcbG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#009A49"/><stop offset="1" stop-color="#3EC06B"/></linearGradient>
    <linearGradient id="jcbR" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#CB0229"/><stop offset="1" stop-color="#F0557A"/></linearGradient>
  </defs>
  <rect x="12" y="12" width="72" height="86" rx="12" fill="url(#jcbB)"/>
  <rect x="99" y="12" width="72" height="86" rx="12" fill="url(#jcbG)"/>
  <rect x="186" y="12" width="72" height="86" rx="12" fill="url(#jcbR)"/>
  <g stroke="#ffffff" stroke-width="2" opacity=".3" fill="none">
    <path d="M22 92 L52 20 M34 92 L64 20 M46 92 L76 20"/>
    <path d="M109 92 L139 20 M121 92 L151 20 M133 92 L163 20"/>
    <path d="M196 92 L226 20 M208 92 L238 20 M220 92 L250 20"/>
  </g>
  <text x="48" y="55" dy=".36em" text-anchor="middle" font-family="${EN_FONT}" font-weight="900" font-size="30" fill="#fff">J</text>
  <text x="135" y="55" dy=".36em" text-anchor="middle" font-family="${EN_FONT}" font-weight="900" font-size="30" fill="#fff">C</text>
  <text x="222" y="55" dy=".36em" text-anchor="middle" font-family="${EN_FONT}" font-weight="900" font-size="30" fill="#fff">B</text>
</svg>`,
    },
    /* Discover:黑字 + 橙渐变圆作 O */
    {
      id: "discover", name: "Discover", wide: true,
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="110" viewBox="0 0 340 110">
  <defs><radialGradient id="discO" cx=".35" cy=".35" r=".9"><stop offset="0" stop-color="#FAB24D"/><stop offset="1" stop-color="#F47216"/></radialGradient></defs>
  <text x="10" y="66" font-family="${EN_FONT}" font-weight="800" font-size="42" fill="#231F20" letter-spacing="1">DISC</text>
  <circle cx="152" cy="51" r="17" fill="url(#discO)"/>
  <text x="176" y="66" font-family="${EN_FONT}" font-weight="800" font-size="42" fill="#231F20" letter-spacing="1">VER</text>
</svg>`,
    },
    /* Diners Club:蓝球白经纬 + 字标 */
    {
      id: "diners", name: "Diners Club", wide: true,
      svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="330" height="120" viewBox="0 0 330 120">
  <clipPath id="dcC"><circle cx="50" cy="58" r="38"/></clipPath>
  <circle cx="50" cy="58" r="38" fill="#0079BE"/>
  <g clip-path="url(#dcC)" stroke="#ffffff" fill="none">
    <ellipse cx="50" cy="58" rx="13" ry="38" stroke-width="3"/>
    <line x1="12" y1="58" x2="88" y2="58" stroke-width="3"/>
    <line x1="19" y1="42" x2="81" y2="42" stroke-width="2.5"/>
    <line x1="19" y1="74" x2="81" y2="74" stroke-width="2.5"/>
  </g>
  <text x="100" y="52" font-family="${EN_FONT}" font-weight="700" font-size="30" fill="#0079BE">Diners</text>
  <text x="100" y="86" font-family="${EN_FONT}" font-weight="400" font-size="26" fill="#0079BE" opacity=".85">Club</text>
</svg>`,
    },
  ];

  /* ---------- 英文卡等级 ---------- */
  const tiers = [
    { id: "classic", name: "Classic 普卡", text: "CLASSIC", color: "#C3C8D0" },
    { id: "silver", name: "Silver 银卡", text: "SILVER", color: "#C8CDD5" },
    { id: "gold", name: "Gold 金卡", text: "GOLD", color: "#D9B45B" },
    { id: "platinum", name: "Platinum 白金", text: "PLATINUM", color: "#EDEFF3" },
    { id: "diamond", name: "Diamond 钻石", text: "DIAMOND", color: "#A9D3F5" },
    { id: "infinite", name: "Infinite 无限", text: "INFINITE", color: "#4A5462" },
    { id: "signature", name: "Signature 签名", text: "SIGNATURE", color: "#3A3F47" },
    { id: "world", name: "World 世界", text: "WORLD", color: "#DA4A22" },
    { id: "worldelite", name: "World Elite 至尊", text: "WORLD ELITE", color: "#C9A54E" },
    { id: "business", name: "Business 商务", text: "BUSINESS", color: "#3E7BDB" },
    { id: "premier", name: "Premier 卓越", text: "PREMIER", color: "#8E6EC0" },
    { id: "centurion", name: "Centurion 黑金", text: "CENTURION", color: "#2A2A2A" },
  ];

  /* ---------- 预设渐变 ---------- */
  const presets = [
    { name: "深邃蓝", colors: ["#141E30", "#243B55"], angle: 135 },
    { name: "暗夜",   colors: ["#0F2027", "#203A43", "#2C5364"], angle: 135 },
    { name: "落日",   colors: ["#FF512F", "#DD2476"], angle: 120 },
    { name: "香槟金", colors: ["#8E6E2C", "#D9B45B"], angle: 135 },
    { name: "玫瑰",   colors: ["#EE9CA7", "#FFDDE1"], angle: 135 },
    { name: "紫罗兰", colors: ["#41295A", "#2F0743"], angle: 135 },
    { name: "海洋",   colors: ["#2E3192", "#1BFFFF"], angle: 135 },
    { name: "翡翠",   colors: ["#134E5E", "#71B280"], angle: 135 },
    { name: "勃艮第", colors: ["#870000", "#190A05"], angle: 135 },
    { name: "石墨",   colors: ["#232526", "#414345"], angle: 135 },
    { name: "极光",   colors: ["#0BA360", "#3CBA92"], angle: 135 },
    { name: "咖啡",   colors: ["#3C2A21", "#865439"], angle: 135 },
  ];

  window.CardAssets = { countries, banks, orgs, tiers, presets, bankSvg, tierSvg };
})();
