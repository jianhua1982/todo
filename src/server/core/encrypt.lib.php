<?php

namespace Alopay\Core;

class Encrypt
{
    private $privKey = null;
    private $pubKey = null;

    function __construct($publicKey = null, $privateKey = null) {
        if(!$publicKey && !$privateKey) {
            // 都为空。
            $config = array(
                "digest_alg" => "sha512",
                "private_key_bits" => 4096,
                "private_key_type" => OPENSSL_KEYTYPE_RSA,
            );

            // Create the private and public key
            $res = openssl_pkey_new($config);

            if($res) {
                // Extract the private key from $res to $privKey
                openssl_pkey_export($res, $this->privKey);
                Util::log('$privKey = ' . $this->privKey);

                // Extract the public key from $res to $pubKey
                $details = openssl_pkey_get_details($res);
                $this->pubKey = $details["key"];
                Util::log('$pubKey = ' . $this->pubKey);
            }
        }
        else {
            $this->pubKey = $publicKey;
            $this->privKey = $privateKey;
        }
    }

//    function createKeyPair() {
//
//    }

    function getPublicKey() {
        return $this->pubKey;
    }

    function getPrivateKey() {
        return $this->privKey;
    }

    function encrypt($data) {
//        $data = 'Password01!';
        if(!is_string($data)) {
            $data = json_encode($data);
        }

        if(strlen($data) == 0) {
            return false;
        }

        // Encrypt the data to $encrypted using the public key
        if(openssl_public_encrypt($data, $encrypted, $this->pubKey)) {
            return $encrypted;
        }

        return false;
    }

    function decrypt($encrypted) {
        //Util::log('try to decrypt = ' . $encrypted);
//        Util::log('$this->privKey = ' . $this->privKey);

        // Decrypt the data using the private key and store the results in $decrypted
        if(openssl_private_decrypt(base64_decode($encrypted), $decrypted, $this->privKey)) {
            //Util::log('$decrypted = '. $decrypted);
            return $decrypted;
        }

        return false;
    }

}