<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 16/5/18
 * Time: PM3:18
 */

namespace Wallet;
include_once __DIR__.'/wallet.php';


namespace Wallet\Core;

if(isset($_GET['code']) && isset($_GET['state'])) {
    /*
     *  get code done, redirect back, then fetch openid.
     */
    Util::log('>>> code = ' . $_GET['code']);

    Util::log($_SERVER['REQUEST_URI']);

    $isSuccess = Oauth::getAccessTokenAndOpenId($_GET['code'], $retData);

    if(!$isSuccess) {
        Util::redirectUrlByError($retData);
        return;
    }

    if(isset($retData['openId'])) {
        $openId = $retData['openId'];

        Util::log('>>> openId = ' . $openId);

        if(isset($_GET['scope']) && ($_GET['scope'] == 'upapi_base')) {
            /*
             * for base mode, the process is over.
             */
            Util::redirectUrl(array(
                'openId' => $openId
            ));
        }
        else {
            // fetch resource by openid plus access_token.
            $isSuccess = Oauth::getUserInfo($retData['openId'], $retData['accessToken'], $ret4Res);

            Util::log('>>> getUserInfo, $isSuccess = ' . $isSuccess);

            if($isSuccess) {
                // success
                if(!isset($ret4Res['openId'])) {
                    $ret4Res['openId'] = $openId;
                }

                Util::redirectUrl($ret4Res);
            }
            else {
                //fail
                Util::redirectUrlByError($ret4Res);
            }
        }
    }
    else {
        Util::log('No openId in request!!!');
    }
}
else if(isset($_GET['errmsg'])) {
    /*
     * get code error.
     *
     */
    Util::redirectUrl($_GET);
}
else {
    Util::log('------------Circle Start-------------------');

    /*
     * 1st step, fetch code.
     */
    if(isset($_GET['scope']) && $_GET['scope'] == 'upapi_base') {
        $scope = 'upapi_base';
    }
    else {
        $scope = 'upapi_userinfo';
    }

    // for redirect uri
    if(isset($_GET['target']) && ($_GET['target'] == 'restService')) {
        // eg: java rest service, code will be sent back to h5.

        Util::log('>>> $_SERVER["HTTP_REFERER"] = ' . $_SERVER["HTTP_REFERER"]);

        $rurl = $_SERVER["HTTP_REFERER"];
        $scopeStr = 'scope=' . $scope;

        //strpos("You love php, I love php too!","php");

        if(strpos($rurl, '?')) {
            // find it.
            $rurl .= '&' . $scopeStr;
        }
        else {
            $rurl .= '?' . $scopeStr;
        }
    }
    else {
        // eg: php web service, code will be sent back to php.
        $rurl = Util::curPageURL($_SERVER['REQUEST_URI']);
    }

    $state = time();  // always uses for store data memcache address.

    Util::log('>>> $rurl = ' . $rurl);

    Oauth::getCode($rurl, $state, $scope);
}
