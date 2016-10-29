<?php
namespace Alopay\Core;

//include_once 'accesstoken.lib.php';

/**
 * 微信Access_Token的获取与过期检查
 * Created by jianhua.
 * Mail: jianhua_iphone@126.com
 * Website: http://www.cnblogs.com/best-html5-js/
 */

class ApiTicket{
    /**
     * 获取微信Access_Token
     */
    public static function getApiTicket(){
        //检测本地是否已经拥有api_ticket，并且检测api_ticket是否过期
        $apiTicket = self::_checkApiTicket();
        if($apiTicket === false){
            $apiTicket = self::_getApiTicket();
        }

        //return $apiTicket['ticket'];
        if(isset($apiTicket['ticket'])) {
            return $apiTicket['ticket'];
        }

        return $apiTicket;
    }

    /**
     * @descrpition 从微信服务器获取微信API_TICKET
     * @return Ambigous|bool
     */
    private static function _getApiTicket(){
        $accessToken = AccessToken::getAccessToken(true);
        $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=$accessToken";

        $apiTicket = Curl::callWebServer($url, '', 'GET');
        if(!isset($apiTicket['ticket'])){
            return Msg::returnErrMsg(MsgConstant::ERROR_GET_API_TICKET, '获取API_TICKET失败');
        }

        if(CACHE_TYPE == 'FILE') {
            $apiTicket['time'] = time();
            $apiTicketJson = json_encode($apiTicket);
            //存入数据库
            /**
             * 这里通常我会把api_ticket存起来，然后用的时候读取，判断是否过期，如果过期就重新调用此方法获取，存取操作请自行完成
             *
             * 请将变量$apiTicketJson给存起来，这个变量是一个字符串
             */
            $f = fopen(self::_fileName2Store(), 'w+');
            fwrite($f, $apiTicketJson);
            fclose($f);
            return $apiTicket;
        }
        else {
            $mc = new Cache();
            $ticket = $apiTicket['ticket'];
            $mc->set(self::_ticketCacheKey(), $ticket, false, 7000);
            return $ticket;
        }
    }

    /**
     * @descrpition 检测微信API_TICKET是否过期
     *              -10是预留的网络延迟时间
     * @return bool
     */
    private static function _checkApiTicket(){

        if(CACHE_TYPE == 'MEM_CACHE') {
            $mc = new Cache();
            return $mc->get(self::_ticketCacheKey());
        }

        //获取api_ticket。是上面的获取方法获取到后存起来的。
//        $apiTicket = YourDatabase::get('api_ticket');

        $fileName = self::_fileName2Store();
        //$fd = fopen('api_ticket', 'r');
        if (!is_readable($fileName)) {
            return false;
        }

        $data = file_get_contents($fileName);
        $apiTicket['value'] = $data;
        if(!empty($apiTicket['value'])){
            $apiTicket = json_decode($apiTicket['value'], true);
            if(time() - $apiTicket['time'] < $apiTicket['expires_in']-10){
                return $apiTicket;
            }
        }
        return false;
    }

    private static function _fileName2Store(){
        $path = (getcwd() . '/Cache/api_ticket.' . WECHAT_APPID);
        //var_dump($path);
        return $path;
    }

    private static function _ticketCacheKey(){
        return 'api.ticket' . WECHAT_APPID;
    }
}
?>