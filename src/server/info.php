<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 15/12/7
 * Time: PM1:30
 */

//phpinfo();

//$ret = sha1('front_end_token=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW& timestamp=1414587457&url=http://haigou.unionpay.com?params=value');
//var_dump($ret);


var_dump($_SERVER);

//var_dump($_GET);


// ~ http://php.net/manual/en/function.openssl-verify.php

//$config = array(
//    "digest_alg" => "sha512", // ""
//    "private_key_bits" => 4096,
//    "private_key_type" => OPENSSL_KEYTYPE_RSA,
//);
//
//// Create the private and public key
//$res = openssl_pkey_new($config);
//
//var_dump($res);
//echo '<br>';
//echo '<br>';
//
//if($res) {
//    // Extract the private key from $res to $privKey
//    openssl_pkey_export($res, $privKey);
//
//    var_dump('$privKey = ' . $privKey);
//    echo '<br>';
//    echo '<br>';
//
//    // Extract the public key from $res to $pubKey
//    $pubKey = openssl_pkey_get_details($res);
//    $pubKey = $pubKey["key"];
//
//    var_dump('$pubKey = ' . $pubKey);
//    echo '<br>';
//    echo '<br>';
//
//    $data = 'Password01!';
//
//    // Encrypt the data to $encrypted using the public key
//    openssl_public_encrypt($data, $encrypted, $pubKey);
//
//    // Decrypt the data using the private key and store the results in $decrypted
//    openssl_private_decrypt($encrypted, $decrypted, $privKey);
//
//    echo '$decrypted = '. $decrypted;
//    echo '<br>';
//}

