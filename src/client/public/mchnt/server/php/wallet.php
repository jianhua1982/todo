<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 16/7/13
 * Time: 下午2:51
 */

namespace Wallet;

error_reporting(E_ALL);
ini_set('display_errors', 'On');

//引入配置文件
$serverPort = $_SERVER["SERVER_PORT"];

//echo '$serverPort = ' . $serverPort;

//if($serverPort == '8088') {
//    //dev
//    $configEnvFile = 'config.dev.env.php';
//}
//else if($serverPort == '8080') {
//    // prod
//    $configEnvFile = 'config.prod.env.php';
//}
//else {
//    $configEnvFile = 'config.test.env.php';
//}

$configEnvFile = 'config.dev.env.php';

include_once __DIR__ . '/env/' . $configEnvFile;

/*
 * web server page prefix, MOCK_SERVER如果打开的话, 将会访问开发MOCK数据, 位于/mockServer/1.0
 * 钱包开发利用MOCK数据测试开放平台的各个逻辑分支.
 */
define("MOCK_SERVER", true);

//-----引入系统所需类库-------------------
include_once 'core/util.lib.php';
include_once 'core/curl.lib.php';
include_once 'core/token.lib.php';
include_once 'core/oauth.lib.php';
include_once 'core/signature.lib.php';

//引入自动载入函数
include_once __DIR__.'/autoloader.php';
//调用自动载入函数
Autoloader::register();

