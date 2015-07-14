(function($){
    var bigAutocomplete;
    bigAutocomplete = new function () {
        currentInputText = null;
        this.functionalKeyArray = [9, 20, 13, 16, 17, 18, 91, 92, 93, 45, 36, 33, 34, 35, 37, 39, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 19, 145, 40, 38, 27];
        this.holdText = null;
        this.holdCommunityId = 0;
        this.FirstCommunityName = null;
        this.FirstCommunityId = null;

        //初始化插入自动补全div，并在document注册mousedown，点击非div区域隐藏div
        this.init = function () {
            $("body").append("<div id='bigAutocompleteContent' class='option getData input-group-btn'></div>");

            $(document).bind('mousedown', function (event) {
                var $target = $(event.target);
                if ((!($target.parents().andSelf().is('#bigAutocompleteContent'))) && (!$target.is($(currentInputText)))) {
                    bigAutocomplete.hideAutocomplete();
                }
            });

            //鼠标悬停时选中当前行
            $("#bigAutocompleteContent").delegate("a", "mouseover", function () {
                $("#bigAutocompleteContent a").removeClass("ct");
                $(this).addClass("ct");
            }).delegate("tr", "mouseout", function () {
                $("#bigAutocompleteContent a").removeClass("ct");
            });

            //单击选中行后，选中行内容设置到输入框中，并执行callback函数
            $("#bigAutocompleteContent").delegate("a", "click", function () {
                $(currentInputText).val($(this).html().replace(/<[^>]+>/g, ""));
                $(currentInputText).attr('community_id', $(this).attr('community_id'));
                var config_data = $(currentInputText).data("config");
                if (config_data) {
                    var callback_ = $(currentInputText).data("config").callback;
                } else {
                    var callback_ = null;
                }
                if ($("#bigAutocompleteContent").css("display") != "none" && callback_ && $.isFunction(callback_)) {
                    callback_($(this).data("jsonData"));

                }
                //bigAutocomplete.hideNoData();
                bigAutocomplete.hideAutocomplete();
                //bigAutocomplete.searchData($(this).attr('community_id'),$(this).html().replace(/<[^>]+>/g, ""));
            });

            $("#bigAutocompleteContent").delegate("#removeCookie", "click", function () {
                bigAutocomplete.removeCooike();
            });
            $("#bigAutocompleteContent").delegate("#removeCookie", "mouseover", function () {
                $("#bigAutocompleteContent").find("a").removeClass("ct");
            });
        };

        this.autocomplete = function (param) {
            if ($("body").length > 0 && $("#bigAutocompleteContent").length <= 0) {
                bigAutocomplete.init();//初始化信息
            }
            var $this = this; //为绑定自动补全功能的输入框jquery对象

            var $bigAutocompleteContent = $("#bigAutocompleteContent");

            this.config = {
                width: 0,
                url: null,
                data: null,
                callback: null
            };
            $.extend(this.config, param);

            $this.data("config", this.config);

            //输入框keydown事件
            $this.keydown(function (event) {
                var node = event.currentTarget;
                switch (event.keyCode) {
                    case 40://向下键
                        if ($bigAutocompleteContent.css("display") == "none")return;

                        var $nextSiblingTr = $bigAutocompleteContent.find(".ct");
                        if ($nextSiblingTr.length <= 0) {//没有选中行时，选中第一行
                            $nextSiblingTr = $bigAutocompleteContent.find("a:first");
                        } else {
                            $nextSiblingTr = $nextSiblingTr.next();
                        }
                        $bigAutocompleteContent.find("a").removeClass("ct");
                        if ($nextSiblingTr.length > 0) { //有下一行时（不是最后一行）
                            $nextSiblingTr.addClass("ct");//选中的行加背景
                            $(node).val($nextSiblingTr.html().replace(/<[^>]+>/g, "")); //选中行内容设置到输入框中
                            $(node).attr('community_id', $nextSiblingTr.attr('community_id'));
                            $bigAutocompleteContent.scrollTop($nextSiblingTr[0].offsetTop - $bigAutocompleteContent.height() + $nextSiblingTr.height());

                        } else {
                            $(node).val(bigAutocomplete.holdText);//输入框显示用户原始输入的值
                            $(node).attr('community_id', bigAutocomplete.holdCommunityId);
                        }
                        break;
                    case 38://向上键
                        if ($bigAutocompleteContent.css("display") == "none")return;

                        var $previousSiblingTr = $bigAutocompleteContent.find(".ct");
                        if ($previousSiblingTr.length <= 0) {//没有选中行时，选中最后一行
                            $previousSiblingTr = $bigAutocompleteContent.find("a:last");
                        } else {
                            $previousSiblingTr = $previousSiblingTr.prev();
                        }
                        $bigAutocompleteContent.find("a").removeClass("ct");

                        if ($previousSiblingTr.length > 0) {//有上一行时（不是第一行）
                            $previousSiblingTr.addClass("ct");//选中的行加背景
                            $(node).val($previousSiblingTr.html().replace(/<[^>]+>/g, ""));//选中行内容设置到输入框中
                            $(node).attr('community_id', $previousSiblingTr.attr('community_id'));

                            $bigAutocompleteContent.scrollTop($previousSiblingTr[0].offsetTop - $bigAutocompleteContent.height() + $previousSiblingTr.height());
                        } else {
                            $(node).val(bigAutocomplete.holdText);//输入框显示用户原始输入的值
                            $(node).attr('community_id', bigAutocomplete.holdCommunityId);
                        }

                        break;
                    case 27://ESC键隐藏下拉框

                        bigAutocomplete.hideAutocomplete();
                        break;
                }
            });
            //输入框click时间
            $this.click(function(event){
                var data_cookie_json = $.cookie('cookie_data');
                if(data_cookie_json){
                    var data_cookie = JSON.parse(data_cookie_json);
                    var a_html = "<ul class='dropdown-menu'><li>";

                    jQuery.each(data_cookie, function(i, val) {
                            a_html += "<a href='javascript:void(0)' community_id='" + val.c_id + "'>" + val.c_name + "</a>";
                    });
                    a_html += "</li></ul>";
                    //a_html += "<span id='removeCookie' style='width:458px; cursor: pointer; height:61px; line-height:61px; text-align:center; float:left;' class='ct'>清空历史记录</span>";

                    var node = event.currentTarget;
                    var config = $(node).data("config");

                    var offset = $(node).offset();
                    if (config.width <= 0) {
                        config.width = $(node).outerWidth() - 2 + 11
                    }
                    $bigAutocompleteContent.width(config.width);
                    var h = $(node).outerHeight() - 1;
                    $bigAutocompleteContent.css({"top": offset.top + h + 21, "left": offset.left - 11});
                    $bigAutocompleteContent.html(a_html);

                    var a_len = $("#bigAutocompleteContent a").length;
                    if (a_len > 5) {
                        $("#bigAutocompleteContent").css('max-height','367px');
                        $("#bigAutocompleteContent").css('overflow-y','scroll');
                    }

                    $bigAutocompleteContent.show();
                }
            });
            //输入框keyup事件
            $this.keyup(function (event) {
                var k = event.keyCode;
                var node = event.currentTarget;
                var ctrl = event.ctrlKey;
                var isFunctionalKey = false;//按下的键是否是功能键
                for (var i = 0; i < bigAutocomplete.functionalKeyArray.length; i++) {
                    if (k == bigAutocomplete.functionalKeyArray[i]) {
                        isFunctionalKey = true;
                        break;
                    }
                }
                //k键值不是功能键或是ctrl+c、ctrl+x时才触发自动补全功能
                if (!isFunctionalKey && (!ctrl || (ctrl && k == 67) || (ctrl && k == 88))) {
                    var config = $(node).data("config");

                    var offset = $(node).offset();
                    if (config.width <= 0) {
                        config.width = $(node).outerWidth() - 2 + 11
                    }
                    $bigAutocompleteContent.width(config.width);
                    var h = $(node).outerHeight() - 1;
                    $bigAutocompleteContent.css({"top": offset.top + h + 21, "left": offset.left - 11});

                    var data = config.data;
                    var url = config.url;
                    var keyword_ = $.trim($(node).val());
                    if (keyword_ == null || keyword_ == "") {
                        bigAutocomplete.showStartMsg();
                        bigAutocomplete.hideAutocomplete();
                        return;
                    }
                    if (data != null && $.isArray(data)) {
                        var data_ = new Array();
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].title.indexOf(keyword_) > -1) {
                                data_.push(data[i]);
                            }
                        }

                        makeContAndShow(data_);
                    } else if (url != null && url != "") {//ajax请求数据
                        var token = $("#token").val();
                        var city_id = $(".selectCityId").val();
                        var city_name = $(".city_name").val();
                        $.post(url, {keyword: keyword_, city_id: city_id, city_name: city_name,_csrf: token}, function (result) {
                            makeContAndShow(result.data)
                        }, "json")
                    }


                    bigAutocomplete.holdText = $(node).val();
                    $(node).attr('community_id', bigAutocomplete.holdCommunityId);
                    bigAutocomplete.showSearchMsg();
                }

                //回车键
                if (k == 13) {
                    var callback_ = $(node).data("config").callback;
                    if ($bigAutocompleteContent.css("display") != "none") {
                        if (callback_ && $.isFunction(callback_)) {
                            callback_($bigAutocompleteContent.find(".ct").data("jsonData"));
                        }
                        $bigAutocompleteContent.hide();
                    }
                    if($(node).attr('community_id')=='0'){
                        bigAutocomplete.searchData(bigAutocomplete.FirstCommunityId,bigAutocomplete.FirstCommunityName);
                    } else {
                        bigAutocomplete.searchData($(node).attr('community_id'),$(node).val());
                    }
                }
                if (k == 8) {
                    if($(node).val()==''){
                        $(".getData").hide();
                        bigAutocomplete.showStartMsg();
                    }
                }

            });

            //组装下拉框html内容并显示
            function makeContAndShow(data_) {
                //if (data_ == null || data_.length <= 0) {
                //    bigAutocomplete.showNoMsg();
                //    return;
                //}
                //bigAutocomplete.hideNoData();

                var cont = "<ul class='dropdown-menu'>";
                for (var i = 0; i < data_.length; i++) {
                    cont += "<li><a href='javascript:void(0)' community_id='" + data_[i].community_id + "'>" + data_[i].title + "</a></li>"
                }
                cont += "</ul>";
                $bigAutocompleteContent.html(cont);
                $bigAutocompleteContent.show();

                //bigAutocomplete.FirstCommunityId = data_[0].community_id;
                //bigAutocomplete.FirstCommunityName = data_[0].title.replace(/<[^>]+>/g, "");

                //$(".selectCname").val(bigAutocomplete.FirstCommunityName);
                //$(".selectCid").val(bigAutocomplete.FirstCommunityId);

                //option绑定数据，返回给回调函数
                $bigAutocompleteContent.find(".option").each(function (index) {
                    $(this).data("jsonData", data_[index]);
                })
            }


            //输入框focus事件
            $this.focus(function (event) {
                currentInputText = event.currentTarget;
            });

        };

        this.hideAutocomplete = function () {
            var $bigAutocompleteContent = $("#bigAutocompleteContent");
            if ($bigAutocompleteContent.css("display") != "none") {
                $bigAutocompleteContent.hide();
            }
        };

        this.searchData = function (c_id,c_name) {
            var city_id = $(".selectCityId").val();
            if(c_id && c_name){
                //设置cookie
                //bigAutocomplete.setCookie(c_id,c_name);
                //var url = '/shop?c_info='+encodeURIComponent(c_id+'||'+c_name);
                //window.location.href=url;
            } else {
                return false;
            }
            //c_id     小区id
            //c_name   小区名称
            //city_id  城市id
        };
        this.showStartMsg = function() {
            $(".noData").show();
            $(".startMsg").show();
            $(".searchMsg").hide();
            $(".noMsg").hide();
        };
        this.showSearchMsg = function() {
            $(".noData").show();
            $(".startMsg").hide();
            $(".searchMsg").show();
            $(".noMsg").hide();
        };
        this.showNoMsg = function() {
            $(".noData").show();
            $(".startMsg").hide();
            $(".searchMsg").hide();
            $(".noMsg").show();
        };
        this.hideNoData = function() {
            $(".noData").hide();
        };
        this.setCookie = function(c_id,c_name) {
            //1. 查询cookie 数组存在，如果存在就不插入，反之，追加。
            //$.cookie('cookie_data',null);
            var cookie_json_data = null;
            cookie_json_data = $.cookie('cookie_data');
            var cookie_data;
            var same_flag = 0;
            var cookie_arr={};
            var obj = {};
            var cookie_json;
            if(cookie_json_data!==null){
                cookie_data = JSON.parse(cookie_json_data);
                jQuery.each(cookie_data, function(i, val) {
                    if(cookie_data[i].c_id != c_id) {
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
                    cookie_arr['c_id'] = c_id;
                    cookie_arr['c_name'] = c_name;
                    cookie_data['c_'+obj_count] = cookie_arr;
                    cookie_json = bigAutocomplete.jsonArray(cookie_data);
                    $.cookie('cookie_data',cookie_json);
                }
            }else{
                //设置cookie
                cookie_arr['c_id'] = c_id;
                cookie_arr['c_name'] = c_name;
                var c_count = 0;
                obj['c_'+c_count] = cookie_arr;
                cookie_json = bigAutocomplete.jsonArray(obj);
                $.cookie('cookie_data',cookie_json);
            }
        };
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
        this.removeCooike = function(){
            $.cookie('cookie_data',null);
            $("#bigAutocompleteContent").hide();
            bigAutocomplete.hideNoData();
        }
    };
	$.fn.bigAutocomplete = bigAutocomplete.autocomplete;
	
})(jQuery);