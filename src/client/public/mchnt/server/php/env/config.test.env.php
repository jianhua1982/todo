<?php

// test env
define("UPWALLET_APPID", 'mchntDemo');
define("UPWALLET_SECRET", 'abcd1234');
//define("REDIRECT_URI", 'http://172.17.250.156:80');
define("REDIRECT_URI", 'http://172.18.64.34:38080');
//define("REDIRECT_URI", 'http://101.231.114.253');

/*
 * 钱包商户侧调试apache.
 */
define("PARTNER_URL_PATH_NAME", '/web/public/mchnt/h5/html/bindLogin.html');
//基于XAMPP环境
//define("PHP_LOG_FILE", '/Applications/XAMPP/logs/mchnt.php.test');
define("PHP_LOG_FILE", '/home/ch_wm_open/logs/mchnt.php.test');

/*
 * 钱包开放平台连接服务器
 */
//define("UPWALLET_URL", 'http://101.231.114.253');
define("UPWALLET_URL", 'http://172.18.64.34:38080');

