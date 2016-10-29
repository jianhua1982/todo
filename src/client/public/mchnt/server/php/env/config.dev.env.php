<?php

// prod env
define("UPWALLET_APPID", 'bing');
define("UPWALLET_SECRET", 'abcd1234');
define("REDIRECT_URI", 'http://localhost');

/*
 * 钱包商户侧调试apache.
 */
//http://localhost:8080/#/bindLogin
define("PARTNER_URL_PATH_NAME", '/web/public/mchnt/h5/html/bindLogin.html');

//基于XAMPP环境
define("PHP_LOG_FILE", '/Applications/XAMPP/logs/mchnt.php.dev');

/*
 * 钱包开放平台连接服务器
 */
define("UPWALLET_URL", 'http://localhost');




