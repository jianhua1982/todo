

<?php
/**
 * Created by PhpStorm.
 * User: cup
 * Date: 16/5/23
 * Time: PM5:02
 */

// http://localhost:8088/web/public/mchnt/server/mockServer/generator.php

/**************** OAUTH2 BindLogin  ******************/

// oauth.merchant
$resp_oauth_merchant = [
    'cmd' => 'oauth.merchant',
    "msg" => "",
    'params' => [
        'mustGrant' => '1',
        'merchantName' => '荔枝科技'
    ],
    'resp' => '00',
    'v' => '1.0'
];

// authorize
$resp_authorize = [
    'cmd' => 'authorize',
    "msg" => "",
    'params' => [
        'code' => '1234567890AFFFFFAFFADFSDFSDFS%%$#GHTTT!',
    ],
    'resp' => '00',
    'v' => '1.0'
];

// backendToken
$resp_backendToken= [
    'cmd' => 'backendToken',
    "msg" => "",
    'params' => [
        "backendToken" => "aaaaaaaaaaabbbbbbbbbbcccccccc",
        "expiresIn" => "3600"
    ],
    'resp' => '00',
    'v' => '1.0'
];

// token
$resp_token= [
    'cmd' => 'token',
    "msg" => "",
    'params' => [
        "accessToken" => "qqqqqqqqqqqqqbbbbbddddddddddd",
        "expiresIn" => "604800",
        "openId" => "!@#$%^&QEWEEEEE124443()JHH^&&^%%",
        "refreshToken" => "eeeeeeeeeeeebbbbbddddddddddd",
        "scope" => "upapi_base"
    ],
    'resp' => '00',
    'v' => '1.0'
];

// oauth.userInfo
$resp_oauth_userInfo= [
    'cmd' => 'oauth.userInfo',
    "msg" => "",
    'params' => [
        "email" => "",
        "mobile" => "13681950366",
        "username" => ""
    ],
    'resp' => '00',
    'v' => '1.0'
];


// general error.
$respError = [
    'resp' => 'a02',
    "msg" => "不合法的AppSecret",
    'params' => [
    ]
];

/**************** JSSDK  ******************/

// backendToken
$resp_frontToken= [
    'cmd' => 'frontToken',
    "msg" => "",
    'params' => [
        "frontToken" => "5435345342gdfadgfasfsafsafsafsdafafasdfas4534532",
        "expiresIn" => "7200"
    ],
    'resp' => '00',
    'v' => '1.0'
];

// jssdk.frontToken
$resp = [
    'resp' => '00',
    "msg" => "",
    'params' => [
        'access_token' => 'dejwfdsia33339988dsafdsgufhiei45riiw3',
        'expires_in' => '7200',
        'refresh_token' => '4848488484jjfjfhfhfhfhfh83883383dhhffh',
        'openid' => 'up3883838djjdjddjddjdjjjdjd8228fj',
        'scope' => 'upapi_userinfo',
    ]
];

// jssdk.verifySign  -- 全量版
$resp_jssdk_verifySign = [
    'resp' => '00',
    "msg" => "success",
    'params' => [
        'jsApiList' => [
            'UPWebPay' => [
                'pay'
            ],

            'UPWebBankCard' => [
                'addBankCard'
            ],

            'UPWebBars' => [
                'setNavigationBarTitle',
                'setNavigationBarRightButton',
                'prefetchImage' // 分享插件会用到
            ],

            'UPWebClosePage' => [
                'closeWebApp'
            ],

            'UPWebUI' => [
                'showLoadingView',
                'showWaitingView',
                'showFlashInfo',
                'showAlertView',
                'dismiss',
                'chooseImage',
                'scanQRCode'
            ],

            'UPWalletPlugin' => [
                'showSharePopup'
            ]
        ]
    ]
];

// jssdk.verifySign  --- 精简版
$resp_jssdk_verifySign = [
    'resp' => '00',
    "msg" => "success",
    'params' => [
        'jsApiList' => [
            [
                'plugin' => 'UPWebPay',
                'actions'=> [
                    'pay'
                ]
            ],

            [
                'plugin' => 'UPWebBankCard',
                'actions'=> [
                    'addBankCard'
                ]
            ],

            [
                'plugin' => 'UPWebBars',
                'actions'=> [
                    'setNavigationBarTitle',
                    'setNavigationBarRightButton'
                ]
            ],

            [
                'plugin' => 'UPWebClosePage',
                'actions'=> [
                    'closeWebApp' // 关闭当前Web容器窗口。
                ]
            ],

            [
                'plugin' => 'UPWebUI',
                'actions'=> [
                    'showFlashInfo',
                    'scanQRCode' // 扫一扫
                ]
            ]
        ]
    ]
];

//echo json_encode($resp_orderSimpleDetail);
//echo json_encode($resp_oauth_merchant);
//echo json_encode($resp_authorize);
//echo json_encode($resp_backendToken);
//echo json_encode($resp_token);
echo json_encode($resp_oauth_userInfo);
