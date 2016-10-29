/**
 * Created by cup on 16/5/26.
 */

import 'weui';
import $ from './zepto.min.js';
import 'weui.js';
//import Router from './../lib/router/router';

export default {
    alert: msg => {
        /*
         调用插件前都需要先签名.
         */
        //if(window.cordova) {
        //    window.cordova.exec(null, null, 'UPWebUI', 'showFlashInfo', [msg]);
        //}
        //else
        {
            //window.alert(msg);
            $.weui.alert(msg);
        }

        console.log(msg);
    },

    success: data => {
        if(data) {
            alert('success data = ' + JSON.stringify(data));
        }
        else {
            alert('success 无返回数据');
        }

        // data && UP.W.Cordova.instance().exec(null, null, 'UPWebUI', 'showAlertView', [msg]);
    },

    fail: err => {
        //window.cordova.errorRetStatus == window.cordova.callbackStatus.INVALID_ACTION
        switch (window.cordova.errorRetStatus) {
            case window.cordova.callbackStatus.INVALID_ACTION: {
                alert('INVALID_ACTION: 插件里面没有此方法！');
            }
                break;

            case window.cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION: {
                alert('CLASS_NOT_FOUND_EXCEPTION: 此插件没有实现！');
            }
                break;

            case window.cordova.callbackStatus.ILLEGAL_ACCESS_EXCEPTION: {
                alert('ILLEGAL_ACCESS_EXCEPTION: 无权限访问此插件！');
            }
                break;

            default: {
                if(err) {
                    alert('fail err = ' + JSON.stringify(err));
                }
                else {
                    alert('fail 无返回数据');
                }
            }
        }
    },

    dismiss:() => {
        window.cordova && window.cordova.exec(null, null, 'UPWebUI', 'dismiss', []);
    },

    urlParams: (function urlQuery2Obj (str) {
        if (!str) {
            str = location.search;
        }

        if (str[0] === '?' || str[0] === '#') {
            str = str.substring(1);
        }
        let query = {};

        str.replace(/\b([^&=]*)=([^&=]*)/g, function (m, a, d) {
            if (typeof query[a] != 'undefined') {
                query[a] += ',' + decodeURIComponent(d);
            } else {
                query[a] = decodeURIComponent(d);
            }
        });

        return query;
    })(),

    init: () => {
        // mock
        //urlParams.tn = '201606221630445658518';

        $('.tn').val(urlParams.tn);
        $('.apply-pay').val('merchant.com.unionpay.wallet.coupon');

        // common page actions.
        $('<h4> 当前页面域名(IP)：<span class="dns-or-ip"> </span> </h4>').insertBefore($('body').children().first()); // 'body :first-child'
        $('.dns-or-ip').text(window.location.hostname);
        $('.input-url').val('');
    },

    upsdkDotJS: (function(){
        let port = window.location.port,
            server;
        if(port == '8088') {
            // dev
            server = window.location.origin;
        }
        else if(port == '8080') {
            // prod
            server = 'https://open.95516.com';
        }
        else {
            // test
            //server = 'https://101.231.114.253';
            server = 'http://172.18.64.34:38080';
        }

        return server + '/s/open/js/upsdk.js';
    })(),

    showLoading: () => {
        $.weui.loading();

        //if($('.loading').length == 0) {
        //    $('<img class="loading" src="../image/ajax_loader_ads.gif">').insertBefore($('h4'));
        //}
        //
        //$('.loading').show();
    },

    dismiss: () => {
        //$('.loading').hide();
        $.weui.hideLoading();
    },

    loadJsOrCssFile: (filename, callback) => {
        let fileref;

        if(filename.indexOf(".js") > 0){
            fileref = document.createElement('script');
            fileref.setAttribute("type","text/javascript");
            fileref.setAttribute("src",filename);

        }if(filename.indexOf(".css") > 0){
            fileref = document.createElement('link');
            fileref.setAttribute("rel","stylesheet");
            fileref.setAttribute("type","text/css");
            fileref.setAttribute("href",filename);
        }

        if(typeof fileref != "undefined"){
            let heads = document.getElementsByTagName("head");
            if(heads.length) {
                heads[0].appendChild(fileref);
            }
        }
        //加载完bill.refactor.js后执行回调
        if (document.all) {
            fileref.onreadystatechange = function() {
                let state = this.readyState;
                if (state === 'loaded' || state === 'complete') {
                    callback();
                }
            }
        } else {
            //firefox, chrome, safari
            fileref.onload = function() {
                callback();
            }
        }
    },

    getSignature: (success, fail) => {
        SdkDemo.showLoading();

        let href = window.location.href;

        $.ajax({
            type: 'POST',
            url: '../../server/php/getSig.php',
            data: {
                /*
                 referrer 靠不住，尤其是页面back回来，静态加载时，referrer 读的是前面一个页面的URL [iOS 100%重现]
                 */
                url: window.location.href
            },
            dataType: 'json',
            success: function (resp) {
                // success
                console.log('Got sig is ' + JSON.stringify(resp));

                if(resp.errmsg) {
                    // failed.
                    SdkDemo.dismiss();

                    if($.isFunction(fail)) {
                        fail(resp);
                    }
                    else {
                        alert(resp.errmsg);
                    }
                }
                else {
                    // ok.
                    if($.isFunction(success)) {
                        success(resp);
                    } else {
                        alert('H5获取签名失败!');
                    }
                }
            },
            error: function (err) {
                console.log('Got sig failed with err = ' + JSON.stringify(err));
                SdkDemo.dismiss();

                if($.isFunction(fail)) {
                    fail(err);
                }
                else {
                    alert('H5获取签名失败!');
                }
            }
        });
    },

    setupSdk: (resp, sdk) => {

        if(!sdk.checkSdkSupport) {
            // 如果钱包加载,就给提示.
            sdk.isInsideWallet && alert('此版本钱包不支持jssdk, 请去下载新版本吧');
            return;
        }
        // after fetch sig is OK.

        /*
         为保证安全, 签名的要素之一'url', 客户端会自己去获取, 无需前端传递, 当然传了也没问题.
         */
        //resp.params.url && delete resp.params.url;
        sdk.config(resp);

        // sdk is ready.
        sdk.ready(function(){
            SdkDemo.dismiss();
            SdkDemo.showJsApiList(sdk);

            // reset webview right button, set space deliberately;'
            sdk.setNavigationBarRightButton({
                title: ' ',
                image: ' '
            });
        });

        sdk.error(function(err){
            SdkDemo.dismiss();
            alert('err = ' + JSON.stringify(err));
        });
    },

    showJsApiList: (sdk) => {
        if(sdk.jsApiList.length) {
            let ul = '<div class="api-list">' + '<p>支持插件列表如下：</p> <ul>';

            $.each(sdk.jsApiList, function(index, item){
                ul += '<li>' + item + '</li>';
            });

            ul += '</ul>' + '</div>';

            //$(ul).insertBefore($('.exceptions').parent());
            //$(ul).appendTo($('body'));
            $('body').append($(ul));
        }
    },

    registerClickEvent: (sdk) => {
        $(document).on('click', function (e) {

            console.log('-----click-----');

            $target = $(e.target);

            function selectOptionValue(defaultValue) {
                let value = $target.siblings('p').find('select option:selected').val();

                if (defaultValue && value === '') {
                    value = defaultValue; // by default
                }

                return value;
            }

            if ($target.hasClass('pay')) {
                // pay
                sdk.pay({
                    tn: $('.tn').val().trim(),
                    merchantId: $('.apply-pay').val().trim()  // for apply pay
                });
            }
            else if ($target.hasClass('addBankCard')) {
                // pay
                sdk.addBankCard();
            }
            else if ($target.hasClass('closeWebApp')) {
                // pay
                sdk.closeWebApp();
            }
            else if ($target.hasClass('setNavigationBarTitle')) {
                // pay
                sdk.setNavigationBarTitle({
                    title: '设置钱包标题'
                });
            }
            else if ($target.hasClass('setNavigationBarRightButton')) {
                // pay
                sdk.setNavigationBarRightButton({
                    title: '刷新页面',
                    handler: function () {
                        window.location.reload();
                    }
                });
            }
            else if ($target.hasClass('scanQRCode')) {
                // scan
                //let params = {
                //    scanType: ["qrCode","barCode"]
                //};
                //
                //params.needResult = selectOptionValue('0');
                //console.log('needResult = ' + params.needResult);
                //
                //if(params.needResult === '1') {
                //    params.success = function(result){
                //        alert('Scan result = ' + result);
                //    }
                //}

                let params = {
                    scanType: ["qrCode", "barCode"],
                    success: function (result) {
                        alert('Scan result = ' + result);
                    }
                };

                sdk.scanQRCode(params);
            }
            else if ($target.hasClass('chooseImage')) {
                // scan
                let params = {
                    maxWidth: $('.max-width').val().trim() || '500',
                    maxHeight: $('.max-height').val().trim() || '1000',
                    success: function (data) {
                        if (data.base64) {
                            showImageOverlay(data);
                        }
                    }
                };

                console.log('target image is (%s, %s)', params.maxWidth, params.maxHeight);

                params.sourceType = selectOptionValue('3');

                sdk.chooseImage(params);
            }

            /*********  exceptions.html  *********/

            else if ($target.hasClass('share')) {
                // scan
                sdk.showSharePopup({
                    title: 'UBER入住银联钱包商城了～！',
                    desc: '通过银联钱包启动UBER叫车服务，收单享受5折优惠！',
                    detailUrl: 'https://partners.uber.com.cn',
                    picUrl: window.location.href.replace('plugins.html', 'image/share_sample.png')
                    //success: success,
                    //fail: fail
                });
            }
            else if ($target.hasClass('no-config')) {
                window.location.href = "noConfig.html";
            }
            else if ($target.hasClass('config-failed')) {
                window.location.href = "configFailed.html";
            }
            else if ($target.hasClass('exceptions')) {
                window.location.href = "exceptions.html";
            }
            else if ($target.hasClass('security-urls-not-include')) {
                window.location.href = "http://www.uisheji.me/wxwallet/h5/html/exceptions.html";
            }
            else if ($target.hasClass('for-client')) {
                window.location.href = "exceptions.html?target=forClient";
            }
            else if ($target.hasClass('load-url')) {
                let url = $('.input-url').val().trim();
                if (url) {
                    window.location.href = url;
                }
            }
        });
    }

}


//let overlay =
//    '<div class="overlay" style="display: none;">' +
//    '<div class="popContent">' +
//    '<img id="targetImage" src="">' +
//    '</div>' +
//    '<div id="close">' +
//    '<img src="../image/X.png">' +
//    '</div>' +
//    '</div>';
//
//$('body').append(overlay);
//
//
//function showImageOverlay(data) {
//    //$('#targetImage').attr('src', '../402');
//
//    //let t = createTpl($('#imageInfo').html());
//    //$('#imageInfo').html(t(imageParams));
//
//    //$('.overlay').show();
//
//    let src;
//    if(data && data.base64) {
//        src = 'data:image/png;base64,' + data.base64;
//    }
//    else {
//        src = 'image/weixin.png';
//    }
//
//    $('#targetImage').attr('src', src);
//
//    //let t = createTpl($('#imageInfo').html());
//    //$('#imageInfo').html(t(imageParams));
//
//    $('.overlay').show();
//
//    $('#close').on('click', function(){
//        $('.overlay').hide();
//    });
//
//}

//export default sdkCommon;

