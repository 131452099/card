<?php
/* 后台 API 公共库(InfinityFree / Apache + PHP 虚拟主机)
 * 配置以 JSON 文件存储于 api/data/config.json(目录需可写) */

/* 关闭错误回显:任何 warning/notice 混进响应体都会让前端 JSON 解析失败 */
ini_set('display_errors', '0');
ini_set('log_errors', '0');

const ADMIN_PASSWORD = 'admin123';            // 后台密码,部署后请修改
const DATA_DIR      = __DIR__ . '/data';
const DATA_FILE     = DATA_DIR . '/config.json';

function cfg_default() {
  return array(
    'links'        => array(),
    'icp'          => '',
    'icpUrl'       => 'https://beian.miit.gov.cn/',
    'police'       => '',
    'policeUrl'    => 'https://beian.gov.cn/',
    'legal'        => '本工具仅用于银行卡卡面的个人设计与效果演示。内置银行及卡组织标识来源于维基百科公开条目,其商标权与版权归各机构所有,本站与任何银行或卡组织无关联;请勿将生成内容用于伪造银行卡或其他违法用途,用户上传与生成的内容由用户自行负责。',
    'legalVersion' => 1,
    'themeColor'   => '#050608',
    'footer'       => array(
      'github'   => '',
      'wechat'   => '',
      'siteName' => '卡面设计工作台',
      'siteUrl'  => 'https://600060.xyz',
    ),
  );
}

function cfg_load() {
  $cfg = cfg_default();
  if (is_file(DATA_FILE)) {
    $raw = json_decode(@file_get_contents(DATA_FILE), true);
    if (is_array($raw)) $cfg = array_merge($cfg, $raw);
  }
  return $cfg;
}

function cfg_save($cfg) {
  if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
  return @file_put_contents(DATA_FILE, json_encode($cfg, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) !== false;
}

/* 与前端 signToken 完全一致的算法(JS: HMAC-SHA256,key='card-studio:'+pwd,msg='admin-session') */
function admin_token() {
  return base64_encode(hash_hmac('sha256', 'admin-session', 'card-studio:' . ADMIN_PASSWORD, true));
}

function bearer_ok() {
  $h = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
  $hs = function_exists('getallheaders') ? getallheaders() : array();
  foreach ($hs as $k => $v) if (strtolower($k) === 'authorization') $h = $v;

  $token = '';
  if (preg_match('/^Bearer\s+(.+)$/i', trim($h), $m)) $token = trim($m[1]);

  /* 兜底:Apache FastCGI / Nginx 常把 Authorization 头剥掉,
   * 此时前端同时发送 X-Admin-Token,自定义头不会被剥离 */
  if ($token === '') {
    $alt = isset($_SERVER['HTTP_X_ADMIN_TOKEN']) ? $_SERVER['HTTP_X_ADMIN_TOKEN'] : '';
    if ($alt === '') foreach ($hs as $k => $v) if (strtolower($k) === 'x-admin-token') $alt = $v;
    $token = trim((string)$alt);
  }

  return $token !== '' && hash_equals(admin_token(), $token);
}

function body_json() {
  $raw = file_get_contents('php://input');
  $d = json_decode($raw, true);
  return is_array($d) ? $d : array();
}

function out($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function str_max($v, $max) {
  if (!is_string($v)) return '';
  return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max * 4);
}

function sanitize_config($raw) {
  $links = array();
  if (isset($raw['links']) && is_array($raw['links'])) {
    foreach ($raw['links'] as $l) {
      if (!is_array($l)) continue;
      $n = isset($l['name']) ? trim(str_max($l['name'], 40)) : '';
      $u = isset($l['url']) ? trim(str_max($l['url'], 300)) : '';
      if ($n !== '' && $u !== '') $links[] = array('name' => $n, 'url' => $u);
      if (count($links) >= 30) break;
    }
  }
  $d = cfg_default();
  $color = isset($raw['themeColor']) ? strval($raw['themeColor']) : '';
  $footer_in = isset($raw['footer']) && is_array($raw['footer']) ? $raw['footer'] : array();
  return array(
    'links'        => $links,
    'icp'          => str_max(isset($raw['icp']) ? $raw['icp'] : '', 60),
    'icpUrl'       => str_max(isset($raw['icpUrl']) ? $raw['icpUrl'] : '', 300) ?: $d['icpUrl'],
    'police'       => str_max(isset($raw['police']) ? $raw['police'] : '', 60),
    'policeUrl'    => str_max(isset($raw['policeUrl']) ? $raw['policeUrl'] : '', 300) ?: $d['policeUrl'],
    'legal'        => str_max(isset($raw['legal']) ? $raw['legal'] : '', 8000),
    'legalVersion' => 1,
    'themeColor'   => preg_match('/^#[0-9a-fA-F]{6}$/', $color) ? $color : $d['themeColor'],
    'footer'       => array(
      'github'   => str_max(isset($footer_in['github']) ? $footer_in['github'] : '', 300),
      'wechat'   => str_max(isset($footer_in['wechat']) ? $footer_in['wechat'] : '', 60),
      'siteName' => str_max(isset($footer_in['siteName']) ? $footer_in['siteName'] : '', 60) ?: $d['footer']['siteName'],
      'siteUrl'  => str_max(isset($footer_in['siteUrl']) ? $footer_in['siteUrl'] : '', 300) ?: $d['footer']['siteUrl'],
    ),
  );
}
