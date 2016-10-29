/**
 * Created by cup on 16/5/18.
 */

import $ from 'jquery';
import 'weui.js';
import entry from '../../../../app.js';
import styles from '../css/mchnt.less';
//import tpl from 'raw!../html/oauthIframe.html';

export default {
    url: '/oauthIframe',
    render: function () {

        //const iframe = document.createElement("iframe"),
        //    url = 'https://www.baidu.com',
        //    div = document.createElement("div");
        //
        //iframe.setAttribute("src", url);
        ////iframe.setAttribute("style", "display:none;");
        //iframe.setAttribute("width", document.body.clientWidth);
        //iframe.setAttribute("height", document.body.clientHeight);
        ////iframe.setAttribute("frameborder", "0");
        //
        ////iframe.parentNode.removeChild(iframe);
        //
        //// Hash changes don't work on about:blank, so switch it to file:///.
        ////iframe.contentWindow.history.replaceState(null, null, '/#/oauthIframe');
        //
        ////iframe = null;
        //
        ////$(function() {
        ////    var $frame = $('<iframe style="width:200px; height:100px;">');
        ////    $('body').html( $frame );
        ////    setTimeout( function() {
        ////        var doc = $frame[0].contentWindow.document;
        ////        var $body = $('body',doc);
        ////        $body.html('<h1>Test</h1>');
        ////    }, 1 );
        ////});
        //
        //div.appendChild(iframe);
        //
        //
        ////return $(iframe).html();
        //
        ////return div.innerHTML;

        // ~ http://stackoverflow.com/questions/2429045/iframe-src-change-event-detection

        const tpl = `
<div>
    <iframe id="oauthFrame" onload="alert(this.contentWindow.location.href)">

    </iframe>
</div>
        `;

        const $tpl = $(tpl);
        $tpl.find('#oauthFrame').attr('src', sessionStorage.getItem('oauth.jump.url'));

        return $tpl.html();
    },
    bind: function () {

        //window.addEventListener("message", function(e) {
        //    if(e.origin == "http://server2") //important for security
        //        if(e.data.indexOf('redirect:') == 0)
        //            document.location = e.data.substr(9);
        //}, false);

        //$('#oauthFrame').on('load', function(){
        //    // onload="alert(this.contentWindow.location.href)"
        //    if(this.contentWindow.location.pathname.indexOf('/notify.php') > 0) {
        //        debugger
        //    }
        //});

    }
};
