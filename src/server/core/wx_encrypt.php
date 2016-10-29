<?php
/**
 * This file is to encrypt or decrypt message
 *
 * @file 			/lib/weixin/wx_encrypt.php
 * @author			KavMors(kavmors@163.com)
 * @version			2015-2-18
 */

class WxEncrypt {
	private $token;
	private $encodingAesKey;
	private $appId;

	function __construct($token, $encodingAesKey, $appId)
	{
		$this->token = $token;
		$this->encodingAesKey = $encodingAesKey;
		$this->appId = $appId;
	}

	//encrypt the reply from raw string
	public function encrypt($replyMsg, $timeStamp, $nonce, &$encryptMsg)
	{
		$pc = new Prpcrypt($this->encodingAesKey);

		$array = $pc->encrypt($replyMsg, $this->appId);
		$ret = $array[0];
		if ($ret != 0) {
			return $ret;
		}

		if ($timeStamp == null) {
			$timeStamp = time();
		}
		$encrypt = $array[1];

		$sha1 = new SHA1;
		$array = $sha1->getSHA1($this->token, $timeStamp, $nonce, $encrypt);
		$ret = $array[0];
		if ($ret != 0) {
			return $ret;
		}
		$signature = $array[1];

		$format = "<xml>
<Encrypt><![CDATA[%s]]></Encrypt>
<MsgSignature><![CDATA[%s]]></MsgSignature>
<TimeStamp>%s</TimeStamp>
<Nonce><![CDATA[%s]]></Nonce>
</xml>";
		$encryptMsg = sprintf($format, $encrypt, $signature, $timeStamp, $nonce);
		return ErrorCode::$OK;
	}

	//decrypt the message to raw string
	public function decrypt($msgSignature, $timestamp = null, $nonce, $postData, &$msg)
	{
		if (strlen($this->encodingAesKey) != 43) {
			return ErrorCode::$IllegalAesKey;
		}
		if ($timestamp == null) $timestamp = time();

		$pc = new Prpcrypt($this->encodingAesKey);

		$encrypt = simplexml_load_string($postData, 'SimpleXMLElement', LIBXML_NOCDATA);
		$encrypt = $encrypt->Encrypt;

		$sha1 = new SHA1;
		$array = $sha1->getSHA1($this->token, $timestamp, $nonce, $encrypt);
		$ret = $array[0];

		if ($ret != 0) {
			return $ret;
		}

		$signature = $array[1];
		if ($signature != $msgSignature) {
			return ErrorCode::$ValidateSignatureError;
		}

		$result = $pc->decrypt($encrypt, $this->appId);
		if ($result[0] != 0) {
			return $result[0];
		}
		$msg = $result[1];

		return ErrorCode::$OK;
	}
}

class ErrorCode {
	public static $OK = 0;
	public static $ValidateSignatureError = -40001;
	public static $ParseXmlError = -40002;
	public static $ComputeSignatureError = -40003;
	public static $IllegalAesKey = -40004;
	public static $ValidateAppidError = -40005;
	public static $EncryptAESError = -40006;
	public static $DecryptAESError = -40007;
	public static $IllegalBuffer = -40008;
	public static $EncodeBase64Error = -40009;
	public static $DecodeBase64Error = -40010;
	public static $GenReturnXmlError = -40011;
}

class SHA1 {
	/**
	 * Create a signature from SHA1
	 * @param string $token
	 * @param string $timestamp
	 * @param string $nonce - random string
	 * @param string $encrypt - encoding string
	 */
	public function getSHA1($token, $timestamp, $nonce, $encrypt_msg) {
		try {
			$array = array($encrypt_msg, $token, $timestamp, $nonce);
			sort($array, SORT_STRING);
			$str = implode($array);
			return array(ErrorCode::$OK, sha1($str));
		} catch (Exception $e) {
			return array(ErrorCode::$ComputeSignatureError, null);
		}
	}
}

/**
 * PKCS7Encoder class
 */
class PKCS7Encoder {
	public static $block_size = 32;

	public function encode($text)
	{
		$block_size = PKCS7Encoder::$block_size;
		$text_length = strlen($text);
		$amount_to_pad = PKCS7Encoder::$block_size - ($text_length % PKCS7Encoder::$block_size);
		if ($amount_to_pad == 0) {
			$amount_to_pad = PKCS7Encoder::block_size;
		}
		$pad_chr = chr($amount_to_pad);
		$tmp = "";
		for ($index = 0; $index < $amount_to_pad; $index++) {
			$tmp .= $pad_chr;
		}
		return $text . $tmp;
	}

	function decode($text)
	{

		$pad = ord(substr($text, -1));
		if ($pad < 1 || $pad > 32) {
			$pad = 0;
		}
		return substr($text, 0, (strlen($text) - $pad));
	}
}

/**
 * Prpcrypt class
 *
 */
class Prpcrypt {
	public $key;

	function Prpcrypt($k)
	{
		$this->key = base64_decode($k . "=");
	}

	public function encrypt($text, $appid)
	{

		try {
			$random = $this->getRandomStr();
			$text = $random . pack("N", strlen($text)) . $text . $appid;
			$size = mcrypt_get_block_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
			$module = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '', MCRYPT_MODE_CBC, '');
			$iv = substr($this->key, 0, 16);
			$pkc_encoder = new PKCS7Encoder;
			$text = $pkc_encoder->encode($text);
			mcrypt_generic_init($module, $this->key, $iv);
			$encrypted = mcrypt_generic($module, $text);
			mcrypt_generic_deinit($module);
			mcrypt_module_close($module);

			return array(ErrorCode::$OK, base64_encode($encrypted));
		} catch (Exception $e) {
			return array(ErrorCode::$EncryptAESError, null);
		}
	}

	public function decrypt($encrypted, $appid)
	{

		try {
			$ciphertext_dec = base64_decode($encrypted);
			$module = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '', MCRYPT_MODE_CBC, '');
			$iv = substr($this->key, 0, 16);
			mcrypt_generic_init($module, $this->key, $iv);

			$decrypted = mdecrypt_generic($module, $ciphertext_dec);
			mcrypt_generic_deinit($module);
			mcrypt_module_close($module);
		} catch (Exception $e) {
			return array(ErrorCode::$DecryptAESError, null);
		}


		try {
			$pkc_encoder = new PKCS7Encoder;
			$result = $pkc_encoder->decode($decrypted);
			if (strlen($result) < 16)
				return "";
			$content = substr($result, 16, strlen($result));
			$len_list = unpack("N", substr($content, 0, 4));
			$xml_len = $len_list[1];
			$xml_content = substr($content, 4, $xml_len);
			$from_appid = substr($content, $xml_len + 4);
		} catch (Exception $e) {
			return array(ErrorCode::$IllegalBuffer, null);
		}
		if ($from_appid != $appid)
			return array(ErrorCode::$ValidateAppidError, null);
		return array(0, $xml_content);
	}

	function getRandomStr()
	{

		$str = "";
		$str_pol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
		$max = strlen($str_pol) - 1;
		for ($i = 0; $i < 16; $i++) {
			$str .= $str_pol[mt_rand(0, $max)];
		}
		return $str;
	}
}