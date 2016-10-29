<?php

namespace Alopay;

//引入配置文件
include_once __DIR__ . '/config.php';
//引入自动载入函数
//include_once __DIR__.'/autoloader.php';
////调用自动载入函数
//AutoLoader::register();

/**
 * 安全的验证码要：验证码文字扭曲、旋转，使用不同字体。
 *
 **/
class YL_Security_Secoder
{
    //验证码中使用的字符，01IO容易混淆，不用
    public static $codeSet = '3456789ABCDEFGHJKLMNPQRTUVWXY';
    public static $fontSize = 12; // 验证码字体大小(px)
    public static $imageH = 0; // 验证码图片宽
    public static $imageL = 0; // 验证码图片长
    public static $length = 4; // 验证码位数
    public static $bg = array(255, 255, 255); // 背景

    protected static $_image = null; // 验证码图片实例
    protected static $_color = null; // 验证码字体颜色

    /**
     * 输出验证码并把验证码的值保存到memcache中
     */
    public static function captcha()
    {
        // 图片宽(px)   
        self::$imageL || self::$imageL = self::$length * self::$fontSize * 1.5 + self::$fontSize * 1.5;
        // 图片高(px)   
        self::$imageH || self::$imageH = self::$fontSize * 2;
        // 建立一幅 self::$imageL x self::$imageH 的图像   
        self::$_image = imagecreate(self::$imageL, self::$imageH);
        // 设置背景
        imagecolorallocate(self::$_image, self::$bg[0], self::$bg[1], self::$bg[2]);
        // 验证码字体随机颜色   
        self::$_color = imagecolorallocate(self::$_image, mt_rand(1, 120), mt_rand(1, 120), mt_rand(1, 120));
        // 验证码使用随机字体，保证目录下有这些字体集
        $ttf = dirname(__FILE__) . '/ttfs/t4.ttf';
        // 绘验证码
        $code = array(); // 验证码   
        $codeNX = 0; // 验证码第N个字符的左边距   
        for ($i = 0; $i < self::$length; $i++) {
            $code[$i] = self::$codeSet[mt_rand(0, 28)];
            $codeNX += mt_rand(self::$fontSize * 1.2, self::$fontSize * 1.6);
            // 写一个验证码字符
            imagettftext(self::$_image, self::$fontSize, mt_rand(-15, 15), $codeNX, self::$fontSize * 1.5, self::$_color, $ttf, $code[$i]);
        }
        isset($_SESSION) || session_start();


        if (!isset($_COOKIE[COOKIE_CAPTCHA])) {
            $randomCode = YL_Security_Secoder::randomChar();
            setcookie(COOKIE_CAPTCHA, $randomCode);
            $cookieId = $randomCode;
        } else {
            $cookieId = $_COOKIE[COOKIE_CAPTCHA];
        }
        error_log("captcha:" . $cookieId);
        if (isset($cookieId) && ($cookieId != null)) {
            // 实例化memcache
            $mc = new Core\Cache();
            //将4位验证码保存到CookieId中，超时时间设为5分钟
            $mc->set($cookieId, join('', $code), 0, 300);
        }

        header('Pragma: no-cache');
        header("content-type: image/JPEG");

        // 输出图像   
        imageJPEG(self::$_image);
        imagedestroy(self::$_image);
    }

    public static function randomChar($length = 64)
    {
        // 密码字符集，可任意添加你需要的字符
        $chars = '0123456789qwertyuioplkjhgfdsazxcvbnm';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[mt_rand(0, strlen($chars) - 1)];
        }
        return $password;
    }
}

//调用上面定义的验证码类 来生产验证码
YL_Security_Secoder::captcha();