

import 'weui';
import $ from 'jquery';
import 'weui.js';
//import Router from './../lib/router/router';
import sdkCommon from './sdkCommon.js';

import styles from './home.less';
import styles from './home.less';

export default {
    url: '/sdkDemo',
    className: 'sdkDemo',
    render: function () {
        //const todos = dataManager.getData(dataManager.TODOS, []);
        //return template.compile(tpl)({
        //    todos: todos,
        //    styles: styles,
        //    DEBUG: DEBUG
        //});
//debugger

        sdkCommon.init();
        sdkCommon.loadJsOrCssFile(SdkDemo.upsdkDotJS, function(){
            // callback
            sdkCommon.getSignature(function(resp){
                // success
                //checkSig(resp);

                sdkCommon.setupSdk(resp, window.upsdk);
                sdkCommon.registerClickEvent(window.upsdk);
            });
        });


        //return $('#tpl_home').html();



    },
    bind: function () {

    }
};



/**
 * Created by cup on 16/5/20.
 */



