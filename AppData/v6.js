Array.prototype.contains = function (item) {
    return RegExp(item).test(this);
};

if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

ContentScript = {
    txn_mode_check_item: new Array('WPB', 'WPE', 'WB', 'WE', 'PB', 'PE', 'FCB', 'FCE', 'PFTB', 'PFTE', 'QB', 'QE', 'QPB', 'QPE', 'DEmr', 'DBmr'),
    Hadtxn_mode_check_item: new Array('WPB', 'WPE', 'WB', 'WE', 'PB', 'PE', 'FCB', 'FCE', 'PFTB', 'PFTE', 'QB', 'QE', 'QPB', 'QPE'),
    WPTypeCheck_Item: new Array('WPB', 'WPE', 'WB', 'WE', 'PB', 'PE'),
    urlX: "http://" + window.location.host,
    needAjaxCount: [],
    timerWithOrderClock: null,
    timerCountPageEatAndBet: null,
    StaticAllData: [],
    AlertMsg: "请输入密码",
    AlertPassToLater: "软件过期",
    PassError: "密码错误",
    SinglePath: false,
    StaticOldAllData: [],
    StaticCountShowData: [],
    StaticOldCountShowData: [],
    HelloKitty: "81dc9bdb52d04dc20036dbd8313ed055",
    HelloKittyTime: ["212112eece862ca4a3da112f217288fb", "519edc8db508d1c088f793f2c3647e6f"],
    DaoQiTime: "YYYY-MM-DD",
    PageConfig: {
        MaxCount: 90,
        Discount: 80,
        LimitStart: 700,
        LimitEnd: 700,
        Percent: 1
    },
    showCountWithWhere: function () {
        ContentScript.StaticOldCountShowData = ContentScript.StaticCountShowData;
        ContentScript.StaticCountShowData = ContentScript.GetAllHadTransactionData();
        if (JSON.stringify(ContentScript.StaticOldCountShowData) != JSON.stringify(ContentScript.StaticCountShowData)) {
            ContentScript.showCountPageEatAndBet();
        }
    },
    setLimitAndDiscount: function () {
        var withType = $("input[name='orderType']:checked").val();
        if ("WP" == withType) {
            $("#MaxCount").val(90);
            $("#Discount1").val(82);
            $("#LimitStart1").val(240);
            $("#LimitEnd1").val(60);

            $("#Discount2").val(82);
            $("#LimitStart2").val(240);
            $("#LimitEnd2").val(60);
        }
        if ("QP" == withType) {
            $("#MaxCount").val(90);
            $("#Discount1").val(80);
            $("#LimitStart1").val(400);
            $("#LimitEnd1").val(400);

            $("#Discount2").val(80);
            $("#LimitStart2").val(400);
            $("#LimitEnd2").val(400);
        }
        if ("Q" == withType) {
            $("#MaxCount").val(90);
            $("#Discount1").val(80);
            $("#LimitStart1").val(700);
            $("#LimitEnd1").val(700);

            $("#Discount2").val(80);
            $("#LimitStart2").val(700);
            $("#LimitEnd2").val(700);
        }
    },
    showCountPageEatAndBet: function () {
        var CheckType = [];
        var withType = $("input[name='orderType']:checked").val();
        var eat = 0;
        var bet = 0;
        var betIds = [];
        var eatIds = [];
        if ("WP" == withType) {
            CheckType = ['WPB', 'WPE', 'WB', 'WE', 'PB', 'PE']
        }
        if ("QP" == withType) {
            CheckType = ['FCB', 'FCE', 'PFTB', 'PFTE', 'QB', 'QE', 'QPB', 'QPE']
        }
        if ("Q" == withType) {
            CheckType = ['FCB', 'FCE', 'QB', 'QE']
        }

        $(ContentScript.StaticCountShowData).each(function (i) {
            if (CheckType.contains($(this)[0].type)) {
                if ($(this)[0].type.indexOf("B") >= 0 && !betIds.contains($(this)[0].id)) {
                    bet++;
                    betIds.push($(this)[0].id);
                }
                if ($(this)[0].type.indexOf("E") >= 0 && !eatIds.contains($(this)[0].id)) {
                    eat++;
                    eatIds.push($(this)[0].id);
                }
            }
        })
        $("#eatCount").text(eat);
        $("#betCount").text(bet);

    },
    GetAllEatTransactionData: function () {
        var result = [];
        var allData = ContentScript.GetAllTransactionData();
        $(allData).each(function (i) {
            if ($(this)[0].type.indexOf("E") >= 0 && $(this)[0].type != 'DEmr') {
                result.push($(this)[0]);
            }
        });
        return result;
    },
    GetAllBetTransactionData: function () {
        var result = [];
        var allData = ContentScript.GetAllTransactionData();
        $(allData).each(function (i) {
            if ($(this)[0].type.indexOf("B") >= 0 && $(this)[0].type != 'DBmr') {
                result.push($(this)[0]);
            }
        });
        return result;
    },
    GetAllDBmrTransactionData: function () {
        var result = [];
        var allData = ContentScript.GetAllTransactionData();
        $(allData).each(function (i) {
            if ($(this)[0].type.indexOf("DBmr") >= 0) {
                var item = $(this)[0];
                if ($(this)[0].t.indexOf("/") > 0) {
                    item.type = "WPB";
                }
                if ($(this)[0].fb.indexOf("-") > 0) {
                    item.type = "QB";
                }
                result.push(item);
            }
        });
        return result;
    },
    GetAllDEmrTransactionData: function () {
        var result = [];
        var allData = ContentScript.GetAllTransactionData();
        $(allData).each(function (i) {
            if ($(this)[0].type.indexOf("DEmr") >= 0) {
                var item = $(this)[0];
                if ($(this)[0].t.indexOf("/") > 0) {
                    item.type = "WPE";
                }
                if ($(this)[0].fb.indexOf("-") > 0) {
                    item.type = "QE";
                }
                result.push(item);
            }
        });
        return result;
    },
    Request: function (paras) {
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {}
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        var returnValue = paraObj[paras.toLowerCase()];
        if (typeof (returnValue) == "undefined") {
            return "";
        } else {
            return returnValue;
        }
    },
    GetSignInInfo: function () {
        var url = window.location.href;
        var siteType = ""
        if (url.indexOf("ctb988.com") >= 0) {
            siteType = "com";
        } else {
            siteType = "net"
        }
        var urlValue = window.location.pathname;
        var paramList = window.location.search.split("?")[1];
        var RaceType = $("input[name='race_type']").val();
        var RaceDate = $("input[name='race_date']").val();
        var Sml = "s";
        var loginuser = $.trim($("#username").text());
        var result = { "id": siteType + urlValue + RaceType + RaceDate + loginuser, "url": urlValue, "loginuser": loginuser, "RaceType": RaceType, "RaceDate": RaceDate, "Sml": Sml, "SiteType": siteType };
        return result;
    },
    setSessionValue: function (val) {
        var signInfo = ContentScript.GetSignInInfo();
        var itemName = "ds" + signInfo.RaceType + signInfo.RaceDate.replace("-", "").replace("-", "");
        localStorage.setItem(itemName, JSON.stringify(val));
    },
    getSessionValue: function () {
        var signInfo = ContentScript.GetSignInInfo();
        var itemName = "ds" + signInfo.RaceType + signInfo.RaceDate.replace("-", "").replace("-", "");
        return $.parseJSON(localStorage.getItem(itemName));
    },
    MaxCountEvent: function () {
        try {
            ContentScript.PageConfig.MaxCount = $("#MaxCount").val();
        } catch (e) {
            ContentScript.PageConfig.MaxCount = 90;
            $("#MaxCount").val(90);
        }

        var type = $("input[name='DiscountType']:checked").val();

        try {
            if (type == "F1") {
                ContentScript.PageConfig.Discount = $("#Discount1").val();
            } else {
                ContentScript.PageConfig.Discount = $("#Discount2").val();
            }
        } catch (e) {
            ContentScript.PageConfig.Discount = 80;
            $("#Discount").val(80);
        }

        try {
            if (type == "F1") {
                ContentScript.PageConfig.LimitStart = $("#LimitStart1").val();
            } else {
                ContentScript.PageConfig.LimitStart = $("#LimitStart2").val();
            }
        } catch (e) {
            ContentScript.PageConfig.LimitStart = 700;
            $("#LimitStart").val(700);
        }

        try {
            if (type == "F1") {
                ContentScript.PageConfig.LimitEnd = $("#LimitEnd1").val();
            } else {
                ContentScript.PageConfig.LimitEnd = $("#LimitEnd2").val();
            }
        } catch (e) {
            ContentScript.PageConfig.LimitEnd = 700;
            $("#LimitEnd").val(700);
        }

        ContentScript.PageConfig.Percent = $("#Percent").val();
    },
    onInit: function () {
        ContentScript.allOnitEvent();
    },
    PrecentChangeEvent: function () {
        $("#Percent").bind("change", function () {
            if ($("#Percent").val() == 1 || $("#Percent").val() == "1") {
                $("#btnBanlance").show();
            } else {
                $("#btnBanlance").hide();
            }
            ContentScript.PageConfig.Percent = $("#Percent").val();
        });
    },
    allOnitEvent: function () {
        //创建用户界面
        ContentScript.CreateHtmlElement();
        //绑定拖拽事件
        ContentScript.HtmlAddDragEvent();
        $("#daoqitime").text(ContentScript.DaoQiTime);
        //限制投注数
        ContentScript.MaxCountEvent();
        //多倍控制
        ContentScript.PrecentChangeEvent();
        //统计吃票的计时器
        ContentScript.timerCountPageEatAndBet = self.setInterval(function () { ContentScript.showCountWithWhere() }, 1000);

        $("#btnEnd").hide();
        $("input[name='orderType']").bind("click", function () {
            ContentScript.showCountPageEatAndBet();
            ContentScript.setLimitAndDiscount();
        });
        //删单
        $("#btnEatDelete").bind("click", function () {
            $(this).hide();
            var isExists = $(window.frames["frmTRANS"].document).find(".del2_ch");
            if (isExists != null && isExists != undefined) {
                $(window.frames["frmTRANS"].document).find(".del2_ch").last().click();
            }
            $(this).show();
        });

        $("#btnBetDelete").bind("click", function () {
            $(this).hide();
            var isExistsDel = $(window.frames["frmTRANS"].document).find(".del_ch");
            if (isExistsDel != null && isExistsDel != undefined) {
                $(window.frames["frmTRANS"].document).find(".del_ch").last().click();
            }
            $(this).show();
        });

        //开始
        $("#btnStart").bind("click", function () {
            ContentScript.SinglePath = false;
            ContentScript.StaticOldAllData = [];
            ContentScript.StaticAllData = [];
            $("#btnStart").hide();
            $("#btnEnd").show();
            ContentScript.MaxCountEvent();
            //创建定时吃票事件
            ContentScript.timerWithOrderClock = self.setInterval(function () {
                var eatCount = $("#eatCount").text();
                if (eatCount == "") {
                    eatCount = 0;
                } else {
                    eatCount = parseInt(eatCount);
                }
                var MaxCount = parseInt($("#MaxCount").val());
                if (eatCount >= MaxCount) {
                    //到达限制数量 删除所有吃单
                    setTimeout(function () {
                        ContentScript.EatButtonEvent();
                    }, 0);
                }
                clearInterval(ContentScript.timerCountPageEatAndBet);
                ContentScript.StaticOldAllData = ContentScript.StaticAllData
                ContentScript.StaticAllData = ContentScript.GetAllHadTransactionData();
                if (JSON.stringify(ContentScript.StaticOldAllData) != JSON.stringify(ContentScript.StaticAllData)) {
                    if (ContentScript.SinglePath) {
                        //nothing
                    } else {
                        ContentScript.StaticCountShowData = ContentScript.StaticAllData;
                        ContentScript.showCountPageEatAndBet();
                        ContentScript.needAjaxCount = ContentScript.getNeedWithOrderList();
                        ContentScript.withOrderOnInit(ContentScript.needAjaxCount, false);
                    }

                }

                var showTitle = "";
                if (window.location.href.indexOf("playerhk.jsp") >= 0) {
                    showTitle = $("#newsLineByLoc").text();
                }
                if (window.location.href.indexOf("Q.jsp") >= 0) {
                    showTitle = $("#news1st").text();
                }

                if (((showTitle.indexOf("进闸完毕") >= 0
                    && showTitle.indexOf("准备开跑") >= 0) || (showTitle.indexOf("剩 1") >= 0))
                    && $("input[id='AutoPingCang']:checked").val() == "1"
                ) {
                    var ret = 0;
                    try {
                        var regexp = /剩 [0-9]+/
                        var firststring = regexp.exec(showTitle);
                        var match = firststring[0].replace("剩", "").replace(" ", "")
                        ret = parseInt(match);
                    } catch (e) {
                        ret = 1
                    }
                    if (ret == 1) {
                        ContentScript.SinglePath = true;
                        //先删除所有没有成交的数据
                        setTimeout(function () {
                            ContentScript.EatButtonEvent();
                        }, 0);
                        setTimeout(function () {
                            ContentScript.BetButtonEvent();
                        }, 0);
                        //然后100%的平仓数据交易
                        setTimeout(function () {
                            ContentScript.withOrderOnInit(ContentScript.getNeedPingCangOrderList(), true);
                        }, 1000);

                        //平仓后结束
                        if (ContentScript.timerWithOrderClock != null) {
                            clearInterval(ContentScript.timerWithOrderClock);
                        }
                        ContentScript.timerWithOrderClock = null;
                        ContentScript.timerCountPageEatAndBet = self.setInterval(function () { ContentScript.showCountWithWhere() }, 1000);
                        $("#btnStart").show();
                        $("#btnEnd").hide();
                    }
                }
                if ((showTitle.indexOf("剩 2") >= 0 || showTitle.indexOf("剩 3") >= 0)
                    && $("input[id='AutoPingCang']:checked").val() == "1"
                ) {
                    //先删除所有没有成交的数据
                    setTimeout(function () {
                        ContentScript.EatButtonEvent();
                    }, 0);
                    ContentScript.SinglePath = true;
                }
            }, 1000);
        });

        //结束
        $("#btnEnd").bind("click", function () {
            if (ContentScript.timerWithOrderClock != null) {
                clearInterval(ContentScript.timerWithOrderClock);
            }
            ContentScript.timerWithOrderClock = null;
            ContentScript.timerCountPageEatAndBet = self.setInterval(function () { ContentScript.showCountWithWhere() }, 1000);
            $("#btnStart").show();
            $("#btnEnd").hide();
        });

        //平仓
        $("#btnBanlance").bind("click", function () {
            if ($("#Percent").val() == 1 || $("#Percent").val() == "1") {
                //平仓后结束
                if (ContentScript.timerWithOrderClock != null) {
                    clearInterval(ContentScript.timerWithOrderClock);
                }
                ContentScript.timerWithOrderClock = null;
                ContentScript.timerCountPageEatAndBet = self.setInterval(function () { ContentScript.showCountWithWhere() }, 1000);
                $("#btnStart").show();
                $("#btnEnd").hide();

                $(this).hide();
                //先删除所有没有成交的数据
                setTimeout(function () {
                    ContentScript.EatButtonEvent();
                }, 0);
                setTimeout(function () {
                    ContentScript.BetButtonEvent();
                }, 0);
                //然后100%的平仓数据交易
                setTimeout(function () {
                    ContentScript.withOrderOnInit(ContentScript.getNeedPingCangOrderList(), true);
                }, 1000);
                $(this).show();
            } else {
                alert("平仓功能只能在倍率是1的情况下使用！");
            }
        });

    },
    checkPingCangHouDataValidation: function () {
        $(window.frames["frmTRANS"].document).find("tbody[id^='DBmr'] tr").each(function (index) {
            if ($($(this).find(".del_ch").parent().parent()).find("td").eq(4).text() != "100") {
                return false;
            }
        });
        return true;
    },
    getNeedWithOrderList: function () {
        var withType = $("input[name='orderType']:checked").val();
        var returnBetList = [];
        var returnEatList = [];
        var returnList = [];
        var CheckType = [];
        if (withType.length > 0) {
            if ("WP" == withType) {
                CheckType = ['WPB', 'WPE', 'WB', 'WE', 'PB', 'PE']
            }
            if ("QP" == withType) {
                CheckType = ['FCB', 'FCE', 'PFTB', 'PFTE', 'QB', 'QE', 'QPB', 'QPE']
            }
            if ("Q" == withType) {
                CheckType = ['FCB', 'FCE', 'QB', 'QE']
            }

            var allList = ContentScript.GetAllTransactionData();
            var notCommitBetList = [];
            var returnEatList = [];

            if ("WP" == withType) {
                var WPBList = [];
                var WPEList = [];
                var WBList = [];
                var WEList = [];
                var PBList = [];
                var PEList = [];
                $(allList).each(function (index) {
                    var temp = $(this)[0];
                    if ($(this)[0].type == "DBmr") {
                        //matches rdfb fb x y t 2 4 5 5 78 0/16
                        if (parseInt($(this)[0].fb) > 0 && parseInt($(this)[0].x) > 0) {
                            temp.type = "WPB";
                            temp.id = temp.matches + temp.rdfb;
                            temp.fb = parseInt(temp.fb) * (-1);
                            temp.x = parseInt(temp.x) * (-1);
                            WPBList.push(temp);
                        }
                        if (parseInt($(this)[0].fb) == 0 && parseInt($(this)[0].x) > 0) {
                            temp.type = "PB";
                            temp.id = temp.matches + temp.rdfb;
                            temp.fb = parseInt(temp.fb) * (-1);
                            temp.x = parseInt(temp.x) * (-1);
                            PBList.push(temp);
                        }
                        if (parseInt($(this)[0].fb) > 0 && parseInt($(this)[0].x) == 0) {
                            temp.type = "WB";
                            temp.id = temp.matches + temp.rdfb;
                            temp.fb = parseInt(temp.fb) * (-1);
                            temp.x = parseInt(temp.x) * (-1);
                            WBList.push(temp);
                        }
                    } else {
                        if (CheckType.contains($(this)[0].type)) {
                            var temp = $(this)[0];
                            //matches rdfb fb x y t 2 4 5 5 78 0/16
                            switch ($(this)[0].type) {
                                case "WPB": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (-1);
                                    temp.x = parseInt(temp.x) * (-1);
                                    WPBList.push(temp);
                                    break;
                                }
                                case "WPE": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (1) * parseInt($("#Percent").val());
                                    temp.x = parseInt(temp.x) * (1) * parseInt($("#Percent").val());
                                    WPEList.push(temp);
                                    break;
                                }
                                case "WB": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (-1);
                                    temp.x = parseInt(temp.x) * (-1);
                                    WBList.push(temp);
                                    break;
                                }
                                case "WE": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (1) * parseInt($("#Percent").val());
                                    temp.x = parseInt(temp.x) * (1) * parseInt($("#Percent").val());
                                    WEList.push(temp);
                                    break;
                                }
                                case "PE": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (1) * parseInt($("#Percent").val());
                                    temp.x = parseInt(temp.x) * (1) * parseInt($("#Percent").val());
                                    PEList.push(temp);
                                    break;
                                }
                                case "PB": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (-1);
                                    temp.x = parseInt(temp.x) * (-1);
                                    PBList.push(temp);
                                    break;

                                }
                            }
                        }
                    }
                });

                var NoRepeatWPBList = [];
                var NoRepeatWBList = [];
                var NoRepeatPBList = [];
                $(WPBList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(NoRepeatWPBList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        NoRepeatWPBList.push(WPBList[index]);
                    }
                });
                $(PBList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(NoRepeatPBList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        NoRepeatPBList.push(PBList[index]);
                    }
                });
                $(WBList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(NoRepeatWBList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        NoRepeatWBList.push(WBList[index]);
                    }
                });

                var wpeListid = [];
                var notWPERepterList = [];
                var notWERepterList = [];
                var notPERepterList = [];

                $(WPEList).each(function (index) {
                    var it = $(this)[0];
                    var hadCount = false;
                    $(notWPERepterList).each(function (i) {
                        if (it.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(it.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(it.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        notWPERepterList.push(WPEList[index]);
                    }
                });

                $(PEList).each(function (index) {
                    var its = $(this)[0];
                    var hadCount = false;
                    $(notPERepterList).each(function (i) {
                        if (its.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(its.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(its.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        notPERepterList.push(PEList[index]);
                    }
                });

                $(WEList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(notWERepterList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        notWERepterList.push(WEList[index]);
                    }
                });

                $(notWPERepterList).each(function (index) {
                    var temp = $(this)[0];
                    $(NoRepeatWPBList).each(function (i) {
                        if (temp.id == $(this)[0].id) {
                            temp.fb = parseInt(temp.fb) + parseInt($(this)[0].fb);
                            temp.x = parseInt(temp.x) + parseInt($(this)[0].x);
                        }
                    });
                    if (temp.fb > 0 && temp.x > 0) {
                        returnList.push(temp);
                    }
                });
                $(notWERepterList).each(function (index) {
                    var temp = $(this)[0];
                    $(NoRepeatWBList).each(function (i) {
                        if (temp.id == $(this)[0].id) {
                            temp.fb = parseInt(temp.fb) + parseInt($(this)[0].fb);
                            temp.x = parseInt(temp.x) + parseInt($(this)[0].x);
                        }
                    });
                    if (temp.fb > 0 && temp.x == 0) {
                        returnList.push(temp);
                    }
                });

                $(notPERepterList).each(function (index) {
                    var temp = $(this)[0];
                    $(NoRepeatPBList).each(function (i) {
                        if (temp.id == $(this)[0].id) {
                            temp.fb = parseInt(temp.fb) + parseInt($(this)[0].fb);
                            temp.x = parseInt(temp.x) + parseInt($(this)[0].x);
                        }
                    });
                    if (temp.fb == 0 && temp.x > 0) {
                        returnList.push(temp);
                    }
                });

                $(returnList).each(function (index) {
                    $(this)[0].type = $(this)[0].type.replace("E", "B");
                });

                return returnList;

            } else {
                $(allList).each(function (index) {
                    if (CheckType.contains($(this)[0].type)) {
                        if ($(this)[0].type != "DEmr" && $(this)[0].type != "DBmr") {
                            if ($(this)[0].type.indexOf("E") >= 0) {
                                var it = $(this)[0];
                                it.x = parseInt(it.x) * parseInt($("#Percent").val())
                                var hadCount = false;
                                $(returnEatList).each(function (i) {
                                    if (it.id == $(this)[0].id) {
                                        $(this)[0].x = parseInt($(this)[0].x) + parseInt(it.x);
                                        hadCount = true;
                                    }
                                });
                                if (!hadCount) {
                                    returnEatList.push(it);
                                }
                            }
                            if ($(this)[0].type.indexOf("B") >= 0) {
                                var it = $(this)[0];
                                var hadCount = false;
                                $(returnEatList).each(function (i) {
                                    if (it.id == $(this)[0].id) {
                                        $(this)[0].x = parseInt($(this)[0].x) + parseInt(it.x) * (-1);
                                        hadCount = true;
                                    }
                                });
                                if (!hadCount) {
                                    allList[index].x = parseInt(allList[index].x) * (-1);
                                    returnEatList.push(allList[index]);
                                }
                            }
                        }
                    }
                    if ($(this)[0].type == "DBmr") {
                        var it = $(this)[0];
                        var hadCount = false;
                        $(notCommitBetList).each(function (i) {
                            if (it.id == $(this)[0].id) {
                                $(this)[0].x = parseInt($(this)[0].x) + parseInt(it.x);
                                hadCount = true;
                            }
                        });
                        if (!hadCount) {
                            notCommitBetList.push(allList[index]);
                        }
                    }
                });

                $(returnEatList).each(function (i) {
                    var item = $(this)[0];
                    $(notCommitBetList).each(function () {
                        if (item.id == $(this)[0].id) {
                            returnEatList[i].x = item.x - $(this)[0].x
                        }
                    });
                });

                $(returnEatList).each(function (i) {
                    var item = $(this)[0];
                    if (item.x > 0) {
                        returnList.push(item);
                    }
                });
            }

            $(returnList).each(function (index) {
                $(this)[0].type = $(this)[0].type.replace("E", "B");
            });
            return returnList;
        } else {
            return [];
        }
    },
    getNeedPingCangOrderList: function () {
        var withType = $("input[name='orderType']:checked").val();
        var returnBetList = [];
        var returnEatList = [];
        var returnList = [];
        var CheckType = [];
        if (withType.length > 0) {
            if ("WP" == withType) {
                CheckType = ['WPB', 'WPE', 'WB', 'WE', 'PB', 'PE']
            }
            if ("QP" == withType) {
                CheckType = ['FCB', 'FCE', 'PFTB', 'PFTE', 'QB', 'QE', 'QPB', 'QPE']
            }
            if ("Q" == withType) {
                CheckType = ['FCB', 'FCE', 'QB', 'QE']
            }

            var allList = ContentScript.GetAllHadTransactionData();

            if ("WP" == withType) {
                var WPBList = [];
                var WPEList = [];
                var WBList = [];
                var WEList = [];
                var PBList = [];
                var PEList = [];
                $(allList).each(function (index) {
                    var temp = $(this)[0];
                    if ($(this)[0].type == "DBmr") {
                        //matches rdfb fb x y t 2 4 5 5 78 0/16
                        if (parseInt($(this)[0].fb) > 0 && parseInt($(this)[0].x) > 0) {
                            temp.type = "WPB";
                            temp.id = temp.matches + temp.rdfb;
                            temp.fb = parseInt(temp.fb) * (-1);
                            temp.x = parseInt(temp.x) * (-1);
                            WPBList.push(temp);
                        }
                        if (parseInt($(this)[0].fb) == 0 && parseInt($(this)[0].x) > 0) {
                            temp.type = "PB";
                            temp.id = temp.matches + temp.rdfb;
                            temp.fb = parseInt(temp.fb) * (-1);
                            temp.x = parseInt(temp.x) * (-1);
                            PBList.push(temp);
                        }
                        if (parseInt($(this)[0].fb) > 0 && parseInt($(this)[0].x) == 0) {
                            temp.type = "WB";
                            temp.id = temp.matches + temp.rdfb;
                            temp.fb = parseInt(temp.fb) * (-1);
                            temp.x = parseInt(temp.x) * (-1);
                            WBList.push(temp);
                        }
                    } else {
                        if (CheckType.contains($(this)[0].type)) {
                            var temp = $(this)[0];
                            //matches rdfb fb x y t 2 4 5 5 78 0/16
                            switch ($(this)[0].type) {
                                case "WPB": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (-1);
                                    temp.x = parseInt(temp.x) * (-1);
                                    WPBList.push(temp);
                                    break;
                                }
                                case "WPE": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (1) * parseInt($("#Percent").val());
                                    temp.x = parseInt(temp.x) * (1) * parseInt($("#Percent").val());
                                    WPEList.push(temp);
                                    break;
                                }
                                case "WB": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (-1);
                                    temp.x = parseInt(temp.x) * (-1);
                                    WBList.push(temp);
                                    break;
                                }
                                case "WE": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (1) * parseInt($("#Percent").val());
                                    temp.x = parseInt(temp.x) * (1) * parseInt($("#Percent").val());
                                    WEList.push(temp);
                                    break;
                                }
                                case "PE": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (1) * parseInt($("#Percent").val());
                                    temp.x = parseInt(temp.x) * (1) * parseInt($("#Percent").val());
                                    PEList.push(temp);
                                    break;
                                }
                                case "PB": {
                                    temp.id = temp.matches + temp.rdfb;
                                    temp.fb = parseInt(temp.fb) * (-1);
                                    temp.x = parseInt(temp.x) * (-1);
                                    PBList.push(temp);
                                    break;

                                }
                            }
                        }
                    }
                });

                var NoRepeatWPBList = [];
                var NoRepeatWBList = [];
                var NoRepeatPBList = [];
                $(WPBList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(NoRepeatWPBList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        NoRepeatWPBList.push(WPBList[index]);
                    }
                });
                $(PBList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(NoRepeatPBList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        NoRepeatPBList.push(PBList[index]);
                    }
                });
                $(WBList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(NoRepeatWBList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        NoRepeatWBList.push(WBList[index]);
                    }
                });

                var wpeListid = [];
                var notWPERepterList = [];
                var notWERepterList = [];
                var notPERepterList = [];

                $(WPEList).each(function (index) {
                    var it = $(this)[0];
                    var hadCount = false;
                    $(notWPERepterList).each(function (i) {
                        if (it.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(it.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(it.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        notWPERepterList.push(WPEList[index]);
                    }
                });

                $(PEList).each(function (index) {
                    var its = $(this)[0];
                    var hadCount = false;
                    $(notPERepterList).each(function (i) {
                        if (its.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(its.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(its.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        notPERepterList.push(PEList[index]);
                    }
                });

                $(WEList).each(function (index) {
                    var itw = $(this)[0];
                    var hadCount = false;
                    $(notWERepterList).each(function (i) {
                        if (itw.id == $(this)[0].id) {
                            $(this)[0].x = parseInt($(this)[0].x) * parseInt($("#Percent").val()) + parseInt(itw.x);
                            $(this)[0].fb = parseInt($(this)[0].fb) * parseInt($("#Percent").val()) + parseInt(itw.fb);
                            hadCount = true;
                        }
                    });
                    if (!hadCount) {
                        notWERepterList.push(WEList[index]);
                    }
                });

                $(notWPERepterList).each(function (index) {
                    var temp = $(this)[0];
                    $(NoRepeatWPBList).each(function (i) {
                        if (temp.id == $(this)[0].id) {
                            temp.fb = parseInt(temp.fb) + parseInt($(this)[0].fb);
                            temp.x = parseInt(temp.x) + parseInt($(this)[0].x);
                        }
                    });
                    if (temp.fb > 0 && temp.x > 0) {
                        returnList.push(temp);
                    }
                });
                $(notWERepterList).each(function (index) {
                    var temp = $(this)[0];
                    $(NoRepeatWBList).each(function (i) {
                        if (temp.id == $(this)[0].id) {
                            temp.fb = parseInt(temp.fb) + parseInt($(this)[0].fb);
                            temp.x = parseInt(temp.x) + parseInt($(this)[0].x);
                        }
                    });
                    if (temp.fb > 0 && temp.x == 0) {
                        returnList.push(temp);
                    }
                });

                $(notPERepterList).each(function (index) {
                    var temp = $(this)[0];
                    $(NoRepeatPBList).each(function (i) {
                        if (temp.id == $(this)[0].id) {
                            temp.fb = parseInt(temp.fb) + parseInt($(this)[0].fb);
                            temp.x = parseInt(temp.x) + parseInt($(this)[0].x);
                        }
                    });
                    if (temp.fb == 0 && temp.x > 0) {
                        returnList.push(temp);
                    }
                });

                $(returnList).each(function (index) {
                    $(this)[0].type = $(this)[0].type.replace("E", "B");
                });

                return returnList;

            } else {
                var returnEatList = [];
                $(allList).each(function (index) {
                    if (CheckType.contains($(this)[0].type)) {
                        if ($(this)[0].type != "DEmr" && $(this)[0].type != "DBmr") {
                            if ($(this)[0].type.indexOf("E") >= 0) {
                                var it = $(this)[0];
                                var hadCount = false;
                                $(returnEatList).each(function (i) {
                                    if (it.id == $(this)[0].id) {
                                        $(this)[0].x = parseInt($(this)[0].x) + parseInt(it.x);
                                        hadCount = true;
                                    }
                                });
                                if (!hadCount) {
                                    allList[index].x = parseInt(allList[index].x);
                                    returnEatList.push(allList[index]);
                                }
                            }
                            if ($(this)[0].type.indexOf("B") >= 0) {
                                var it = $(this)[0];
                                var hadCount = false;
                                $(returnEatList).each(function (i) {
                                    if (it.id == $(this)[0].id) {
                                        $(this)[0].x = parseInt($(this)[0].x) + (parseInt(it.x) * (-1));
                                        hadCount = true;
                                    }
                                });
                                if (!hadCount) {
                                    allList[index].x = parseInt(allList[index].x) * (-1);
                                    returnEatList.push(allList[index]);
                                }
                            }
                        }
                    }

                });

                $(returnEatList).each(function (i) {
                    var item = $(this)[0];
                    if (item.x > 0) {
                        returnList.push(item);
                    }
                })

                $(returnList).each(function (index) {
                    $(this)[0].type = $(this)[0].type.replace("E", "B");
                });
                return returnList;
            }
        } else {
            return [];
        }
    },
    ticketByFloat: function (item, type) {
        var result = 0;
        if (type == "Q") {
            result = item;
        } else {
            if (item == 0) {
                result = 0;
            } else {
                if (item % 5 != 0) {
                    result = item + (5 - item % 5);
                } else {
                    result = item;
                }
            }
        }
        return result
    },
    withOrderOnInit: function (pushData, isBalance) {
        //真实的跟单操作
        $(pushData).each(function (i) {
            var item = $(this)[0];
            if (true) {
                var signInfo = ContentScript.GetSignInInfo();
                if (['FCB', 'FCE', 'PFTB', 'PFTE', 'QB', 'QE', 'QPB', 'QPE'].contains(item.type)) {
                    var postData = {};
                    postData.task = "betBox";
                    postData.combo = 0;
                    var pcBeiShu = 1;
                    try {
                        if (isBalance) {
                            pcBeiShu = parseInt($("#MulitBeiPingCang").val());
                        }
                    } catch (e) {
                        pcBeiShu = 1;
                    }
                    postData.Tix = ContentScript.ticketByFloat(parseInt(item.x) * pcBeiShu, "Q");
                    postData.Race = parseInt(item.matches);
                    var hourse1, hourse2;
                    //如果含有括号特殊处理一下
                    if (item.fb.indexOf("(") < 0) {
                        hourse1 = item.fb.split("-")[0];
                        hourse2 = item.fb.split("-")[1];
                        postData.fctype = 0;
                    } else {
                        hourse1 = item.fb.replace(/\(/g, "").replace(/\)/g, "").split("-")[0];
                        hourse2 = item.fb.replace(/\(/g, "").replace(/\)/g, "").split("-")[1];
                        postData.fctype = 1;
                    }
                    postData.Hs1 = hourse1;
                    postData.Hs2 = hourse2;
                    postData.Hs3 = "";
                    postData.Hs4 = "";
                    postData.Hs5 = "";
                    postData.Hs6 = "";
                    postData.Hs7 = "";
                    postData.Hs8 = "";
                    //postData.fctype = 0;
                    postData.Q = "Q";
                    if (item.type.indexOf("E") >= 0) {
                        postData.type = "EAT";
                    } else {
                        postData.type = "BET";
                    }

                    if (isBalance) {
                        postData.amount = 100;
                    } else {
                        postData.amount = ContentScript.PageConfig.Discount;
                    }
                    postData.fclmt = ContentScript.PageConfig.LimitStart;

                    postData.overflow = "1";
                    //postData.amount = "100";
                    postData.race_type = signInfo.RaceType;
                    postData.race_date = signInfo.RaceDate;
                    postData.show = parseInt(item.matches);
                    postData.rd = Math.random();

                    console.log(postData);
                    ///forecast?task=betBox&combo=0&Tix=2&Race=6&Hs1=1&Hs2=2&Hs3=&Hs4=&Hs5=&Hs6=&Hs7=&Hs8=&fctype=0&Q=Q&type=EAT&overflow=1&amount=90&fclmt=700&race_type=330E&race_date=12-04-2015&show=6&rd=0.05655713961459696
                    $.ajax({
                        type: "get",
                        url: ContentScript.urlX + "/forecast",
                        data: postData,
                        success: function (msg) {
                            console.log(msg);
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    });
                }
                if (['WPB', 'WPE', 'WB', 'WE', 'PB', 'PE'].contains($(this)[0].type)) {

                    var postURL = "";
                    var postData = {};
                    postData.t = "frm";
                    postData.race = item.matches;
                    postData.horse = item.rdfb;
                    //var Proportion = parseInt(ContentScript.PageConfig.Percent);
                    var pcBeiShu = 1;
                    try {
                        if (isBalance) {
                            pcBeiShu = parseInt($("#MulitBeiPingCang").val());
                        }
                    } catch (e) {
                        pcBeiShu = 1;
                    }

                    postData.win = ContentScript.ticketByFloat(parseInt(item.fb) * pcBeiShu, "WP");
                    postData.place = ContentScript.ticketByFloat(parseInt(item.x) * pcBeiShu, "WP");

                    var postURL = "";
                    postURL = "/bets";

                    if (isBalance) {
                        postData.amount = 99;
                    } else {
                        postData.amount = ContentScript.PageConfig.Discount;
                    }

                    postData.l_win = ContentScript.PageConfig.LimitStart;
                    postData.l_place = ContentScript.PageConfig.LimitEnd;
                    postData.race_type = signInfo.RaceType;
                    postData.race_date = signInfo.RaceDate;
                    postData.show = parseInt(item.matches);

                    if (parseInt(postData.win) > 0 && parseInt(postData.place) > 0) {
                        postData.wptck = 1;
                    } else {
                        postData.wptck = 0;
                    }
                    if (parseInt(postData.win) > 0 && parseInt(postData.place) == 0) {
                        postData.wtck = 1;
                        postData.l_place = "0";
                    }
                    if (parseInt(postData.win) == 0 && parseInt(postData.place) > 0) {
                        postData.ptck = 1;
                        postData.l_win = "0";
                    }

                    postData.post = "1";
                    postData.rd = Math.random();
                    console.log(postData);
                    $.ajax({
                        type: "get",
                        url: ContentScript.urlX + postURL,
                        data: postData,
                        success: function (msg) {
                            console.log(msg);
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    });
                }
            }
        });
    },

    GetAllTransactionData: function () {
        var result = [];
        //<td>6</td>
        //<td class="RD F_B">FC</td>
        //<td class="F_B ">4-5</td>
        //<td id="FCE_6_4-5_100_700x">2</td>
        //<td id="FCE_6_4-5_100_700y">100</td>
        //<td id="FCE_6_4-5_100_700t" colspan="1" class="">700</td>
        //<td class="">吃</td>

        //<td>2</td>
        //<td class="F_B">4</td>
        //<td id="PE_2_4_78_0/16_0x">0</td>
        //<td id="PE_2_4_78_0/16_0y">5</td>
        //<td id="PE_2_4_78_0/16_0z">78</td>
        //<td id="PE_2_4_78_0/16_0t" colspan="1" class="">0/16</td>
        //<td class="">吃</td></tr>

        $(ContentScript.txn_mode_check_item).each(function (i) {
            var type = ContentScript.txn_mode_check_item[i];
            $(window.frames["frmTRANS"].document).find("tbody[id^='" + type + "'] tr").each(function () {
                var temp = "";
                $(this).find("td").each(function (item) {
                    temp += $(this).text() + "$";
                })
                if (temp.length > 0) {
                    var tempArray = temp.split("$");
                    var id = tempArray[0] + tempArray[1] + tempArray[2];
                    item = { "id": id, "type": type, "matches": tempArray[0], "rdfb": tempArray[1], "fb": tempArray[2], "x": tempArray[3], "y": tempArray[4], "t": tempArray[5] }
                    result.push(item);
                }
            });
        });

        return result;
    },
    GetAllHadTransactionData: function () {
        var result = [];
        $(ContentScript.Hadtxn_mode_check_item).each(function (i) {
            var type = ContentScript.txn_mode_check_item[i];
            $(window.frames["frmTRANS"].document).find("tbody[id^='" + type + "'] tr").each(function () {
                var temp = "";
                $(this).find("td").each(function (item) {
                    temp += $(this).text() + "$";
                })
                if (temp.length > 0) {
                    var tempArray = temp.split("$");
                    var id = tempArray[0] + tempArray[1] + tempArray[2];
                    item = { "id": id, "type": type, "matches": tempArray[0], "rdfb": tempArray[1], "fb": tempArray[2], "x": tempArray[3], "y": tempArray[4], "t": tempArray[5] }
                    result.push(item);
                }
            });
        });

        return result;
    },

    CreateHtmlElement: function () {
        var htmlList = '<div id="drag" style="background:white;width: 400px; height: 180px; position: absolute; border: solid 1px #ccc; float: right; z-index: 100;right: 0;top: 0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
        htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">当前账户:' + $.trim($("#username").text()) + ' &nbsp; 到期时间<span id="daoqitime"></span>'
        htmlList += '<select id="dsType"><option>开始跟单</option><option>接受跟单</option></select>';    
        htmlList += '</h3>';
        htmlList += '<table style="width:100%">';
        htmlList += '<tr style="line-height: 30px;"><td colspan="2">';
        htmlList += '<input type= "radio" name="orderType"  value="QP" id="QPType"/>QP';
        htmlList += '&nbsp;&nbsp;限注:<input id="MaxCount" type="number" step="1" style="width: 40px;" size="4" value="300" />';
        htmlList += '&nbsp;倍率:<select id="Percent"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>20</option><option>50</option><option>100</option></select>';
        
        htmlList += '</td></tr>';
        htmlList += '<tr style="line-height: 30px;" ><td colspan="2">'
        htmlList += '<input type= "radio" name="DiscountType"  value="F1" checked="checked" id="DiscountType1"/>'
        htmlList += '折头:<input id="Discount1" type="number" step="10" style="width: 40px;" size="4" value="80" />'
        htmlList += '极限:<input id="LimitStart1" type="number" step="10" style="width: 40px;" size="4" value="700" />'
        htmlList += '/<input id="LimitEnd1" type="number" step="10" style="width: 40px;" size="4" value="700" />'
        htmlList += '&nbsp;赌单多倍平仓<input id="MulitBeiPingCang" type="number" value="1" style="width: 40px;" size="4" />'

        htmlList += '</td>';
        htmlList += '</tr>';
        htmlList += '<tr style="line-height: 30px;" ><td colspan="2">';
        htmlList += '<input type= "radio" name="DiscountType" value="F2" id="DiscountType2"/>';
        htmlList += '折头:<input id="Discount2" type="number" step="10" style="width: 40px;" size="4" value="80" />'
        htmlList += '极限:<input id="LimitStart2" type="number" step="10" style="width: 40px;" size="4" value="700" />'
        htmlList += '/<input id="LimitEnd2" type="number" step="10" style="width: 40px;" size="4" value="700" />'
        htmlList += '&nbsp;<input id="AutoPingCang" type="checkbox" value="1" />自动平仓'
        //htmlList +='比例:<input id="Percent" type="number" step="1" style="width: 40px;" size="4" value="1" />'
        htmlList += '</td>';
        htmlList += '</tr>';
        htmlList += '<tr style="line-height: 40px;"><td style="text-align:left;font-size:18px">';
        htmlList += '吃:<span id="eatCount" style="color:red"></span>&nbsp;赌:<span id="betCount" style="color:red" ></span>&nbsp;';
        htmlList += '</td><td style="text-align:right">';
        htmlList += '<input type="button" id="btnStart" value="开始" />';
        htmlList += '<input type="button" id="btnEnd" value="停止" />';
        htmlList += '<input type="button" id="btnBanlance" value="平仓" />';
        htmlList += '<input type="button" id="btnEatDelete" value="删吃单" />';
        htmlList += '<input type="button" id="btnBetDelete" value="删赌单" />';
        htmlList += '</td></tr>';
        htmlList += '</table>';
        htmlList += '</div>';

        $("body").append(htmlList);
    },
    EatButtonEvent: function () {
        var yellowList = $(window.frames["frmTRANS"].document).find("tbody[id^='DEmr'] tr");
        if (yellowList != null && yellowList != undefined && yellowList.length > 0) {
            var obj = $(window.frames["frmTRANS"].document).find(".del2_ch").last().attr("onclick").replace(/mr\(\'/g, "").replace(/\'\)/g, "");
            PostHelp.AjaxDeleteData(obj);
        }
    },
    BetButtonEvent: function () {
        var greenList = $(window.frames["frmTRANS"].document).find("tbody[id^='DBmr'] tr");
        if (greenList != null && greenList != undefined && greenList.length > 0) {
            var obj = $(window.frames["frmTRANS"].document).find(".del_ch").last().attr("onclick").replace(/mr\(\'/g, "").replace(/\'\)/g, "");
            PostHelp.AjaxDeleteData(obj);
        }
    },
    HtmlAddDragEvent: function () {
        var _move = false; //移动标记  
        var _x, _y; //鼠标离控件左上角的相对位置  
        $("#drag").click(function () {
            //alert("click");//点击（松开后触发）  
        }).mousedown(function (e) {
            _move = true;
            _x = e.pageX - parseInt($("#drag").css("left"));
            _y = e.pageY - parseInt($("#drag").css("top"));
        });
        $(document).mousemove(function (e) {
            if (_move) {
                var x = e.pageX - _x; //移动时根据鼠标位置计算控件左上角的绝对位置  
                var y = e.pageY - _y;
                $("#drag").css({ top: y, left: x }); //控件新位置  
            }
        }).mouseup(function () {
            _move = false;
        });
    }
}

PostHelp = {
    urlX: "http://" + window.location.host,
    fcfrm1: $("#fcfrm1"),
    fcfrm2: $("#fcfrm2"),
    chkKBBet: function (f) {
        f = PostHelp.fcfrm1;
        if (f.find("input[name='fctype']").val() == "0") {
            PostHelp.chkKB1(f);
        } else if (f.find("input[name='fctype']").val() == "1") {
            PostHelp.chkKB3(f);
        }
    },
    chkKBEat: function (f) {
        f = PostHelp.fcfrm2;
        if (f.find("input[name='fctype']").val() == "0") {
            PostHelp.chkKB2(f);
        } else if (f.find("input[name='fctype']").val() == "1") {
            PostHelp.chkKB4(f);
        }
    },
    chkKB1: function (f) {
        f = PostHelp.fcfrm1;
        var combo;
        var hssA = "";
        if (f.find("input[name='Hss']") != null && f.find("input[name='Hss']") != undefined
            && f.find("input[name='Hss']").val() != undefined
        ) {
            hssA = f.find("input[name='Hss']").val();
        }
        if (hssA.indexOf('>') > -1) {
            combo = 1;
        } else {
            combo = 0;
        }
        if (true) {
            //f.Order.disabled = true;
            var hss = "";
            if (f.find("input[name='Hss']") != null && f.find("input[name='Hss']") != undefined
                && f.find("input[name='Hss']").val() != undefined
            ) {
                if (f.find("input[name='Hss']").val().length > 0) {
                    hss = f.find("input[name='Hss']").val().replace(/\+/g, '_');
                }
            }
            if (hss == "") {
                hss = f.find("input[name='Hs1']").val() + "_" + f.find("input[name='Hs2']").val();
            }
            PostHelp.postData(PostHelp.urlX + '/forecast?task=betBox&combo=' + combo + '&Tix=' + f.find("input[name='Tix']").val() + '&Race=' + f.find("input[name='Race']").val() + '&Hss=' + hss + '&fctype=' + f.find("input[name='fctype']").val() + '&Q=' + f.find("input[name='Q']").val() + '&type=' + f.find("input[name='type']").val() + '&overflow=' + f.find("input[name='overflow']").val() + '&amount=' + f.find("input[name='amount']").val() + '&fclmt=' + f.find("input[name='fclmt']").val() + '&race_type=' + f.find("input[name='race_type']").val() + '&race_date=' + f.find("input[name='race_date']").val());
        }
    },
    chkKB2: function (f) {
        f = PostHelp.fcfrm2;
        var combo = f.find("input[name='banker2']").val();
        if (true) {
            //f.Order.disabled = true;
            //PostHelp.postData(PostHelp.urlX+'/forecast?task=betBox&combo='+combo+'&Tix=' + f.Tix.value + '&Race=' + f.Race.value + '&Hss=' + f.Hss.value.replace(/\+/g,'_')+'&fctype=' + f.fctype.value + '&Q=' + f.Q.value + '&type=' + f.type.value+ '&overflow=' + f.overflow.value + '&amount=' + f.amount.value + '&fclmt=' + f.fclmt.value  + '&race_type=' + f.race_type.value + '&race_date=' + f.race_date.value );
            //f.Order.disabled = true;
            var hss = "";
            if (f.find("input[name='Hss']")) {
                if (f.find("input[name='Hss']").val().length > 0) {
                    hss = f.find("input[name='Hss']").val().replace(/\+/g, '_');
                }
            }
            if (hss == "") {
                hss = f.find("input[name='Hs1']").val() + "_" + f.find("input[name='Hs2']").val();
            }
            PostHelp.postData(PostHelp.urlX + '/forecast?task=betBox&combo=' + combo + '&Tix=' + f.find("input[name='Tix']").val() + '&Race=' + f.find("input[name='Race']").val() + '&Hss=' + hss + '&fctype=' + f.find("input[name='fctype']").val() + '&Q=' + f.find("input[name='Q']").val() + '&type=' + f.find("input[name='type']").val() + '&overflow=' + f.find("input[name='overflow']").val() + '&amount=' + f.find("input[name='amount']").val() + '&fclmt=' + f.find("input[name='fclmt']").val() + '&race_type=' + f.find("input[name='race_type']").val() + '&race_date=' + f.find("input[name='race_date']").val());

        }
    },
    chkKB3: function (f) {
        f = PostHelp.fcfrm1;
        var combo;
        var hssA = "";
        if (f.find("input[name='Hss']") != null && f.find("input[name='Hss']") != undefined
            && f.find("input[name='Hss']").val() != undefined
        ) {
            hssA = f.find("input[name='Hss']").val()
        }
        if (hssA.indexOf('>') > -1) {
            combo = 1;
        } else {
            combo = 0;
        }
        if (true) {
            //f.Order.disabled = true;
            //PostHelp.postData(PostHelp.urlX+'/forecast?task=betBox&combo='+combo+'&Tix=' + f.Tix.value + '&Race=' + f.Race.value + '&Hss=' + f.Hss.value.replace(/\+/g,'_')+'&fctype=' + f.fctype.value + '&Q=' + f.Q.value + '&type=' + f.type.value+ '&overflow=' + f.overflow.value + '&amount=' + f.amount.value + '&fclmt=' + f.fclmt.value  + '&race_type=' + f.race_type.value + '&race_date=' + f.race_date.value );
            var hss = "";
            if (f.find("input[name='Hss']") != null && f.find("input[name='Hss']") != undefined
                && f.find("input[name='Hss']").val() != undefined
            ) {
                if (f.find("input[name='Hss']").val() != "") {
                    hss = f.find("input[name='Hss']").val().replace(/\+/g, '_');
                }
            }
            if (hss == "") {
                hss = f.find("input[name='Hs1']").val() + "_" + f.find("input[name='Hs2']").val();
            }
            PostHelp.postData(PostHelp.urlX + '/forecast?task=betBox&combo=' + combo + '&Tix=' + f.find("input[name='Tix']").val() + '&Race=' + f.find("input[name='Race']").val() + '&Hss=' + hss + '&fctype=' + f.find("input[name='fctype']").val() + '&Q=' + f.find("input[name='Q']").val() + '&type=' + f.find("input[name='type']").val() + '&overflow=' + f.find("input[name='overflow']").val() + '&amount=' + f.find("input[name='amount']").val() + '&fclmt=' + f.find("input[name='fclmt']").val() + '&race_type=' + f.find("input[name='race_type']").val() + '&race_date=' + f.find("input[name='race_date']").val());

        }
    },
    chkKB4: function (f) {
        f = PostHelp.fcfrm2;
        var combo = f.find("input[name='banker2']").val();
        if (true) {
            f.Order.disabled = true;
            //PostHelp.postData(PostHelp.urlX+'/forecast?task=betBox&combo='+combo+'&Tix=' + f.Tix.value + '&Race=' + f.Race.value + '&Hss=' + f.Hss.value.replace(/\+/g,'_')+'&fctype=' + f.fctype.value + '&Q=' + f.Q.value + '&type=' + f.type.value+ '&overflow=' + f.overflow.value + '&amount=' + f.amount.value + '&fclmt=' + f.fclmt.value  + '&race_type=' + f.race_type.value + '&race_date=' + f.race_date.value );
            var hss = "";
            if (f.find("input[name='Hss']") != null && f.find("input[name='Hss']") != undefined) {
                if (f.find("input[name='Hss']").val() != "") {
                    hss = f.find("input[name='Hss']").val().replace(/\+/g, '_');
                }
            }
            if (hss == "") {
                hss = f.find("input[name='Hs1']").val() + "_" + f.find("input[name='Hs2']").val();
            }
            PostHelp.postData(PostHelp.urlX + '/forecast?task=betBox&combo=' + combo + '&Tix=' + f.find("input[name='Tix']").val() + '&Race=' + f.find("input[name='Race']").val() + '&Hss=' + hss + '&fctype=' + f.find("input[name='fctype']").val() + '&Q=' + f.find("input[name='Q']").val() + '&type=' + f.find("input[name='type']").val() + '&overflow=' + f.find("input[name='overflow']").val() + '&amount=' + f.find("input[name='amount']").val() + '&fclmt=' + f.find("input[name='fclmt']").val() + '&race_type=' + f.find("input[name='race_type']").val() + '&race_date=' + f.find("input[name='race_date']").val());
        }
    },
    chkActBet: function (f) {
        f = PostHelp.fcfrm1;
        var combo;
        var check = f.find("input[name='banker1'] :checked");
        if (check) {
            combo = 1;
        } else {
            combo = 0;
        }
        if (true) {
            //f.Order.disabled = true;
            PostHelp.postData(PostHelp.urlX + '/forecast?task=betBox&combo=' + combo + '&Tix=' +
                f.find("input[name='Tix']").val() + '&Race=' +
                f.find("input[name='Race']").val() + '&Hs1=' +
                f.find("input[name='Hs1']").val() + '&Hs2=' +
                f.find("input[name='Hs2']").val() + '&Hs3=' +
                f.find("input[name='Hs3']").val() + '&Hs4=' +
                f.find("input[name='Hs4']").val() + '&Hs5=' +
                f.find("input[name='Hs5']").val() + '&Hs6=' +
                f.find("input[name='Hs6']").val() + '&Hs7=' +
                f.find("input[name='Hs7']").val() + '&Hs8=' +
                f.find("input[name='Hs8']").val() + '&fctype=' +
                f.find("input[name='fctype']").val() + '&Q=' +
                f.find("input[name='Q']").val() + '&type=' +
                f.find("input[name='type']").val() + '&overflow=' +
                f.find("input[name='overflow']").val() + '&amount=' +
                f.find("input[name='amount']").val() + '&fclmt=' +
                f.find("input[name='fclmt']").val() + '&race_type=' +
                f.find("input[name='race_type']").val() + '&race_date=' +
                f.find("input[name='race_date']").val());
        }
    },
    chkActEat: function (f) {
        f = PostHelp.fcfrm2;
        var combo = f.find("input[name='banker2']").val();
        if (true) {
            //f.Order.disabled = true;
            PostHelp.postData(PostHelp.urlX + '/forecast?task=betBox&combo=' + combo + '&Tix=' +
                f.find("input[name='Tix']").val() + '&Race=' +
                f.find("input[name='Race']").val() + '&Hs1=' +
                f.find("input[name='Hs1']").val() + '&Hs2=' +
                f.find("input[name='Hs2']").val() + '&Hs3=' +
                f.find("input[name='Hs3']").val() + '&Hs4=' +
                f.find("input[name='Hs4']").val() + '&Hs5=' +
                f.find("input[name='Hs5']").val() + '&Hs6=' +
                f.find("input[name='Hs6']").val() + '&Hs7=' +
                f.find("input[name='Hs7']").val() + '&Hs8=' +
                f.find("input[name='Hs8']").val() + '&fctype=' +
                f.find("input[name='fctype']").val() + '&Q=' +
                f.find("input[name='Q']").val() + '&type=' +
                f.find("input[name='type']").val() + '&overflow=' +
                f.find("input[name='overflow']").val() + '&amount=' +
                f.find("input[name='amount']").val() + '&fclmt=' +
                f.find("input[name='fclmt']").val() + '&race_type=' +
                f.find("input[name='race_type']").val() + '&race_date=' +
                f.find("input[name='race_date']").val());
        }
    },
    postData: function (url) {
        var view1 = $("#view1");
        if (view1) {
            var y = $("#view1").val();
            var postion = url + "&show=" + y + "&rd=" + Math.random();
            var postionArray = postion.split("?");
            var postUrl = postionArray[0];
            var dataUrl = postionArray[1];
            var dataArray = dataUrl.split('&');
            var postString = '{';
            for (var i = 0; i < dataArray.length; i++) {
                var itemArray = dataArray[i].split('=');
                postString += '"' + itemArray[0] + '": "' + itemArray[1] + '",';
            }
            postString = postString.substr(0, postString.length - 1);
            postString += '}';
            var dataJson = $.parseJSON(postString);
            $.ajax(
                {
                    type: "GET",
                    url: postUrl,
                    data: dataJson,
                    dataType: "text",
                    success: function (da) {
                    },
                    error: function (da, status, e) {
                    }
                });
        }
    },
    PostDeleteData: function (info) {
        var id, x, type, date, race_type, race
        var li = info.split(",");
        id = li[0]; x = li[1]; type = li[2]; date = li[3]; race_type = li[4]; race = li[5];
        document.getElementById('boxFcBET').style.display = "none";
        document.getElementById('boxFcEAT').style.display = "none";
        document.getElementById('boxPfcBET').style.display = "none";
        document.getElementById('boxPfcEAT').style.display = "none";
        PostHelp.postData(PostHelp.urlX + '/transactions?type=del&bid=' + id + '&x=' + x + '&betType=' + type + '&race_date=' + date + '&race_type=' + race_type + '&q=q&race=' + race);
    },
    AjaxDeleteData: function (info) {
        var id, x, type, date, race_type, race
        var li = info.split(",");
        var y = 0;
        try {
            y = view1.options[view1.selectedIndex].value;
        } catch (e) {
            y = $(".dd-selected-value").val();
        }

        id = li[0]; x = li[1]; type = li[2]; date = li[3]; race_type = li[4]; race = li[5];
        $.ajax(
            {
                type: "GET",
                url: PostHelp.urlX + "/transactions",
                data: {
                    "type": "del",
                    "bid": id,
                    "x": x,
                    "betType": type,
                    "race_date": date,
                    "race_type": race_type,
                    "q": "q",
                    "race": race,
                    "show": y,
                    "rd": Math.random()
                },
                dataType: "text",
                success: function (da) {
                },
                error: function (da, status, e) {
                }

            });
    }
}

var host = window.location.href;
if (host.indexOf("playerhk.jsp") >= 0 || host.indexOf("Q.jsp") >= 0) {
    ContentScript.onInit();
}