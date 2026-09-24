<?php
/* GET /api/selfcheck.php  部署自检(零副作用,不写配置、不校验密码)
 * 用法:浏览器打开 https://你的域名/api/selfcheck.php,全部 ok=true 即后台可用。
 * 确认无误后请删除本文件。 */
require_once __DIR__ . '/lib.php';

$writable = is_dir(DATA_DIR) ? is_writable(DATA_DIR) : (@mkdir(DATA_DIR, 0755, true) && is_writable(DATA_DIR));
$fileOk   = is_file(DATA_FILE) ? is_writable(DATA_FILE) : $writable;

/* token 往返:服务端签发 → bearer_ok() 校验,模拟后台保存时的鉴权 */
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . admin_token();
$roundTrip = bearer_ok();
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer bogus-token';
$rejectBad = !bearer_ok();
unset($_SERVER['HTTP_AUTHORIZATION']);

/* 随机卡面依赖的出站能力 */
$fetch = function_exists('curl_init') || (bool)ini_get('allow_url_fopen');
$net = array('ok' => false, 'detail' => 'skip');
if (function_exists('curl_init')) {
  $ch = curl_init('https://a.600060.xyz/');
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT        => 12,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_USERAGENT      => 'Mozilla/5.0',
  ));
  $body = curl_exec($ch);
  $err  = curl_error($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  $net = array(
    'ok'     => $body !== false && $code >= 200 && $code < 400,
    'detail' => $body !== false ? ('http ' . $code . ', ' . strlen($body) . ' bytes') : ('curl: ' . $err),
  );
} elseif (ini_get('allow_url_fopen')) {
  $body = @file_get_contents('https://a.600060.xyz/');
  $net = array('ok' => $body !== false, 'detail' => $body !== false ? (strlen($body) . ' bytes') : 'fopen failed');
}

$checks = array(
  'php'             => PHP_VERSION,
  'hashHmac'        => function_exists('hash_hmac'),
  'hashEquals'      => function_exists('hash_equals'),
  'json'            => function_exists('json_encode'),
  'dataDirWritable' => $writable,
  'configWritable'  => $fileOk,
  'tokenRoundTrip'  => $roundTrip,
  'rejectBadToken'  => $rejectBad,
  'configRead'      => is_array(cfg_load()),
  'outboundFetch'   => $fetch,
  'imageSource'     => $net,
);

$ok = $checks['hashHmac'] && $checks['hashEquals'] && $checks['dataDirWritable']
   && $checks['configWritable'] && $checks['tokenRoundTrip'] && $checks['rejectBadToken']
   && $checks['configRead'] && $checks['outboundFetch'];

out(array('ok' => $ok, 'checks' => $checks, 'hint' => $ok ? '后台可用' : '请按 false 项排查(多为 api/data 目录不可写)'), $ok ? 200 : 500);
