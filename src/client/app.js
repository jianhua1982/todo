
import 'weui';
import $ from 'jquery';
import 'weui.js';
import Router from './lib/router/router';
//import require from './lib/require.js';
import styles from './home/home.less';
import cell from './home/cell';
import actionsheet from './home/actionsheet';
import todo from './todo/todo.js';
import sns from './sns/sns';
import allInOne from './public/mchnt/h5/js/allInOne';
import addressBook from './addressBook/ab_main';


console.log('-------enter app.js-------');

const router = new Router({
    container: '#container'
    //enterTimeout: 250,
    //leaveTimeout: 250
});

export default {
    //appRouter: () => router
    //appRouter(){
    //    return router;
    //}
    router: router
};


let grid = {
    url: '/',
    className: 'grid',
    render: function () {
        return `
<div class="hd">
    <h1 class="page_title">WeUI</h1>
    <p class="page_desc">Proj based on WeUI.</p>
</div>
<div class="bd">
    <div class="weui_grids">
        <a href="#/cell" class="weui_grid">
            <div class="weui_grid_icon">
                <i class="icon icon_cell"></i>
            </div>
            <p class="weui_grid_label">
                Cell
            </p>
        </a>
        <a href="#/actionsheet" class="weui_grid">
            <div class="weui_grid_icon">
                <i class="icon icon_actionSheet"></i>
            </div>
            <p class="weui_grid_label">
                ActionSheet
            </p>
        </a>
        <a href="#/todo" class="weui_grid">
            <div class="weui_grid_icon">
                <i class="icon"></i>
            </div>
            <p class="weui_grid_label">
                todo
            </p>
        </a>
        <a href="#/sns" class="weui_grid">
            <div class="weui_grid_icon">
                <i class="icon"></i>
            </div>
            <p class="weui_grid_label">
                sns
            </p>
        </a>
        <a href="#/allInOne" class="weui_grid">
            <div class="weui_grid_icon">
                <i class="icon"></i>
            </div>
            <p class="weui_grid_label">
                allInOne
            </p>
        </a>
        <a href="#/addressBook" class="weui_grid debug-it">
            <div class="weui_grid_icon">
                <i class="icon"></i>
            </div>
            <p class="weui_grid_label">
                addressBook
            </p>
        </a>
    </div>
</div>`;

    },
    bind: function () {
        //---------router related------------
        router.push(cell)
            .push(actionsheet)
            .push(todo)
            .push(sns)
            .push(allInOne)
            .push(addressBook);

        console.log('bind done');

    }
};

router.push(grid)
    .setDefault('/')
    .init();

function debug() {
    if($.isArray($('a'))) {
        console.log('jQuery returns array.');
    }
    else {
        console.log('Unexpected!!!');
    }
}
debug();




