<?php
/* GET /api/config  公开读取站点配置 */
require_once __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  out(array('error' => 'Method Not Allowed'), 405);
}
out(cfg_load());
