import $ from 'jquery';
import 'weui.js';

import styles from '../css/mchnt.less';
import tpl from 'raw!../html/allInOne.html';

import entry from '../../../../app.js';
import bindLogin from './bindLogin.js';


export default {
    url: '/allInOne',
    render: function () {
        entry.router.push(bindLogin);
        return tpl;
    },
    bind: function () {

    }
};

