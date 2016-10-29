/**
 * Created by cup on 16/5/20.
 */


requirejs([SdkDemo.upsdkDotJS], function(sdk) {
    SdkDemo.getSignature(function(resp){
        // success
        SdkDemo.setupSdk(resp, sdk);
        SdkDemo.registerClickEvent(sdk);
    });
});
