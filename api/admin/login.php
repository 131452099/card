<?php
/* POST /api/admin/login  密码登录,返回 token */
require_once __DIR__ . '/../lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  out(array('error' => 'Method Not Allowed'), 405);
}
$body = body_json();
$pwd = isset($body['password']) ? strval($body['password']) : '';
if (!hash_equals(ADMIN_PASSWORD, $pwd)) {
  out(array('error' => '密码错误'), 401);
}
out(array('token' => admin_token()));
