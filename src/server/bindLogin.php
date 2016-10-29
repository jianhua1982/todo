<?php

namespace Alopay\Core;

//引入配置文件
include_once __DIR__ . '/config.php';

/*
 * echo str_replace("world","earth","Hello world!");		//输出 Hello earth!
 */
//$loginPage = str_replace('/server/bindLogin.php', '/client/html/pay/login.html', $_SERVER['PHP_SELF']);
$loginPage = Util::loginPagePath();

    /*
     * mock
     */
//$_POST['phone'] = '12345678901';
//$_POST['pwd'] = '1212121212';
//$_POST['captcha'] = 'abcd';
//$_POST['redurl'] = '/alopay/client/html/pay/main.html';

$disableCaptcha = true;

if($disableCaptcha) {
    // mock
    $_POST['captcha'] = 'abcd';
}

// check input data.
if (!(isset($_POST['phone']) && isset($_POST['pwd']) && isset($_POST['captcha'])) && !(isset($_GET['code']) && isset($_GET['state']))) {
    util::errorRedirect($loginPage, '99', '输入参数异常');
}

if (isset($_POST['phone']) && isset($_POST['encPwd']) && isset($_POST['captcha'])) {

    $user = $_POST['phone'];
    $password = $_POST['encPwd'];
    $captcha = $_POST["captcha"]; //存在

    if(isset($_COOKIE['PHPSESSID'])) {
        $sessionId = $_COOKIE['PHPSESSID'];
    }

    if(!$sessionId) {
        util::errorRedirect($loginPage, '111', 'session已经过期');
        return;
    }

    Util::log('$sessionId = ' . $sessionId);

    // decrypt pwd.
    $decryptPwd = Util::decryptMsg($sessionId, $password);
    if(!$decryptPwd) {
        Util::log('decrypt failed!!!');
        Util::errorRedirect($loginPage, EYZ_DECRYPT_FAILED, Util::errorMsg(EYZ_DECRYPT_FAILED));
        return;
    }

    Util::log('$decryptPwd = ' . $decryptPwd);

    //初始化mmc实例
    $mc = new Cache();

    if(!$disableCaptcha) {
        /*
         * disable it current now.
         */
        //获取当前Cookieid验证码
        $validate_code = $mc->get($_COOKIE[COOKIE_CAPTCHA]);

//    var_dump($_POST);
//    echo '<br>';
//
//    var_dump($validate_code);
//    var_dump($captcha);

        if ($validate_code == null || !isset($validate_code)) {
            //验证码已失效
            error_log("captcha_cookie_name:".$_COOKIE[COOKIE_CAPTCHA]);
            Util::errorRedirect($loginPage, '77', '验证码已失效!');
        }
        else if (strtoupper($captcha) !== strtoupper($validate_code)) {
            Util::errorRedirect($loginPage, '88', '验证码不正确!');
        }

        $mc->delete($_COOKIE[COOKIE_CAPTCHA]);
    }

    if (isset($_POST['redurl']) && strlen($_POST['redurl'])) {
        $redirectUrl = $_POST['redurl'];
    } else {
        if (isset($_SERVER['HTTP_REFERER'])) {
            $redirectUrl = $_SERVER['HTTP_REFERER'];
        } else {
            $redirectUrl = $_SERVER['REQUEST_URI'];
        }
    }

    Util::log('>>> $redirectUrl = ' . $redirectUrl);


    $value = array('phone' => $user, 'pwd' => $decryptPwd, 'redurl' => $redirectUrl);

    $ret = Util::checkOpenId($openId);
    if($ret) {
        // openId has got already.
        Util::doLogin($value, $openId, $loginPage);
    }
    else {
        // code -> openid -> login
        $mc->set($sessionId, $value);
        /*
         * 1st step: fetch code.
         */
        WeChatOAuth::getCode($_SERVER['REQUEST_URI'], $sessionId, 'snsapi_base'); // 'snsapi_userinfo'  'snsapi_base'
    }
}

if (isset($_GET['code']) && isset($_GET['state'])) {
    error_log(json_encode($_GET));

   /*
    * Got code then fetch openid.
    */
    $result = WeChatOAuth::getAccessTokenAndOpenId($_GET['code']);

    if (isset($result['openid'])) {
        /*
         * got openid, then bind login.
         */
        $openid = $result['openid'];
        //初始化mmc实例
        $mc = new Cache();

        $loginInfo = $mc->get($_GET['state']);

        if(!$loginInfo) {
            Util::retError(EYZ_LOGIC_EXCEPTION);
            return;
        }

        Util::doLogin($loginInfo, $openid, $loginPage);
    }
    else {
        Util::retError(EYZ_LOGIC_EXCEPTION);
    }
}
