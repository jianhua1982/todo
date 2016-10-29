/**
 * Created by cup on 16/5/18.
 */

import $ from 'jquery';
import 'weui.js';
import entry from '../../../../app.js';
import styles from '../css/mchnt.less';
//import tpl from 'raw!../html/bindLogin.html';
import oauthIframe from './oauthIframe.js';

let phpServer = window.location.origin;
// for debug
//phpServer = 'https://www.wygreen.cn/weui.app';
phpServer = 'http://localhost';


export default {
    url: '/bindLogin',
    render: function () {
        //return tpl;

        var tpl = `
 <div>
    <div id="bindLogin" class="bd">
        <p class="target"> </p>

        <section class="login-page" style="display: none;">
            <div>
                <button class="upapi_base">静默授权(upapi_base)</button>
            </div>

            <div>
                <button class="upapi_userinfo">显示授权(upapi_userinfo)</button>
            </div>
        </section>

        <section class="result-page" style="display: none;">

            <p class="base_tips"  style="display: none;">静默授权(upapi_base)获取到用户信息如下</p>
            <p class="userinfo_tips" style="display: none;">显示授权(upapi_userinfo)获取到用户信息如下</p>

            <!--<div class="open-id">-->
            <!--<span>openId: </span> <div>{{openId}}</div>-->
            <!--</div>-->

            <!--<p> <span class="key">openId: </span> <span class="value"> {{openId}} </span> </p>-->

            <p> <span>openId: </span>  {{openId}} </p>

            <div class="upapi_userinfo" style="display: none;">
                <p><span>mobile: </span> {{mobile}}</p>
                <p><span>username: </span> {{username}}</p>
                <p><span>email: </span> {{email}}</p>
            </div>
        </section>

        <section class="errormsg" style="display: none;">
            <p> </p>
        </section>
    </div>
 </div>
        `;

        let urlParams = (function urlQuery2Obj (str) {
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
            isProd = (window.location.host.indexOf('.95516.com') > 0);

        let target = ' 针对目标服务器是：',
            $tpl = $(tpl);
        if(urlParams['target'] === 'restService') {
            target += 'JAVA REST服务, 没有WEB接口';
        }
        else {
            target += 'PHP, JSP或者ASP提供WEB接口服务';
        }

        $tpl.find('.target').text(target);

        if(urlParams.errmsg) {
            /*
             all failed cases will come here.
             */
            //alert(urlParams.errmsg);
            let errMsg = urlParams.errmsg;
            if(urlParams.errcode) {
                errMsg += ' [' + urlParams.errcode + ']';
            }

            let $errormsg = $tpl.find('.errormsg');

            $errormsg.find('p').text('返回错误：' + errMsg);
            $errormsg.show();
        }
        else if(urlParams['openId']) {
            /*
             got user info success.
             */
            let t = createTpl($('.result-page').html());
            $('.result-page').html(t(urlParams));

            if(urlParams['mobile'] || urlParams['username'] || urlParams['email']) {
                $('.upapi_userinfo').show();
                $('.userinfo_tips').show();
            }
            else {
                $('.base_tips').show();
            }

            $tpl.find('.result-page').show();
        }
        else if(urlParams['code']) {
            // simulate java backend rest service.
            //alert('code = ' + urlParams['code']);
            let url = phpServer + '/web/public/mchnt/server/php/bindLogin.php' + window.location.search;
            console.log('jump to url = ' + url);
            window.location.href = url;
        }
        else {
            $tpl.find('.login-page').show();
        }

        // 创建{{}}占位的模板
        function createTpl(t) {
            return function (m) {
                return t.replace(/\\?\{{([^{}]+)}}/gm, function (t, e) {
                    return m && m[e] || "";
                });
            };
        }

        return $tpl.html();
    },
    bind: function () {

        $('.upapi_base').on('click', function(){
            fetchCode(true);
        });

        $('.upapi_userinfo').on('click', function(){
            fetchCode(false);
        });

        //window.sessionStorage.setItem('skip_auth_page_when_back', '0');

        function fetchCode(silent) {
            let url = phpServer + '/web/public/mchnt/server/php/bindLogin.php';

            url += window.location.search;

            if(silent) {
                if(url.indexOf('?') > 0) {
                    url += '&scope=upapi_base';
                }
                else {
                    url += '?scope=upapi_base';
                }
            }

            console.log('url = ' + url);

            sessionStorage.setItem('oauth.jump.url', url);
            entry.router.push(oauthIframe); //.go('oauthIframe');
            window.location.href = '#/oauthIframe';
            //window.location.replace('#/oauthIframe');

            //if (!execHashIframe.contentWindow) {
            //    execHashIframe = createHashIframe();
            //}

           // createHashIframe(url);

            // try href jump
            //entry.router.push(this);
            //window.location.href = url;
        }
    }
};
