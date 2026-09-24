<?php
/* GET /api/random-card.php
 * 代理二次元图源 a.600060.xyz:同源返回,避免跨域图片污染 canvas(否则导出 PNG 会失败)
 * 说明:部分虚拟主机禁止 PHP 对外请求,此时返回 502,前端会提示该图源不可用。 */
require_once __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  out(array('error' => 'Method Not Allowed'), 405);
}

$url = 'https://a.600060.xyz?r=' . time() . mt_rand(100, 999);
$img = null;
$ctype = null;

if (function_exists('curl_init')) {
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
  ));
  $img = curl_exec($ch);
  $ctype = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($img === false) { $img = null; if ($err) error_log('random-card curl: ' . $err); }
} else {
  /* 无 curl 时用流方式;关闭证书校验以兼容缺少 CA 的主机 */
  $ctx = stream_context_create(array(
    'ssl'  => array('verify_peer' => false, 'verify_peer_name' => false),
    'http' => array('timeout' => 15, 'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0\r\n"),
  ));
  $img = @file_get_contents($url, false, $ctx);
  if (isset($http_response_header)) {
    foreach ($http_response_header as $h) {
      if (stripos($h, 'content-type:') === 0) $ctype = trim(substr($h, 13));
    }
  }
}

if (!$img || strlen($img) < 1024 || ($ctype && strpos($ctype, 'image/') !== 0)) {
  out(array('error' => '随机图源不可用(主机可能禁止 PHP 对外请求)'), 502);
}

header('Content-Type: ' . ($ctype ?: 'image/jpeg'));
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
echo $img;
