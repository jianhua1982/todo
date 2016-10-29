/**
 * Created by cup on 8/26/16.
 */

/**
 * Created by cup on 16/09/05.
 */

import 'weui';
import $ from 'jquery';
import 'weui.js';
//import requirejs from './require.es6';
//import wx from 'https://res.wx.qq.com/open/js/jweixin-1.0.0.js';

export default class commonJS {

    constructor(params){
        this.AppName = {
            // projName => real gong zhong hao
            DuoShouQian: 'weui',
            TuJiaYanMei: 'tujiayanmei',
            Scan2FetchCoupon: 'testaccount',
            TestEnv: 'testaccount'
        };

        this.RespCode = {
            // projName => real gong zhong hao
            Success: '00',
            MustLogin: '999',
            Dangerous: '+9x9+'
        };

        this.isProdMode = (window.location.pathname.indexOf('/prod/') > 0);

        this.userAgent = navigator.userAgent.toLowerCase();

        this.isWX = (this.userAgent.indexOf('micromessenger') >= 0);

        this.envPrefix = (this.isProdMode ? '/weui/prod' : '/weui'),

        this.urlParams = (() => {
            let str = location.search;

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
        })();

        this.appParams = {};

    }  // end constructor.

    /*
     string class extend.
     */
    strHasPrefix (str, prefix) {
        if (str && prefix && str.indexOf(prefix) === 0) {
            return true;
        }

        return false;
    }

    strHasSurfix (str, surfix)  {
        if (str && surfix && str.indexOf(surfix) === (str.length - surfix.length)) {
            return true;
        }

        return false;
    }

    /**
     * *******************************************
     * Methods
     */

    /************** 初始化， 配置类相关  ****************/

    config (appName)  {
        this.appParams.appName = appName;
        this.appParams.weChatUrl = ('//www.wygreen.cn' + (this.isProdMode ? '/weui/prod/server/wechat.php' : '/weui/server/wechat.php'));
    }

    /******************  与后台网络接口相关  *****************/

    storageNameForOpenId (indicator)  {
        if (!indicator || indicator.length === 0) {
            // no tel.
            console.error('>>> storageNameForOpenId, indicator is expected!!!');
        }
        return (window.location.hostname + '_' + 'openId_' + indicator);
    }

    weChatUrl (action) {
        if (this.strHasSurfix(action, '.php')) {
            /*
             访问的后台单独的php.
             */
            /*
             core 外面单独的PHP会来处理。
             */

            return  (this.envPrefix + '/server/'
            + action + '?appName=' + this.appParams.appName);
        }
        else {
            return (this.appParams.weChatUrl + '?appName=' + this.appParams.appName + '&requestAction=' + action);
        }
    }

    /**
     *
     * @param action
     * @param data
     * @param success
     *
     *  code: 00, 01, ...
     *  msg: mainly for error.
     *  params: for success data.
     *
     * @param fail
     *
     */
    ajax2Php (params) {
        if(!params) {
            return;
        }

        console.log('ajax2Php for action ' + params.action);

        // true ||
        if(true || this.isProdMode) {
            params.params && (delete params.params.mockServer);
        }

        let url = '';
        //if(params.params && params.mockServer === '1') {
        //    //url = '//www.wygreen.cn/weui/mockServer/' + data.id;
        //    url = window.location.origin + '/weui/mockServer/' + params.params.id;
        //}
        //else
        {
            url = this.weChatUrl(params.action);
        }

        /*
         For post request, the default is form type, ok for our php server.
         https://imququ.com/post/four-ways-to-post-data-in-http.html
         */
        $.ajax({
            type: (params.type || 'POST'),
            url: url,
            data: params.params,
            //contentType: 'application/json',
            //dataType: "json",
            success: resp => {
                // success
                //debugger
                if (!$.isPlainObject(resp)) {
                    resp = JSON.parse(resp);
                }

                if (resp.code === this.RespCode.Success) {
                    $.isFunction(params.success) && params.success(resp);
                }
                else if(resp.code === this.RespCode.MustLogin) {
                    $.weui.hideLoading();
                    //YZ.Pay.login();
                }
                else if(resp.code === this.RespCode.Dangerous) {
                    $.weui.hideLoading();
                    //YZ.Pay.checkAccount(resp);
                }
                else {
                    if ($.isFunction(params.fail)) {
                        params.fail(resp);
                    }
                    else {
                        let msg = resp && resp.msg ? resp.msg : '服务器繁忙，请稍后再试！';
                        $.weui.hideLoading();
                        $.weui.toast(msg);
                    }
                }
            },
            error: err => {
                // fail
                if (params.fail) {
                    params.fail(err);
                }
                else {
                    $.weui.hideLoading();
                    $.weui.toast('网络不给力哟');
                }
            }
        });
    }

    /*
     to private later.
     */
    fetchJSSignature (wx, success, fail, params) {
        /**
         * got js-sdk signature
         *
         */
        this.ajax2Php({
            action: 'wxJsSignature',
            success: function (data) {
                // success
                data = data.params;

                let msg = 'data = ' + JSON.stringify(data);
                console.log(msg);
                //alert(msg);
                //process(data);

                let configParams = data;
                $.extend(configParams, params);

                wx.config(configParams);

                // wx is ready.
                wx.ready(success);

                wx.error(fail);
            }
        });
    }

    fetchJSSignatureNew(success, fail, methods) {

        if (!$.isArray(methods)) {
            alert('methods 参数必须是数组');
            return;
        }

        //requirejs(['//res.wx.qq.com/open/js/jweixin-1.0.0.js'], function (wx) {
            this.fetchJSSignature(wx, function () {
                success && success(wx);

            }, fail, {
                jsApiList: methods
            });
        //});
    }

    /**
     * This API is obsoleted...
     *
     *  --> 开发阶段所有请求通过自己的php后台来完成。
     * @param data
     * {
        type: 'POST', // 默认是GET
        action:'userLogin',
        params:key_value pair,
        success: successCB,
        fail: failCB,
        disableLoading: 不显示loading框，// 默认显示loading框， 转圈但不会把整个页面给block住。
        showWaiting: 转圈页面会把整个页面给block住，适用于表单提交等逻辑，请求执行过程是原子操作。
     *
     */
    ajax2BackendByPhp (data) {
        if (!data || (typeof data !== "object")) {
            console.error('Method ajax2BackendByPhp must have parameter data');
            return;
        }

        // 默认的action就是'zero2Scan'
        data.action = data.action || 'zero2Scan';

        this.ajax2Php(data);
    }

    /******************  工具方法集合  *****************/

    urlAppendParams (href, params) {
        if (typeof href === 'undefined' || href.length === 0) {
            href = window.location.href;
        }

        if (params) {
            let queries = '';
            $.each(params, function (key, value) {
                if (key && value) {
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

    //验证手机号的输入是否正确
    checkTel (tel) {
        // 合法的手机号码以1开头的10位数字。
        let reg = /^1\d{10}$/;
        return reg.test(tel);
    }


    loadjscssfile (filename, filetype) {
        let fileref;
        if (filetype === "js") { //if filename is a external JavaScript file
            fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
        }
        else if (filetype === "css") { //if filename is an external CSS file
            fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }

        if (typeof fileref !== "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    }

    isHidden ($dom) {
        let style = $dom && $dom.attr('style');
        //let style = window.getComputedStyle(el);
        return (style === "display: none;" || style === "display:none;");
    }

    icon2DataUrl (url, callback, outputFormat) {
        let img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function(){
            let canvas = document.createElement('CANVAS');
            let ctx = canvas.getContext('2d');
            let dataURL;
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null;
            //img = null; // need it? when to destory it automatically?
        };
        img.src = url;
    }

    isValidMoney (amount) {
        /*
         http://stackoverflow.com/questions/2227370/currency-validation
         1. 所有整数（正负均可）。 2. 或者小数，小数点后面最多两位。
         */
        return amount && amount.length > 0 &&
            (/^-?[1-9]\d*$/.test(amount) || /^\d+(?:\.\d{0,2})$/.test(amount)) &&
            parseFloat(amount) > 0;
    }

    isValidPhone (phone) {
        // 合法的手机号码以1开头的10位数字。
        let reg = /^1\d{10}$/;
        return reg.test(phone);
    }

    bindTpl(Handlebars, $tpl, data, append2Parent=true, forceLoad=false) {
        if(Handlebars && $tpl && data) {
            let $parent = $tpl.parent();
            if(forceLoad || ($parent && !$parent.data('load'))) {
                const child = (Handlebars.compile($tpl.html()))(data);
                if(child) {
                    append2Parent && $tpl.parent().append(child);
                    $parent.data('load', true);
                }

                return child;
            }
        }

        return null;
    }
}
