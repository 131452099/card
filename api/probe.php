<?php
/* 诊断页:确认主机是否允许 PHP 对外请求(随机卡面依赖此项)
 * 用法:浏览器打开 https://你的域名/api/probe.php,看结果后把页面内容发回即可。
 * 诊断完请删除本文件。 */
header('Content-Type: text/plain; charset=utf-8');

echo "PHP: " . PHP_VERSION . "\n";
echo "curl: " . (function_exists('curl_init') ? 'available' : 'NOT available') . "\n";
echo "allow_url_fopen: " . (ini_get('allow_url_fopen') ? 'on' : 'off') . "\n";
echo "\n";

function try_fetch($url) {
  $out = array('url' => $url, 'ok' => false, 'bytes' => 0, 'type' => '', 'error' => '');
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_CONNECTTIMEOUT => 8,
      CURLOPT_TIMEOUT => 15,
      CURLOPT_USERAGENT => 'Mozilla/5.0',
      CURLOPT_SSL_VERIFYPEER => false,
      CURLOPT_SSL_VERIFYHOST => false,
    ));
    $d = curl_exec($ch);
    $out['error'] = curl_error($ch);
    $out['type'] = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    if (is_string($d) && strlen($d) > 0) { $out['ok'] = true; $out['bytes'] = strlen($d); }
    return $out;
  }
  $ctx = stream_context_create(array(
    'ssl'  => array('verify_peer' => false, 'verify_peer_name' => false),
    'http' => array('timeout' => 15, 'header' => "User-Agent: Mozilla/5.0\r\n"),
  ));
  $d = @file_get_contents($url, false, $ctx);
  if (is_string($d) && strlen($d) > 0) { $out['ok'] = true; $out['bytes'] = strlen($d); }
  else { $out['error'] = 'file_get_contents failed'; }
  return $out;
}

foreach (array('https://a.600060.xyz?r=' . time(), 'https://example.com') as $u) {
  $r = try_fetch($u);
  echo ($r['ok'] ? "[OK]   " : "[FAIL] ") . $r['url'] . "\n";
  echo "       bytes=" . $r['bytes'] . " type=" . $r['type'] . " error=" . $r['error'] . "\n";
}

echo "\n结论:\n";
echo "  a.600060.xyz 可取 -> 随机卡面可用(PHP 代理同源返回)\n";
echo "  两个都失败      -> 主机禁止 PHP 对外请求,随机卡面无法在该主机上使用\n";
echo "  只有 example.com 成功 -> 图源被主机网络屏蔽\n";
