/**
 * Created by cup on 15/9/11.
 */


(function ($) {
    'using strict';

    // h5页面是否运行在钱包APP里面？
    // ~ "mozilla/5.0 (iphone; cpu iphone os 9_3 like mac os x) applewebkit/601.1.46 (khtml, like gecko) mobile/13e230 (com.unionpay.chsp) (cordova 3.6.3) (updebug 0) (version 412) (140684909348352)"
    var _agent = navigator.userAgent.toLowerCase(),
        _isInsideWallet = ((new RegExp(/(com.unionpay.chsp)/).test(_agent)) || (new RegExp(/(com.unionpay.mobilepay)/).test(_agent))),
        _isIos = new RegExp(/iphone|ipad|ipod/).test(_agent),
        _invokerShareParams = {}, // share content params
        _configParams, // config params
        _isResReady = false, // sdk will load cordova and other res, when done, set it as true.
        _isConfigDone = false,// config action  is async, when done, set it as true.
        _isConfigFailed = false,// config failed, other plugins invoking will be prevented.
        _readyCBArray = [], // sdk.ready() 以后将会执行接入方的成功回调.
        _jsApiListMap = {},// server ret api map, eg: {UPWebPay: [pay]}
        _errorCB, // sdk.ready() 以后将会执行的回调.
        _errData,  // error failed data, including code, msg.
        _debugMode = false;

    if (!$) {
        alert('请先加载Zepto或者jQuery！');
        return;
    }

    var sdkError = {
        ESDK_BAD_PARAMS: {
            errcode: 'c00',
            errmsg: '参数错误'
        },
        ESDK_CONFIG_FAILED: {
            errcode: 'c01',
            errmsg: '签名未通过, 不能访问插件'
        },
        ESDK_PLUGIN_ILLEGAL_ACCESS: {
            errcode: 'c02',
            errmsg: 'ILLEGAL_ACCESS_EXCEPTION: 无权限访问此插件！'
        },
        ESDK_PLUGIN_INVALID_ACTION: {
            errcode: 'c03',
            errmsg: 'INVALID_ACTION_EXCEPTION: 插件里面没有此方法！'
        },
        ESDK_PLUGIN_CLASS_NOT_FOUND: {
            errcode: 'c04',
            errmsg: 'CLASS_NOT_FOUND_EXCEPTION: 此插件没有实现！'
        },
        ESDK_PAY_NEED_TN: {
            errcode: 'c99',
            errmsg: '银联钱包支付必须先生成TN号'
        },
        ESDK_NOT_IN_WALLET: {
            errcode: 'c101',
            errmsg: 'upsdk.js必须被银联钱包加载'
        }
    };

    window.upsdk = window.upsdk || {};

    window.upsdk.isInsideWallet = _isInsideWallet;

    /*
     检查当前版本是否支持JSSDK 解决方案.
     */
    window.upsdk.checkSdkSupport = (function () {
        var agentArray = /\(version\s(\d+)\)/g.exec(_agent),
            appVer = $.isArray(agentArray) && agentArray.length >= 2 && agentArray[1]; //app版本

        if(appVer) {
            if(_isIos) {
                return (appVer >= '422');
            }
            else {
                return (appVer >= '422');
            }
        }

        return false;
    })();

    if(window.upsdk.checkSdkSupport) {
        /*
         钱包用的cordova文件是经过修改的，通用的cordova文件不一定能起作用，强制加载钱包的cordova。
         */
        //if (window.cordova) {
        //    // already available.
        //    cordovaReadyCB();
        //}
        //else
        {
            /*
             接入方的URL是他们自己的，但我们cordova的路径针对upsdk.js是同级的。
             ~ http://stackoverflow.com/questions/13261970/how-to-get-the-absolute-path-of-the-current-javascript-file-name
             */
            var scripts = $('script'),
                fileref = document.createElement('script'),
                cordovaFile = (_isIos ? 'cordova.ios.3.6.3.js' : 'cordova.android.3.6.4.js'),
                cordovaScriptPath;

            if(scripts.length) {
                // 静态加载 upsdk.js 是最后一个script.

                function hasSurfix (str, surfix) {
                    if(str && surfix && str.indexOf(surfix) === (str.length - surfix.length)) {
                        return true;
                    }

                    return false;
                }

                var scriptSrc = scripts[scripts.length - 1].src;
                if(hasSurfix(scriptSrc, '/upsdk.js')) {
                    cordovaScriptPath = scriptSrc.replace('/upsdk.js', '/' + cordovaFile);
                }

                scriptSrc = scripts[0].src;
                // 动态加载是第一个script.
                if(!cordovaScriptPath && hasSurfix(scriptSrc, '/upsdk.js')) {
                    cordovaScriptPath = scriptSrc.replace('/upsdk.js', '/' + cordovaFile);
                }
            }

            if(!cordovaScriptPath) {
                // 还是没找到, 根据APP运行环境写路径。
                var serverEnv = /\(updebug\s(\d+)\)/g.exec(_agent)[1];
                if(serverEnv === '2') {
                    // testing env.
                    cordovaScriptPath = '//172.18.64.34:38080/s/open/js/' + cordovaFile;
                }
                else {
                    // default is prod env, only support https
                    cordovaScriptPath = 'https://open.95516.com/s/open/js/' + cordovaFile;
                }
            }

            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", cordovaScriptPath);

            document.getElementsByTagName("head")[0].appendChild(fileref);

            /*
                解决iOS老版本问题，必须等到页面加载完成以后才能调用config插件。
             */
            if(document.readyState === 'complete') {
                // 页面已经加载完成，只需监听cordova加载完成事件。
                $(document).on('deviceready', cordovaReadyCB);
            }
            else {
                /*
                    轮回检查两个变量状态，
                    1，页面已经加载成功；document.readyState === 'complete'
                    2，Cordova加载完成 window.cordova
                 */
                var interval = setInterval(function() {
                    if(document.readyState === 'complete' && window.cordova) {
                        clearInterval(interval);
                        cordovaReadyCB();
                    }
                }, 50);
            }
        }

        var actions = [
            'pay',
            'addBankCard',
            'setNavigationBarTitle',
            'setNavigationBarRightButton',
            'closeWebApp',
            'showFlashInfo',
            'scanQRCode',
            'chooseImage',
            'getLocationCity'
        ];

        window.upsdk = window.upsdk || {};
        function f() {}

        $.each(actions, function(index, item){
            window.upsdk[item] = f;
        });

        window.upsdk.jsApiList = [];

        console.log('href = ' + window.location.href);

        $.extend(window.upsdk, {
            config: function(params) {

                if(!_isInsideWallet) {
                    // not run in wallet.
                    failedHandler(null, sdkError.ESDK_NOT_IN_WALLET);
                    return;
                }

                if(!$.isPlainObject(params)) {
                    failedHandler(null, sdkError.ESDK_BAD_PARAMS);
                    return;
                }

                if(params['debug']) {
                    _debugMode = true;
                    delete params['debug'];
                }

                console.log('config: _isResReady = ' + _isResReady);

                if(_isResReady) {
                    // it is ok to config.
                    window.cordova.exec(function(data){
                        // success
                        _isConfigDone = true;
                        _isConfigFailed = false;

                        /*
                         有的返回了string, 不是json对象。
                         */
                        if(typeof data === 'string') {
                            data = JSON.parse(data);
                        }

                        /*
                         有的把整个报文返回了，我们只需要params字段里面的内容。
                         */
                        if(data.params) {
                            data = data.params;
                        }

                        /*
                         JS授权访问API列表
                         */
                        _jsApiListMap = (data && data.jsApiList && pluginRetDataConventor(data.jsApiList)) || {};
                        /*
                         去除plugin, 只显示actions给调用者，plugin是我们程序内部定义的，调用者对此没感觉。
                         */

                        var apiList = [];
                        $.each(_jsApiListMap, function(key, value){
                            if($.isArray(value)) {
                                apiList = apiList.concat(value);
                            }
                        });

                        /*
                         UPWalletPlugin: fetchNativeData 接口封装给调用者, 名称为getLocationCity
                         */
                        var index = $.inArray('fetchNativeData', apiList);
                        if(index >= 0) {
                            // find it.
                            apiList.splice(index, 1, 'getLocationCity');
                        }

                        window.upsdk.jsApiList = apiList;

                        if(_readyCBArray.length) {
                            $.each(_readyCBArray, function(index, item){
                                $.isFunction(item) && item();
                            });
                        }

                        showMsg2User('config ok');

                    }, function(err) {
                        // fail
                        _isConfigFailed = true;
                        _isConfigDone = false;
                        _errData = err;

                        _errorCB(err);

                        showMsg2User('config error: ' + err);

                    }, 'UPWebSdk', 'config', [params]);
                }
                else {
                    // waiting cordova to be ready, remember it.
                    _configParams = params;
                }

                function pluginRetDataConventor(oldArray) {
                    var newJson = {};

                    $.isArray(oldArray) && $.each(oldArray, function(index, item) {
                        $.isPlainObject(item) && (newJson[item.plugin] = item.actions);
                    });

                    return newJson;
                }
            },

            ready: function (readyCB) {
                if($.isFunction(readyCB)) {
                    if(_isConfigDone) {
                        readyCB();
                    }
                    else {
                        /*
                         如下覆盖方法不好，改为数组记录。
                         */
                        //_readyCB = readyCB;
                        _readyCBArray.push(readyCB);
                    }
                }
            },

            /*
             Pls tell me fail reason.
             */
            error: function (errorCB) {
                errorCB = $.isFunction(errorCB) && errorCB || $.noop();
                if(_isConfigFailed) {
                    errorCB(_errData);
                }
                else {
                    _errorCB = errorCB;
                }
            }
        });
    }

    /*
     Dynamic load, for AMD dynamic load
     */
    if (typeof define !== 'undefined') {
        define(function () {
            return window.upsdk;
        });
    }

    function cordovaReadyCB() {

        console.log('cordovaReadyCB...');

        /*
         Resource loaded done.
         */
        _isResReady = true;

        if(typeof _configParams != 'undefined') {
            window.upsdk.config(_configParams);
            _configParams = null;
        }

        $.extend(window.upsdk, {
            /******** UPWebPay **********/
            /*
             1. tn必填,
             2. outParams: {
             code: '01|02, 分别表示 用户取消交易|通用支付失败',
             msg: '失败文言'
             }
             */
            pay: function (params) {
                /*
                 tn is mandatory.
                 */
                if (!params || !params.tn) {
                    console.error("Exception: tn is null!!!!");
                    failedHandler(params.fail, sdkError.ESDK_PAY_NEED_TN);
                    return;
                }

                /*
                    iOS支持Apple Pay, 商户号后台获取；前台传最后支付还是不成功。
                 */
                delete params.merchantId;

                var agentArray = /\(updebug\s(\d+)\)/g.exec(_agent);
                if($.isArray(agentArray) && agentArray.length >= 2 && (agentArray[1] === '2')) {
                    // test env.
                    params.mode = '02';
                }
                else {
                    params.mode = '00';
                }

                // tn is always for production.
                cordovaExecV2(params, 'UPWebPay', 'pay');
            },

            /******** UPWebBankCard **********/
            addBankCard: function (params) {
                cordovaExecV2(params, "UPWebBankCard", "addBankCard");
            },

            /******** UPWebBars **********/
            setNavigationBarTitle: function (params) {
                var title;
                if(typeof  params === 'string') {
                    title = params;
                }
                else {
                    title = params && params.title;
                }
                cordovaExec(null, null, "UPWebBars", "setNavigationBarTitle", [title]);
            },

            /*
             inParams: {
             image: '图片URL路径',
             title: '文字按钮'
             },
             outParams: {},
             specify: [
             '1. image和title同时有的时候，image优先显示；',
             '2. 按钮点击事件，JS触发事件rightbtnclick，让上层逻辑捕获；',
             '3. 页面内跳转，设置以后如何清除掉？以前的方案是 GLO.APP.PY.setNavigationBarRightButton(" ", " ");  // set space deliberately;',
             '4. 接#3，正确做法应该是 webViewDidFinishLoad: 现在会刷新标题，同样可以将右按钮reset清空。【TODO 客户端修复】;'
             ]
             */
            setNavigationBarRightButton: function (params) {
                cordovaExecV2(params, "UPWebBars", "setNavigationBarRightButton");

                var handler = params && params.handler;
                if($.isFunction(handler)) {
                    $(document).on('rightbtnclick', handler);
                }
            },

            /******** UPWebClosePage **********/
            /*
             关闭当前WEB窗口.
             */
            closeWebApp: function (params) {
                cordovaExecV2(params, "UPWebClosePage", "closeWebApp");
            },

            /******** UPWebUI **********/
            showFlashInfo: function (params) {
                var msg;
                if(typeof  params === 'string') {
                    msg = params;
                }
                else {
                    msg = params && params.msg;
                }

                msg && cordovaExec(null, null, "UPWebUI", "showFlashInfo", [msg]);
            },

            /*
             调用客户端扫一扫功能扫描二维码, 或者条形码
             inParams: {
             needResult: '0|1 默认为0，扫描结果由钱包处理，1则直接返回扫描结果，',
             scanType: '["qrCode","barCode"] 可以指定扫二维码还是一维码，默认二者都有'
             },
             outParams: {
             resultStr: '返回条码数字'
             }
             */
            scanQRCode: function (params) {
                cordovaExecV2(params, "UPWebUI", "scanQRCode", function(data){
                    if($.isPlainObject(data) && data.value) {
                        // for android.
                        data = data.value;
                    }

                    return data;
                });
            },

            /*
             sourceType: 1. camera; 2. album; 3. all
             */
            chooseImage: function (params) {
                /*
                 set default value for lazy invokers.
                 */
                if(!params['maxWidth'] && !params['maxHeight']) {
                    // 最大图片大小默认为 500 * 1000.
                    params['maxWidth'] = 500;
                    params['maxHeight'] = 1000;
                }

                // sourceType: 1. camera; 2. album; 3. all(default)
                params['sourceType'] = params['sourceType'] || '3';

                cordovaExecV2(params, "UPWebUI", "chooseImage", function(data){
                    if(typeof data === 'string') {
                        data = JSON.parse(data);
                    }

                    // 截取路径文件名后几位获取图片类型，jpg|png|gif 等等。
                    var url = data.url,
                        index = url.lastIndexOf("."),
                        type = url.substr(index + 1).trim();

                    return {
                        base64: data.base64,
                        type: type
                    };
                });
            },

            /******** UPWalletPlugin **********/

            /*
             弹出分享框
             */
            showSharePopup: function (params) {
                /*
                 Native端分享暂时没有任何成功或者失败回调。
                 */
                cordovaExecV2(params, 'UPWalletPlugin', 'showSharePopup');
                //_invokerShareParams = params;
            },

            getLocationCity: function (params) {
                params = params || {};
                params.type = '0'; // 0-系统参数

                cordovaExecV2(params, "UPWalletPlugin", "fetchNativeData", function(data){
                    if(typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                    return data.cityCd;
                });
            }

        });

        /*
         在JS这层先校验插件访问权限先.
         */
        function cordovaExec(success, fail, plugin, action, params) {
            if(!_isInsideWallet) {
                // not run in wallet.
                failedHandler(fail, sdkError.ESDK_NOT_IN_WALLET);
                return;
            }

            if(_isConfigDone) {
                // ok to call.
                // 让客户端去验证吧，安全真实。
                window.cordova.exec(success, function(err){
                    failedHandler(fail, err);
                }, plugin, action, params);
            }
            else if(_isConfigFailed) {
                // can't call
                //$.isFunction(fail) && fail(sdkError.ESDK_CONFIG_FAILED);
                failedHandler(fail, sdkError.ESDK_CONFIG_FAILED);
            }
            else {
                // wait env ready.
                window.upsdk.ready(function(){
                    cordovaExec(success, fail, plugin, action, params);
                });
            }
        }

        /*
         iOS, android插件返回报文如果有差异的话, upsdk负责封装一致.
         */
        function cordovaExecV2(params, plugin, action, pluginRetDataHandler) {
            params = params || {};

            // cordova 内容参数
            var data = {};
            // 去除参数里面的函数对象，插件送出去的参数不需要。
            $.isPlainObject(params) && $.each(params, function(key, value){
                if(!$.isFunction(value)) {
                    //data.push({key: value});
                    data[key] = value;
                }
            });

            console.log('>>>> cordovaExecV2 data = ' + JSON.stringify(data));

            cordovaExec(function(data){
                $.isFunction(pluginRetDataHandler) && (data = pluginRetDataHandler(data));
                $.isFunction(params.success) && params.success(data);

            }, params.fail || params.cancel, plugin, action, [data]);
        }
    }

    function failedHandler(fail, err){
        var cordovaError;
        switch (window.cordova.errorRetStatus) {
            case window.cordova.callbackStatus.INVALID_ACTION: {
                cordovaError = sdkError.ESDK_PLUGIN_INVALID_ACTION;
            }
                break;

            case window.cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION: {
                cordovaError = sdkError.ESDK_PLUGIN_CLASS_NOT_FOUND;
            }
                break;

            case window.cordova.callbackStatus.ILLEGAL_ACCESS_EXCEPTION: {
                cordovaError = sdkError.ESDK_PLUGIN_ILLEGAL_ACCESS;
            }
                break;
        }

        /*
         cordova 方法调用异常，统一错误处理。
         */
        if(cordovaError) {
            err = cordovaError;
        }

        if($.isFunction(fail)) {
            fail(err);
        }
        else {
            if(err) {
                var msg = (err.errmsg || err.msg || err.desc);
                var code = (err.errcode || err.code);
                if(code) {
                    msg += ' [' + code  + ']';
                }

                showMsg2User(msg);
            }
        }

        // reset status to normal.
        window.cordova.errorRetStatus = window.cordova.callbackStatus.OK;
    }

    function showMsg2User(msg) {
        if(_debugMode && msg) {
            if(_isConfigDone && $.inArray('showFlashInfo', window.upsdk.jsApiList)) {
                window.upsdk.showFlashInfo(msg);
                window.cordova.exec(null, null, 'UPWebUI', 'showFlashInfo', [msg]);
            }
            else {
                alert(msg);
            }
        }
    }

})((typeof(jQuery) !== "undefined" ? jQuery : ((typeof(Zepto) !== "undefined" ? Zepto : undefined))));

