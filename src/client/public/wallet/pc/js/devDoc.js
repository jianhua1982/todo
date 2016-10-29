/**
 * Created by lover on 2016/5/3.
 */
$("h5").on("click",function(){
    var self=$(this);
    if (self.hasClass("active")){
        self.parent().children("div").hide();
        self.removeClass("active");
    }else{
       if($(".active")){
           $(".active").siblings("div").hide();
           $(".active").removeClass("active");
       }
        self.parent().children("div").show();
        self.addClass("active");
    }
});
