/**
 * Created by cup on 8/30/16.
 */
//

import 'weui';
import $ from 'jquery';
import 'weui.js';
//import require from '../lib/require.js';
//import Swiper from '../../vendor/';
//require(['../../alopay/client/js/lib/jquery.min.js', 'swiper', 'commonJS', 'handlebars'], function($, Swiper, YZ, Handlebars)

import CommonJS from '../lib/common.js';
import Handlebars from '../lib/vendor/handlebars-v4.0.5.js';
import Swiper from '../lib/vendor/swiper/swiper.min.js';
//import Waypoints from 'waypoints/lib/jquery.waypoints.js';
import Waypoints from 'jquery-waypoints/waypoints.min.js';

import snsDataMgr from './js/dataMgr.js';
import styles from './less/sns.less';
import tpl from 'raw!./html/sns.html';

//loadjscssfile("./scripts/vendor/swiper/swiper.min.css", 'css');

export default {
    url: '/sns',
    className: 'sns',
    render: function () {
        return tpl;

        //$.weui.loading('加载中...');
        //if(tpl && $(tpl).length) {
        //    let $template = $(tpl).find('#timelineTemplate');
        //    if($template.length) {
        //        let child = (Handlebars.compile($template.html()))(snsDataMgr.timeline);
        //        $('section.timeline').append(child);
        //        return $('section.timeline').html(); // $(tpl)
        //    }
        //}
        //
        //return tpl;
    },
    bind: () => {

        console.log('Got DOMContentLoaded');
        console.log('>>>' + location.href);

        let _appName,
            commonJS = new CommonJS();

        if (commonJS.isProdMode) {
            /*
             https://www.wygreen.cn/alopay/prod/wechat.php?appName=alopayN
             */
            _appName = commonJS.AppName.DuoShouQian;
        }
        else {
            /*
             https://www.wygreen.cn/alopay/wechat.php?appName=testaccount
             */
            _appName = commonJS.AppName.TestEnv;
        }

        commonJS.config(_appName);

        commonJS.loadjscssfile('//res.wx.qq.com/open/js/jweixin-1.0.0.js', 'js');

        //const tabs = ['timeline', 'discover', 'mine','upload'];

        const tabBar = {
            tabs: [
                {
                    class: 'timeline',
                    text: '朋友圈',
                    icon: 'https://weui.github.io/weui/images/icon_nav_button.png',
                    action: (e) => {
                        // top user profile.
                        commonJS.bindTpl(Handlebars, $('#timelineTemplate'), snsDataMgr.timeline);

                        // msg list
                        appendMsgData(snsDataMgr.timeline);

                        function appendMsgData(data) {
                            const child = commonJS.bindTpl(Handlebars, $('#timelineListTemplate'), data, false);
                            child && $('.timeline .msg-list').append(child);
                        }

                        $('section').hide();
                        // ref ~ https://rainsoft.io/when-not-to-use-arrow-functions-in-javascript/
                        //$('section.' + this.class).show(); // TODO this.class is undefine
                        //$(`section.${}`).show();
                        $('section.timeline').show();

                        const waypointTop = new Waypoint({
                            //element: document.getElementById('waypoint'),
                            element: $('.timeline .profile-banner')[0],
                            handler: direction => {
                                console.log('!!! Scrolled to top waypoint! ' + direction);
                                $.weui.loading();

                                // user wants to see the newest ones.
                                commonJS.ajax2Php({
                                    action: 'timeline.loadNew',
                                    updateTime: '',
                                    success: (resp) => {
                                        // success
                                        $.weui.hideLoading();
                                        commonJS.bindTpl(Handlebars, $('#timelineListTemplate'), snsDataMgr.timeline, false, true);
                                    }
                                });
                            }
                        });

                        const $listCells = $('.timeline .msg-list .list-cell');

                        if($listCells.length) {
                            const waypointDown = new Waypoint({
                                //element: document.getElementById('waypoint'),
                                element: $listCells[$listCells.length - 2], // TODO for good user experience.
                                handler: direction => {
                                    console.log('!!! Scrolled to down waypoint! ' + direction);
                                    if(direction === 'down') {
                                        // user wants to see the old ones.
                                        // fetch next page for old ones.
                                        $.weui.loading();

                                        commonJS.ajax2Php({
                                            action: 'timeline.loadOld',
                                            updateTime: '',
                                            success: (resp) => {
                                                // success
                                                $.weui.hideLoading();
                                            }
                                        });
                                    }
                                }
                            });
                        }

                        //$('.jscroll').jscroll({
                        //    loadingHtml: '<img src="loading.gif" alt="Loading" /> Loading...',
                        //    padding: 20,
                        //    nextSelector: 'a.jscroll-next:last',
                        //    contentSelector: 'li',
                        //    callback: () => {
                        //        console.log('Trigger callback!');
                        //        //ajax request
                        //
                        //        const child = commonJS.bindTpl(Handlebars, $('#timelineListTemplate'), snsDataMgr.timeline, false);
                        //        child && $('.timeline .msg-list').append(child);
                        //    }
                        //});


                    }
                },
                {
                    class: 'discover',
                    text: '发现',
                    icon: 'https://weui.github.io/weui/images/icon_nav_button.png',
                    action: () => {
                        // slider
                        commonJS.bindTpl(Handlebars, $('#discoverSliderTemplate'), snsDataMgr.discover);

                        const swiper = new Swiper('.swiper-container', {
                            pagination: '.swiper-pagination',
                            effect: 'coverflow',
                            grabCursor: true,
                            centeredSlides: true,
                            slidesPerView: 'auto',
                            coverflow: {
                                rotate: 50,
                                stretch: 0,
                                depth: 100,
                                modifier: 1,
                                slideShadows: true
                            }
                        });

                        // grid images.
                        commonJS.bindTpl(Handlebars, $('#discoverGridTemplate'), snsDataMgr.discover);

                        $('section').hide();
                        $('section.discover').show();
                    }
                },
                {
                    class: 'mine',
                    text: '我',
                    icon: 'https://weui.github.io/weui/images/icon_nav_msg.png',
                    action: () => {
                        $('section').hide();
                        $('section.mine').show();
                    }
                },
                {
                    class: 'upload',
                    text: '我要上传',
                    icon: 'http://weui.github.io/weui/images/icon_nav_search_bar.png',
                    action: () => {
                        commonJS.fetchJSSignatureNew((wx) => {
                            // 获取图片。
                            wx.chooseImage({
                                //count: 9, // 默认9
                                sizeType: ['compressed'], // 'original', 可以指定是原图还是压缩图，默认二者都有
                                //sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                                success: (res) => {
                                    var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片s
                                    if(localIds && localIds.length) {
                                        // Save to local
                                        commonJS.bindTpl(Handlebars, $('#uploadTemplate'), res);
                                        $('section').hide();
                                        $('section.upload').show();
                                    }
                                }
                            });
                        }, null, [
                            'chooseImage',
                            'uploadImage'
                        ]);

                        // upload page, user click submit button to do upload action.
                        $('section.upload .upload-action').one('click', () => {

                            // upload image to wx server.
                            var $self = $(this),
                                serverIds = {};

                            $self.attr("disabled", "disabled");

                            function uploadImageOneByOne(index, cb) {
                                if (index >= uploads.length) {
                                    $.isFunction(cb) && cb();
                                    return;
                                }

                                var $img = uploads[index].find('img'),
                                    wxImgId = $img.attr('src');

                                if (wxImgId) {
                                    wx.uploadImage({
                                        localId: wxImgId, // 需要上传的图片的本地ID，由chooseImage接口获得
                                            isShowProgressTips: 1, // 默认为1，显示进度提示
                                                success: function (res) {
                                                var serverId = res.serverId; // 返回图片的服务器端ID
                                                //    var $img = item.find('img'),
                                                //        localId = $img.attr('src');
                                                //
                                                //$img.data('serverId', serverId);
                                                //serverIds[index] = serverId;
                                            serverIds[$img.data('key')] = serverId;

                                            // upload the next one to wx server.
                                            uploadImageOneByOne(index + 1, cb);
                                        }
                                    });
                                }
                                else {
                                    // set empty str if no image available.
                                    //serverIds[index] = 'aa';
                                    //serverIds.push('');
                                    serverIds[$img.data('key')] = '';

                                    // upload the next one to wx server.
                                    uploadImageOneByOne(index + 1, cb);
                                }
                            }

                            uploadImageOneByOne(0, function () {
                                // then send register data to php server.
                                $.weui.loading();

                                commonJS.ajax2BackendByPhp({
                                    type: 'POST',
                                    action: 'mchntRegister',
                                    params: {
                                        id: '8888', //YZ.Pay.requestCommands.Register,
                                        serverIds: serverIds
                                    },
                                    success: function (resp) {
                                        // login success
                                        $.weui.hideLoading();
                                        $.weui.topTips('让朋友们享受你的分享吧!');
                                    },
                                    complete: function () {
                                        // recover btn status.
                                        $self.removeAttr("disabled");
                                    }
                                });
                            });
                        });
                    }
                }
            ]
        };

        // tabs.
        commonJS.bindTpl(Handlebars, $('#tabbarTemplate'), tabBar);

        // bind click event.
        tabBar.tabs.map(tab => {
            //console.log('...' + tab.class);
            $('.weui_tabbar').on('click', '.' + tab.class, tab.action || $.noop);
        });

        // trigger first tab click event.
        //$("input").trigger("click");
        $('.weui_tabbar').find('.' + tabBar.tabs[0].class).trigger("click");

    }
};


