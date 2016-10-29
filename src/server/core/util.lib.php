<?php
namespace Alopay\Core;
/**
 * Created by lixuan-it@360.cn
 * User: lane
 * Date: 15/4/29
 * Time: 上午10:51
 * E-mail: lixuan868686@163.com
 * WebSite: http://www.lanecn.com
 */
class Util
{
    /*********** public **********/

    /**
     * $params: 请求参数，如果直接是POST参数的，传null.
     * $retParams: 请求成功，是否需要把params字段内容返回，有些仅仅只需要通知的不用，目的：安全 & 网络开销
     *
     */
    public static function request2GW($params=null, $echo2H5=true){

        $sid = Util::fetchSidForZeroServer();

        Util::log('>>> $sid = ' . $sid);

        Util::log($_POST);

        if(!$sid) {
            // try to fetch openid.
//            if(isset($_SERVER["HTTP_REFERER"])) {
//                if()
//            }

            if(isset($_GET['notAjaxReq']) && ($_GET['notAjaxReq'] == '1')) {
                // not available, redirect to login page.
                $loginPage = Util::loginPagePath() . '?backFromPhp=1';
                Util::log('>> jump to $loginPage = ' . $loginPage);
                header('Location: ' . $loginPage, true, 301);
            }
            else {
                self::retError(EYZ_ZERO_SID_NOT_FOUND);
            }

            return false;
        }

        // default to read $_POST
        if(!$params) {
            $params = $_POST;
        }

        if(!isset($params['params'])) {
            $params['params'] = [];
        }

        Util::log($params);

        // for mock server.
        if(isset($params['mockServer']) && $params['mockServer']) {
            $ret = Curl::callWebServer('https://www.wygreen.cn/alopay/mockServer/' . $params['id'], json_encode($params), 'POST');
        }
        else {
            /*
             * GW接口支持, sid 通过params传过去。
             */
            $params['params']['sid'] = $sid;

            /*
             * 服务器通信走内网。
             */
            try {
                $ret = Curl::callWebServer(self::requestUrlForGW(), json_encode($params), 'POST');
            }
            catch(Exception $e) {
                //  CURLE_UNSUPPORTED_PROTOCOL
                // need to notify the owner.

                //error_log('Curl::callWebServer Exception = ' . $e);
            }
        }

        $echo2H5 && self::retResponse($ret);

        return $ret;
    }

    public static function errorRedirect($url, $code, $msg) {
        $url = WECHAT_URL . $url . '?code=' . $code . '&msg=' . urlencode($msg);
        echo $url;
        Header("Location: $url");
        exit;
    }

    public static function isGwResponseOK ($resp) {
        if(isset($resp['code'])) {
            return ($resp['code'] == '00');
        }

        return false;
    }

    public static function fetchSidForZeroServer() {
        // read openId from cookie.
        $ret = self::checkOpenId($openId);
        self::log('checkOpenId, $ret = ' . $ret);
        if($ret) {
            // 通过openId 从缓存里面找sid
            return self::getZeroSid($openId);
        }

        return false;
    }

//    public static function addCache($openId, $key, $value) {
//
//        Util::log('add ' . $key . ' = ' . $value);
//
//        if($openId && $key && $value) {  //  && is_object($obj)
//            $mc = new Cache();
//            $cache = $mc->get($openId);
//            if(!$cache) {
//                $cache = [
//                    $key => $value
//                ];
//            }
//            else {
//                $cache[$key] = $value;
//            }
//
//            $mc->set($openId, $cache);
//        }
//    }

    public static function addCache($openId, $obj) {

//        Util::log('add ' . $key . ' = ' . $value);

        if($openId && $obj) {  //  && is_object($obj)
            $mc = new Cache();
            $cache = $mc->get($openId);
            if(!$cache) {
                $cache = [
                ];
            }

            $cache = array_merge($cache, $obj);

            $mc->set($openId, $cache);
        }
    }

    public static function getZeroSid($openId) {

        Util::log('>>> getZeroSid $openId = ' . $openId);

        if($openId) {
            $mc = new Cache();
            $cache = $mc->get($openId);
            Util::log('>>> $cache = ' . json_encode($cache));

            if($cache && isset($cache[CACHE_ZERO_SID])) {
                return $cache[CACHE_ZERO_SID];
            }
        }

        return false;
    }

    public static function unbindZeroSid() {

        if(self::checkOpenId($openId)) {
            Util::log('--- unbindZeroSid $openId = ' . $openId);

            if($openId) {
                $mc = new Cache();
                $cache = $mc->get($openId);
                //Util::log('>>> $cache = ' . json_encode($cache));
                if($cache && isset($cache[CACHE_ZERO_SID])) {
                    //$cache[CACHE_ZERO_SID] = null;
                    unset($cache[CACHE_ZERO_SID]);

                    $mc->set($openId, $cache);
                    return true;
                }
            }
        }

        return false;
    }

    public static function errorMsg($errCode) {
        switch($errCode) {
            case EYZ_BAD_PARAM: {
                $msg = '参数错误';
            }
            break;

            case EYZ_DECRYPT_FAILED: {
                $msg = '解密失败';
            }
                break;

            case EYZ_OPENID_NOT_FOUND: {
                $msg = '系统异常，请稍后再试';
            }
                break;

            case EYZ_ZERO_SID_NOT_FOUND: {
                $msg = '没有找到sid, 请重新登录';
            }
                break;

            case EYZ_ACCOUNT_KICKOUT: {
                $msg = '登录已超时，为了保护您的帐号安全，请重新登录';
            }
                break;

            case EYZ_SIGNATURE_NOT_SAME: {
                $msg = '前端签名计算错误';
            }
                break;

            default:{
                $msg = '未知错误原因 [' . $errCode . ']';
            }
        }

        return $msg;
    }

    public static function retResponse($params){
        self::retData($params['code'], $params['msg'], $params['params']);
    }

    public static function retError($errCode=EYZ_LOGIC_EXCEPTION){
        self::retData($errCode, Util::errorMsg($errCode));
    }

    // only for mock
    public static function retSuccessResponse($params=[]) {
        self::retData('00', 'success', $params);
    }

    public static function retData($code='00', $msg='', $params=[]){

        //header('Content-type: application/json');

        $ret = json_encode(array(
            'code' => $code,
            'msg' => $msg,
            'params' => $params
        ));

        echo $ret;

//        error_log('>>> retData = ' . json_encode($ret));
    }

    public static function setCookie4OpenId($openId, $expire=null){
        /*
         *  http://php.net/manual/zh/function.setcookie.php
         */
        $path = '/alopay';
        if(self::isProductionEnv()) {
            $path .= '/prod';
        }

        $ret = setcookie(COOKIE_OPENID, $openId, $expire, $path, 'www.wygreen.cn', true, true);

        self::log('setCookie4OpenId $ret = ' . $ret);

//        setcookie(COOKIE_GOT_OPENID, '1', $expire, $path, 'www.wygreen.cn', true); // !!! not http only.
    }

    public static function log($data){
        if(!is_string($data)) {
            $data = json_encode($data);
        }

        if(is_string($data)) {
            /*
             * http://stackoverflow.com/questions/19898688/how-to-create-a-logfile-in-php
             */
//            error_log(__FILE__ . ' >>> ' . $data . ' on line ' . __LINE__);

            error_log('[LOG]>>> ' . $data);

            // can't write !!!
            //file_put_contents('/var/log/apache2/php_log_'.date("j.n.Y").'.txt', $data, FILE_APPEND);
        }
    }

    public static function isProductionEnv() {
        if(isset($_SERVER['PHP_SELF']) && (strpos($_SERVER['PHP_SELF'], '/prod/') == false)) {
            return false;
        }

        // no good method to decide, default is true.
        return true;
    }

    public static function requestUrlForGW() {
        // only port different
        if(true || self::isProductionEnv()) {
            // prod
            return 'http://127.0.0.1:10010/zero/scan';
        }

        // zero dev
        return 'http://127.0.0.1:10020/zero/scan';
    }

    public static function pushWarnings($msg) {
        // only port different

    }

    /*
     * fetch public key
     */
    public static function getPublicKeyByIdentifier($identifier) {

        Util::log('$identifier = ' . $identifier);

        if(!$identifier || strlen($identifier) == 0) {
            Util::retError(EYZ_LOGIC_EXCEPTION);
            return false;
        }

        include_once __DIR__ . '/encrypt.lib.php';

        $cacheKey = 'RSA__' . $identifier;
        $mc = new Cache();
        $encryptKeys = $mc->get($cacheKey);
        if($encryptKeys && is_array($encryptKeys) && (count($encryptKeys) == 2)) {
            // find it.
            $pubKey = $encryptKeys[0];
        }
        else {
            // not found or expire.
            $encrypt = new Encrypt();
            $mc->set($cacheKey, [
                $encrypt->getPublicKey(),
                $encrypt->getPrivateKey()
            ]);

            $pubKey = $encrypt->getPublicKey();
        }

        Util::retSuccessResponse([
            'pubKey' => $pubKey
        ]);

        return true;
    }

    /*
     * decrypt msg
     */
    public static function decryptMsg($identifier, $encryptedMsg) {
        if(!$identifier || strlen($identifier) == 0) {
            return false;
        }

        $cacheKey = 'RSA__' . $identifier;
        $mc = new Cache();
        $encryptKeys = $mc->get($cacheKey);

        //Util::log($encryptKeys);

        if($encryptKeys && is_array($encryptKeys) && (count($encryptKeys) == 2)) {
            // find it.
            include_once __DIR__ . '/encrypt.lib.php';

            $encrypt = new Encrypt($encryptKeys[0], $encryptKeys[1]);
            $authCode = $encrypt->decrypt($encryptedMsg);
            return $authCode;
        }
        else {
            return false;
        }
    }

    public static function checkOpenId(&$openId) {
        if(isset($_COOKIE[COOKIE_OPENID]))  {
            $openId = $_COOKIE[COOKIE_OPENID];
            return (strlen($openId) > 0);
        }

        return false;
    }

    public static function phpFileFullUrl(){
        // TODO: https by code!!
        return 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }

    public static function doLogin($loginInfo, $openid){
        $loginInfo['openid'] = $openid;

        // http://127.0.0.1/zero/scan
        // https://www.wygreen.cn/zero/scan
        $serverRet = Curl::callWebServer(Util::requestUrlForGW(), json_encode([
            'id' => 'zr01',
            'params' => $loginInfo
        ]), 'POST');

        Util::log($serverRet);

        Util::log('>>>> openid = ' . $openid);

        if(Util::isGwResponseOK($serverRet)) {
            // login success
            $retParams = $serverRet['params'];

            $sid = $retParams[CACHE_ZERO_SID];

            Util::log('>>>> $sid = ' . $sid);

//            Util::addCache($openid, CACHE_ZERO_SID,  $sid);

            Util::addCache($openid, [
                CACHE_ZERO_SID => $sid,
                'mchntInfo' => $retParams
            ]);

            header('Location: ' . $loginInfo['redurl'], true, 301);
        }
        else {
            // fail
            util::errorRedirect(self::loginPagePath(), $serverRet['code'], $serverRet['msg']);
        }
    }

    public static function loginPagePath() {
        $prefix = '/alopay';
        if(self::isProductionEnv()) {
            $prefix .= '/prod';
        }

        return $prefix . '/client/html/pay/login.html';
    }

    /*********** private **********/
}














