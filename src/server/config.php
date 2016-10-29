<?php

namespace Alopay;

ini_set("display_errors", "On");


// error code define
define('EYZ_BAD_PARAM', '01');
define('EYZ_OPENID_NOT_FOUND', '03');
define('EYZ_DECRYPT_FAILED', '04');
define('EYZ_LOGIC_EXCEPTION', '11');
define('EYZ_SIGNATURE_NOT_SAME', '12');

define('EYZ_ZERO_SID_NOT_FOUND', '999');
define('EYZ_ACCOUNT_KICKOUT', '+9x9+');

/*
 * 服务器配置，详情请参考@link http://mp.weixin.qq.com/wiki/index.php?title=接入指南
 */
define("WECHAT_URL", 'https://www.wygreen.cn');
define('WECHAT_TOKEN', 'wygreen');

define ("ENCODING_AES_KEY", 'g60cL5yUkvh6abVyCA8tlzecciMlY0GSXe6uRxoOJDN');  //encoding AES key
define ("ENCRYPT_TYPE", "RAW");			//raw for not encoding
//define ("ENCRYPT_TYPE", "ENCODING");

/*
 * 开发者配置
 */

$appName = '';

if (isset($_GET["appName"])) {
    $appName = $_GET["appName"];
}
elseif (isset($_POST["appName"])) {
    $appName = $_POST["appName"];
}

if($appName === 'tujiayanmei') {
    /*
     * 合作社 公众号
     */
    define("WECHAT_APPID", 'wxbf31a57518937d93');
    define("WECHAT_APPSECRET", '26dec13028a2a4c2a3640c7fde0e7b85');
    define("WECHAT_DEV_ID", 'gh_0131c3540f48');
}
elseif($appName === 'taiweiclient') {
    /*
     * 泰为公司客户端开发大家庭  订阅号
     */
    define("WECHAT_APPID", 'wx165b8edf42085a7d');
    define("WECHAT_APPSECRET", 'dd4e0057ab6ce107b01fd05439861fc6');
}
elseif($appName === 'testaccount') {
    /*
     * 测试系统公众号
     */
    define("WECHAT_APPID", 'wxe755419ca7f45e03');
    define("WECHAT_APPSECRET", 'ca279c6d4e8d8a286f9fa2474156bb51');
    define("WECHAT_DEV_ID", 'gh_0131c3540f48');
    define("WECHAT_SHOU_TEMPLATE_ID", 'gyeJkADKP7nk7-jBOoGiQpRR1UDbDv7Q1V1eksQFtlQ');
}
elseif($appName === 'alopay') {
    /*
     * 测试系统公众号
     */
    define("WECHAT_APPID", 'wx5d47e3eaa09fcde9');
    define("WECHAT_APPSECRET", '19086e89d72df376b27f8b0ddd7cdf6c');
    define("WECHAT_DEV_ID", 'gh_d1b6df27c109');
    define("WECHAT_SHOU_TEMPLATE_ID", 'h7WQrnA8r0rEAvkrYGcZClQvlZRkfigzVughTIvr9vM');
}

/*
 *  https://www.wygreen.cn/alopay/wechat.php?appName=alopay
 *  https://www.wygreen.cn/alopay/prod/wechat.php?appName=alopay
 *
 */

/*
 * Memcache节点
 */
//define("MEMCACHE_NODES", array(
//    array(
//        "IP" => "120.26.119.20",  // wygreen.cn
//        "PORT" => "11211"
//    )
//));

//define ("CACHE_TYPE", "FILE");   // store in file
define ("CACHE_TYPE", "MEM_CACHE");  // memcache

define ("COOKIE_CAPTCHA", "WXSESSIONID");

//define ("COOKIE_SID", "sid");

define ("COOKIE_OPENID", "openid");
//define ("COOKIE_GOT_OPENID", "gotOpenId");


define ("CACHE_ZERO_SID", "sid");

// app related logic




//-----引入系统所需类库-------------------
//引入错误消息类
include_once 'core/msg.lib.php';
//引入错误码类
include_once 'core/msgconstant.lib.php';
//引入CURL类
include_once 'core/curl.lib.php';

//-----------引入微信所需的基本类库----------------
//引入微信处理中心类
include_once 'core/wechat.lib.php';
//引入微信请求处理类
include_once 'core/wechatrequest.lib.php';
//引入微信被动响应处理类
include_once 'core/responsepassive.lib.php';
//引入微信access_token类
include_once 'core/accesstoken.lib.php';

//-----如果是认证服务号，需要引入以下类--------------
//引入微信权限管理类
include_once 'core/wechatoauth.lib.php';
//引入微信用户/用户组管理类
include_once 'core/usermanage.lib.php';
//引入微信主动相应处理类
include_once 'core/responseinitiative.lib.php';
//引入多媒体管理类
include_once 'core/media.lib.php';
//引入自定义菜单类
include_once 'core/menu.lib.php';

//-----引入JS-SDK所需类库-------------------
include_once 'core/apiticket.lib.php';
include_once 'core/signature.lib.php';

//-----应用扩展--------
include_once 'core/cache.lib.php';
include_once 'core/util.lib.php';
include_once 'core/picmgr.lib.php';

?>