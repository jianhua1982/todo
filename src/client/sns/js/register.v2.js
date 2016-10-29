/**
 * Created by cup on 16/02/05.
 */

requirejs(["app/common.pay"], function (instance) {
    instance.startPageLoad(function(YZ){
        var commonUI = YZ.Common.UI,
            uploads = [$('.card-front'), $('.card-back'), $('.license-card')];

        YZ.Common.fetchJSSignatureNew(function(wx){
            // 选取商家LOGO.
            $.each(uploads, function(index, item) {
                // 获取图片。
                item.on('click', function(e){
                    var $self = $(this);

                    // 获取图片。
                    wx.chooseImage({
                        count: 1, // 默认9
                        sizeType: ['compressed'], // 'original', 可以指定是原图还是压缩图，默认二者都有
                        //sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                        success: function (res) {
                            var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片s
                            if(localIds && localIds.length) {
                                // Save to local
                                //setImage();
                                var localId = localIds[0],
                                    $img = $self.find('img');

                                $img.attr('src', localId);
                                $img.show();
                            }
                        }
                    });
                });
            });

            //function setImage($parent, localId) {
            //    console.log('localIds[0] = ' + localIds[0]);
            //    item.find('img').attr('src', localIds[0]);
            //}

            $('.register-btn').on('click', function(){
                // upload image to wx server.
                var phone = $("input[name='phone']").val();
                if(!YZ.Common.isValidPhone(phone)) {
                    commonUI.showPopup('手机号码输入不正确, 请检查您的输入!');
                    return;
                }

                var cardFront = $('.card-front img').attr('src'),
                    cardBack = $('.card-Back img').attr('src'),
                    license = $('.license-card img').attr('src');

                //if(!cardFront || !cardBack) {
                //    commonUI.showPopup('身份证正反面都必须拍照才能开通支付功能!');
                //    return;
                //}

                var $self = $(this),
                    serverIds = {};

                $self.attr("disabled", "disabled");

                function uploadImageOneByOne(index, cb) {
                    if (index >= uploads.length) {
                        $.isFunction(cb) && cb();
                        return;
                    }

                    var $img = uploads[index].find('img'),
                        wxImgId = $img.attr('src');

                    if(wxImgId) {
                        wx.uploadImage({
                            localId: wxImgId, // 需要上传的图片的本地ID，由chooseImage接口获得
                            isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: function (res) {
                                var serverId = res.serverId; // 返回图片的服务器端ID
                                //    var $img = item.find('img'),
                                //        localId = $img.attr('src');
                                //
                                //$img.data('serverId', serverId);
                                //serverIds[index] = serverId;
                                serverIds[$img.data('key')] = serverId;

                                // upload the next one to wx server.
                                uploadImageOneByOne(index + 1, cb);
                            }
                        });
                    }
                    else {
                        // set empty str if no image available.
                        //serverIds[index] = 'aa';
                        //serverIds.push('');
                        serverIds[$img.data('key')] = '';

                        // upload the next one to wx server.
                        uploadImageOneByOne(index + 1, cb);
                    }

                }

                uploadImageOneByOne(0, function(){
                    // then send register data to php server.
                    commonUI.showLoading();
//debugger
                    YZ.Common.ajax2BackendByPhp({
                        type: 'POST',
                        action: 'mchntRegister',
                        params: {
                            id: YZ.Pay.requestCommands.Register,
                            "phone": phone,
                            "serverIds": serverIds
                        },
                        success: function (resp) {
                            // login success
                            commonUI.dismiss();
                            commonUI.showToast('材料提交成功，支付渠道申请中...', function(){
                                // set toast time.
                            });
                        },
                        complete: function(){
                            // recover btn status.
                            $self.removeAttr("disabled");
                        }
                    });
                });
            });

        }, null, [
            'chooseImage',
            'uploadImage'
        ]);
    });
});




