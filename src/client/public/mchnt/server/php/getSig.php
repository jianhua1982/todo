<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 16/7/7
 * Time: 下午7:40
 */

/*
 * 接入方页面获取签名.
 */
namespace Wallet;
include_once __DIR__.'/wallet.php';


namespace Wallet\Core;

if (isset($_POST["url"])) {
    $url = $_POST["url"];
}
/*
 referrer 靠不住，尤其是页面back回来，静态加载时，referrer 读的是前面一个页面的URL [iOS 100%重现]
 */
//else if(isset($_SERVER["HTTP_REFERER"])) {
//    $url = $_SERVER["HTTP_REFERER"];
//}
else {
    $url = '';
}

if(!filter_var($url, FILTER_VALIDATE_URL)) {
    /*
     * Invalid url
     */
    Util::retError(EUPWALLET_INVALID_URL);
}
else {
    $sig = new Signature();
    if($signPackage = $sig->getSignPackage($url)) {
        // success
        $ret =  json_encode($signPackage);
    }
    else {
        // fail
        $ret =  json_encode(Util::retError(EUPWALLET_FRONT_TOKEN_ERROR));
    }

    Util::log($ret);
    echo $ret;
}
