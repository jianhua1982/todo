/**
 * Created by cup on 8/9/16.
 */

import 'weui';
import $ from 'jquery';
import 'weui.js';

export default {
    url: '/actionsheet',
    className: 'actionsheet',
    render: function () {
        //const todos = dataManager.getData(dataManager.TODOS, []);
        //return template.compile(tpl)({
        //    todos: todos,
        //    styles: styles,
        //    DEBUG: DEBUG
        //});

        //return $('#tpl_home').html();

        return `<div class="hd">
    <h1 class="page_title">ActionSheet</h1>
</div>
<div class="bd spacing">
    <a href="javascript:;" class="weui_btn weui_btn_primary" id="showActionSheet">点击上拉ActionSheet</a>
</div>
<!--BEGIN actionSheet-->
<div id="actionSheet_wrap">
    <div class="weui_mask_transition" id="mask"></div>
    <div class="weui_actionsheet" id="weui_actionsheet">
        <div class="weui_actionsheet_menu">
            <div class="weui_actionsheet_cell">示例菜单</div>
            <div class="weui_actionsheet_cell">示例菜单</div>
            <div class="weui_actionsheet_cell">示例菜单</div>
            <div class="weui_actionsheet_cell">示例菜单</div>
        </div>

        <div class="weui_actionsheet_action">
            <div class="weui_actionsheet_cell" id="actionsheet_cancel">取消</div>
        </div>
    </div>
</div>`;

    },
    bind: function () {
        $('#container').on('click', '#showActionSheet', function () {
            var mask = $('#mask');
            var weuiActionsheet = $('#weui_actionsheet');
            weuiActionsheet.addClass('weui_actionsheet_toggle');
            mask.show()
                .focus()//加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
                .addClass('weui_fade_toggle').one('click', function () {
                    hideActionSheet(weuiActionsheet, mask);
                });
            $('#actionsheet_cancel').one('click', function () {
                hideActionSheet(weuiActionsheet, mask);
            });
            mask.unbind('transitionend').unbind('webkitTransitionEnd');

            function hideActionSheet(weuiActionsheet, mask) {
                weuiActionsheet.removeClass('weui_actionsheet_toggle');
                mask.removeClass('weui_fade_toggle');
                mask.on('transitionend', function () {
                    mask.hide();
                }).on('webkitTransitionEnd', function () {
                    mask.hide();
                })
            }
        });
    }
};