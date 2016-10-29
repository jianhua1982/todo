/**
 * Created by cup on 16/3/6.
 */


;
define(function () {
    'use strict';

    var instance = {};

    instance.startPageLoad = function(cb) {

        // Load other modules to start the app
        requirejs(["common", 'cookies'/*, "resize"*/], function (YZ, Cookies) {

            var commonUI = YZ.Common.UI,
                _appName;

            commonUI.registerAdjustFontHandler();

            console.log('Got DOMContentLoaded');
            console.log('>>>' + location.href);

            if (YZ.Const.isProdMode) {
                /*
                 https://www.wygreen.cn/alopay/prod/wechat.php?appName=alopayN
                 */
                _appName = YZ.Const.AppName.DuoShouQian;
            }
            else {
                /*
                 https://www.wygreen.cn/alopay/wechat.php?appName=testaccount
                 */
                _appName = YZ.Const.AppName.TestEnv;
            }

            YZ.Common.config(_appName);

            // cookie operations as zepto encapsulated.
            $.fn.cookie = function (key, value) {
                if (key && key.length && Cookies) {
                    if (value === undefined) {
                        // get
                        return Cookies.get(key);
                    }
                    else {
                        // set
                        Cookies.set(key, value);
                    }
                }
            };

            if(!Cookies.enabled) {
                // tip user to enable cookie.
                commonUI.showPopup('Please enalbe coookie!!');
                // TODO help user to close page?
            }

            /*
                history code reason, append in YZ.Common.
             */
            $.extend(YZ.Common, {
                /**
                 * 向JAVA后台发请求。
                 * @param data
                 * @param success
                 * @param fail
                 * @param complete  先 success or fail, then complete, 调用方最好不要在complete里面做ui.dismiss();
                 */
                //ajax2Backend: function (params) {
                //    if(!params || typeof params !== 'object') {
                //        failedCB({
                //            code: '8899',
                //            msg: '输入参数错误！'
                //        });
                //        return;
                //    }
                //
                //    var success = params.success,
                //        data = params.data;
                //
                //    console.log('>>> ajax2Backend request = ' + JSON.stringify(data));
                //
                //    // true ||
                //    if(true || YZ.Const.isProdMode) {
                //        data && (delete data.mockServer);
                //    }
                //
                //    var url = '';
                //    if(data && data.mockServer === '1') {
                //        url = '//www.wygreen.cn/alopay/mockServer/' + data.id;
                //    }
                //    else {
                //        url = '//www.wygreen.cn/zero/scan';
                //    }
                //
                //    $.ajax({
                //        type: "POST",
                //        url: url,
                //        //url: '//www.wygreen.cn/zero/scan2',  // for error test
                //        contentType: 'application/json',
                //        dataType: "json",
                //        data: JSON.stringify(data),
                //        success: function (resp, status, xhr) {
                //            //debugger
                //            if(status === 'success') {
                //
                //                console.log('<<< resp = ' + JSON.stringify(resp) );
                //                console.log('');
                //
                //                /*
                //                 check account status.
                //                 */
                //                // debugger
                //                if(resp.code === YZ.Const.RespCode.Success) {
                //                    success && success(resp);
                //                }
                //                else if(resp.code === YZ.Const.RespCode.MustLogin) {
                //                    commonUI.dismiss();
                //                    YZ.Pay.login();
                //                }
                //                else if(resp.code === YZ.Const.RespCode.Dangerous) {
                //                    commonUI.dismiss();
                //                    YZ.Pay.checkAccount(resp);
                //                }
                //                else {
                //                    // fail cases.
                //                    failedCB(resp);
                //                }
                //            }
                //            else {
                //                failedCB(resp);
                //            }
                //        },
                //        error: function (xhr, errorType, error) {
                //
                //            commonUI.dismiss();
                //            commonUI.showPopup('出错咯，请检查您的网络或者稍后再试！');
                //            //commonUI.showToast('出错咯，请检查您的网络或者稍后再试！');
                //        },
                //        complete: function (xhr, status) {
                //            //debugger
                //            var cb = params.complete || params.always;
                //            $.isFunction(cb) && cb(xhr, status);
                //        }
                //    });
                //
                //    function failedCB(err) {
                //
                //        commonUI.dismiss();
                //        var msg = err.msg + ' [' + err.code +  ']',
                //            fail = params.fail || params.error;
                //        commonUI.showPopup(msg, fail);
                //    }
                //}
            });

            YZ.Pay = YZ.Pay || {};

            var channelsArray = [
                {
                    name:'支付宝',
                    value:'01',
                    color:'zhifubao',
                    icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA1CAYAAADh5qNwAAAZEElEQ…4j+Gt8XHFY6v/GN6md7ct/zav+3yzz/xv1f+bH/yc99b8AbJylIzE0RuMAAAAASUVORK5CYII=',
                    enable: true
                },
                {
                    name:'微信支付',
                    value:'02',
                    color:'wxpay',
                    icon:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAmCAYAAABdw2IeAAAOCklEQ…pkSrFAIX4uWoHCdQWePakKB1XIMFXqALlrNTR/XQl6K8j/D7hPYUWJ+8jLAAAAAElFTkSuQmCC',
                    enable: false
                },
                {
                    name:'银联钱包',
                    value:'03',
                    enable: false
                },
                {
                    name:'百度钱包',
                    value:'04',
                    enable: false
                }
            ];

            $.extend(YZ.Pay, {

                /*
                    request command.
                 */
                requestCommands: {
                    MchntInfo: 'zr02',
                    Login: 'zr01',
                    ScanPay: '01', // append channel
                    OrderQuery: 'zr00',
                    Register: 'zr04',
                    taxCard: 'zr10'
                },

                /*
                    pay channel related.
                 */
                supportChannels: (function() {
                        return  $.grep(channelsArray, function(item) {
                            return item.enable;
                        });
                    }
                )(),

                channelNameByCode: function(code) {
                    var channel = YZ.Pay.channelByCode(code);
                    if(channel) {
                        return channel.name;
                    }

                    return code;
                },

                channelByCode: function(code) {

                    if(code && parseInt(code)) {
                        var ret = $.grep(channelsArray, function(item){
                            return (item.value === code);
                        });

                        if(ret && ret.length) {
                            return ret[0];
                        }
                    }

                    return null;
                },

                /*
                    login related.
                 */
                checkAccount: function(resp) {
                    /*
                        eg: 该用已在其他终端登录
                     */
                    commonUI.showPopup(resp && resp.msg, function(){
                        YZ.Pay.login();
                    });
                },

                logout: function() {
                    // TODO notify server to logout.

                    /*
                        必须通过后台写cookie，JS写没效果 [Android]
                     */
                    //$.fn.cookie('sid', ''); // tmp solution.

                    commonUI.showLoading();

                    YZ.Common.ajax2Php({
                        action: 'userLogout',
                        success: function (data) {
                            // success
                            commonUI.dismiss();
                            YZ.Pay.login();
                        }
                    });
                },

                login: function(redirectPage, state) {

                    // reset the bool flag.
                    sessionStorage.setItem('YZ.loginSucceed', '0');

                    var params = {};
                    if(redirectPage && redirectPage.length) {
                        params.redirect_uri = redirectPage;
                    }

                    if(state && state.length) {
                        params.state = state;
                    }

                   // YZ.Pay.jump2Page('login.html');
                    YZ.Pay.jump2Page('login.html', true);
                },

                today: function(){
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1; //January is 0!

                    var yyyy = today.getFullYear();
                    if(dd < 10){
                        dd = '0' + dd;
                    }
                    if(mm < 10){
                        mm = '0' + mm;
                    }

                    //return (yyyy + '' + mm  + '' + dd);
                    return (yyyy + '-' + mm  + '-' + dd);
                },

                jump2Page: function(html, replaceBy) {
                    if(html && html.indexOf('.html') > 0) {
                        var href = YZ.Common.urlAppendParams(html, {
                            bust: YZ.Common.urlParams && YZ.Common.urlParams.bust
                        });

                        if(replaceBy) {
                            window.location.replace(href);
                        }
                        else {
                            window.location.href = href;
                        }
                    }
                },

                createList: function($ul, listData) {

                    if(!$.isArray(listData)) {
                        alert('listData must be array!');
                        return;
                    }

                    var  $liT = $('.liT'),
                        liT =
                        '<div class="liT" style="display: none">' +
                            '<li class="li-l-r">' +
                                '<div class="vertical-middle">' +
                                '</div>' +
                            '</li>' +
                        '</div>';

                    if($liT.length === 0) {
                        $ul.parent().append(liT);
                        $liT = $('.liT');
                    }

                    $ul.addClass('ul-l-r');

                    $.each(listData, function(index, item) {
                        //console.log(item.title + ' -> ' + item.value + ' with class ' + item.class);

                        var tag = item.tag,
                            dom;

                        var spanValue = $liT.find('span.value'),
                            $div = $liT.find('div.vertical-middle');

                        $div.empty();

                        $div.append('<span class="title">{{title}}</span>');

                        if(tag && tag.length) {
                            if(tag === 'img') {
                                dom = '<img class="value" src="{{src}}">';
                            }
                            else if(tag === 'input') {
                                dom = '<input class="value" type="{{type}}" value="{{value}}">';
                            }
                        }
                        else {
                            if(item.arrow) {
                                dom = '<span class="value arrow">{{value}}&nbsp;&nbsp;&nbsp;&gt;</span>';
                            }
                            else {
                                dom = '<span class="value">{{value}}</span>';
                            }
                        }

                        dom && $div.append(dom);

                        if(item.class) {
                            $liT.find('li').addClass(item.class);
                        }

                        item.class = item.class || '';
                        //debugger
                        var t = YZ.Common.createTpl($liT.html());
                        $ul.append(t(item));

                        // recovery
                        if(item.class) {
                            $liT.find('li').removeClass(item.class);
                        }

                        if(index != listData.length - 1) {
                            $ul.append('<div class="spLine"> </div>');
                        }
                    });
                },

                enableBtn: function ($btn, enable) {
                    if(enable) {
                        // all filled already.
                        $btn.removeClass("btnDisable").addClass("btnEnable").removeAttr("disabled");
                    }
                    else {
                        $btn.removeClass("btnEnable").addClass("btnDisable").attr("disabled", "disabled");
                    }
                },

                /*
                    default is bind to document.body
                 */
                enableFastClick: function(target) {
                    requirejs(["fastclick"], function(FastClick){
                        /*
                         https://github.com/ftlabs/fastclick
                         */
                        //$(function() {
                        //    FastClick.attach(document.body);
                        //});
                        FastClick.attach(target || document.body);
                    });
                }
            });

            // go to up layer's callback.
            cb && cb(YZ);

            /*
                ref: http://www.cnblogs.com/PeunZhang/p/3407453.html
             */
            window.onorientationchange = function(){
                switch(window.orientation){
                    case -90:
                    case 90: {
                        //alert("横屏:" + window.orientation);

                    }
                        break;
                    case 0:
                    case 180: {
                        //alert("竖屏:" + window.orientation);
                    }
                        break;
                }
            };
        });
    };

    return instance;
});


