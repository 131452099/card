<?php
/* POST /api/admin/config  保存站点配置(需 Bearer token) */
require_once __DIR__ . '/../lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  out(array('error' => 'Method Not Allowed'), 405);
}
if (!bearer_ok()) {
  out(array('error' => '登录已失效,请重新登录'), 401);
}

$cfg = sanitize_config(body_json());
$old = cfg_load();
$base = !empty($old['legalVersion']) ? intval($old['legalVersion']) : 1;
/* 法律声明内容变更时版本号 +1,前端会要求用户重新同意 */
$cfg['legalVersion'] = (!empty($old['legal']) && $old['legal'] !== $cfg['legal']) ? $base + 1 : $base;

if (!cfg_save($cfg)) {
  out(array('error' => '配置写入失败,请检查 api/data 目录是否可写(权限 755 或 777)'), 500);
}
out(array('ok' => true, 'config' => $cfg));
