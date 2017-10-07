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
	urlX: "http://" + window.location.host,
	needAjaxCount: [],
	timerSearch: null,
	timerSearchQP: null,
	DaoQiTime: "YYYY-MM-DD",
	maxAndMinValueListWin: [],
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
	onInit: function () {
		ContentScript.allOnitEvent();
	},
	onPlayerInit: function () {
		var htmlList = '<div id="drag" style="background:white;width: 660px; height: 480px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right:370;top:0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">当前账户:' + $.trim($("#username").text()) + ' &nbsp; 到期时间<span id="daoqitime"></span><span>&nbsp;独赢数据统计</span><input type="button" id="btnClose" text="清空" value="清空"></input></h3>';
		htmlList += '<div id="divCreate"></div>'
		htmlList += '</div>';
		$("body").append(htmlList);
		$("#daoqitime").text(ContentScript.DaoQiTime);
		ContentScript.HtmlAddDragEvent($("#drag"));

		$("#btnClose").bind("click", function () {
			$("#divCreate").empty();
			ContentScript.maxAndMinValueListWin=[];
		})

		self.setInterval(function () {
			var hourseCount1 = ContentScript.GetWinTransData();
			if (hourseCount1.length == 0) {
				return;
			}

			var htmlListQPRight = '<table class="bettable" style="width:250px">';
			htmlListQPRight += '<tr><th width="20%">马</th><th width="34%">数量</th><th width="20%">最多</th><th width="20%">最少</th>';
			hourseCount1.sort(function (a, b) {
				return parseInt(a["ticketsw"]) < parseInt(b["ticketsw"]) ? 1 : parseInt(a["ticketsw"]) == parseInt(b["ticketsw"]) ? 0 : -1;
			});
			$(hourseCount1).each(function (index) {
				var temp = $(this)[0];
				var minValue = 0;
				var maxValue = 0;
				var isExistsItem = false;
				$(ContentScript.maxAndMinValueListWin).each(function (index) {
					if (temp.hourse == $(this)[0].hourse) {
						isExistsItem = true;
						if ($(this)[0].Max < temp.ticketsw) {
							$(this)[0].Max = temp.ticketsw;
						}
						if ($(this)[0].Min > temp.ticketsw) {
							$(this)[0].Min = temp.ticketsw;
						}
						minValue = $(this)[0].Min;
						maxValue = $(this)[0].Max;
					}
				});
				if (!isExistsItem) {
					ContentScript.maxAndMinValueListWin.push({ "hourse": $(this)[0].hourse, "Min": $(this)[0].ticketsw, "Max": $(this)[0].ticketsw })
				}
				htmlListQPRight += '<tr style="line-height: 30px;">';
				htmlListQPRight += '<td>' + $(this)[0].hourse + '</td>';
				htmlListQPRight += '<td>' + $(this)[0].ticketsw + '</td>';
				htmlListQPRight += '<td>' + maxValue + '</td>';
				htmlListQPRight += '<td>' + minValue + '</td>';
				htmlListQPRight += '</tr>';
			});
			$("#divCreate").empty();
			$("#divCreate").append(htmlListQPRight);
		}, 1000);
	},
	allOnitEvent: function () {
		//创建用户界面
		ContentScript.CreateHtmlElement();
		//绑定拖拽事件
		ContentScript.HtmlAddDragEvent($("#drag"));
		ContentScript.HtmlAddDragEvent($("#dragQ"));
		ContentScript.HtmlAddDragEvent($("#dragQP"));
		$("#daoqitime").text(ContentScript.DaoQiTime);
		ContentScript.timerSearch = self.setInterval(function () {
			var start = $("#startDiscount").val();
			var end = $("#endDiscount").val();
			start = parseFloat(start);
			end = parseFloat(end);
			var resultFirst = ContentScript.GetTransactionDataByArea('vrtFC_1', 'FC_DATA_1');

			var htmlList = '<table class="bettable" style="width:400px">';
			htmlList += '<tr><th width="20%">马</th><th width="34%">票数$</th></tr>';
			var hourseCount = [];
			resultFirst.sort(function (a, b) {
				return parseInt(a["tickets"]) < parseInt(b["tickets"]) ? 1 : parseInt(a["tickets"]) == parseInt(b["tickets"]) ? 0 : -1;
			});
			$(resultFirst).each(function (index) {
				var hourseM = $(this)[0].hourse.split('-');

				var isExists1 = false;
				var isExists2 = false;

				$(hourseCount).each(function (index) {
					var temp = $(this)[0];
					if (temp.hourse == hourseM[0]) {
						isExists1 = true;
						$(this)[0].count = $(this)[0].count + 1;
					}
					if (temp.hourse == hourseM[1]) {
						isExists2 = true;
						$(this)[0].count = $(this)[0].count + 1;
					}
				});
				if (!isExists1) {
					hourseCount.push({ "hourse": hourseM[0], "count": 1 });
				}
				if (!isExists2) {
					hourseCount.push({ "hourse": hourseM[1], "count": 1 });
				}

				htmlList += '<tr style="line-height: 30px;">';
				htmlList += '<td>' + $(this)[0].hourse + '</td>';
				htmlList += '<td>' + $(this)[0].tickets + '</td>';
				htmlList += '</tr>';
			});

			htmlList += '</table><br/>';
			$("#divCreateQLeft").empty();
			$("#divCreateQLeft").append(htmlList);

			var htmlListQRight = '<table class="bettable" style="width:150px">';
			htmlListQRight += '<tr><th width="20%">马</th><th width="34%">数量</th>';

			if ($("input[id='chkQ']:checked").val() == "1") {
				hourseCount.sort(function (a, b) {
					return parseInt(a["hourse"]) > parseInt(b["hourse"]) ? 1 : parseInt(a["hourse"]) == parseInt(b["hourse"]) ? 0 : -1;
				});
			} else {
				hourseCount.sort(function (a, b) {
					return parseInt(a["count"]) < parseInt(b["count"]) ? 1 : parseInt(a["count"]) == parseInt(b["count"]) ? 0 : -1;
				});
			}



			$(hourseCount).each(function (index) {
				htmlListQRight += '<tr style="line-height: 30px;">';
				htmlListQRight += '<td>' + $(this)[0].hourse + '</td>';
				htmlListQRight += '<td>' + $(this)[0].count + '</td>';
				htmlListQRight += '</tr>';
			});
			$("#divCreateQRight").empty();
			$("#divCreateQRight").append(htmlListQRight);
		}, 1000);

		ContentScript.timerSearch = self.setInterval(function () {
			var start = $("#startDiscountQP").val();
			var end = $("#endDiscountQP").val();
			start = parseFloat(start);
			end = parseFloat(end);
			var resultSecond = ContentScript.GetTransactionDataByArea('vrtFC_3', 'FC_DATA_3');

			var hourseCount1 = [];

			var htmlListQP = '<table class="bettable" style="width:400px">';
			htmlListQP += '<tr><th width="20%">马</th><th width="34%">票数$</th></tr>';
			resultSecond.sort(function (a, b) {
				return parseInt(a["tickets"]) < parseInt(b["tickets"]) ? 1 : parseInt(a["tickets"]) == parseInt(b["tickets"]) ? 0 : -1;
			});
			$(resultSecond).each(function (index) {
				var hourseM = $(this)[0].hourse.replace("(", "").replace(")", "").split('-');

				var isExists1 = false;
				var isExists2 = false;

				$(hourseCount1).each(function (index) {
					var temp = $(this)[0];
					if (temp.hourse == hourseM[0]) {
						isExists1 = true;
						$(this)[0].count = $(this)[0].count + 1;
					}
					if (temp.hourse == hourseM[1]) {
						isExists2 = true;
						$(this)[0].count = $(this)[0].count + 1;
					}
				});
				if (!isExists1) {
					hourseCount1.push({ "hourse": hourseM[0], "count": 1 });
				}
				if (!isExists2) {
					hourseCount1.push({ "hourse": hourseM[1], "count": 1 });
				}

				htmlListQP += '<tr style="line-height: 30px;">';
				htmlListQP += '<td>' + $(this)[0].hourse + '</td>';
				htmlListQP += '<td>' + $(this)[0].tickets + '</td>';
				htmlListQP += '</tr>';
			});
			htmlListQP += '</table>';
			$("#divCreateQPLeft").empty();
			$("#divCreateQPLeft").append(htmlListQP);

			var htmlListQPRight = '<table class="bettable" style="width:150px">';
			htmlListQPRight += '<tr><th width="20%">马</th><th width="34%">数量</th>';

			if ($("input[id='chkQP']:checked").val() == "1") {
				hourseCount1.sort(function (a, b) {
					return parseInt(a["hourse"]) > parseInt(b["hourse"]) ? 1 : parseInt(a["hourse"]) == parseInt(b["hourse"]) ? 0 : -1;
				});
			} else {
				hourseCount1.sort(function (a, b) {
					return parseInt(a["count"]) < parseInt(b["count"]) ? 1 : parseInt(a["count"]) == parseInt(b["count"]) ? 0 : -1;
				});
			}


			$(hourseCount1).each(function (index) {
				htmlListQPRight += '<tr style="line-height: 30px;">';
				htmlListQPRight += '<td>' + $(this)[0].hourse + '</td>';
				htmlListQPRight += '<td>' + $(this)[0].count + '</td>';
				htmlListQPRight += '</tr>';
			});
			$("#divCreateQPRight").empty();
			$("#divCreateQPRight").append(htmlListQPRight);

		}, 1000);
	},
	GetFliterData: function (result, start, end) {
		var limitResult = [];
		//将符合条件的跑马的最小值显示出来
		$(result).each(function (index) {
			var temp = $(this)[0];
			var isNew = false;
			if (parseFloat(temp.discount) >= start && parseFloat(temp.discount) <= end) {
				$(limitResult).each(function (item) {
					var tp = $(this)[0];
					if (tp.hourse == temp.hourse) {
						isNew = true;
					}
					if (tp.hourse == temp.hourse && temp.discount < tp.discount) {
						$(this)[0].tickets = temp.tickets;
						$(this)[0].discount = temp.discount;
						$(this)[0].limit = temp.limit;
					}
				});
				if (!isNew) {
					limitResult.push(temp);
				}
			}
		});
		return limitResult;
	},
	getIframeInnerHTML(frame, element) {
		try {
			return document.getElementById(frame).contentWindow.document.getElementById(element).innerHTML;
		} catch (e) { return document.getElementById(element).innerHTML; }
	},
	GetWinTransData: function () {
		//1	1	9	9	83	300/100
		var textq = ContentScript.getIframeInnerHTML('vrtBET', 'BET_DATA');
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var textList = textq.split(";");
		var result = [];
		for (var i = 0; i < textList.length; i++) {
			if (textList[i] == "") { continue; }
			var tempArray = textList[i].split("$");
			var isExists = false;
			var id = tempArray[0] + tempArray[1] + tempArray[2] + tempArray[3];
			item = { "id": id, "type": "WQ", "matches": tempArray[0], "hourse": tempArray[1], "ticketsw": parseInt(tempArray[2]), "ticketsp": parseInt(tempArray[3]), "discount": parseFloat(tempArray[4]), "limit": tempArray[4] }
			$(result).each(function (index) {
				var temp = $(this)[0];
				if (temp.hourse == tempArray[1] && parseInt(tempArray[3]) == 0) {
					isExists = true;
					if (temp.discount > parseFloat(tempArray[3])) {
						$(this)[0].ticketsw = parseInt($(this)[0].ticketsw) + parseInt(tempArray[2]);
						//$(this)[0].ticketsp = parseInt($(this)[0].ticketsp) + parseInt(tempArray[3]);
					}
					return;
				}
			});
			if (!isExists && parseInt(tempArray[3]) == 0) {
				result.push(item);
			}
		}
		return result;
	},
	GetTransactionData: function (fc, data, start, end) {
		var textq = ContentScript.getIframeInnerHTML(fc, data);
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var result = [];
		var fliterHourse = [];
		var textList = textq.split(";");
		console.log(textList.length);
		for (var i = 0; i < textList.length; i++) {
			if (textList[i] == "") { continue; }
			var tempArray = textList[i].split("$");
			var paramValue = 700;
			if (tempArray[1].indexOf("(") >= 0) {
				paramValue = 400;
			}
			var id = tempArray[0] + tempArray[1] + tempArray[2];
			if ((!fliterHourse.contains(tempArray[1])) && parseFloat(tempArray[3]) >= start && parseFloat(tempArray[3]) <= end && parseFloat(tempArray[4]) == paramValue) {
				var isExists = false;
				item = { "id": id, "type": "WQ", "matches": tempArray[0], "hourse": tempArray[1], "tickets": tempArray[2], "discount": parseFloat(tempArray[3]), "limit": tempArray[4] }
				$(result).each(function (index) {
					var temp = $(this)[0];
					if (temp.hourse == tempArray[1]) {
						isExists = true;
						if (temp.discount > parseFloat(tempArray[3])) {
							$(this)[0].tickets = tempArray[2];
							$(this)[0].discount = parseFloat(tempArray[3]);
							$(this)[0].limit = tempArray[4];
						}
						return;
					}
				});
				if (!isExists) {
					result.push(item);
				}
			}
			if (parseFloat(tempArray[3]) < start && parseFloat(tempArray[4]) == paramValue) {
				fliterHourse.push(tempArray[1]);
			}
		}
		return result;
	},
	GetTransactionDataByArea: function (fc, data) {
		var textq = ContentScript.getIframeInnerHTML(fc, data);
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var result = [];
		var textList = textq.split(";");
		console.log(textList.length);
		for (var i = 0; i < textList.length; i++) {
			if (textList[i] == "") { continue; }
			var tempArray = textList[i].split("$");
			var id = tempArray[0] + tempArray[1] + tempArray[2];

			var isExists = false;
			item = { "id": id, "type": "WQ", "matches": tempArray[0], "hourse": tempArray[1], "tickets": parseFloat(tempArray[2]), "discount": parseFloat(tempArray[3]), "limit": tempArray[4] }
			$(result).each(function (index) {
				var temp = $(this)[0];
				if (temp.hourse == tempArray[1]) {
					isExists = true;
					$(this)[0].tickets = parseInt($(this)[0].tickets) + parseInt(tempArray[2]);
					return;
				}
			});
			if (!isExists) {
				result.push(item);
			}

		}
		return result;
	},
	CreateHtmlElement: function () {
		var htmlList = '<div id="drag" style="display:none;background:white;width: 460px; height: 180px; position: absolute; border: solid 1px #ccc; float: right; z-index: 100;right: 0;top: 0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">当前账户:' + $.trim($("#username").text()) + ' &nbsp; 到期时间<span id="daoqitime"></span></h3>';
		htmlList += '<div style="float: left;"><table style="width:200">';
		htmlList += '<tr style="line-height: 30px;"><td>';
		htmlList += '<input id="startDiscount" type="number" step="1" style="width: 40px;" size="4" value="95" />-';
		htmlList += '<input id="endDiscount" type="number" step="1" style="width: 40px;" size="4" value="100" />';
		htmlList += '</td></tr>';
		htmlList += '<tr style="line-height: 30px;"><td>';
		htmlList += '<input type="button" id="btnStart" value="连赢Q开始" />';
		htmlList += '<input type="button" id="btnEnd" value="连赢Q停止" />';
		htmlList += '</td></tr>';
		htmlList += '</table> </div>';
		htmlList += '<div style="float: right;"><table style="width:200">';
		htmlList += '<tr style="line-height: 30px;"><td>';
		htmlList += '<input id="startDiscountQP" type="number" step="1" style="width: 40px;" size="4" value="95" />-';
		htmlList += '<input id="endDiscountQP" type="number" step="1" style="width: 40px;" size="4" value="100" />';
		htmlList += '</td></tr>';
		htmlList += '<tr style="line-height: 30px;"><td>';
		htmlList += '<input type="button" id="btnStartQP" value="位置Q开始" />';
		htmlList += '<input type="button" id="btnEndQP" value="位置Q停止" />';
		htmlList += '</td></tr>';
		htmlList += '</table> </div>';
		htmlList += '</div>';

		htmlList += '<div id="dragQ" style="background:white;width: 660px; height: 480px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right: 400;top:0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">连赢Q下注统计 <input type="checkbox" id="chkQ" value="1" />按马次排序</h3>';
		htmlList += '<div id="divCreateQLeft" style="float: left;"></div>'
		htmlList += '<div id="divCreateQRight" style="float: right;"></div>'
		htmlList += '</div>';

		htmlList += '<div id="dragQP" style="background:white;width: 660px; height: 480px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right:370;top:0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">位置Q下注统计 <input type="checkbox" id="chkQP" value="1" />按马次排序</h3>';
		htmlList += '<div id="divCreateQPLeft" style="float: left;"></div>'
		htmlList += '<div id="divCreateQPRight" style="float: right;"></div>'
		htmlList += '</div>';

		$("body").append(htmlList);
	},

	HtmlAddDragEvent: function (obj) {
		var _move = false; //移动标记  
		var _x, _y; //鼠标离控件左上角的相对位置  
		obj.click(function () {
			//alert("click");//点击（松开后触发）  
		}).mousedown(function (e) {
			_move = true;
			_x = e.pageX - parseInt(obj.css("left"));
			_y = e.pageY - parseInt(obj.css("top"));
		});
		$(document).mousemove(function (e) {
			if (_move) {
				var x = e.pageX - _x; //移动时根据鼠标位置计算控件左上角的绝对位置  
				var y = e.pageY - _y;
				obj.css({ top: y, left: x }); //控件新位置  
			}
		}).mouseup(function () {
			_move = false;
		});
	}
}
var host = window.location.href;
if (host.indexOf("Q.jsp") >= 0) {
	ContentScript.onInit();
}
if (host.indexOf("playerhk.jsp") >= 0) {
	ContentScript.onPlayerInit();
}