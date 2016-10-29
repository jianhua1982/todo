<?php
/**
 * Created by PhpStorm.
 * User: jhyu
 * Date: 6/10/16
 * Time: 10:57 PM
 */

// ~ https://gist.github.com/dahnielson/508447

namespace Alopay\Core;

//引入配置文件
//include_once __DIR__.'/config.php';
include_once __DIR__ . '/core/uuid.lib.php';

//include_once 'Alopay/core/uuid.lib.php';


// Named-based UUID.
$v3uuid = UUID::v3('1546058f-5a25-4334-85ae-e68f2a44bbaf', 'SomeRandomString');
echo '$v3uuid = ' . $v3uuid;
echo '<br>';

$v5uuid = UUID::v5('1546058f-5a25-4334-85ae-e68f2a44bbaf', 'SomeRandomString');
echo '$v5uuid = ' . $v5uuid;
echo '<br>';

// Pseudo-random UUID
$v4uuid = UUID::v4();
echo '$v4uuid = ' . $v4uuid;
echo '<br>';
