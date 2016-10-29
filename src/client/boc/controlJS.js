/**
 * Created by cup on 8/23/16.
 */

var _webUrl = "http://visa.uncle-ad.com/haitao/",
    _loadingNum = 0,
    _intervalTime = 1E3,
    _fadeTime = 200,
    _pageIndex = 0,
    _myScroll,
    _infoType = "",
    _isPlay = !0,
    _documentWidth = parseInt(document.documentElement.clientWidth),
    _documentHeight = parseInt(document.documentElement.clientHeight),
    _shareUrl = _webUrl + "index.html?ac=",
    _shareTitle = "\u4e2d\u94f6\u6d77\u6dd8\u66f4\u60e0\u6dd8\uff01\u53ef\u4eab\u6700\u9ad818%\u8fd4\u73b0\uff0c23\u4e07\u79ef\u5206\uff0c\u66f4\u6709\u8f6c\u8fd0\u6700\u4f4e4\u6298\uff01",
    _shareInfo = "\u4e2d\u94f6\u6d77\u6dd8\u66f4\u60e0\u6dd8\uff01\u53ef\u4eab\u6700\u9ad818%\u8fd4\u73b0\uff0c23\u4e07\u79ef\u5206\uff0c\u66f4\u6709\u8f6c\u8fd0\u6700\u4f4e4\u6298\uff01",
    _shareImg = _webUrl + "images/ads/share.jpg",
    animationFun = {
    initialization: function() {
        setWeiXinShare();
        480 < window.screen.height && document.addEventListener("touchmove", function(a) {
            a.preventDefault()
        }, !1);
        var a = !1;
        if (/i(Phone|P(o|a)d)/.test(navigator.userAgent)) {
            //$(document).on("touchstart", function(b) {
            //    a || (a = !0,
            //        $("audio")[0].play(),
            //        _isPlay = !0)
            //});
        }

        this.fillData();
        this.fnHide();
        this.showPage();
        $("section .music").on("click", function() {
            var a = $("audio")[0];
            _isPlay ? ($("section .music").addClass("nomusic"),
                a.pause(),
                _isPlay = !1) : ($("section .music").removeClass("nomusic"),
                a.play(),
                _isPlay = !0)
        });
        $("section.index .menu a").on("click", function() {
            animationFun.fnHide();
            var a = $("section.index .menu a").index(this);
            switch (parseInt(a)) {
                case 0:
                    animationFun.liyulistPage();
                    break;
                case 1:
                    animationFun.preferlistPage();
                    break;
                case 2:
                    animationFun.marvellouslistPage()
            }
        });
        $("section.list footer ul li a").on("click", function() {
            animationFun.fnHide();
            var a = $("section.list footer ul li a").index(this);
            switch (parseInt(a)) {
                case 0:
                    animationFun.liyulistPage();
                    break;
                case 1:
                    animationFun.preferlistPage();
                    break;
                case 2:
                    animationFun.marvellouslistPage()
            }
        });
        $("section.info footer ul li a").on("click", function() {
            animationFun.fnHide();
            var a = $("section.info footer ul li a").index(this);
            switch (parseInt(a)) {
                case 0:
                    animationFun.liyulistPage();
                    break;
                case 1:
                    animationFun.preferlistPage();
                    break;
                case 2:
                    animationFun.marvellouslistPage()
            }
        });
        $("section.list .liyulist ul li").on("click", function() {
            animationFun.fnHide();
            var a = $("section.list .liyulist ul li").index(this);
            switch (parseInt(a)) {
                case 0:
                    animationFun.liyucashPage();
                    break;
                case 1:
                    animationFun.liyudiscountPage();
                    break;
                case 2:
                    animationFun.liyuintegralPage()
            }
        });
        $("section.list header .liyuMenu a").on("click", function() {
            animationFun.fnHide();
            $("section.list header .liyuMenu a").removeClass("now");
            $(this).addClass("now");
            var a = $("section.list header .liyuMenu a").index(this);
            switch (parseInt(a)) {
                case 0:
                    animationFun.liyucashPage();
                    break;
                case 1:
                    animationFun.liyudiscountPage();
                    break;
                case 2:
                    animationFun.liyuintegralPage()
            }
        });
        $("section.list header .back").on("click", function() {
            $("section.list").is(":visible") && ($("section.list .liyulist").is(":visible") && (animationFun.fnHide(),
                _pageIndex = 1,
                animationFun.showPage()),
            $("section.list .preferlist").is(":visible") && (animationFun.fnHide(),
                _pageIndex = 1,
                animationFun.showPage()),
            $("section.list .marvellouslist").is(":visible") && (animationFun.fnHide(),
                _pageIndex = 1,
                animationFun.showPage()));
            if ($("section.list .liyucash").is(":visible") || $("section.list .liyudiscount").is(":visible") || $("section.list .liyuintegral").is(":visible"))
                animationFun.fnHide(),
                    animationFun.liyulistPage()
        });
        $("section.info header .back").on("click", function() {
            switch (_infoType) {
                case "liyucash":
                    animationFun.fnHide();
                    animationFun.liyucashPage();
                    break;
                case "liyudiscount":
                    animationFun.fnHide();
                    animationFun.liyudiscountPage();
                    break;
                case "liyuintegral":
                    animationFun.fnHide();
                    animationFun.liyuintegralPage();
                    break;
                case "preferlist":
                    animationFun.fnHide();
                    animationFun.preferlistPage();
                    break;
                case "marvellouslist":
                    animationFun.fnHide();
                        animationFun.marvellouslistPage();
            }
        });
        $("section.list .liyucash ul li").on("click", function() {
            var a = $(this).attr("rel");
            _infoType = "liyucash";
            animationFun.infoPage(a)
        });
        $("section.list .liyudiscount ul li").on("click", function() {
            var a = $(this).attr("rel");
            _infoType = "liyudiscount";
            animationFun.infoPage(a)
        });
        $("section.list .liyuintegral ul li").on("click", function() {
            var a = $(this).attr("rel");
            _infoType = "liyuintegral";
            animationFun.infoPage(a)
        });
        $("section.list .preferlist ul li").on("click", function() {
            var a = $(this).attr("rel");
            _infoType = "preferlist";
            animationFun.infoPage(a)
        });
        $("section.list .marvellouslist ul li").on("click", function() {
            var a = $(this).attr("rel");
            _infoType = "marvellouslist";
            animationFun.infoPage(a)
        })
    },
    fillData: function() {
        var a = "";
        $("section.list .liyulist ul").empty();
        for (x in liyulistData)
            a += '<li><img src="' + liyulistData[x].img + '"><span><img src="' + liyulistData[x].txtImg + '"><i></i></span></li>';
        $("section.list .liyulist ul").append(a);
        a = "";
        $("section.list .liyucash ul").empty();
        for (x in liyucashData)
            a += '<li rel="' + liyucashData[x].id + '"><img src="' + liyucashData[x].img + '"><span><img src="' + liyucashData[x].txtImg + '"></span></li>';
        $("section.list .liyucash ul").append(a);
        a = "";
        $("section.list .liyudiscount ul").empty();
        for (x in liyudiscountData)
            a += '<li rel="' + liyudiscountData[x].id + '"><img src="' + liyudiscountData[x].img + '"><span><img src="' + liyudiscountData[x].txtImg + '"></span></li>';
        $("section.list .liyudiscount ul").append(a);
        a = "";
        $("section.list .liyuintegral ul").empty();
        for (x in liyuintegralData)
            a += '<li rel="' + liyuintegralData[x].id + '"><img src="' + liyuintegralData[x].img + '"><span><img src="' + liyuintegralData[x].txtImg + '"></span></li>';
        $("section.list .liyuintegral ul").append(a);
        a = "";
        $("section.list .preferlist ul").empty();
        for (x in preferlistData)
            a += '<li rel="' + preferlistData[x].id + '"><img src="' + preferlistData[x].img + '"><span><img src="' + preferlistData[x].txtImg + '"></span></li>';
        $("section.list .preferlist ul").append(a);
        a = "";
        $("section.list .marvellouslist ul").empty();
        for (x in marvellouslistData)
            a += '<li rel="' + marvellouslistData[x].id + '"><img src="' + marvellouslistData[x].img + '"><span><img src="' + marvellouslistData[x].txtImg + '"></span></li>';
        $("section.list .marvellouslist ul").append(a)
    },
    showPage: function() {
        $("section").hide();
        $("section").eq(_pageIndex).fadeIn(_fadeTime, function() {
            switch (_pageIndex) {
                case 0:
                    animationFun.loadingPage();
                    break;
                case 1:
                    animationFun.indexPage()
            }
        })
    },
    loadingPage: function() {
        this.reLoadImg();
        _pageIndex = 1;
        var a = setInterval(function() {
            55 <= _loadingNum && (clearInterval(a),
                animationFun.showPage())
        }, 500)
    },
    indexPage: function() {
        //debugger
        TweenMax.fromTo($("section.index .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.index .logo span:eq(0)"), 0.6, {
            top: "-10px",
            opacity: 0
        }, {
            top: "7px",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.index .logo span:eq(1)"), 0.6, {
            top: "-10px",
            opacity: 0
        }, {
            top: "7px",
            opacity: 1,
            delay: 0.3
        });
        TweenMax.fromTo($("section.index .logo span:eq(2)"), 0.6, {
            top: "-17px",
            opacity: 0
        }, {
            top: "0",
            opacity: 1,
            delay: 0.5
        });
        TweenMax.fromTo("section.index .kv", 0.4, {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        }, {
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            delay: 0.6,
            ease: Power2.easeIn
        });
        TweenMax.fromTo($("section.index .menu a:eq(0)"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.index .menu a:eq(1)"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.6
        });
        TweenMax.fromTo($("section.index .menu a:eq(2)"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.8
        })
    },
    liyulistPage: function() {
        $("section").hide();
        $("section.list .liyulist").show();
        $("section.list footer ul li a:eq(0)").addClass("now");
        $("section.list").fadeIn(_fadeTime);
        TweenMax.fromTo($("section.list header .back"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list header .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list footer"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .liyulist ul li:eq(0) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.2
        });
        TweenMax.fromTo($("section.list .liyulist ul li:eq(1) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .liyulist ul li:eq(2) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.6
        })
    },
    preferlistPage: function() {
        $("section").hide();
        $("section.list .preferlist").show();
        $("section.list footer ul li a:eq(0)").addClass("noline");
        $("section.list footer ul li a:eq(1)").addClass("now");
        $("section.list").fadeIn(_fadeTime);
        TweenMax.fromTo($("section.list header .back"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list header .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list footer"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .preferlist ul li:eq(0) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.2
        });
        TweenMax.fromTo($("section.list .preferlist ul li:eq(1) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        })
    },
    marvellouslistPage: function() {
        $("section").hide();
        $("section.list .marvellouslist").show();
        $("section.list footer ul li a:eq(1)").addClass("noline");
        $("section.list footer ul li a:eq(2)").addClass("now");
        $("section.list").fadeIn(_fadeTime);
        TweenMax.fromTo($("section.list header .back"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list header .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list footer"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .marvellouslist ul li:eq(0) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.2
        });
        TweenMax.fromTo($("section.list .marvellouslist ul li:eq(1) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .marvellouslist ul li:eq(2) span"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.6
        })
    },
    liyucashPage: function() {
        $("section").hide();
        $("section.list .liyucash").show();
        $("section.list header .liyuMenu a").removeClass("now");
        $("section.list header .liyuMenu a:eq(0)").addClass("now");
        $("section.list header .liyuMenu").show();
        $("section.list footer ul li a:eq(0)").addClass("now");
        $("section.list").fadeIn(_fadeTime);
        TweenMax.fromTo($("section.list header .back"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list header .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list footer"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .liyucash .title"), 0.6, {
            marginTop: "-20px",
            opacity: 0
        }, {
            marginTop: "0",
            opacity: 1,
            delay: 0.2
        });
        TweenMax.fromTo($("section.list .liyucash ul li:eq(0) span"), 0.6, {
            width: "0",
            opacity: 0
        }, {
            width: "50%",
            opacity: 1,
            delay: 0.2
        });
        TweenMax.fromTo($("section.list .liyucash ul li:eq(1) span"), 0.6, {
            width: "0",
            opacity: 0
        }, {
            width: "50%",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .liyucash ul li:eq(2) span"), 0.6, {
            width: "0",
            opacity: 0
        }, {
            width: "50%",
            opacity: 1,
            delay: 0.6
        })
    },
    liyudiscountPage: function() {
        $("section").hide();
        $("section.list .liyudiscount").show();
        $("section.list header .liyuMenu a").removeClass("now");
        $("section.list header .liyuMenu a:eq(1)").addClass("now");
        $("section.list header .liyuMenu").show();
        $("section.list footer ul li a:eq(0)").addClass("now");
        $("section.list").fadeIn(_fadeTime);
        TweenMax.fromTo($("section.list header .back"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list header .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list footer"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .liyudiscount ul li:eq(0) span"), 0.6, {
            width: "0",
            opacity: 0
        }, {
            width: "50%",
            opacity: 1,
            delay: 0.2
        });
        TweenMax.fromTo($("section.list .liyudiscount ul li:eq(1) span"), 0.6, {
            width: "0",
            opacity: 0
        }, {
            width: "50%",
            opacity: 1,
            delay: 0.4
        })
    },
    liyuintegralPage: function() {
        $("section").hide();
        $("section.list .liyuintegral").show();
        $("section.list header .liyuMenu a").removeClass("now");
        $("section.list header .liyuMenu a:eq(2)").addClass("now");
        $("section.list header .liyuMenu").show();
        $("section.list footer ul li a:eq(0)").addClass("now");
        $("section.list").fadeIn(_fadeTime);
        TweenMax.fromTo($("section.list header .back"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list header .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.list footer"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.list .liyuintegral ul li:eq(0) span"), 0.6, {
            width: "0",
            opacity: 0
        }, {
            width: "50%",
            opacity: 1,
            delay: 0.2
        });
        TweenMax.fromTo($("section.list .liyuintegral ul li:eq(1) span"), 0.6, {
            width: "0",
            opacity: 0
        }, {
            width: "50%",
            opacity: 1,
            delay: 0.4
        })
    },
    infoPage: function(a) {
        "liyucash" != _infoType && "liyudiscount" != _infoType && "liyuintegral" != _infoType || $("section.info footer ul li a:eq(0)").addClass("now");
        "preferlist" == _infoType && ($("section.info footer ul li a:eq(0)").addClass("noline"),
            $("section.info footer ul li a:eq(1)").addClass("now"));
        "marvellouslist" == _infoType && ($("section.info footer ul li a:eq(1)").addClass("noline"),
            $("section.info footer ul li a:eq(2)").addClass("now"));
        $("#scroller").empty();
        var b = "";
        for (x in infoData)
            infoData[x].parentID == a && infoData[x].type == _infoType && (b += infoData[x].info);
        $("#scroller").append(b);
        $("section").hide();
        $("section.info").fadeIn(_fadeTime, function() {
            _myScroll = new IScroll("#wrapper",{
                mouseWheel: !0,
                click: !0
            })
        });
        TweenMax.fromTo($("section.info header .back"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.info header .music"), 0.6, {
            rotation: 0,
            opacity: 0
        }, {
            rotation: "360",
            opacity: 1,
            delay: 0.1
        });
        TweenMax.fromTo($("section.info footer"), 0.6, {
            bottom: "-20px",
            opacity: 0
        }, {
            bottom: "0",
            opacity: 1,
            delay: 0.4
        });
        TweenMax.fromTo($("section.info .info"), 0.6, {
            opacity: 0
        }, {
            opacity: 1,
            delay: 0.4
        })
    },
    reLoadImg: function() {
        this.loadImage("images/ads/line1.jpg");
        for (var a = 1; 5 >= a; a++)
            this.loadImage("images/ads/bg" + a + ".jpg");
        for (a = 1; 6 >= a; a++)
            this.loadImage("images/ads/img" + a + ".png");
        for (a = 1; 3 >= a; a++)
            this.loadImage("images/ads/item" + a + ".png");
        for (a = 1; 3 >= a; a++)
            this.loadImage("images/ads/liyu/list_" + a + ".jpg"),
                this.loadImage("images/ads/liyu/list_txt_" + a + ".png"),
                this.loadImage("images/ads/liyu/liyucash_" + a + ".jpg"),
                this.loadImage("images/ads/liyu/liyucash_txt_" + a + ".png"),
            2 >= a && (this.loadImage("images/ads/liyu/liyudiscount_" + a + ".jpg"),
                this.loadImage("images/ads/liyu/liyudiscount_txt_" + a + ".png"),
                this.loadImage("images/ads/liyu/liyuintegral_" + a + ".jpg"),
                this.loadImage("images/ads/liyu/liyuintegral_txt_" + a + ".png"));
        for (a = 1; 2 >= a; a++)
            this.loadImage("images/ads/teyun/preferlist_" + a + ".jpg"),
                this.loadImage("images/ads/teyun/preferlist_txt_" + a + ".png");
        for (a = 1; 3 >= a; a++)
            this.loadImage("images/ads/jingcai/marvellouslist_" + a + ".jpg"),
                this.loadImage("images/ads/jingcai/marvellouslist_txt_" + a + ".png");
        for (a = 1; 10 >= a; a++)
            this.loadImage("images/ads/liyu/info_" + a + ".jpg")
    },
    loadImage: function(a) {
        var b = new Image;
        b.src = a;
        b.onload = function() {
            _loadingNum++;
            console.log(_loadingNum);
            var a = Math.floor(1.8181 * _loadingNum);
            100 < a && (a = 100);
            $("section.loading .progressNum").text(a + "%")
        }
        ;
        b.onerror = function() {
            _loadingNum++;
            console.log(_loadingNum);
            var a = Math.floor(1.8181 * _loadingNum);
            100 < a && (a = 100);
            $("section.loading .progressNum").text(a + "%")
        }
    },
    fnHide: function() {
        _infoType = "";
        $("section.list").hide();
        $("section.list .liyulist").hide();
        $("section.list .preferlist").hide();
        $("section.list .marvellouslist").hide();
        $("section.list .liyucash").hide();
        $("section.list .liyudiscount").hide();
        $("section.list .liyuintegral").hide();
        $("section.list header .liyuMenu").hide();
        $("section.index .music").css({
            opacity: 0
        });
        $("section.index .logo span").css({
            opacity: 0
        });
        $("section.index .kv").css({
            opacity: 0
        });
        $("section.index .menu a").css({
            opacity: 0
        });
        $("section.list footer ul li a").removeClass("now");
        $("section.list footer ul li a").removeClass("noline");
        $("section.info footer ul li a").removeClass("now");
        $("section.info footer ul li a").removeClass("noline");
        $("section.list header .back").css({
            opacity: 0
        });
        $("section.list header .music").css({
            opacity: 0
        });
        $("section.list footer").css({
            opacity: 0
        });
        $("section.list .liyulist ul li span").css({
            opacity: 0
        });
        $("section.list .preferlist ul li span").css({
            opacity: 0
        });
        $("section.list .marvellouslist ul li span").css({
            opacity: 0
        });
        $("section.list .liyucash ul li span").css({
            opacity: 0
        });
        $("section.list .liyucash .title").css({
            opacity: 0
        });
        $("section.list .liyudiscount ul li span").css({
            opacity: 0
        });
        $("section.list .liyuintegral ul li span").css({
            opacity: 0
        });
        $("section.info header .back").css({
            opacity: 0
        });
        $("section.info header .music").css({
            opacity: 0
        });
        $("section.info footer").css({
            opacity: 0
        });
        $("section.info .info").css({
            opacity: 0
        })
    },
    clearFun: function() {}
};
$(document).ready(function() {
    animationFun.initialization()
});
function setWeiXinShare() {
    var a = encodeURIComponent(location.href.split("#")[0])
        , a = $.param({
            url: a,
            type: "angke"
        });
    $.ajax({
        url: "http://auth.weixinmenu.com/home/index/getShareParam?callback=?",
        dataType: "jsonp",
        data: a,
        success: function(a) {
            "undefined" != a.error ? wx.config({
                appId: a.appId,
                timestamp: a.timestamp,
                nonceStr: a.nonceStr,
                signature: a.signature,
                jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage"]
            }) : alert(a.msg)
        }
    })
}
wx.ready(function() {
    var a = {
        title: _shareTitle,
        desc: _shareInfo,
        link: _shareUrl,
        imgUrl: _shareImg,
        trigger: function(a) {},
        success: function(a) {},
        cancel: function(a) {}
    };
    wx.onMenuShareAppMessage(a);
    wx.onMenuShareTimeline(a)
});
