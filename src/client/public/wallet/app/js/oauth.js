/**
 * Created by cup on 16/5/18.
 */

;
(function ($) {
    "use strict";

    $(document).ready(function(){
        /*
         How to trace page go back!!!!
         */
        console.log('%%% window.history.length = ' + window.history.length);

        var pageFootPrintSessionKey = window.location.href,// 页面back回退时, URL会保持不变。
            isIOS = !!$.os.ios,
            willCloseWindow = false;

        if(isIOS) {
            if(window.sessionStorage.getItem(pageFootPrintSessionKey) === '1') {
                // 用户点击back按钮后退到此中间页面。
                //alert('catch it');
                window.sessionStorage.setItem(pageFootPrintSessionKey, '0');  // reset it
                //console.log('catch');

                /*
                 接入方如果在自身页面没有加载完成就跳转到钱包联登页面, 如下back操作会返回undefined. objc: [self.webView canGoBack] 返回 false.
                 */
                window.history.back();

                // [self.webView canGoBack] 无反应, 那就只能求助 插件去关掉当前窗口了, 反正用户现在就是想退出此应用。
                willCloseWindow = true;
            }
        }

        var urlParams = (function urlQuery2Obj (str) {
                if (!str) {
                    str = location.search;
                }

                if (str[0] === '?' || str[0] === '#') {
                    str = str.substring(1);
                }
                var query = {};

                str.replace(/\b([^&=]*)=([^&=]*)/g, function (m, a, d) {
                    if (typeof query[a] != 'undefined') {
                        query[a] += ',' + decodeURIComponent(d);
                    } else {
                        query[a] = decodeURIComponent(d);
                    }
                });

                return query;
            })(), env = urlParams.env || '0',
            isProd = (window.location.host.indexOf('.95516.com') > 0),
            isMockTest = (urlParams.mockTest === '1');

        // h5页面是否运行在钱包APP里面？
        var agent = navigator.userAgent.toLowerCase(),
            isInsideWallet = ((new RegExp(/(com.unionpay.chsp)/).test(agent)) || (new RegExp(/(com.unionpay.mobilepay)/).test(agent)));

        if (!isInsideWallet && !isMockTest) {
            //alert('请用银联钱包APP打开此页面！');
            setPageVisitFlag();
            if(isIOS) {
                window.location.href = 'walletOpen.html';
            }
            else {
                window.location.replace('walletOpen.html');
            }

            return;
        }

        if(!isMockTest) {
            $('.loading').show();

            var cordovaEntry = '../js/' + ($.os.ios ? 'cordova.ios.3.6.3.js' : 'cordova.android.3.6.4.js'),
                fileref = document.createElement('script');

            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", cordovaEntry);

            document.getElementsByTagName("head")[0].appendChild(fileref);
            $(document).on('deviceready', cordovaReadyCB);
        }
        else {
            cordovaReadyCB();
        }

        function cordovaReadyCB() {
            willCloseWindow && closeWebPage();

            // Cordova is ready.
            /*
             Fetch mchnt info for grunt issue.
             */
            if(urlParams.scope === 'upapi_userinfo') {
                // 获取第三方APP信息，后台同时做全权限审查。
                sendMessageForOpen(function(resp){
                    // success
                    var retParams = resp.params;
                    if(retParams.mustGrant == '1') {
                        /*
                         必须手动授权，show grunt page.
                         */
                        dismiss();

                        var t = createTpl($('.top').html());
                        $('.top').html(t(resp.params));
                        $('.grant-must').show();

                        $('.login-sure').on('click', approveLogin);
                    }
                    else {
                        dismiss();

                        /*
                         你近期已经授权过了，无需重新授权。
                         */
                        $('.grant-done').show();

                        /*
                         无需用户点授权, 稍后直接去取code.
                         */
                        setTimeout(fetchCodeRequest, 1500);
                    }

                }, null, {
                    method: 'POST',
                    cmd: 'oauth.merchant',
                    params: urlParams,
                    encrypt: true
                });
            }
            else {
                // 静默直接授权，发请求访问。
                fetchCodeRequest();
            }
        }

        function approveLogin(){
            if(!$('.user-agree').attr('checked')) {
                showToast('请先点击选择框同意授权');
            }
            else {
                fetchCodeRequest();
            }
        }

        function fetchCodeRequest() {

            $('.grant-done').hide();
            $('.grant-must').hide();

            showLoading();

            sendMessageForOpen(function(resp){
                // success
                /*
                 跳转到商户提供的回调页面，带上code, state作为参数。
                 */
                locatePageBySuccess({
                    code: resp['params']['code'],
                    state: urlParams['state']
                });

            }, null, {
                method: 'POST',
                cmd: 'authorize',
                params: urlParams,
                encrypt: true
            });
        }

        /*
         send message by plugin
         */
        function sendMessageForOpen(success, fail, data) {
            var version = data.version || '1.0',
                params = {
                    path: (version + '/' + data.cmd),
                    encrypt: data.encrypt ? '1' : '0',
                    httpMethod: 'POST',
                    params: data.params
                },
                self = this;

            /*
             sendMessageForOpen success cb
             */
            var successCB = function (resp) {
                // success
                console.log('<<< resp = ' + JSON.stringify(resp));

                if ((typeof resp) === 'string') {
                    resp = JSON.parse(resp);
                }

                if (resp.resp === '00') {
                    if($.isFunction(success)) {
                        success(resp);
                    }
                    else {
                        dismiss();
                    }
                }
                else if(resp.resp === '+9x9+') {

                    console.log('<<< err got +9x9+, msg = ' + resp.msg);

                    dismiss();

                    // APP 登陆被踢出, 强制用户重新登陆。
                    window.cordova.exec(function() {
                        // user click 重新登录 按钮
                        /*
                         这个老插件没有成功和失败回调。
                         */
                        window.cordova.exec(null, null, "UPWalletPlugin", "openLoginPage", [{
                            'refreshPage': '1'
                        }]);

                    }, null, 'UPWebUI', 'showAlertView', [
                        {
                            "title": "提示",
                            "msg":resp.msg,
                            "ok": "重新登录"
                        }
                    ]);
                }
                else {
                    if ($.isFunction(fail)) {
                        fail(resp);
                    }
                    else {
                        // 如果用户不写的话，就这么默认处理了。
                        dismiss();
                        /*
                         also redirect page back with err code and msg.
                         */
                        locatePageByError(resp['resp'], resp['msg']);
                    }
                }
            };

            if(urlParams.mockTest === '1') {
                console.log('>>> request for the path = ' + params.path);
                //$.getJSON(window.location.origin + '/web/public/mchnt/server/mockServer/' + params.path, successCB);
                $.getJSON('/open/access/' + params.path, successCB);
            }
            else {
                // not mock for the following code...
                console.log('>>> sendMessageForOpen: req = ' + JSON.stringify(params));

                window.cordova.exec(successCB, function (err) {
                    //fail
                    if(window.cordova.errorRetStatus === window.cordova.callbackStatus.INVALID_ACTION ||
                        window.cordova.errorRetStatus === window.cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION) {
                        /*
                         老版本新插件还没实现, 跳转到下载最新版本APP的页面.
                         */
                        //window.location.replace('walletOpen.html');
                        window.cordova.exec(function(){
                            // 避免循环触发失败，直接关掉页面。
                            closeWebPage();
                            // 或者跳转到第三方，带errcode ??

                        }, null, 'UPWebUI', 'showAlertView', [{
                            "title": "提示",
                            "msg": '此功能需要您下载最新版本的银联钱包',
                            "ok": "我知道了"
                        }]);
                    }
                    else {
                        console.log('<<< err = ' + JSON.stringify(err));
                        var msg = '';
                        if(err) {
                            if(typeof(err) === 'string') {
                                msg = err;
                            }
                            else {
                                msg = err.msg;
                            }
                        }

                        if(msg.length === 0) {
                            msg = '出错咯，请检查您的网络或者稍后再试！';
                        }

                        if ($.isFunction(fail)) {
                            fail({
                                msg: msg
                            });
                        }
                        else {
                            // 如果用户不写的话，就这么默认处理了。
                            dismiss();
                            /*
                             also redirect page back with err code and msg.
                             */

                            // '99' server means 系统繁忙，请稍候再试
                            locatePageByError('99', msg);
                        }
                    }

                }, 'UPWebNetwork', 'sendMessageForOpen', [params]);
            }
        }

        function  closeWebPage() {
            window.cordova && window.cordova.exec(null, null, 'UPWebClosePage', 'closeWebApp', []);
        }

        function showLoading(){
            $('.loading').show();
        }

        function dismiss(){
            $('.loading').hide();
        }

        function showToast(msg){
            window.cordova.exec(null, null, 'UPWebUI', 'showFlashInfo', [msg]);
        }

        function showAlert(success, cancel, params){
            window.cordova.exec(null, null, 'UPWebUI', 'showAlertView', [params]);
        }

        function urlAppendParams(href, params) {
            /*
               将code和state两个参数拼加到redirectUri后面, 针对SPA, 只要redirectUri正确, 返回URL也正确。
             */
            if (typeof href === 'undefined' || href.length === 0) {
                href = window.location.href;
            }

            if (params) {
                var queries = '';
                $.each(params, function (key, value) {
                    /*
                     state字段调用者可能传空，但我们必须返回state字段，不管是否有值。
                     */
                    if (key/* && value*/) {
                        queries += (key + '=' + encodeURIComponent(value) + '&');
                    }
                });

                if (queries.length) {
                    // remove the last &
                    queries = queries.substr(0, queries.length - 1);

                    if (href.indexOf('?') > 0) {
                        href += '&' + queries;
                    }
                    else {
                        href += '?' + queries;
                    }
                }
            }

            return href;
        }

        function locatePageBySuccess(params) {
            // for later page back observer.
            setPageVisitFlag();
            var rurl = urlAppendParams(urlParams['redirectUri'], params);

            console.log('>>> rurl = ' + rurl);


            /*
                iOS location.replace函数 从iOS 9 开始有缺陷, android支持很好。
             */
            if (isIOS) {
                window.location.href = rurl;
            }
            else {
                window.location.replace(rurl);
            }
        }

        function locatePageByError(code, msg) {
            var errMsg = msg;
            if(code) {
                errMsg += ' [' + code + ']';
            }

            locatePageBySuccess({
                errmsg: errMsg,
                state: urlParams.state
            });
        }

        // 创建{{}}占位的模板
        function createTpl(t) {
            return function (m) {
                return t.replace(/\\?\{{([^{}]+)}}/gm, function (t, e) {
                    return m && m[e] || "";
                });
            };
        }

        function setPageVisitFlag() {
            /*
                因为页面回退时,需要自动关闭此中间页, 页面跳转时,做下标记。
             */
            window.sessionStorage.setItem(pageFootPrintSessionKey, '1');  // set flag for page back check.
        }
    });

})(Zepto);
