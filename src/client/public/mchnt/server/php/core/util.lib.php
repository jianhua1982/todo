<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 16/7/7
 * Time: 下午1:37
 */

namespace Wallet\Core;

/*
 * error code define, function errorMsg will provide detail msg info.
 */
define('EUPWALLET_JSON_ERROR', '01');
define('EUPWALLET_BAD_PARAM', '02');

define('EUPWALLET_SYS_BUSY', '99');

define('EUPWALLET_BACKEND_TOKEN_ERROR', '1001');
define('EUPWALLET_FRONT_TOKEN_ERROR', '1002');
define('EUPWALLET_INVALID_URL', '1003');


class Util {
    public static function log($msg){
        if(true || PHP_LOG_FILE) {
            if(!is_string($msg)) {
                $msg = json_encode($msg);
            }

            //echo $msg . PHP_EOL;

            //file_put_contents(PHP_LOG_FILE, $msg . PHP_EOL, FILE_APPEND);

            error_log($msg);
        }
    }

    /*
     * 页面重定向
     */
    public static function redirectUrl($params) {

        Util::log('---------redirectUrl');
        Util::log($params);

        /*
         * [优化]: UPWALLET_CLIENT_H5 实际上可以通过state字段获取 (eg: memcache save it at first.),
         * 没必要在这儿 hard code.
         */
//        $redirectUrl = self::curPageURL(PARTNER_URL_PATH_NAME);

        /*
         * echo str_replace("world","earth","Hello world!");		//输出 Hello earth!
         */
        $redirectUrl = str_replace('/bindLogin.php', '/notify.php', $_SERVER['PHP_SELF']);

        $redirectUrl = self::curPageURL($redirectUrl);

        $url = $redirectUrl . '?' . http_build_query($params);
        Util::log($url);

        Util::log('------------Circle End-------------------');
        Util::log('------------');
        Util::log('------------');


        Header("Location: " . $url);
        exit;
    }

    /*
     * 页面重定向, 用于错误返回.
     */
    public static function redirectUrlByError($err) {

        Util::log($err);

        if(isset($err['errcode'])) {
            $code = $err['errcode'];
        }
        else if(isset($err['resp'])) {
            $code = $err['resp'];
        }
        else {
            $code = '';
        }

        if(isset($err['errmsg'])) {
            $msg = $err['errmsg'];
        }
        else if(isset($err['msg'])) {
            $msg = $err['msg'];
        }
        else {
            $msg = '';
        }

        if(!is_string($code)) {
            $code = '' . $code;
        }

        if(strlen($msg) == 0) {
            $msg = self::errorMsg($code);
        }

        self::redirectUrl(array(
            'errcode' => $code,
            'errmsg' => $msg
        ));
    }

    public static function retError($code, $msg = '') {
        if(!is_string($code)) {
            $code = '' . $code;
        }

        if(!$msg || strlen($msg) == 0) {
            $msg = self::errorMsg($code);
        }

        return array(
            'errcode' => $code,
            'errmsg' => $msg
        );
    }

    public static function errorMsg($errCode) {
        switch($errCode) {
            case EUPWALLET_JSON_ERROR: {
                $msg = '请求报文解析错误';
            }
                break;

            case EUPWALLET_BAD_PARAM: {
                $msg = '请求参数缺失或者不合法';
            }
                break;

            case EUPWALLET_SYS_BUSY: {
                $msg = '系统繁忙，请稍候再试';
            }
                break;

            case EUPWALLET_BACKEND_TOKEN_ERROR: {
                $msg = '获取backendToken失败';
            }
                break;

            case EUPWALLET_FRONT_TOKEN_ERROR: {
                $msg = '获取fontToken失败';
            }
                break;

            case EUPWALLET_INVALID_URL: {
                $msg = 'UPSDK签名, 页面URL不合法';
            }
                break;

            default:{
                $msg = '未知错误原因';
            }
        }

        //return ($msg . ' [' . $errCode . ']');
        return $msg;
    }

    public static function curPageURL($url) {
        if (strpos($url, "http://") || strpos($url, "https://")) {
            return $url;
        }

        /*
         *  HTTP_X_FORWARDED_HOST 对应某些apache配置 Proxy
         */
        if(isset($_SERVER["HTTP_X_FORWARDED_HOST"])) {
            $server = $_SERVER["HTTP_X_FORWARDED_HOST"];
        }
        else {
            $server = $_SERVER["SERVER_NAME"];
        }

        $pageURL = 'http';

        if (isset($_SERVER["HTTPS"]) && strtolower($_SERVER["HTTPS"]) == "on") {
            $pageURL .= "s";
        }
        $pageURL .= "://";

        if ($_SERVER["SERVER_PORT"] != "80") {
            $pageURL .= $server . ":" . $_SERVER["SERVER_PORT"];
        } else {
            $pageURL .= $server;
        }

        return $pageURL . $url;
    }
};
