<?php

/**
 * Created by PhpStorm.
 * User: fanjingjian
 * Date: 2015/12/7
 * Time: 9:38
 */

namespace Wallet\Core;

class Signature
{
    /**
     * 生成签名
     */
    public function getSignPackage($url) {
        $frontToken = Token::getFrontToken();

        Util::log('$frontToken = ' . $frontToken);

        if(!$frontToken) {
            return false;
        }

        $timestamp = time();
        $nonceStr = self::_createNonceStr();
        /*
         * 去除#锚点的内容
         */
        $pos = strpos($url, '#');
        if($pos != FALSE) {
            $url = substr($url, 0, $pos);
        }
        // 这里参数的顺序要按照 key 值 ASCII 码升序排序
        $string = "fronttoken=" . $frontToken . "&noncestr=" . $nonceStr . "&timestamp=" .$timestamp ."&url=" .$url;
        // sha1
        $signature = sha1($string);
        // sha256
        $signature = hash('sha256', $string);

        $signPackage = array(
            "appId"     => UPWALLET_APPID,
            "nonceStr"  => $nonceStr,
            "timestamp" => $timestamp,
            "url"       => $url,
            "signature" => $signature
        );

        if(MOCK_SERVER) {
            $signPackage = array_merge($signPackage, array(
                'mockTest' => '1'
            ));
        }

//        $signPackage = array_merge($signPackage, array(
//            'frontToken' => $frontToken
//        ));

        return $signPackage;
    }

    /**
     * 生成随机字符串
     */
    private function _createNonceStr($length = 16) {
        $str = null;
        $strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        $max = strlen($strPol)-1;

        for($i=0;$i<$length;$i++){
            $str.=$strPol[rand(0,$max)];//rand($min,$max)生成介于min和max两个数之间的一个随机整数
        }

        return $str;
    }
}


