<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2015/11/14
 * Time: 15:18
 */

include 'lanewechat.php';

//// 获取菜单
//$ret = \Alopay\Core\Menu::getMenu();
//var_dump($ret);
//
//// force ignore.
//return;


/*
 *   https://www.wygreen.cn/alopay/server/createMenu.php?appName=testaccount    测试公众号
 *
 *   https://www.wygreen.cn/alopay/server/createMenu.php?appName=tujiayanmei   土家燕妹
 *
 * https://www.wygreen.cn/alopay/server/createMenu.php?appName=alopay   alopay
 */

//

/**
 * 自定义菜单
 */

//$baseUrl = 'http://www.wygreen.cn/alopay/prod/';  // prod

$baseUrl = 'https://www.wygreen.cn/alopay/';  // dev
$baseUrlProd = $baseUrl . 'prod/';  // prod
$bust = rand(10000, 100000);

//设置菜单
//$menuList = array(
//
//    array('id'=>'1', 'pid'=>'',   'name'=>'燕妹合作社', 'type'=>'', 'code'=>'key_1'),
//    array('id'=>'2', 'pid'=>'1',  'name'=>'合作社简介', 'type'=>'view', 'code'=>'http://mp.weixin.qq.com/s?__biz=MzI5NjA0MDQ3Ng==&mid=208589323&idx=1&sn=9a17450930991ed1552d792003c8d075&scene=20#rd'),
//    array('id'=>'3', 'pid'=>'1',  'name'=>'土家红薯粉', 'type'=>'view', 'code'=>'http://mp.weixin.qq.com/s?__biz=MzI5NjA0MDQ3Ng==&mid=400274765&idx=1&sn=04b35a99c378fe98a4f746e4d2aabd34&scene=18#rd'),
//
//
//    array('id'=>'7', 'pid'=>'',  'name'=>'帮助', 'type'=>'', 'code'=>'key_7'),
//    array('id'=>'8', 'pid'=>'7', 'name'=>'联系我们', 'type'=>'view', 'code'=>$baseUrl . 'Client/html/help.html')
//);


//$menuList = array(
//    array('id'=>'1', 'pid'=>'',   'name'=>'开发环境', 'type'=>'', 'code'=>'key_1'),
//    array('id'=>'2', 'pid'=>'1',  'name'=>'收银台', 'type'=>'view', 'code'=>$baseUrl . 'Client/html/pay/main.html?bust=' . $bust),
//    array('id'=>'3', 'pid'=>'1',  'name'=>'商户中心', 'type'=>'view', 'code'=>$baseUrl . 'Client/html/pay/userInfo.html?bust=' . $bust),
//    array('id'=>'4', 'pid'=>'1', 'name'=>'帮助中心', 'type'=>'view', 'code'=>$baseUrl . 'Client/html/pay/helpList.html?bust=' . $bust),
//
//    array('id'=>'5', 'pid'=>'',   'name'=>'生产环境', 'type'=>'', 'code'=>'key_5'),
//    array('id'=>'6', 'pid'=>'5',  'name'=>'收银台', 'type'=>'view', 'code'=>$baseUrlProd . 'Client/html/pay/main.html?bust=' . $bust),
//    array('id'=>'7', 'pid'=>'5',  'name'=>'商户中心', 'type'=>'view', 'code'=>$baseUrlProd . 'Client/html/pay/userInfo.html?bust=' . $bust),
//    array('id'=>'8', 'pid'=>'5',  'name'=>'帮助中心', 'type'=>'view', 'code'=>$baseUrlProd . 'Client/html/pay/helpList.html?bust=' . $bust),
//);

$menuList = array(
    array('id'=>'1', 'pid'=>'',  'name'=>'收银台', 'type'=>'view', 'code'=>$baseUrlProd . 'client/html/pay/main.html?bust=' . $bust),
    array('id'=>'2', 'pid'=>'',  'name'=>'商户中心', 'type'=>'view', 'code'=>$baseUrlProd . 'client/html/pay/userInfo.html?bust=' . $bust)
    //,array('id'=>'3', 'pid'=>'',  'name'=>'帮助中心', 'type'=>'view', 'code'=>$baseUrlProd . 'client/html/pay/helpList.html?bust=' . $bust),
);

//$menuList = array(
//);


//var_dump($menuList);
//echo <br>;

//$accessToken = $sign->getAccessToken();
//$url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=$accessToken";
//$res = json_decode(HttpUtil::sendPostRequest($url, $data));
//var_dump($res);
//
//return;

// ip_list
//$list = \Alopay\Core\Auth::getWeChatIPList();
////https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=ACCESS_TOKEN
//var_dump(json_encode($list));
//return;

/*
 * standard one.
 *
 */
//$menuList = array(
//    array('id'=>'1', 'pid'=>'',  'name'=>'常规', 'type'=>'', 'code'=>'key_1'),
//    array('id'=>'2', 'pid'=>'1',  'name'=>'点击', 'type'=>'click', 'code'=>'key_2'),
//    array('id'=>'3', 'pid'=>'1',  'name'=>'浏览', 'type'=>'view', 'code'=>'http://www.lanecn.com'),
//    array('id'=>'4', 'pid'=>'',  'name'=>'扫码', 'type'=>'', 'code'=>'key_4'),
//    array('id'=>'5', 'pid'=>'4', 'name'=>'扫码带提示', 'type'=>'scancode_waitmsg', 'code'=>'key_5'),
//    array('id'=>'6', 'pid'=>'4', 'name'=>'扫码推事件', 'type'=>'scancode_push', 'code'=>'key_6'),
//    array('id'=>'7', 'pid'=>'',  'name'=>'发图', 'type'=>'', 'code'=>'key_7'),
//    array('id'=>'8', 'pid'=>'7', 'name'=>'系统拍照发图', 'type'=>'pic_sysphoto', 'code'=>'key_8'),
//    array('id'=>'9', 'pid'=>'7', 'name'=>'拍照或者相册发图', 'type'=>'pic_photo_or_album', 'code'=>'key_9'),
//    array('id'=>'10', 'pid'=>'7', 'name'=>'微信相册发图', 'type'=>'pic_weixin', 'code'=>'key_10'),
//    array('id'=>'11', 'pid'=>'1', 'name'=>'发送位置', 'type'=>'location_select', 'code'=>'key_11'),
//);

\Alopay\Core\Menu::setMenu($menuList);

//获取菜单
//\Alopay\Core\Menu::getMenu();
////删除菜单
//\Alopay\Core\Menu::delMenu();
