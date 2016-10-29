<?php
namespace Alopay\Core;
/**
 * 微信公众平台来来路认证，处理中心，消息分发
 * Created by Lane.
 * Author: lane
 * Date: 14-03-03
 * Time: 上午10:20
 * Mail: lixuan868686@163.com
 * Website: http://www.lanecn.com
 */
class Wechat
{
    /**
     * 调试模式，将错误通过文本消息回复显示
     * @var boolean
     */
    private $debug;

    /**
     * 以数组的形式保存微信服务器每次发来的请求
     * @var array
     */
    private $request;

    /**
     * 初始化，判断此次请求是否为验证请求，并以数组形式保存
     * @param string $token 验证信息
     * @param boolean $debug 调试模式，默认为关闭
     */
    public function __construct($token, $debug = FALSE) {
        //未通过消息真假性验证
        if ($this->isValid() && $this->validateSignature($token)) {
            return $_GET['echostr'];
        }
        //是否打印错误报告
        $this->debug = $debug;

        //接受并解析微信中心POST发送XML数据
        if (isset($GLOBALS['HTTP_RAW_POST_DATA'])) {
            $xml = (array)simplexml_load_string($GLOBALS['HTTP_RAW_POST_DATA'], 'SimpleXMLElement', LIBXML_NOCDATA);

            //将数组键名转换为小写
            $this->request = array_change_key_case($xml, CASE_LOWER);
        }
    }

    /**
     * 判断此次请求是否为验证请求
     * @return boolean
     */
    private function isValid() {
        return isset($_GET['echostr']);
    }

    /**
     * 判断验证请求的签名信息是否正确
     * @param  string $token 验证信息
     * @return boolean
     */
    private function validateSignature($token) {
        $signature = $_GET['signature'];
        $timestamp = $_GET['timestamp'];
        $nonce = $_GET['nonce'];
        $signatureArray = array($token, $timestamp, $nonce);
        sort($signatureArray, SORT_STRING);
        return sha1(implode($signatureArray)) == $signature;
    }

    /**
     * 获取本次请求中的参数，不区分大小
     * @param  string $param 参数名，默认为无参
     * @return mixed
     */
    protected function getRequest($param = FALSE) {
        if ($param === FALSE) {
            return $this->request;
        }
        $param = strtolower($param);
        if (isset($this->request[$param])) {
            return $this->request[$param];
        }
        return NULL;
    }

    /**
     * 分析消息类型，并分发给对应的函数
     * @return void
     */
    public function run() {
        $action = '';
        if (isset($_GET["requestAction"])) {
            $action = $_GET["requestAction"];
        } elseif (isset($_POST["requestAction"])) {
            $action = $_POST["requestAction"];
        }

        if (strlen($action)) {
            return $this->requestAction($action);
        }

        return WechatRequest::switchType($this->request);
    }

    public function checkSignature() {
        $signature = $_GET["signature"];
        $timestamp = $_GET["timestamp"];
        $nonce = $_GET["nonce"];

        $token = WECHAT_TOKEN;
        $tmpArr = array($token, $timestamp, $nonce);
        sort($tmpArr, SORT_STRING);
        $tmpStr = implode($tmpArr);
        $tmpStr = sha1($tmpStr);

        if ($tmpStr == $signature) {
            echo $_GET['echostr'];
            return true;
        } else {
            return false;
        }
    }

    // customize action.

    private function requestAction($action) {
        Util::log('>>>> $action = ' . $action);

        if (isset($_GET["ignoreUserAuth"]) || $action == 'fetchCode' || $action == 'fetchOpenId') {
            // fall down...
        }
        // need to fetch user openid.
        else if(!Util::checkOpenId($openId)) {

            /*
             *  http://stackoverflow.com/questions/10704125/php-setcookie-doesnt-take-effect
             *  因为php setcookie 必须response back才会生效（真正写到cookie里面去），所以方案调整为getCode 以后
             *  重定向到H5, 再ajax去获取openId, 再重发开始的命令字请求。
             */

            // do bind login.
            // redirect page back to PHP.
            isset($_SESSION) || session_start();
            $mc = new Cache();
            $sessionId = session_id();
            $mc->set($sessionId, [
                'phpUrl' => 'https://www.wygreen.cn' . $_SERVER['REQUEST_URI'],  //self::phpFileFullUrl(),
                'postData' => $_POST
            ]);

            parse_str($_SERVER['QUERY_STRING'], $queries);
            // TODO replace $action with fetchOpenId should also be OK.

            $rurl = $_SERVER['PHP_SELF'] . '?requestAction=fetchCode&appName=' . $queries['appName'] . '&state=' . urlencode($sessionId);
            $redirectUrl = $_SERVER['PHP_SELF'] . '?requestAction=fetchOpenId&appName=' . $queries['appName'];
            $jumpUrl = $rurl . '&redirect_uri=' . urlencode($redirectUrl);

            Util::log('$jumpUrl = ' . $jumpUrl);

            //$url
//            header('Location: ' . $composeUrl, true, 301);
            Util::retData('301', 'redirect', [
                'redirectUri' => $jumpUrl
            ]);

            return;
        }
        else {
            // openid is available, fall down...

        }

        /*
         * 调用微信服务器的域名必须是开始绑定的3个之一。
         */
        switch ($action) {
            /********** Common usage ***********/
            case 'wxJsSignature': {
                // got wx js signature
                if (isset($_SERVER['HTTP_REFERER'])) {
                    $url = $_SERVER['HTTP_REFERER'];
                } else {
                    $url = self::_phpFileFullUrl();
                }

                $sig = new ApiSignature(WECHAT_APPID, WECHAT_APPSECRET, $url);
                Util::retData('00', '', $sig->getSignPackage());
            }
                break;

            case 'fetchCode': {
                /*
                 * 重定向页面在参数里面已经指明。
                 */
                if (isset($_GET['redirect_uri']) && strlen($_GET['redirect_uri'])) {
                    $redirectUrl = $_GET['redirect_uri'];
                } else {
                    if (isset($_SERVER['HTTP_REFERER'])) {
                        $redirectUrl = $_SERVER['HTTP_REFERER'];
                    } else {
                        $redirectUrl = $_SERVER['REQUEST_URI'];
                    }
                }

                $state = '';
                if (isset($_GET['state'])) {
                    $state = $_GET['state'];
                }

                $scope = 'snsapi_base';
                if (isset($_GET['scope'])) {
                    $scope = $_GET['scope'];
                }

                WeChatOAuth::getCode($redirectUrl, $state, $scope);
            }
                break;

            case 'fetchOpenId': {
                if (isset($_GET['code']) && isset($_GET['state'])) {
                    $code = $_GET['code'];

                    Util::log('$code = ' . $code);

                    $ret = WeChatOAuth::getAccessTokenAndOpenId($code);
                    if($ret && isset($ret['openid'])) {
                        $openId = $ret['openid'];

                        /*
                         * http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
                         * Cookie has maximum value.
                         */
                        $expire = 2147483647;
                        Util::setCookie4OpenId($openId, $expire);

                        $mc = new Cache();
                        $cache = $mc->get($_GET['state']);
                        if($cache) {
                            Util::log($cache);

                            Curl::callWebServer($cache['phpUrl'] . '&notAjaxReq=1', json_encode($cache['postData']), 'POST');
                            return;
                        }
                    }
                }

                Util::retError(EYZ_LOGIC_EXCEPTION);
            }
                break;

            /********** DuoShouQian ***********/

            case 'publicKey4Login': {
                /*
                 * https://segmentfault.com/a/1190000003012552
                 */
                isset($_SESSION) || session_start();
                Util::getPublicKeyByIdentifier(session_id());
            }
                break;

            // disable it to outside.
//            case 'scanCodePay': {
//                self::_scanCodePay();
//            }
//                break;

            case 'getPublicKey': {
                Util::getPublicKeyByIdentifier(Util::fetchSidForZeroServer());
            }
                break;

            case 'scanCodePaySecurity': {
                self::_scanCodePaySecurity();
            }
                break;

            case 'pushMessage': {
                if(isset($_POST['msg'])) {
                    self::_pushMessage($_POST['msg']);
                }
            }
                break;

            case 'userLogout': {
                // 将zero服务的sid从openid 关联里面解放出来.
                if(Util::unbindZeroSid()) {
                    Util::retSuccessResponse();
                }
                else {
                    Util::retError();
                }
            }
                break;

            case 'zero2Scan': {
                util::request2GW();
            }
                break;

            case 'mchntRegister': {
                self::_mchntRegister();
            }
                break;

            case 'taxCard': {
                self::_taxCard();
            }
                break;

            case 'taxCardFromShare': {
                self::_taxCardFromShare();
            }
                break;

            case 'entry': {
                //if()
                // check openId.
            }
                break;

            /********** TuJiaYanMei ***********/


            /********** Scan2FetchCoupon ***********/
            case 'login4ScanCoupon': {

            }
                break;

            case 'register4ScanCoupon': {

            }
                break;

            /********** DianZan ***********/
            case 'dianZan': {
                self::_dianZan();
            }
                break;

            default: {
                return ResponsePassive::text($this->request['fromusername'], $this->request['tousername'], '收到未知的消息，我不知道怎么处理 ' . $action);
            }
        }
    }


    /********** Common usage ***********/

    private function _phpFileFullUrl(){
        return 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }

    /********** DuoShouQian ***********/

    private function _scanCodePay($params){
        /*
         * gw返回的数据不用前台用不上。
         */
        $ret = Util::request2GW($params, false);

        if(!Util::isGwResponseOK($ret)) {
            // pay failed, ret to h5.
            Util::retResponse($ret);
            return;
        }

        // scan pay success.

        Util::log($ret);

        /**
         * Notify the receipt.
         */
//        error_log('Cookie with name "' . COOKIE_OPENID . '" value is: ' . $_COOKIE[COOKIE_OPENID]);

        $payChannel = '';
        if (isset($ret['id']) && strlen($ret['id']) >= 2) {
            switch (substr($ret['id'], 0, 2)) {
                case '01': {
                    $payChannel = '支付宝';
                    $color = '#00bfff';
                }
                    break;

                case '02': {
                    $payChannel = '微信支付';
                    $color = '##13ec49';
                }
                    break;
            }
        }

        $retParams = $ret['params'];

        $amount = $retParams['receipt_amount'] . '元';

        /*
         * pay succeed, ret to  h5.
         */
        Util::retData($ret['code'], $payChannel . '成功收款' . $amount);

        // send shoukuan message by weixin.
        if(Util::checkOpenId($openid)) {

            Util::log('Send pay message to ' . $openid);

            $mc = new Cache();
            $obj = $mc->get($openid);

            if($obj && isset($obj['mchntInfo'])) {
                $mchntInfo = $obj['mchntInfo'];

                // mock
//                $openid = 'oDpaVjui28PrVkUHjaCdbjxJvUb0';  // 22031863
//                $openid = 'oDpaVjt9NBJd0g3pGtAGlreRUHMw';  // 2837606324

                if (isset($mchntInfo['merName'])) {
                    $mchntNm = $mchntInfo['merName'];
                } else {
                    $mchntNm = '';
                }
            }

            $retMessage = TemplateMessage::sendTemplateMessage(array(
                'first' => array('value' => '您好，您收到一笔付款'),
                'keyword1' => array('value' => $amount),
                'keyword2' => array('value' => $mchntNm),
                'keyword3' => array('value' => $payChannel, 'color' => $color),
                'keyword4' => array('value' => $retParams['trade_no']),
                'keyword5' => array('value' => $retParams['gmt_payment'])
//               'remark' => array('value' => '查看详情，请...', 'color' => '#173177')
            ), $openid, WECHAT_SHOU_TEMPLATE_ID, '');

            Util::log('... sendTemplateMessage = ' . json_encode($retMessage));
        }
        else {
            Util::log('send shoukuan message failed!!');
        }
    }

    private function _scanCodePaySecurity() {
        // decrypt authCode at first.
        Util::log($_POST);

        $params = $_POST['params'];
        $authCode = Util::decryptMsg(Util::fetchSidForZeroServer(), $params['authCode']);
        Util::log('>>> decrypt $authCode = ' . $authCode);
        if($authCode && isset($params['sigData'])){
            $sigData = $params['sigData'];

            $oldSignature = $sigData['signature'];

            Util::log('>>> $oldSignature = ' . $oldSignature);

            if(is_array($sigData)) {
                Util::log('!!!!!!');
            }

            unset($sigData['signature']);

            $sigData = array_merge($sigData, [
                'authCode' => $authCode
            ]);

            $sigData = array_change_key_case($sigData);
            ksort($sigData);

            Util::log($sigData);

            $rawContent = '';
            foreach($sigData as $key => $value) {
                $rawContent .= $key . '=' . $value . '&';
            }

            $length = strlen($rawContent);
            if($length) {
                // remove the last &
                $rawContent = substr($rawContent, 0, $length - 1);
            }

            Util::log('>>> $rawContent = ' . $rawContent);

            $newSignature = sha1($rawContent);

            Util::log('>>> $newSignature = ' . $newSignature);

            if(strcmp($newSignature, $oldSignature) == 0) {
                // the same sig.
                self::_scanCodePay([
                    'id' => $_POST['id'],
                    'params' => [
                        'amount'=> $sigData['amount'],
                        'authCode'=> $authCode
                    ]
                ]);
            }
            else {
                Util::retError(EYZ_SIGNATURE_NOT_SAME);
            }
        }
        else {
            Util::retError(EYZ_LOGIC_EXCEPTION);
        }
    }

    /**
     * Notify the receipt.
     */
    private function _pushMessage($msg, $needRet=true) {

        if(isset($_COOKIE[COOKIE_SID])) {
            //print 'Cookie with name "' . COOKIE_SID . '" value is: ' . $_COOKIE[COOKIE_SID];
            $mc = new Cache();
            $userInfo = $mc->get($_COOKIE[COOKIE_SID]);
            $openid = $userInfo['openid'];
            //print('   openid = ' . $openid);
            if($openid) {
                ResponseInitiative::text($openid, $msg);
                $needRet && Util::retData();
            }
            else {
                $needRet && Util::retError(EYZ_OPENID_NOT_FOUND);
            }
        } else {
            //print 'Cookie with name "' . COOKIE_SID . '" does not exist...';
            $needRet && Util::retError(EYZ_ZERO_SID_NOT_FOUND);
        }
    }

    public function _mchntRegister() {
        /*
         * http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID
         */
        Util::log($_POST);

        /*
         * download uploaded images from wx server.
         * send mchnt info to zero gw.
         */
        $phone = $_POST['phone'];

        if(isset($_POST['serverIds'])) {
            include_once __DIR__ . '/uuid.lib.php';

            $v5uuid = UUID::v5('1546058f-5a25-4334-85ae-e68f2a44bbaf', $phone);

            $dir = getcwd() . '/licenses/' . $v5uuid;

            Util::log('$dir = ' . $dir);

            if (!file_exists($dir)) {
                /*
                 *  chown -R zero:www-data licenses/
                 *  http://stackoverflow.com/questions/5246114/php-mkdir-permission-denied-problem
                 */
                mkdir($dir, 0755, true);
            }

            $failed = [];

            foreach($_POST['serverIds'] as $key => $serverId) {
                /*
                 * 上传的临时多媒体文件有格式和大小限制，如下：
                    图片（image）: 1M，支持JPG格式
                    语音（voice）：2M，播放长度不超过60s，支持AMR\MP3格式
                    视频（video）：10MB，支持MP4格式
                    缩略图（thumb）：64KB，支持JPG格式
                    媒体文件在后台保存时间为3天，即3天后media_id失效。
                 */
                if($serverId && strlen($serverId)) {
                    $isSuccess = Media::download($serverId, ($dir . '/' . $key . '.jpg'));
                    if(!$isSuccess) {
                        array_push($failed, $key);
                    }
                }
            }

            if(count($failed) == 0) {
                // all image downloaded successfully
                $postData = $_POST;
                $postData['picFolder'] = $v5uuid;
                /*
                 * GW will make mapping sid -> user pic folder.
                 */
                Util::request2GW($postData);
            }
            else {
                Util::retError();
            }
        }
        else {
            Util::retError(EYZ_LOGIC_EXCEPTION);
        }
    }

    public function _licenseFolder() {

    }

    public function _taxCard() {
        // mock
        $uid = 'afsdfsaf;awerew9r[werdisfjfi8ewreqwrfnzcx.xz';
        $tax = [
            "taxId"=> '31012233333333',
            "company"=> '豹子网络科技(上海)有限公司',
            "account"=> '212222222',
            "bank"=> '建设银行上海分行营业部',
            "tel"=> '63442222',
            "addr"=> '上海市闵行区101号'
        ];

        Util::retSuccessResponse([
            'tax' => $tax,
            'uid' => $uid
        ]);

        $mc = new Cache();
        $mc->set($uid, $tax);
    }

    public function _taxCardFromShare() {
        $params = $_POST;

        if(isset($params['params']) && isset($params['params']['uid'])) {
            $mc = new Cache();
            $tax = $mc->get($params['params']['uid']);
            if($tax) {
                Util::retSuccessResponse([
                    'tax' => $tax
                ]);

                return;
            }
        }

        Util::retError();
    }
}




