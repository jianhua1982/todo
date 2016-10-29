<?php

namespace Wallet;

/**
 * Created by PhpStorm.
 * User: cup
 * Date: 16/7/7
 * Time: 下午2:14
 */
class Autoloader{
    const NAMESPACE_PREFIX = 'Wallet\\';
    /**
     * 向PHP注册在自动载入函数
     */
    public static function register(){
        spl_autoload_register(array(new self, 'autoload'));
    }

    /**
     * 根据类名载入所在文件
     */
    public static function autoload($className){
        $namespacePrefixStrlen = strlen(self::NAMESPACE_PREFIX);
        if(strncmp(self::NAMESPACE_PREFIX, $className, $namespacePrefixStrlen) === 0){
            $className = strtolower($className);
            $filePath = str_replace('\\', DIRECTORY_SEPARATOR, substr($className, $namespacePrefixStrlen));
            $filePath = realpath(__DIR__ . (empty($filePath) ? '' : DIRECTORY_SEPARATOR) . $filePath . '.lib.php');
            if(file_exists($filePath)){
                require_once $filePath;
            }else{
                echo $filePath;
            }
        }
    }
}
