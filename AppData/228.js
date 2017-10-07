Array.prototype.contains = function(item) {
	return RegExp(item).test(this);
};

if(!Array.indexOf) {
	Array.prototype.indexOf = function(obj) {
		for(var i = 0; i < this.length; i++) {
			if(this[i] == obj) {
				return i;
			}
		}
		return -1;
	}
}

Array.prototype.contains = function(obj) {
	var i = this.length;
	while(i--) {
		if(this[i] === obj) {
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
	WPFirstData: [],
	WPFirstPL: [],
	blueData: [],
    redData: [],
    WData:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    WPData:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	Request: function(paras) {
		var url = location.href;
		var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
		var paraObj = {}
		for(i = 0; j = paraString[i]; i++) {
			paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
		}
		var returnValue = paraObj[paras.toLowerCase()];
		if(typeof(returnValue) == "undefined") {
			return "";
		} else {
			return returnValue;
		}
	},
	GetSignInInfo: function() {
		var url = window.location.href;
		var siteType = ""
		if(url.indexOf("ctb988.com") >= 0) {
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
		var result = {
			"id": siteType + urlValue + RaceType + RaceDate + loginuser,
			"url": urlValue,
			"loginuser": loginuser,
			"RaceType": RaceType,
			"RaceDate": RaceDate,
			"Sml": Sml,
			"SiteType": siteType
		};
		return result;
	},
	onInit: function() {
		ContentScript.allOnitEvent();
	},
	getWPDiscount: function(data, type, hourse, isticket) {
		var result = 0;
		//item={"id":id,"type":"W","matches":tempArray[0],"hourse":tempArray[1],"ticketsw":parseInt(tempArray[2]),"ticketsp":parseInt(tempArray[3]),"discount":parseFloat(tempArray[4]),"limit":tempArray[4]}
		$(data).each(function(index) {
			var temp = $(this)[0];
			if(temp.type == type && temp.hourse == hourse) {
				if(isticket) {
					if(type == "P") {
						result = temp.ticketsp;
						return false
					}
					result = temp.ticketsw;
					return false
				} else {
					result = temp.discount;
					return false
				}
			}
		});
		return result;
	},
	setSessionValue: function(val) {
		var signInfo = ContentScript.GetSignInInfo();
		var itemName = "b" + signInfo.RaceType + signInfo.RaceDate.replace("-", "").replace("-", "");
		localStorage.setItem(itemName, JSON.stringify(val));
	},
	getSessionValue: function() {
		var signInfo = ContentScript.GetSignInInfo();
		var itemName = "b" + signInfo.RaceType + signInfo.RaceDate.replace("-", "").replace("-", "");
		return $.parseJSON(localStorage.getItem(itemName));
	},
	onPlayerInit: function() {

		var htmlList = '<div id="drag" style="background:white;width: 1060px; height: 1400px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right:370;top:0;min-height: 180px;overflow-y: auto;max-height: 900px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">当前账户:' + $.trim($("#username").text()) + ' &nbsp; 到期时间<span id="daoqitime"></span><span>&nbsp;独赢数据统计</span>';
		htmlList += '<input id="limitsStart" type="number" step="1" style="width: 40px;" size="4" value="240" />-';
		htmlList += '<input id="limitsEnd" type="number" step="1" style="width: 40px;" size="4" value="60" /><input type="button" id="btnChange" text="切换" value="切换"></h3>';
		htmlList += '<div id="divCreate"></div>'
		htmlList += '</div>';
		$("body").append(htmlList);
		$("#daoqitime").text(ContentScript.DaoQiTime);
		ContentScript.HtmlAddDragEvent($("#drag"));
		ContentScript.WPFirstData = ContentScript.GetWinTransData();
		ContentScript.WPFirstPL = ContentScript.getWPPLDataList();
		console.log("111");

		$("#btnChange").bind("click", function() {
			if($("#limitsStart").val() == "240") {
				$("#limitsStart").val("300");
				$("#limitsEnd").val("100");
			} else {
				$("#limitsStart").val("240");
				$("#limitsEnd").val("60");
			}
		});

		self.setInterval(function() {
			var hourseCount1 = ContentScript.GetWinTransData();
			if(hourseCount1.length == 0) {
				return;
			}
			var currentPLData = ContentScript.getWPPLDataList();
			var currentWPData = hourseCount1;
			if(ContentScript.WPFirstData.length == 0) {
				ContentScript.WPFirstData = ContentScript.GetWinTransData();
			}
			//item={"id":id,"type":"W","matches":tempArray[0],"hourse":tempArray[1],"ticketsw":parseInt(tempArray[2]),"ticketsp":parseInt(tempArray[3]),"discount":parseFloat(tempArray[4]),"limit":tempArray[4]}
			var htmlListQPRight = '<table class="bettable" style="width:840px">';
			htmlListQPRight += '<tr style="height:24px"><th style="width:50px">马</th><th style="width:80px">&nbsp;&nbsp;</th><th style="width:80px">早盘赔率</th><th style="width:80px">即时赔率</th><th style="width:80px">早盘WP</th><th style="width:40px">&nbsp;&nbsp;</th><th>W</th><th>P</th><th>WP</th>';
			ContentScript.redData = [];
			ContentScript.blueData = [];
			for(var i = 1; i < 15; i++) {
				var firstPeiLv = ContentScript.getWPPLByHourse(ContentScript.WPFirstPL, i);
				var currentPeiLv = ContentScript.getWPPLByHourse(currentPLData, i);
				var firstWPDiscount = ContentScript.getWPDiscount(ContentScript.WPFirstData, "WP", i, false);
				//var currentWPData = ContentScript.GetWinTransData();
				var currentW = ContentScript.getWPDiscount(currentWPData, "W", i, false);
				var currentP = ContentScript.getWPDiscount(currentWPData, "P", i, false);
				var currentWP = ContentScript.getWPDiscount(currentWPData, "WP", i, false);
				var currentWTicket = ContentScript.getWPDiscount(currentWPData, "W", i, true);
				var currentPTicket = ContentScript.getWPDiscount(currentWPData, "P", i, true);
				var currentWPTicket = ContentScript.getWPDiscount(currentWPData, "WP", i, true);
                ContentScript.WData[i] = currentW;
                ContentScript.WPData[i] = currentWP;
				htmlListQPRight += '<tr style="height:24px">'
				htmlListQPRight += '<td><b>' + i + '</b></td>'
				htmlListQPRight += '<td>赔率</td>'
				if(firstPeiLv == 0 && i == 1) {
					ContentScript.WPFirstPL = ContentScript.getWPPLDataList();
					firstPeiLv = currentPeiLv;
				}
				htmlListQPRight += '<td>' + firstPeiLv + '</td>'

				if(firstPeiLv < currentPeiLv) {
					htmlListQPRight += '<td style="background-color:#8EE5EE;">' + currentPeiLv + '</td>'
				} else {
					htmlListQPRight += '<td>' + currentPeiLv + '</td>'
				}

				if(firstWPDiscount == 76) {
					htmlListQPRight += '<td style="background-color:#EE799F;">' + firstWPDiscount + '</td>'
				} else if(firstWPDiscount >= 89) {
					htmlListQPRight += '<td style="background-color:#8EE5EE;">' + firstWPDiscount + '</td>'
				} else {
					htmlListQPRight += '<td>' + firstWPDiscount + '</td>'
				}

				htmlListQPRight += '<td><b>' + i + '</b></td>'
				if(currentW == 76) {
					htmlListQPRight += '<td style="background-color:#EE799F;">' + currentW + '</td>'
				} else if(currentW >= 89) {
					htmlListQPRight += '<td style="background-color:#8EE5EE;">' + currentW + '</td>'
				} else {
					htmlListQPRight += '<td>' + currentW + '</td>'
				}

				if(currentP == 76) {
					htmlListQPRight += '<td style="background-color:#EE799F;">' + currentP + '</td>'
				} else if(currentP >= 89) {
					htmlListQPRight += '<td style="background-color:#8EE5EE;">' + currentP + '</td>'
				} else {
					htmlListQPRight += '<td>' + currentP + '</td>'
				}

				if(currentWP == 76) {

					if(!ContentScript.redData.contains(i)) {
						ContentScript.redData.push(i);
					}
					htmlListQPRight += '<td style="background-color:#EE799F;">' + currentWP + '</td>'
				} else if(currentWP >= 89) {
					if(!ContentScript.blueData.contains(i)) {
						ContentScript.blueData.push(i);
					}
					htmlListQPRight += '<td style="background-color:#8EE5EE;">' + currentWP + '</td>'
				} else {
					htmlListQPRight += '<td>' + currentWP + '</td>'
				}
				htmlListQPRight += '</tr>'
				htmlListQPRight += '<tr style="height:24px">'
				htmlListQPRight += '<td></td><td></td><td></td><td></td><td></td>'
				htmlListQPRight += '<td></td>'
				if(currentW == 76) {
					if(currentWTicket >= 200000) {
						htmlListQPRight += '<td style="background-color:#EE799F;">' + currentWTicket + '</td>'
					} else {
						htmlListQPRight += '<td>' + currentWTicket + '</td>'
					}
				} else {
					htmlListQPRight += '<td>/</td>'
				}

				if(currentP == 76) {
					if(currentPTicket >= 200000) {
						htmlListQPRight += '<td style="background-color:#EE799F;">' + currentPTicket + '</td>'
					} else {
						htmlListQPRight += '<td>' + currentPTicket + '</td>'
					}
				} else {
					htmlListQPRight += '<td>/</td>'
				}

				if(currentWP == 76) {
					if(currentWPTicket >= 200000) {
						htmlListQPRight += '<td style="background-color:#EE799F;">' + currentWPTicket + '</td>'
					} else {
						htmlListQPRight += '<td>' + currentWPTicket + '</td>'
					}
				} else {
					htmlListQPRight += '<td>/</td>'
				}

				htmlListQPRight += '</tr>'
			}
			$("#divCreate").empty();
			$("#divCreate").append(htmlListQPRight);
			var postData = {};
			postData.red = ContentScript.redData;
            postData.blue = ContentScript.blueData;
            postData.wp = ContentScript.WPData;
            postData.w = ContentScript.WData;
			ContentScript.setSessionValue(postData);
		}, 2000);
	},
	arrayContain: function(arr, indexValue) {
		var isExists = false;
		$(arr).each(function() {
			if($(this)[0] == indexValue) {
				isExists = true;
			}
		});
		return isExists
	},
	allOnitEvent: function() {
		//创建用户界面
		ContentScript.CreateHtmlElement();
		//绑定拖拽事件
		ContentScript.HtmlAddDragEvent($("#drag"));
		ContentScript.HtmlAddDragEvent($("#dragQ"));
		$("#daoqitime").text(ContentScript.DaoQiTime);

		$("#btnStart").bind("click", function() {
			$("#btnStart").hide();
			$("#btnEnd").show();

			ContentScript.timerSearch = self.setInterval(function() {
                var selQ =  $("#selQ").val();
                var selQStart =  $("#selQStart").val();

				var start = $("#startDiscount").val();
				var end = $("#endDiscount").val();
				start = parseFloat(start);
				end = parseFloat(end);
				var resultFirst = ContentScript.GetTransactionData('vrtFC_2', 'FC_DATA_2', start, end);
				var resultSecond = ContentScript.GetTransactionData('vrtFC_4', 'FC_DATA_4', 70, 100);
				//getQPPLData
				var htmlList = '<table class="bettable" style="width:400px">';
				htmlList += '<tr><th width="20%">马</th><th>赔率</th><th width="34%">票数$</th><th width="12%">%</th><th>位置Q%</th><th width="18%">限额</th></tr>';
				var hourseCount = [];
				var postData = ContentScript.getSessionValue();
				console.log(postData);
				console.log(resultFirst);
				$(resultFirst).each(function(index) {
					var hourseM = $(this)[0].hourse.split('-');
					var isExists1 = false;
					var isExists2 = false;
                    var hourse1, hourse2
					if($(this)[0].hourse.indexOf("(") < 0) {
						hourse1 = $(this)[0].hourse.split("-")[0];
						hourse2 = $(this)[0].hourse.split("-")[1];
					} else {
						hourse1 = $(this)[0].hourse.replace(/\(/g, "").replace(/\)/g, "").split("-")[0];
						hourse2 = $(this)[0].hourse.replace(/\(/g, "").replace(/\)/g, "").split("-")[1];
					}
                    if(selQ=="W"&&(postData.w[hourse1]<selQStart||postData.w[hourse2]<selQStart)){
                        return;
                    }
                    if(selQ=="WP"&&(postData.wp[hourse1]<selQStart||postData.wp[hourse2]<selQStart)){
                        return;
                    }
					console.log(hourse1);
                    console.log(hourse2);
                    
					$(hourseCount).each(function(index) {
						var temp = $(this)[0];
						if(temp.hourse == hourseM[0]) {
							isExists1 = true;
							$(this)[0].count = $(this)[0].count + 1;
						}
						if(temp.hourse == hourseM[1]) {
							isExists2 = true;
							$(this)[0].count = $(this)[0].count + 1;
						}
					});
					if(!isExists1) {
						hourseCount.push({
							"hourse": hourseM[0],
							"count": 1
						});
					}
					if(!isExists2) {
						hourseCount.push({
							"hourse": hourseM[1],
							"count": 1
						});
					}

					htmlList += '<tr style="line-height: 30px;">';

					

					//console.log(ContentScript.arrayContain(postData.red, parseInt(hourse1)));

					var hasHourse1 = false;
					var hasHourse2 = false;
					var hourse1String = ""; // 8EE5EE
					var hourse2String = "";
					if(postData != null && postData != undefined && postData.red != null && postData.red != undefined && postData.red.length > 0) {
						if(ContentScript.arrayContain(postData.red, parseInt(hourse1))) {
							hourse1String = "<font color='red'><b>" + hourse1 + "</b></font>"
							hasHourse1 = true;
						}
						if(ContentScript.arrayContain(postData.red, parseInt(hourse2))) {
							hourse2String = "<font color='red'><b>" + hourse2 + "</b></font>"
							hasHourse2 = true;
						}
					}
					if(postData != null && postData != undefined && postData.blue != null && postData.blue != undefined && postData.blue.length > 0) {
						if(ContentScript.arrayContain(postData.blue, parseInt(hourse1))) {
							hourse1String = "<font color='blue'><b>" + hourse1 + "</b></font>"
							hasHourse1 = true;
						}
						if(ContentScript.arrayContain(postData.blue, parseInt(hourse2))) {
							hourse2String = "<font color='blue'><b>" + hourse2 + "</b></font>"
							hasHourse2 = true;
						}
					}

					if(!hasHourse1) {
						hourse1String = "<font>" + hourse1 + "</font>"
					}

					if(!hasHourse2) {
						hourse2String = "<font>" + hourse2 + "</font>"
					}

					var wzQP="";
					if(resultSecond!=null && resultSecond!=undefined){
						try{
							$(resultSecond).each(function(index){
								var item = $(this)[0];
								if(wzQP=="" && item.hourse==("("+hourse1+"-"+hourse2+")")){
									wzQP = item.discount;
								}
							});
						}catch(ex){
							wzQP ="";
						}
					}

					htmlList += '<td>' + hourse1String + '-' + hourse2String + '</td>';
					htmlList += '<td>' + ContentScript.getQPPLData(hourse1, hourse2) + '</td>';
					htmlList += '<td>' + $(this)[0].tickets + '</td>';
					htmlList += '<td>' + $(this)[0].discount + '</td>';
					try{
						if(parseInt(wzQP)>=89){
							htmlList += '<td style="background-color:#8EE5EE;">' + wzQP + '</td>';
						}else{
							htmlList += '<td>' + wzQP + '</td>';
						}
					}catch(ex){
						htmlList += '<td>' + wzQP + '</td>';
					}
					htmlList += '<td>' + $(this)[0].limit + '</td>';
					htmlList += '</tr>';
				});

				htmlList += '</table><br/>';
				console.log(htmlList);
				$("#divCreateQLeft").empty();
				$("#divCreateQLeft").append(htmlList);

				var htmlListQRight = '<table class="bettable" style="width:150px">';
				htmlListQRight += '<tr><th width="20%">马</th><th width="34%">数量</th>';

				if($("input[id='chkQ']:checked").val() == "1") {
					hourseCount.sort(function(a, b) {
						return parseInt(a["hourse"]) > parseInt(b["hourse"]) ? 1 : parseInt(a["hourse"]) == parseInt(b["hourse"]) ? 0 : -1;
					});
				} else {
					hourseCount.sort(function(a, b) {
						return parseInt(a["count"]) < parseInt(b["count"]) ? 1 : parseInt(a["count"]) == parseInt(b["count"]) ? 0 : -1;
					});
				}

				$(hourseCount).each(function(index) {
					htmlListQRight += '<tr style="line-height: 30px;">';
					htmlListQRight += '<td>' + $(this)[0].hourse + '</td>';
					htmlListQRight += '<td>' + $(this)[0].count + '</td>';
					htmlListQRight += '</tr>';
				});
				$("#divCreateQRight").empty();
				$("#divCreateQRight").append(htmlListQRight);
			}, 1000);
		});
		$("#btnEnd").bind("click", function() {
			if(ContentScript.timerSearch != null) {
				clearInterval(ContentScript.timerSearch);
			}
			$("#btnStart").show();
			$("#btnEnd").hide();
		});
	},
	GetFliterData: function(result, start, end) {
		var limitResult = [];
		//将符合条件的跑马的最小值显示出来
		$(result).each(function(index) {
			var temp = $(this)[0];
			var isNew = false;
			if(parseFloat(temp.discount) >= start && parseFloat(temp.discount) <= end) {
				$(limitResult).each(function(item) {
					var tp = $(this)[0];
					if(tp.hourse == temp.hourse) {
						isNew = true;
					}
					if(tp.hourse == temp.hourse && temp.discount < tp.discount) {
						$(this)[0].tickets = temp.tickets;
						$(this)[0].discount = temp.discount;
						$(this)[0].limit = temp.limit;
					}
				});
				if(!isNew) {
					limitResult.push(temp);
				}
			}
		});
		return limitResult;
	},
	getQPPLData: function(x, y) {
		try {
			var len = 0;
			if(parseInt(x) > 7 && parseInt(y) > 8) {
				len = 13 * (y - 8) + (x - 7);
			} else {
				len = 13 * (x - 1) + (y - 1);
			}
			var result = $($("#frmTOTE").find("td")[len - 1]).text();
			if(result == "" || result == "SCR" || isNaN(result)) {
				return 0;
			}
			return parseFloat(result);
		} catch(e) {
			return 0;
		}
	},
	getWPPLDataList: function() {
		var result = [];
		$($("#tttbl td").find(".style22")).each(function(index) {
			var item = {};
			item.pl1 = parseFloat($(this).parent().prev().text());
			item.pl2 = parseFloat($(this).parent().next().text());
			item.cc = $(this).text();
			item.type = "WP";
			result.push(item);
		});
		if(result.length == 0) {
			$($("#tttbl td").find(".style21")).each(function(index) {
				var item = {};
				item.pl1 = parseFloat($(this).parent().prev().text());
				item.pl2 = parseFloat($(this).parent().next().text());
				item.cc = $(this).text();
				item.type = "WP";
				result.push(item);
			});
		}
		return result;
	},
	getWPPLByHourse: function(data, hourse) {
		var peiLv = 0;
		$(data).each(function(item) {
			var temp = $(this)[0];
			if(parseInt(temp.cc) == parseInt(hourse)) {
				peiLv = temp.pl1;
				return;
			}
		});
		return peiLv;
	},
	getIframeInnerHTML(frame, element) {
		try {
			return document.getElementById(frame).contentWindow.document.getElementById(element).innerHTML;
		} catch(e) {
			return document.getElementById(element).innerHTML;
		}
	},
	GetWinTransData: function() {
		var limitsStart = $("#limitsStart").val();
		var limitsEnd = $("#limitsEnd").val();
		//1	1	9	9	83	300/100
		var textq = ContentScript.getIframeInnerHTML('vrtEAT', 'EAT_DATA');
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var textList = textq.split(";");
		var result = [];
		for(var i = 0; i < textList.length; i++) {
			if(textList[i] == "") {
				continue;
			}
			var tempArray = textList[i].split("$");
			var isExists = false;
			var id = tempArray[0] + tempArray[1] + tempArray[2] + tempArray[3];
			var item = null;
			if(tempArray[5] == limitsStart + "/0") {
				item = {
					"id": id,
					"type": "W",
					"matches": tempArray[0],
					"hourse": tempArray[1],
					"ticketsw": parseInt(tempArray[2]),
					"ticketsp": parseInt(tempArray[3]),
					"discount": parseFloat(tempArray[4]),
					"limit": tempArray[5]
				}
			}
			if(tempArray[5] == "0/" + limitsEnd) {
				item = {
					"id": id,
					"type": "P",
					"matches": tempArray[0],
					"hourse": tempArray[1],
					"ticketsw": parseInt(tempArray[2]),
					"ticketsp": parseInt(tempArray[3]),
					"discount": parseFloat(tempArray[4]),
					"limit": tempArray[5]
				}
			}
			if(tempArray[5] == limitsStart + "/" + limitsEnd) {
				item = {
					"id": id,
					"type": "WP",
					"matches": tempArray[0],
					"hourse": tempArray[1],
					"ticketsw": parseInt(tempArray[2]),
					"ticketsp": parseInt(tempArray[3]),
					"discount": parseFloat(tempArray[4]),
					"limit": tempArray[5]
				}
			}

			if(item != null) {
				$(result).each(function(index) {
					var temp = $(this)[0];
					if(item != null && temp.hourse == tempArray[1] && temp.type == item.type) {
						isExists = true;
						if(temp.discount == parseFloat(tempArray[3])) {
							$(this)[0].ticketsw = parseInt($(this)[0].ticketsw) + parseInt(tempArray[2]);
							$(this)[0].ticketsp = parseInt($(this)[0].ticketsp) + parseInt(tempArray[3]);
						}
						return;
					}
				});
			}
			if(!isExists && item != null) {
				result.push(item);
			}
		}
		return result;
	},
	GetTransactionData: function(fc, data, start, end) {
		var textq = ContentScript.getIframeInnerHTML(fc, data);
		console.log(11);
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var result = [];
		var fliterHourse = [];
		var textList = textq.split(";");
		console.log(textList.length);
		for(var i = 0; i < textList.length; i++) {
			if(textList[i] == "") {} else {
				var tempArray = textList[i].split("$");
				var paramValue = 700;
				if(tempArray[1].indexOf("(") >= 0) {
					paramValue = 400;
				}
				var id = tempArray[0] + tempArray[1] + tempArray[2];
				var hourse1, hourse2;
				if(tempArray[1].indexOf("(") < 0) {
					hourse1 = tempArray[1].split("-")[0];
					hourse2 = tempArray[1].split("-")[1];
				} else {
					hourse1 = tempArray[1].replace(/\(/g, "").replace(/\)/g, "").split("-")[0];
					hourse2 = tempArray[1].replace(/\(/g, "").replace(/\)/g, "").split("-")[1];
				}

				var minPL = $("#minPL").val();
				var maxPL = $("#maxPL").val();
				var currentPL = ContentScript.getQPPLData(hourse1, hourse2);
				if((!fliterHourse.contains(tempArray[1])) && parseFloat(tempArray[3]) >= start && parseFloat(tempArray[3]) <= end && parseFloat(tempArray[4]) == paramValue) {
					var isExists = false;
					item = {
						"id": id,
						"type": "WQ",
						"matches": tempArray[0],
						"hourse": tempArray[1],
						"tickets": tempArray[2],
						"discount": parseFloat(tempArray[3]),
						"limit": tempArray[4]
					}
					$(result).each(function(index) {
						var temp = $(this)[0];
						if(temp.hourse == tempArray[1]) {
							isExists = true;
							if(temp.discount > parseFloat(tempArray[3])) {
								$(this)[0].tickets = tempArray[2];
								$(this)[0].discount = parseFloat(tempArray[3]);
								$(this)[0].limit = tempArray[4];
							}
							return;
						}
					});
					if(!isExists) {
						if(minPL <= currentPL && currentPL <= maxPL) {
							result.push(item);
						}
					}
				}
				if(parseFloat(tempArray[3]) < start && parseFloat(tempArray[4]) == paramValue) {
					fliterHourse.push(tempArray[1]);
				}
			}

		}
		return result;
	},
	CreateHtmlElement: function() {
		var htmlList = '<div id="drag" style="background:white;width: 460px; height: 180px; position: absolute; border: solid 1px #ccc; float: right; z-index: 100;right: 0;top: 0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">当前账户:' + $.trim($("#username").text()) + ' &nbsp; 到期时间<span id="daoqitime"></span><input id="minPL" type="number" step="1" style="width: 40px;" size="4" value="0" />-<input id="maxPL" type="number" step="1" style="width: 40px;" size="4" value="70" /></h3>';
		htmlList += '<div style="float: left;"><table style="width:200">';
		htmlList += '<tr style="line-height: 30px;"><td>';
		htmlList += '<input id="startDiscount" type="number" step="1" style="width: 40px;" size="4" value="80" />-';
		htmlList += '<input id="endDiscount" type="number" step="1" style="width: 40px;" size="4" value="80" />';
		htmlList += '</td></tr>';

		htmlList += '<tr style="line-height: 30px;"><td>';
		htmlList += '<input type="button" id="btnStart" value="连赢Q开始" />';
		htmlList += '<input type="button" id="btnEnd" value="连赢Q停止" />';
		htmlList += '</td></tr>';
		htmlList += '</table> </div></div>';

		htmlList += '<div id="dragQ" style="background:white;width: 660px; height: 600px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right: 400;top:0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
        htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">连赢Q统计 &nbsp;<input type="checkbox" id="chkQ" value="1" />按马次排序';
        htmlList += '&nbsp;<select id="selQ"><option>W</option><option>WP</option><select>&nbsp;<input id="selQStart" type="number" step="1" style="width: 40px;" size="4" value="85" />起</h3>';
		htmlList += '<div id="divCreateQLeft" style="float: left;"></div>'
		htmlList += '<div id="divCreateQRight" style="float: right;"></div>'
		htmlList += '</div>';

		$("body").append(htmlList);
	},

	HtmlAddDragEvent: function(obj) {
		var _move = false; //移动标记  
		var _x, _y; //鼠标离控件左上角的相对位置  
		obj.click(function() {
			//alert("click");//点击（松开后触发）  
		}).mousedown(function(e) {
			_move = true;
			_x = e.pageX - parseInt(obj.css("left"));
			_y = e.pageY - parseInt(obj.css("top"));
		});
		$(document).mousemove(function(e) {
			if(_move) {
				var x = e.pageX - _x; //移动时根据鼠标位置计算控件左上角的绝对位置  
				var y = e.pageY - _y;
				obj.css({
					top: y,
					left: x
				}); //控件新位置  
			}
		}).mouseup(function() {
			_move = false;
		});
	}
}
var host = window.location.href;
if(host.indexOf("Q.jsp") >= 0) {
	ContentScript.onInit();
}
if(host.indexOf("playerhk.jsp") >= 0) {
	ContentScript.onPlayerInit();
}