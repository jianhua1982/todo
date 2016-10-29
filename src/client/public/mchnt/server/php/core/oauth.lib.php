<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 16/5/18
 * Time: PM3:18
 */

namespace Wallet\Core;

class Oauth {
    public static function getCode($redirect_uri, $state='', $scope='upapi_base'){
        $components = parse_url($redirect_uri);
        Util::log($components);
        if($components && isset($components['scheme'])) {
            // already full url
            //$redirect_uri = $redirect_uri;
        }
        else {
            /*
             *  即使在同一个域名下. 回跳地址也必须是全域名，光path不行
             */

            //授权后重定向的回调链接地址，请使用urlencode对链接进行处理
            $redirect_uri = UPWALLET_URL . $redirect_uri;
        }

        $redirect_uri = urlencode($redirect_uri);
        //返回类型，请填写code
        $response_type = 'code';
        //公众号的唯一标识
        $appid = UPWALLET_APPID;

        /*
         * 跳转到钱包 oauth.html
         *
         * 驼峰命名法则
         */
        $jumpUrl = UPWALLET_URL . '/s/open/html/oauth.html?appId='.$appid.'&redirectUri='.$redirect_uri.
            '&responseType='.$response_type.'&scope='.$scope.'&state='.$state;

        if(MOCK_SERVER) {
            $jumpUrl .= '&mockTest=1';
        }

        Util::log('$jumpUrl = ' . $jumpUrl);

        header('Location: ' . $jumpUrl, true, 301);
        //header('Location: ' . $jumpUrl);
    }


    /**
     * Description: 通过code换取网页授权access_token
     * 首先请注意，这里通过code换取的网页授权access_token,与基础支持中的access_token不同。
     * 公众号可通过下述接口来获取网页授权access_token。
     * 如果网页授权的作用域为snsapi_base，则本步骤中获取到网页授权access_token的同时，也获取到了openid，snsapi_base式的网页授权流程即到此为止。
     * @param $code getCode()获取的code参数
     *
     * @return Array(access_token, expires_in, refresh_token, openid, scope)
     */
    public static function getAccessTokenAndOpenId($code, &$retData){
        $backendToken = Token::getBackendToken();

        Util::log('$backendToken = ' . $backendToken);

        if(!$backendToken) {
            // fail
            $retData = Util::retError(EUPWALLET_BACKEND_TOKEN_ERROR);
            return false;
        }

        return Curl::callWebServerWithCmd('token', array(
            'appId' => UPWALLET_APPID,
            'backendToken'=> $backendToken,
            'code'=> $code,
            'grantType'=> 'authorization_code'
        ), $retData);
    }

    public static function getUserInfo($openId, $accessToken, &$retData){
        return Curl::callWebServerWithCmd('oauth.userInfo', array(
            'accessToken' => $accessToken,
            'openId' => $openId,
            'appId' => UPWALLET_APPID
        ), $retData);
    }
}

