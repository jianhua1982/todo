<?php
/**
 * Created by PhpStorm.
 * User: fanjingjian
 * Date: 2015/12/4
 * Time: 13:43
 */

/**
 *由Token类执行 获取 存储 token
 */
namespace Wallet\Core;

/*
 * 为了防范接入方secret暴漏风险, 接入方首先获取token, 通过token辅助再去获取其他资源.
 *
 */
class Token {
    /**
     * @descrpition oauth联登, 获取后台token, token有效期在请求返回字段, 一般都是7200秒
     * @return return {"backendToken":"aaaaaaaaaaabbbbbbbbbbcccccccc"}  or false
     */
    public static function getBackendToken($force=false) {
        return self::_getUPToken('back', $force);
    }

    /**
     * @descrpition 前台UPSDK, 获取前台token, token有效期在请求返回字段, 一般都是7200秒
     * @return return {"frontToken":"rrrtddddddddkkkk4455522"}  or false
     */
    public static function getFrontToken($force=false) {
        return self::_getUPToken('front', $force);
    }

    private static function _getUPToken($type, $force=false){

        Util::log('_getUPToken = ' . $type);

        if($force) {
            $token = self::_getTokenFromUP($type);
        }
        else{
            //判断本地存储的token是否存在 是否在有效期内
            $ret = self::_checkToken($type, $token);

            if($ret) {
                Util::log('checkToken = ' . 'true');
            }
            else {
                Util::log('checkToken = ' . 'false');
            }

            if(!$ret) {
                // fetch new one.
                $token = self::_getTokenFromUP($type);
            }
        }

        $key = self::_getTokenKey($type);

        if(isset($token[$key])) {
            return $token[$key];
        }

        return false;
    }

    private static function _getTokenKey($type) {
        if($type=='back') {
            $key = 'backendToken';
        }
        else {
            $key = 'frontToken';
        }

        return $key;
    }

    //从银联服务器获取token
    private static function _getTokenFromUP($type){
        Util::log('>>> getTokenFromUP ' . $type);

        $isSuccess = Curl::callWebServerWithCmd(self::_getTokenKey($type), array(
            'appId' => UPWALLET_APPID,
            'secret' => UPWALLET_SECRET
        ), $token);

        if(!$isSuccess) {
            // TODO 添加一次重试
        }

        if($isSuccess) {
            // request token succcessfully.
            $token['time'] = time();

            /*
             * 建议存储在memcache, redis等缓存服务器中.
             */
            //将取到的token存入文件

            /*
             * http://stackoverflow.com/questions/5165183/apache-permissions-php-file-create-mkdir-fail
             *
             */
//            $cacheDir = getcwd() . '/cache/';
//            Util::log('>>> mkdir $cacheDir = ' . $cacheDir);
//            if(!file_exists($cacheDir)) {
//                $ret = mkdir($cacheDir, 0755); // default mode is 0777
//                Util::log('>>> mkdir $ret = ' . $ret);
//            }

            $f = fopen(self::_fileName2Store($type), 'w+');
            fwrite($f, json_encode($token));
            fclose($f);
        }

        Util::log($token);

        return $token;
    }

    //检测本地token是否存在 是否过期
    private static function _checkToken($type, &$token){
        $fileName = self::_fileName2Store($type);

        Util::log('$fileName = ' . $fileName);

        if (!is_readable($fileName)) {
            Util::log('cache file not readable!!');
            return false;
        }
        //在本地token文件存在的情况下，读取文件内容
        $data = file_get_contents($fileName);
        if($data) {
            Util::log('>>> file_get_contents');
            Util::log($data);

            $data = json_decode($data, true);

            $pastTime = time() - $data['time'];
            Util::log('$pastTime = ' . $pastTime);

            // expiresIn always is 7200s
            if($pastTime <= ($data['expiresIn'] - 100)){
                // 没有过有效期
                $token = $data;
                return true;
            }
        }
        else {
            Util::log('!!!file_get_contents = false');
        }

        return false;
    }

    private static function _fileName2Store($type){
        /*
         * 存储在文件为了demo方便, mkkdir cache/ && chmod 777 cache/
         * 当然文件放在用户访问目录很不安全,大家都可以访问.
         * 建议存储在memcache, redis等缓存服务器中.
         */
        $path = (getcwd() . '/cache/' . self::_getTokenKey($type) . '.' . UPWALLET_APPID);
        if(MOCK_SERVER) {
            $path .= '.mock.server';
        }

        return $path;
    }
}
