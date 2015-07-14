/**
 * 输入框自动补全JS
 * @author lxl
 */
(function($){
    var bigAutocomplete = new function(){
        currentInputText = null;//目前获得光标的输入框（解决一个页面多个输入框绑定自动补全功能）
        this.functionalKeyArray = [9,20,13,16,17,18,91,92,93,45,36,33,34,35,37,39,112,113,114,115,116,117,118,119,120,121,122,123,144,19,145,40,38,27];//键盘上功能键键值数组
        this.holdText = null;//输入框中原始输入的内容
        /**
         * 初始化插入自动补全div，并在document注册mousedown，点击非div区域隐藏div
         */
        this.init = function(){
            $("body").append("<div id='bigAutocompleteContent' class='bigautocomplete-layout'></div>");
            $(document).bind('mousedown',function(event){
                var $target = $(event.target);
                if((!($target.parents().andSelf().is('#bigAutocompleteContent'))) && (!$target.is($(currentInputText)))){
                    bigAutocomplete.hideAutocomplete();
                }
            });

            /**
             * 鼠标悬停时选中当前行
             */
            $("#bigAutocompleteContent").delegate("tr", "mouseover", function() {
                $("#bigAutocompleteContent tr").removeClass("ct");
                $(this).addClass("ct");
            }).delegate("tr", "mouseout", function() {
                $("#bigAutocompleteContent tr").removeClass("ct");
            });

            /**
             * 单击选中行后，选中行内容设置到输入框中，并执行callback函数
             */
            $("#bigAutocompleteContent").delegate("tr", "click", function() {
                $(currentInputText).val( $(this).find("div:last").html());
                var callback_ = $(currentInputText).data("config").callback;
                if($("#bigAutocompleteContent").css("display") != "none" && callback_ && $.isFunction(callback_)){
                    callback_($(this).data("jsonData"));

                }
                bigAutocomplete.hideAutocomplete();
            });

            $("#bigAutocompleteContent").delegate("#removeCookie", "click", function () {
                bigAutocomplete.removeCookie();
            });
        };

        this.autocomplete = function(param){

            if($("body").length > 0 && $("#bigAutocompleteContent").length <= 0){
                bigAutocomplete.init();//初始化信息
            }
            var $this = this;//为绑定自动补全功能的输入框jquery对象

            var $bigAutocompleteContent = $("#bigAutocompleteContent");

            this.config = {
                //width:下拉框的宽度，默认使用输入框宽度
                width:0,
                //url：格式url:""用来ajax后台获取数据，返回的数据格式为data参数一样
                url:null,
                /*data：格式{data:[{title:null,result:{}},{title:null,result:{}}]}
                 url和data参数只有一个生效，data优先*/
                data:null,
                //callback：选中行后按回车或单击时回调的函数
                callback:bigAutocomplete.setCookie
            };
            $.extend(this.config,param);

            $this.data("config",this.config);

            /**
             * 输入框keydown事件
             */
            $this.keydown(function(event) {
                var node = event.currentTarget;
                switch (event.keyCode) {
                    case 40://向下键

                        if($bigAutocompleteContent.css("display") == "none")return;

                        var $nextSiblingTr = $bigAutocompleteContent.find(".ct");
                        if($nextSiblingTr.length <= 0){//没有选中行时，选中第一行
                            $nextSiblingTr = $bigAutocompleteContent.find("tr:first");
                        }else{
                            $nextSiblingTr = $nextSiblingTr.next();
                        }
                        $bigAutocompleteContent.find("tr").removeClass("ct");

                        if($nextSiblingTr.length > 0){//有下一行时（不是最后一行）
                            $nextSiblingTr.addClass("ct");//选中的行加背景
                            $(node).val($nextSiblingTr.find("div:last").html());//选中行内容设置到输入框中

                            //div滚动到选中的行,jquery-1.6.1 $nextSiblingTr.offset().top 有bug，数值有问题
                            $bigAutocompleteContent.scrollTop($nextSiblingTr[0].offsetTop - $bigAutocompleteContent.height() + $nextSiblingTr.height() );

                        }else{
                            $(node).val(bigAutocomplete.holdText);//输入框显示用户原始输入的值
                        }

                        break;
                    case 38://向上键
                        if($bigAutocompleteContent.css("display") == "none")return;

                        var $previousSiblingTr = $bigAutocompleteContent.find(".ct");
                        if($previousSiblingTr.length <= 0){//没有选中行时，选中最后一行行
                            $previousSiblingTr = $bigAutocompleteContent.find("tr:last");
                        }else{
                            $previousSiblingTr = $previousSiblingTr.prev();
                        }
                        $bigAutocompleteContent.find("tr").removeClass("ct");

                        if($previousSiblingTr.length > 0){//有上一行时（不是第一行）
                            $previousSiblingTr.addClass("ct");//选中的行加背景
                            $(node).val($previousSiblingTr.find("div:last").html());//选中行内容设置到输入框中

                            //div滚动到选中的行,jquery-1.6.1 $$previousSiblingTr.offset().top 有bug，数值有问题
                            $bigAutocompleteContent.scrollTop($previousSiblingTr[0].offsetTop - $bigAutocompleteContent.height() + $previousSiblingTr.height());
                        }else{
                            $(node).val(bigAutocomplete.holdText);//输入框显示用户原始输入的值
                        }

                        break;
                    case 27://ESC键隐藏下拉框

                        bigAutocomplete.hideAutocomplete();
                        break;
                }
            });

            /**
             * 输入框keyup事件
             */
            $this.keyup(function(event) {
                var k = event.keyCode;
                var node = event.currentTarget;
                var ctrl = event.ctrlKey;
                var isFunctionalKey = false;//按下的键是否是功能键
                for(var i=0;i<bigAutocomplete.functionalKeyArray.length;i++){
                    if(k == bigAutocomplete.functionalKeyArray[i]){
                        isFunctionalKey = true;
                        break;
                    }
                }
                //k键值不是功能键或是ctrl+c、ctrl+x时才触发自动补全功能
                if(!isFunctionalKey && (!ctrl || (ctrl && k == 67) || (ctrl && k == 88)) ){
                    var config = $(node).data("config");

                    var offset = $(node).offset();
                    if(config.width <=0){
                        config.width  = $(node).outerWidth() - 2
                    }
                    $bigAutocompleteContent.width(config.width);
                    var h = $(node).outerHeight() - 1;
                    $bigAutocompleteContent.css({"top":offset.top + h,"left":offset.left});

                    var data = config.data;
                    var url = config.url;
                    var keyword_ = $.trim($(node).val());
                    if(keyword_ == null || keyword_ == ""){
                        bigAutocomplete.getCookie();
                        //bigAutocomplete.hideAutocomplete();
                        return;
                    }
                    if(data != null && $.isArray(data) ){
                        var data_ = new Array();
                        for(var i=0;i<data.length;i++){
                            if(data[i].title.indexOf(keyword_) > -1){
                                data_.push(data[i]);
                            }
                        }
                        makeContAndShow(data_);
                    }else if(url != null && url != ""){//ajax请求数据
                        $.post(url,{keyword:keyword_},function(result){
                            makeContAndShow(result.data)
                        },"json")
                    }
                    bigAutocomplete.holdText = $(node).val();
                }
                //回车键
                if(k == 13){
                    var callback_ = $(node).data("config").callback;
                    if($bigAutocompleteContent.css("display") != "none"){
                        if(callback_ && $.isFunction(callback_)){
                            callback_($bigAutocompleteContent.find(".ct").data("jsonData"));
                        }
                        $bigAutocompleteContent.hide();
                    }
                }
            });
            /**
             * 输入框click事件
             */
            $this.click(function(event) {
                var node = event.currentTarget;
                var keyword_ = $.trim($(node).val());
                if(keyword_ == null || keyword_ == ""){
                    /** 当输入框中没有文字的时候，显示缓存的数据 **/
                    bigAutocomplete.getCookie();
                }
            });


            /**
             * 组装下拉框html内容并显示
             * @param data_
             */
            function makeContAndShow(data_){
                if(data_ == null || data_.length <=0 ){
                    return;
                }

                var cont = "<table><tbody>";
                for(var i=0;i<data_.length;i++){
                    cont += "<tr><td><div>" + data_[i].title + "</div></td></tr>"
                }
                cont += "</tbody></table>";
                $bigAutocompleteContent.html(cont);
                $bigAutocompleteContent.show();

                //每行tr绑定数据，返回给回调函数
                $bigAutocompleteContent.find("tr").each(function(index){
                    $(this).data("jsonData",data_[index]);
                })
            }

            /**
             * 输入框focus事件
             */
            $this.focus(function(event){
                currentInputText = event.currentTarget;
            });

        };
        /**
         * 隐藏下拉框
         */
        this.hideAutocomplete = function(){
            var $bigAutocompleteContent = $("#bigAutocompleteContent");
            if($bigAutocompleteContent.css("display") != "none"){
                $bigAutocompleteContent.find("tr").removeClass("ct");
                $bigAutocompleteContent.hide();
            }
        };
        /**
         * 选中行后按回车或单击时回调的函数
         * @param result
         */
        this.setCookie = function(result){
            if (!result) {
                return ;
            }
            //查询cookie 数组存在，如果存在就不插入，反之，追加。
            var cookie_arr       = {};
            var obj              = {};
            var same_flag        = 0;
            var cookie_json;
            var cookie_data;
            var cookie_json_data = $.cookie('cookie_data');
            if (cookie_json_data == null || cookie_json_data == "") {
                //设置cookie
                cookie_arr['id']    = result.id;
                cookie_arr['title'] = result.title;
                var c_count = 0;
                obj['c_'+c_count] = cookie_arr;
                cookie_json = bigAutocomplete.jsonArray(obj);
                $.cookie('cookie_data',cookie_json);
            } else {
                //如果存在就插入 反之，追加
                cookie_data = JSON.parse(cookie_json_data);
                jQuery.each(cookie_data, function(i, val) {
                    if(cookie_data[i].id != result.id) {
                        //追加
                        same_flag = same_flag+1;
                    }else{
                        //不做处理
                        same_flag = 0;
                        return false;
                    }
                });
                if(same_flag>0){
                    //追加
                    var obj_count = 0;
                    var i;
                    for (i in cookie_data) {
                        if (cookie_data.hasOwnProperty(i)) {
                            obj_count++;
                        }
                    }
                    cookie_arr['id']    = result.id;
                    cookie_arr['title'] = result.title;
                    cookie_data['c_'+obj_count] = cookie_arr;
                    cookie_json = bigAutocomplete.jsonArray(cookie_data);
                    $.cookie('cookie_data',cookie_json);
                }
            }
            bigAutocomplete.jumpServer(result);
        };
        /**
         * 将对象转成json数组
         * @param obj
         * @returns {*}
         */
        this.jsonArray = function(obj){
            var seen = [];
            var json = JSON.stringify(obj, function(key, value){
                if (typeof value === 'object') {
                    if ( !seen.indexOf(value) ) {
                        return '__cycle__' + (typeof value) + '[' + key + ']';
                    }
                    seen.push(value);
                }
                return value;
            }, 4);
            return json;
        };
        /**
         * 清除所有Cookie
         */
        this.removeCookie = function(){
            $.cookie('cookie_data',null);
            $("#bigAutocompleteContent").hide();
        };
        /**
         * 读取Cookie中的值
         */
        this.getCookie = function(){
            var data_cookie_json = $.cookie('cookie_data');
            if(data_cookie_json) {
                var data_cookie = JSON.parse(data_cookie_json);
                var cont = "<table><tbody>";
                jQuery.each(data_cookie, function(i, val) {
                    cont += "<tr><td><div>" + val.title + "</div></td></tr>";
                });
                cont += "</tbody></table>";
                cont += "<div id='removeCookie' style='text-align: center; cursor: pointer;'>清除全部缓存</div>";
            } else {
                var cont = "<div style='text-align: center; cursor: pointer;'>赶快搜索吧~</div>";
            }
            var node = event.currentTarget;
            var config = $(node).data("config");

            var offset = $(node).offset();
            if (config.width <= 0) {
                config.width = $(node).outerWidth() - 2
            }
            var $bigAutocompleteContent = $("#bigAutocompleteContent");
            $bigAutocompleteContent.width(config.width);
            var h = $(node).outerHeight() - 1;
            $bigAutocompleteContent.css({"top": offset.top + h, "left": offset.left});

            $bigAutocompleteContent.html(cont);
            $bigAutocompleteContent.show();

            if(data_cookie_json) {
                //每行tr绑定数据，返回给回调函数
                var data_cookie = JSON.parse(data_cookie_json);
                $bigAutocompleteContent.find("tr").each(function(index){
                    var idx = 'c_'+index;
                    $(this).data("jsonData",data_cookie[idx]);
                })
            }

            var tr_len = $("#bigAutocompleteContent tr").length;
            if (tr_len > 4) {
                $("#bigAutocompleteContent").css('max-height','110px');
                $("#bigAutocompleteContent").css('overflow-y','scroll');
            }
        };
        /**
         * 设置跳转到服务器端页面
         * @param result
         */
        this.jumpServer = function(result){
            alert('在这里设置页面跳转服务端页面 传值?title='+result.title+'&id='+result.id);
        };
    };
    $.fn.bigAutocomplete = bigAutocomplete.autocomplete;

})(jQuery);