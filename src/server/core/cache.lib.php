<?php

namespace Alopay\Core;

class Cache
{
    private $mmc = null;

    function __construct()
    {
        $this->mmc = new \Memcache();
        //初始化Memcache节点

        $MEMCACHE_NODES = array(
            //测试Memcache节点
            array(
                //"IP" => "120.26.119.20",
                "IP" => "127.0.0.1",
                "PORT" => "11211"
            )
        );

        foreach($MEMCACHE_NODES as $value){
            $this->mmc->addserver($value["IP"], $value["PORT"]);
        }
    }

    /**
     * 默认失效时间为不过期
        key
        The key that will be associated with the item.

        var
        The variable to store. Strings and integers are stored as is, other types are stored serialized.

        flag
        Use MEMCACHE_COMPRESSED to store the item compressed (uses zlib).

        expire
        Expiration time of the item. If it's equal to zero, the item will never expire. You can also use Unix timestamp or
     *  a number of seconds starting from current time, but in the latter case the number of seconds may not exceed 2592000 (30 days).
     */
    function set($key, $var, $flag = 0, $expire = 0)
    {
        if (!$this->mmc) return;

        //print('>>> Cache set ' . $key . ' = ' . $var . '<br>');

        return $this->mmc->set($key, $var, $flag, $expire);
    }

    function get($key)
    {
        if (!$this->mmc) return;
        return $this->mmc->get($key);
    }

    function incr($key, $value = 1)
    {
        if (!$this->mmc) return;
        return $this->mmc->increment($key, $value);
    }

    function decr($key, $value = 1)
    {
        if (!$this->mmc) return;
        return $this->mmc->decrement($key, $value);
    }

    function delete($key)
    {
        if (!$this->mmc) return;
        //print('>>> Cache delete key = ' . $key . '<br>');

        return $this->mmc->delete($key);
    }
}