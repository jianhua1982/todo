<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 15/11/25
 * Time: PM7:20
 */

namespace Alopay\Core;

/**
 * 微信公众平台 JS_SDK 签名
 *
 * @author zero
 */

class ApiSignature
{
    /**
     * 生成微信签名需要参数
     */
    private $appId;
    private $appSecret;
    private $url;

    public function __construct($appId, $appSecret, $url) {
        $this->appId = $appId;
        $this->appSecret = $appSecret;
        $this->url = $url;
    }

    /**
     * 生成签名
     */
    public function getSignPackage() {
        $jsapiTicket = ApiTicket::getApiTicket();

        //echo $jsapiTicket . '<br>';

        $timestamp = time();
        $nonceStr = $this::createNonceStr();

        // 这里参数的顺序要按照 key 值 ASCII 码升序排序
        $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$this->url";

        //echo $string . '<br>';

        $signature = sha1($string);

        //echo $signature . '<br>';

        $signPackage = array(
            "appId"     => $this->appId,
            "nonceStr"  => $nonceStr,
            "timestamp" => $timestamp,
            "url"       => $this->url,
            "signature" => $signature
        );
        return $signPackage;
    }

    /**
     * 生成随机字符串
     */
    public static function createNonceStr($length = 16) {

        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $str = "";
        for ($i = 0; $i < $length; $i++) {
            $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
        }
        return $str;
    }
}