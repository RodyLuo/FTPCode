Array.prototype.contains = function(item) {
	return RegExp(item).test(this);
};

if (!Array.indexOf) {
	Array.prototype.indexOf = function(obj) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
		return -1;
	}
}

Array.prototype.contains = function(obj) {
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
	handerTicketList:['日','60分','30分'],
	handerJSList:['日','60分','30分'],
	handerPLHeadList:['日','60分','15分'],
	handerPLFooterList:['10%','25%'],
	orderResultList:[],
	urlX: "http://"+window.location.host,
	handerPLDataOneDay:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	handerPLData60Min:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	handerPLData30Min:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	
	handerTicketDataOneDay:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	handerTicketData60Min:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	handerTicketData30Min:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	
	handerJSDataOneDay:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	handerJSData60Min:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	handerJSData30Min:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	
	handerJSEndData:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	
	resultPL3Yellow:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	resultPL1MinYellow:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	resultPLCount:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	resultJSCount:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	
	tempJSHtml:"",
	tempTicketHtml:"",
	tempPLHtml:"",
	ChangePervChangCi:0,
	monitorTicketTimeList: [1200,900,600,420,300,180,120,60,0,-30,-50,-70,-90],
	monitorPLTimeList: [900,420,300,60],
	monitorJSTimeList:     [1200,900,600,420,300,180,120,60,0,-30,-50,-70,-90],
	monitorTicketData: [],
	monitorQPLTimeData: [],
	monitorPLTimeData: [],
	monitorJSTimeData: [],
	monitorJSQTimeData: [],
	monitorJSQPTimeData: [],
	ccEndTime: null,
	PervChangCi:0,
	getCurrentPMTime: function() {
		var currentTime = $("#txtTIMER").text();
		if (parseFloat(currentTime) == 0 && ( ContentScript.ccEndTime == null || (ContentScript.ccEndTime !=null && ContentScript.PervChangCi != ContentScript.getChangChi()))) {
			ContentScript.ccEndTime = new Date();
			ContentScript.PervChangCi = ContentScript.getChangChi();
		}
		if (parseFloat(currentTime) == 0 && ContentScript.ccEndTime != null && ContentScript.PervChangCi == ContentScript.getChangChi()) {
			var startDateTime = new Date();
			var diffTime = (ContentScript.ccEndTime.getTime() - startDateTime.getTime());
			var resultValue = parseInt(diffTime / 1000);
			//,0,-30,-50,-70,-90
			if(resultValue<=0 && resultValue>-360){
				if (resultValue >-30  && resultValue<=0) {
					return 0;
				}
				if (resultValue >-50  && resultValue<=-30) {
					return -30;
				}
				if (resultValue >-70  && resultValue<=-50) {
					return -50;
				}
				if (resultValue >-90  && resultValue<=-70) {
					return -70;
				}
				if (resultValue<=-90) {
					return -90;
				}
			}
			return -360;
		}
		var TIMER = parseFloat(currentTime);
		
		if (TIMER > 15 && TIMER<=20) {
			return 1200;
		}
		
		if (TIMER > 10 && TIMER<=15) {
			return 900;
		}
		
		if (TIMER > 7 && TIMER<=10) {
			return 600;
		}
		
		if (TIMER > 5 && TIMER<=7) {
			return 420;
		}
		
		if (TIMER > 3 && TIMER<=5) {
			return 300;
		}
		
		if (TIMER > 2 && TIMER<=3) {
			return 180;
		}
		
		if (TIMER > 1 && TIMER<=2) {
			return 120;
		}
		
		if (TIMER<=1) {
			return 60;
		}
		
		return parseFloat(currentTime) * 60;
	},
	getCurrentPLPMTime: function() {
		var currentTime = $("#txtTIMER").text();
		if (parseFloat(currentTime) == 0 && ContentScript.ccEndTime == null) {
			ContentScript.ccEndTime = new Date();
		}
		if (parseFloat(currentTime) == 0 && ContentScript.ccEndTime != null) {
			var startDateTime = new Date();
			var diffTime = (ContentScript.ccEndTime.getTime() - startDateTime.getTime());
			var resultValue = parseInt(diffTime / 1000);
			
			if(resultValue<=0 && resultValue>-360){
				return 0;
			}
			return 0;
		}
		var TIMER = parseFloat(currentTime);
		if (TIMER > 7 && TIMER<=15) {
			return 900;
		}
		
		if (TIMER > 5 && TIMER<=7) {
			return 420;
		}
		
		if (TIMER > 1 && TIMER<=5) {
			return 300;
		}
		
		if (TIMER<=1) {
			return 60;
		}

		return parseFloat(currentTime) * 60;
	},
	getChangChi: function() {
		var returnVal;
		if (host.indexOf("Q.jsp") >= 0) {
			returnVal = parseInt($("#view1").val());
		} else {
			returnVal = parseInt($(".dd-selected-value").val());
		}
		return returnVal;
	},
	DaoQiTime: "YYYY-MM-DD",
	maxAndMinValueListWin: [],
	getQPPLData: function(x, y) {
		try {
			var len = 0;
			if (parseInt(x) > 7 && parseInt(y) > 8) {
				len = 13 * (y - 8) + (x - 7);
			} else {
				len = 13 * (x - 1) + (y - 1);
			}
			var result = $($("#frmTOTE2").find("td")[len - 1]).text();
			if (result == "" || result == "SCR" || isNaN(result)) {
				return 0;
			}
			return parseFloat(result);
		} catch (e) {
			return 0;
		}
	},
	getQPLData: function(x, y) {
		try {
			var len = 0;
			if (parseInt(x) > 7 && parseInt(y) > 8) {
				len = 13 * (y - 8) + (x - 7);
			} else {
				len = 13 * (x - 1) + (y - 1);
			}
			var result = $($("#frmTOTE").find("td")[len - 1]).text();
			if (result == "" || result == "SCR" || isNaN(result)) {
				return 0;
			}
			return parseFloat(result);
		} catch (e) {
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
		if (result.length == 0) {
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
			if (parseInt(temp.cc) == parseInt(hourse)) {
				peiLv = temp.pl1;
				return;
			}
		});
		return peiLv;
	},
	Request: function(paras) {
		var url = location.href;
		var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
		var paraObj = {}
		for (i = 0; j = paraString[i]; i++) {
			paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
		}
		var returnValue = paraObj[paras.toLowerCase()];
		if (typeof(returnValue) == "undefined") {
			return "";
		} else {
			return returnValue;
		}
	},
	GetSignInInfo: function() {
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
	onPlayerInit: function() {

		ContentScript.CreateHtmlElementPage();

		ContentScript.timerSearchQP  = self.setInterval(function() {
			var currentPMTime = ContentScript.getCurrentPMTime();
			var currentPLTime = ContentScript.getCurrentPLPMTime();
			if(isNaN(currentPMTime)|| isNaN(currentPLTime)){
				return;
			}
			//是否是需要监控的时间
			var isTicketTime = ContentScript.monitorTicketTimeList.contains(currentPMTime)
			var isPeiLvTime = ContentScript.monitorPLTimeList.contains(currentPLTime);
			var cchi = ContentScript.getChangChi();
			var isExistTicket = false;
			var isExistPL = false;

			if(isTicketTime==false){
				isExistTicket=true;
			}else{
				if (isTicketTime &&  !isNaN(currentPMTime)) {
					$(ContentScript.monitorTicketData).each(function(item) {
						var temp = $(this)[0];
						if (temp.changchi == cchi && temp.currentPMTime == currentPMTime) {
							isExistTicket = true;
							return;
						}
					});
				}
			}

			if(isPeiLvTime==false){
				isExistPL=true;
			}else{
				if (isPeiLvTime && !isNaN(currentPLTime)) {
					$(ContentScript.monitorPLTimeData).each(function(item) {
						var temp = $(this)[0];
						if (temp.changchi == cchi && temp.currentPMTime == currentPLTime) {
							isExistPL = true;
							return;
						}
					});
				}
			}
			


			if (!isExistPL) {
				var item = {};
				item.changchi = cchi;
				item.currentPMTime = currentPLTime;
				item.Data = ContentScript.getWPPLDataList();
				ContentScript.monitorPLTimeData.push(item);
			}

			var hourseCount1 = ContentScript.GetWinTransData();
			if (hourseCount1.length == 0) {
				return;
			}
            console.log(222);
            
			hourseCount1.sort(function(a, b) {
				return parseInt(a["ticketsw"]) < parseInt(b["ticketsw"]) ? 1 : parseInt(a["ticketsw"]) == parseInt(b["ticketsw"]) ? 0 : -1;
			});
			if (!isExistTicket) {
				var item = {};
				item.changchi = cchi;
				item.currentPMTime = currentPMTime;
				item.Data = hourseCount1;
				ContentScript.monitorTicketData.push(item);
			}
			$(hourseCount1).each(function(index) {
				var temp = $(this)[0];
				var minValue = 0;
				var maxValue = 0;
				var isExistsItem = false;
				$(ContentScript.maxAndMinValueListWin).each(function(index) {
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
					ContentScript.maxAndMinValueListWin.push({
						"hourse": $(this)[0].hourse,
						"Min": $(this)[0].ticketsw,
						"Max": $(this)[0].ticketsw
					})
				}
			});
			
			
				var htmlTicket = '<table id="HKTicket" class="gridtable" style="width:900px">';
				htmlTicket += '<tr><th width="65px">HK票数</th><th width="50px">1</th><th width="50px">2</th><th width="50px">3</th><th width="50px">4</th><th width="50px">5</th><th width="50px">6</th><th width="50px">7</th><th width="50px">8</th><th width="50px">9</th><th width="50px">10</th><th width="50px">11</th><th width="50px">12</th><th width="50px">13</th><th width="50px">14</th><th></th></tr>';
				
				htmlTicket +=  '<tr class="count"><td width="65px">日</td>';
				for (var i = 1; i <= 14; i++){
					htmlTicket += '<td>' + ContentScript.handerTicketDataOneDay[i-1] + '</td>';
				}
				htmlTicket += '<td>日</td></tr>';
				
				htmlTicket +=  '<tr class="count"><td width="65px">60</td>';
				for (var i = 1; i <= 14; i++){
					htmlTicket += '<td>' + ContentScript.handerTicketData60Min[i-1] + '</td>';
				}
				htmlTicket += '<td>60</td></tr>';
				
				htmlTicket += '<tr class="count"><td width="65px">30</td>';
				for (var i = 1; i <= 14; i++){
					htmlTicket += '<td>' + ContentScript.handerTicketData30Min[i-1] + '</td>';
				}
				htmlTicket += '<td>30</td></tr>';
				
				ContentScript.monitorTicketData.sort(function(a, b) {
					return parseInt(a["currentPMTime"]) < parseInt(b["currentPMTime"]) ? 1 : parseInt(a["currentPMTime"]) == parseInt(b["currentPMTime"]) ? 0 : -1;
				});
				
				var tempTicket="";
				if (!isExistTicket) {
					$(ContentScript.monitorTicketData).each(function(item) {
						var temp = $(this)[0];
						if (temp.changchi == cchi) {
							if (temp.currentPMTime >= 60) {
								if(temp.currentPMTime==2400){
									tempTicket += '<tr class="count"><td width="50px">30分前</td>';
								}else{
									tempTicket += '<tr class="count"><td width="50px">' + (temp.currentPMTime / 60) + '</td>';
								}
							} else {
								tempTicket += '<tr class="count"><td width="50px">' + temp.currentPMTime + '</td>';
							}
							for (var i = 1; i <= 14; i++) {
								tempTicket += '<td width="50px">' + ContentScript.getTicketByHourse(temp.Data, i) + '</td>';
							}
							tempTicket += '<td></td></tr>';
						}
					});
					ContentScript.tempTicketHtml = tempTicket;
				}

				$("#divCreateTicket").empty();
				$("#divCreateTicket").append(htmlTicket+ContentScript.tempTicketHtml);
			

			
				var htmlPeiLv = '<table id="HKPL" class="gridtable" style="width:900px">';
				htmlPeiLv += '<tr><th width="65px">HK赔率</th><th width="50px">1</th><th width="50px">2</th><th width="50px">3</th><th width="50px">4</th><th width="50px">5</th><th width="50px">6</th><th width="50px">7</th><th width="50px">8</th><th width="50px">9</th><th width="50px">10</th><th width="50px">11</th><th width="50px">12</th><th width="50px">13</th><th width="50px">14</th><th></th></tr>';
				
				htmlPeiLv +=  '<tr class="count"><td width="65px">日</td>';
				for (var i = 1; i <= 14; i++){
					htmlPeiLv += '<td>' + ContentScript.handerPLDataOneDay[i-1] + '</td>';
				}
				htmlPeiLv += '<td>日</td></tr>';
				
				htmlPeiLv +=  '<tr class="count"><td width="65px">60</td>';
				for (var i = 1; i <= 14; i++){
					htmlPeiLv += '<td>' + ContentScript.handerPLData60Min[i-1] + '</td>';
				}
				htmlPeiLv += '<td>60</td></tr>';
				
				htmlPeiLv += '<tr class="count"><td width="65px">30</td>';
				for (var i = 1; i <= 14; i++){
					htmlPeiLv += '<td>' + ContentScript.handerPLData30Min[i-1] + '</td>';
				}
				htmlPeiLv += '<td>30</td></tr>';
				
				ContentScript.monitorPLTimeData.sort(function(a, b) {
					return parseInt(a["currentPMTime"]) < parseInt(b["currentPMTime"]) ? 1 : parseInt(a["currentPMTime"]) == parseInt(b["currentPMTime"]) ? 0 : -1;
				});
                var tempPL = "";
                if (!isExistPL) {
                	var FirstTemp=[];
	                var HadChangeTime = true;
	                var LastData =ContentScript.monitorPLTimeData[ContentScript.monitorPLTimeData.length-1];
	                if(LastData!=undefined && LastData!=null){
	                	if(LastData.currentPMTime<=420){
		                	FirstTemp = LastData.Data;
		                }else{
		                	if(ContentScript.monitorPLTimeData[0].currentPMTime>420){
		                		HadChangeTime = false;
		                	}else{
		                		$(ContentScript.monitorPLTimeData).each(function(item){
		                			var temp = $(this)[0];
		                			if(temp.currentPMTime==420){
		                				FirstTemp = temp.Data;
		                				return;
		                			}
		                		});
		                	}
		                }
	                }
	                
					$(ContentScript.monitorPLTimeData).each(function(item) {
						var temp = $(this)[0];
						if (temp.changchi == cchi) {
							if (temp.currentPMTime >= 60) {
								if(temp.currentPMTime==2400){
									tempPL += '<tr class="count"><td width="50px">30分前</th>';
								}else{
									tempPL += '<tr class="count"><td width="50px">' + (temp.currentPMTime / 60) + '</td>';
								}
							} else {
								tempPL += '<tr class="count"><td width="50px">' + temp.currentPMTime + '</td>';
							}
							for (var i = 1; i <= 14; i++) {
								tempPL += '<td width="50px">' + ContentScript.getWPPLByHourse(temp.Data, i) + '</td>';
							}
							tempPL += '<td></td></tr>';
						}
					});
					ContentScript.tempPLHtml = tempPL;
				}
				
				var htmlPeiLv2="";
				htmlPeiLv2 += '<tr id="line10"><td width="65px">10%</td>';
				for (var i = 1; i <= 14; i++){
					htmlPeiLv2 += '<td> </td>';
				}
				htmlPeiLv2+='<td></td></tr>';
				
				htmlPeiLv2 += '<tr id="line25"><td width="65px">25%</td>';
				for (var i = 1; i <= 14; i++){
					htmlPeiLv2 += '<td> </td>';
				}
				htmlPeiLv2 +='<td></td></tr>';
				
				console.log(1);
				$("#divCreatePL").empty();
				$("#divCreatePL").append(htmlPeiLv+ContentScript.tempPLHtml+htmlPeiLv2);
			
			ContentScript.createPLColor();
			ContentScript.createTicketColor();
			ContentScript.createResultHtml();
		}, 1000);
	},
	getTicketByHourse: function(data, hourse) {
		var ticketsw = 0;
		$(data).each(function(item) {
			var temp = $(this)[0];
			if (parseInt(temp.hourse) == parseInt(hourse)) {
				ticketsw = temp.ticketsw;
				return;
			}
		});
		return ticketsw;
	},
	createPLColor:function(){
		var notNeed123 = ($("#notNeed123").val()=="2");
		var data = $("#HKPL").find(".count td");
		var change10 =  [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var change25=  [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var pl = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		
		if(notNeed123){
			var has15Data = false;
			var plFirst = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
			$(data).each(function(index){
				
				var item = index%16;
				var line = parseInt(index/16);
				var val = parseFloat($(this).text())
				
				if(line<=2){
					return;
				}
				
				if(item==0 && $(this).text()=="15"){
					has15Data = true;
					for(var i=1;i<=14;i++){
						pl[i-1] = parseFloat($(data[index+i]).text());	
					}
					plFirst =pl;
				}
				
				if(has15Data && line>2 && item>=1 && item<=14 && $(data[line*16]).text()=="1"){
					if(pl[item-1]!=0 && pl[item-1]*0.9>=val && pl[item-1]*0.75<val &&val>0){
						change10[item-1]=1;
					}
					if(pl[item-1]!=0 && pl[item-1]*0.75>=val &&val>0){
						change25[item-1]=1;
					}
				}
				
				
				if(line==3 && $(data[line*16]).text()=="15" && item>=1 && item<=14){
					var nextLine = parseFloat($(data[index+16]).text());
					var nextLine2 = parseFloat($(data[index+32]).text());
					if(plFirst[item-1]>=nextLine && plFirst[item-1]>=nextLine2 && nextLine>0 && nextLine2>0 &&nextLine>=nextLine2){
						$(this).css("background-color","orange");
						$(data[index+16]).css("background-color","orange");
						$(data[index+32]).css("background-color","orange");
						ContentScript.resultPL3Yellow[item-1]=1;
					}
				}
				
				if(line==6 && item>=1 && item<=14){
					if(plFirst[item-1]>=val && val>0){
						$(this).css("background-color","orange");
						if($(data[line*16]).text()=="1"){
							ContentScript.resultPL1MinYellow[item-1]=1;
						}
					}
				}
				index++;
			});
		}else{
			var plFirst = ContentScript.handerPLDataOneDay;
			var has5Data=false;
			$(data).each(function(index){
				var item = index%16;
				var line = parseInt(index/16);
				var val = parseFloat($(this).text())
				
				if(item==0 && $(this).text()=="5"){
					has5Data =true;
					for(var i=1;i<=14;i++){
						pl[i-1] = parseFloat($(data[index+i]).text());	
					}
				}
				
				if(has5Data && line>0 && item>=1 && item<=14){
					if(pl[item-1]!=0 && pl[item-1]*0.9>=val && pl[item-1]*0.75<val &&val>0){
						change10[item-1]=1;
					}
					if(pl[item-1]!=0 && pl[item-1]*0.75>=val &&val>0){
						change25[item-1]=1;
					}
				}
				if(line<=2 && item>=1 && item<=14){
					if(line==0){
						var nextLine = parseFloat($(data[index+16]).text());
						var nextLine2 = parseFloat($(data[index+32]).text());
						if(plFirst[item-1]>=nextLine && plFirst[item-1]>=nextLine2 && nextLine>0 && nextLine2>0 &&nextLine>=nextLine2){
							$(this).css("background-color","orange");
							$(data[index+16]).css("background-color","orange");
							$(data[index+32]).css("background-color","orange");
							ContentScript.resultPL3Yellow[item-1]=1;
						}
					}
				}
				
				if(line>2 && item>=1 && item<=14){
					if(plFirst[item-1]>val && val>0){
						$(this).css("background-color","orange");
						if($(data[line*16]).text()=="1"){
							ContentScript.resultPL1MinYellow[item-1]=1;
						}
					}
				}
				index++;
			} );
		}
		
		$("#line10").find("td").each(function(index){
				if(index>=1 && index<=14){
					if(change10[index-1]>0){
						$(this).css("background-color","orange");
					}else{
						$(this).css("background-color","");
					}
				}
				index++;
		});
			
		$("#line25").find("td").each(function(index){
				if(index>=1 && index<=14){
					if(change25[index-1]>0){
						ContentScript.resultPLCount[index-1] = 1;
						$(this).css("background-color","red");
					}else{
						$(this).css("background-color","");
					}
				}
				index++;
		});
			
		for(var item=0;item<14;item++){
			if(ContentScript.resultPL3Yellow[item]>0 && ContentScript.resultPL1MinYellow[item]>0){
				ContentScript.resultPLCount[item]=1;
			}
		}
		
	},
	createTicketColor:function(){
		var data = $("#HKTicket").find(".count td");
		var min5Line =  [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		
		var lineMax = ContentScript.getLineMaxValue(data);
		$(data).each(function(index){
			var line = parseInt(index/16);
			var item = index%16;
			var val = parseFloat($(this).text())
			if(item>=1 && item<=14){
				if(lineMax[line]<=val && val>0){
					$(this).css("background-color","orange");
				}
			}
			index++;
		});
	},
	getLineMaxValue:function(obj){
		var retVal = [];
		var line = parseInt(obj.length/16);
		for(var i=0;i<line;i++){
			var lineMax=0;
			for(var j=0;j<16;j++){
			  if(j>=1 && j<=14){
			  	  var temp = parseFloat($(obj[i*16+j]).text());
				  if(temp>lineMax){
				  	lineMax= temp;
				  }
			  }
			}
			retVal.push(lineMax);
		}
		return retVal;
	},
	createResultHtml:function(){
		var htmlJS = '<table class="gridtable" style="width:500px">';
		htmlJS += '<tr><th>马</th><th>数量</th><th>购买</th></tr>';
		var JSLimits = parseInt($("#JSLimits").val());
		var HowMuchPL= parseInt($("#HowMuchPL").val());
		var masterList=[];
		for(var item=0;item<14;item++){
			if(ContentScript.resultPLCount[item]>0 && ContentScript.resultJSCount[item]>=JSLimits){
				masterList.push(item+1);	
			}
		}
		var resultList =[];
		var jsList=[];
		var countMa =0;
		if(masterList.length>0){
			for(var i=0;i<masterList.length;i++){
				for(var j=0;j<14;j++){
					if(ContentScript.resultJSCount[j]>0){
						jsList.push(ContentScript.resultJSCount[j]);
						if(masterList[i]!=j+1){
							var item ={"id":Math.random(),"hourse1":masterList[i],"hourse2":j+1,"countJS":ContentScript.resultJSCount[j]}
							resultList.push(item);	
							countMa+=ContentScript.resultJSCount[j];
						}
					}
				}
			}
			
			resultList.sort(function(a, b) {
				return parseInt(a["countJS"]) < parseInt(b["countJS"]) ? 1 : parseInt(a["countJS"]) == parseInt(b["countJS"]) ? 0 : -1;
			});
			
			 
			$(resultList).each(function(index){
				htmlJS += '<tr><td>'+ $(this)[0].hourse1 + '-' + $(this)[0].hourse2 +'</td><td>'+ $(this)[0].countJS +'</td><td><input type="button" value="购买" class="orderOne"/><input type="hidden" class="hiddenOrderData" value="'+ $(this)[0].id +'"/></td></tr>';
			});
			
			ContentScript.orderResultList = resultList;
			
			htmlJS += '<tr><td>总计</td><td>'+ countMa +'</td><td>'+ parseInt(countMa)*parseInt(HowMuchPL) +'</td></tr>';
			
			$("#divShowResult").empty();
		    $("#divShowResult").append(htmlJS +'</table>');	
		    
		    $(".orderOne").bind("click",function(){
				$(this).hide();
				//下单即不再计算马
				clearInterval(ContentScript.timerSearch);
			    clearInterval(ContentScript.timerSearchQP);
				
				var data = $(this).parent().find(".hiddenOrderData").val();
				$(ContentScript.orderResultList).each(function(){
					if(data==$(this)[0].id){
						ContentScript.orderBetQ($(this)[0]);
					}
				});
			})
		}
	},
	createJSColor:function(){
		var data = $("#HKJS").find(".count td");
		//统计每个马的总数
		var countLine = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var countLineSort = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var min5Line =  [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var dengData =  [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var lineMax = ContentScript.getLineMaxValue(data);
		var has5Data=false;
		var has1Data=false;
		$(data).each(function(index){
			var item = index%16;
			var line = parseInt(index/16);
			if(item>=1 && item<=14){
				var val = parseFloat($(this).text())
				countLine[item-1] += val ;
				countLineSort[item-1] += val ;
				// 如果有5分钟的基数的时候
				if(has5Data){
					if(min5Line[item-1]+2 <= val){
						dengData[item-1]= val;
					}
				}
				// 如果有1分钟的基数的时候
				if(has1Data){
					if(ContentScript.resultJSCount[item-1] < val){
						ContentScript.resultJSCount[item-1]= val;
					}
				}
				
				//最大显示黄色
				if(lineMax[line]<=val && val >0){
					$(this).css("background-color","orange");
				}
			}
			if(item==0 && $(this).text()=="5"){
				has5Data =true;
				for(var i=1;i<=14;i++){
					min5Line[i-1] = parseFloat($(data[index+i]).text());	
				}
			}
			
			if(item==0 && $(this).text()=="1"){
				has1Data =true;
				for(var i=1;i<=14;i++){
					ContentScript.resultJSCount[i-1]= parseFloat($(data[index+i]).text());	
				}
			}
			
			index++;
		});
		countLineSort.sort(function(a,b){return a>b?1:-1});;
		//显示统计 并且排名前3的显示黄色背景
	    $("#countJS").find("td").each(function(index){
	    	if(index>=1 && index<=14){
	    		if(countLine[index-1] >0 && countLineSort[11]<=countLine[index-1]){
	    			$(this).text(countLine[index-1]).css("background-color","orange")
	    		}else{
	    			$(this).text(countLine[index-1]).css("background-color","")
	    		}
	    	}
	    	index++;
	    });
		//显示灯  以5分钟为基数 超过两个的显示绿色 background-color:#00FF00;
		$("#deng").find("td").each(function(index){
	    	if(index>=1 && index<=14){
	    		if(dengData[index-1]>0){
	    			$(this).css("background-color","#00FF00")
	    		}
	    	}
	    	index++;
	  });
	},
	allOnitEvent: function() {
		ContentScript.timerSearch = self.setInterval(function() {
			var resultFirst;
			var signInfo = ContentScript.GetSignInInfo();
			var itemName = "a"+signInfo.RaceType+signInfo.RaceDate.replace("-","").replace("-","");
			if (host.indexOf("Q.jsp") >= 0) {
				resultFirst = ContentScript.GetTransactionDataByArea('vrtFC_1', 'FC_DATA_1');
				var postData = {};
	            
	            postData.race_type = signInfo.RaceType;
				postData.race_date = signInfo.RaceDate;
				postData.Data = resultFirst;
				
				if(localStorage.getItem(itemName)==null || localStorage.getItem(itemName) ==undefined){
					localStorage.setItem(itemName,JSON.stringify(postData));
				}else{
					localStorage.setItem(itemName,JSON.stringify(postData));
				}
			}else{
				if(localStorage.getItem(itemName)==null || localStorage.getItem(itemName) ==undefined){
					resultFirst=null;
				}else{ 
					resultFirst = $.parseJSON(localStorage.getItem(itemName)).Data;
					ContentScript.createJSHtml(resultFirst);
					ContentScript.createJSColor();
				}
			}
            
            if(resultFirst==null || resultFirst==undefined ){
            	return;
            }
			return;
		}, 1000);
	},
	createJSHtml:function(resultFirst){
			var hourseCount = [];
			resultFirst.sort(function(a, b) {
				return parseInt(a["tickets"]) < parseInt(b["tickets"]) ? 1 : parseInt(a["tickets"]) == parseInt(b["tickets"]) ? 0 : -1;
			});
			
			$(resultFirst).each(function(index) {
				if($(this)[0].hourse ==null || $(this)[0].hourse == undefined || $(this)[0].hourse.indexOf("-")<0){
					return;
				}
				var hourseM = $(this)[0].hourse.split('-');

				var isExists1 = false;
				var isExists2 = false;

				$(hourseCount).each(function(index) {
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
					hourseCount.push({
						"hourse": hourseM[0],
						"count": 1
					});
				}
				if (!isExists2) {
					hourseCount.push({
						"hourse": hourseM[1],
						"count": 1
					});
				}
			});

			hourseCount.sort(function(a, b) {
				return parseInt(a["count"]) < parseInt(b["count"]) ? 1 : parseInt(a["count"]) == parseInt(b["count"]) ? 0 : -1;
			});

			var currentPMTime = ContentScript.getCurrentPMTime();
			//是否是需要监控的时间
			var isExistsJSTime = ContentScript.monitorJSTimeList.contains(currentPMTime)
			var cchi = ContentScript.getChangChi();
			var isExistJS = false;
			
			if(isExistsJSTime==false){
				isExistJS =true;
			}else{
				if (isExistsJSTime) {
					$(ContentScript.monitorJSQTimeData).each(function(item) {
						var temp = $(this)[0];
						if (temp.changchi == cchi && temp.currentPMTime == currentPMTime) {
							isExistJS = true;
							return;
						}
					});
				}
			}
				
				if (!isExistJS) {
					var item = {};
					item.changchi = cchi;
					item.currentPMTime = currentPMTime;
					item.Data = hourseCount;
					ContentScript.monitorJSQTimeData.push(item);
					
					ContentScript.monitorJSQTimeData.sort(function(a, b) {
						return parseInt(a["currentPMTime"]) < parseInt(b["currentPMTime"]) ? 1 : parseInt(a["currentPMTime"]) == parseInt(b["currentPMTime"]) ? 0 : -1;
					});
					
					var tempHtml = "";
					$(ContentScript.monitorJSQTimeData).each(function(item) {
						var temp = $(this)[0];
						if (temp.changchi == cchi) {
							if (temp.currentPMTime >= 60) {
								if(temp.currentPMTime==2400){
									tempHtml += '<tr class="count"><td width="50px">30分前</td>';
								}else{
									tempHtml += '<tr class="count"><td width="50px">' + (temp.currentPMTime / 60) + '</td>';
								}
							} else {
								tempHtml += '<tr class="count"><td width="50px">' + temp.currentPMTime + '</td>';
							}
							
							for (var i = 1; i <= 14; i++) {
								var tempCount = ContentScript.getJSCountByHourse(temp.Data, i)
								tempHtml += '<td width="50px">' + tempCount + '</td>';
							}
							tempHtml += '<td></td></tr>';
						}
					});
					ContentScript.tempJSHtml=tempHtml;
				}
				
				var htmlJS = '<table id="HKJS" class="gridtable" style="width:900px">';
				htmlJS += '<tr><th width="65px">HK脚数</th>';
				
				for (var i = 1; i <= 14; i++) {
					htmlJS += '<th width="50px">' + i + '</th>';
				}
				htmlJS += '<th></th></tr>'
				
				var HeardHtml = '<tr class="count"><td width="65px">日</td>';
				for (var i = 1; i <= 14; i++){
					HeardHtml += '<td>' + ContentScript.handerJSDataOneDay[i-1] + '</td>';
				}
				HeardHtml += '<td>日</td></tr>';
				
				HeardHtml += '<tr class="count"><td width="65px">60</td>';
				for (var i = 1; i <= 14; i++){
					HeardHtml += '<td>' + ContentScript.handerJSData60Min[i-1] + '</td>';
				}
				HeardHtml += '<td>60</td></tr>';
				
				HeardHtml += '<tr class="count"><td width="65px">30</td>';
				for (var i = 1; i <= 14; i++){
					HeardHtml += '<td>' + ContentScript.handerJSData30Min[i-1] + '</td>';
				}
				HeardHtml += '<td>30</td></tr>';
				
				
				var htmlJSCount ="";
				htmlJSCount += '<tr id="countJS" style="background-color:#fff68f" ><td style="background-color:#fff68f">合脚</th>';
			    for (var i = 1; i <= 14; i++){
			    	htmlJSCount += '<td style="background-color:#fff68f"></td>';
			    }
				htmlJSCount += '<td >合脚</td></tr>';
				
				
				var htmlJSDeng ="";
				htmlJSDeng += '<tr id="deng" style="background-color:#fff68f" ><td style="background-color:#fff68f">灯</th>';
			    for (var i = 1; i <= 14; i++){
			    	htmlJSDeng += '<td >  </td>';
			    }
				htmlJSDeng += '<td style="background-color:#fff68f">灯</td></tr>';
				
				var htmlJSEnd ="";
				htmlJSEnd += '<tr><td></th>';
			    for (var i = 1; i <= 14; i++){
			    	htmlJSEnd += '<td > '+ i +' </td>';
			    }
				htmlJSEnd += '<td ></td></tr>';
				
				htmlJSEnd += '<tr><td width="65px"></td>';
				for (var i = 1; i <= 14; i++){
					htmlJSEnd += '<td>' + ContentScript.handerJSEndData[i-1] + '</td>';
				}
				htmlJSEnd += '<td></td></tr>';

				$("#divCreateJS").empty();
				$("#divCreateJS").append(htmlJS + HeardHtml + ContentScript.tempJSHtml + htmlJSDeng + htmlJSCount + htmlJSEnd +'</table>');
			
	},
	getJSCountByHourse: function(data, hourse) {
		var jsCount = 0;
		$(data).each(function(item) {
			var temp = $(this)[0];
			if (parseInt(temp.hourse) == parseInt(hourse)) {
				jsCount = temp.count;
				return;
			}
		});
		return jsCount;
	},
	GetFliterData: function(result, start, end) {
		var limitResult = [];
		//将符合条件的跑马的最小值显示出来
		$(result).each(function(index) {
			var temp = $(this)[0];
			var isNew = false;
			if (parseFloat(temp.discount) >= start && parseFloat(temp.discount) <= end) {
				$(limitResult).each(function(item) {
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
		} catch (e) {
			return "";
		}
	},
	GetWinTransData: function() {
		//1	1	9	9	83	300/100
		var textq = ContentScript.getIframeInnerHTML('vrtBET', 'BET_DATA');
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var textList = textq.split(";");
		var result = [];
		for (var i = 0; i < textList.length; i++) {
			var tempArray = textList[i].split("$");
			var isExists = false;
			var id = tempArray[0] + tempArray[1] + tempArray[2] + tempArray[3];
			item = {
				"id": id,
				"type": "WQ",
				"matches": tempArray[0],
				"hourse": tempArray[1],
				"ticketsw": parseInt(tempArray[2]),
				"ticketsp": parseInt(tempArray[3]),
				"discount": parseFloat(tempArray[4]),
				"limit": tempArray[4]
			}
			//&& parseInt(tempArray[3]) > 0 
			$(result).each(function(index) {
				var temp = $(this)[0];
				if (temp.hourse == tempArray[1] 
				    && parseInt(tempArray[2]) > 0 && (tempArray[5]=="110/30" || tempArray[5]=="240/60"||tempArray[5]=="300/100" || tempArray[5]=="110/0" || tempArray[5]=="240/0"||tempArray[5]=="300/0")) {
					isExists = true;
					//if (temp.discount > parseFloat(tempArray[3])) {
						$(this)[0].ticketsw = parseInt($(this)[0].ticketsw) + parseInt(tempArray[2]);
						//$(this)[0].ticketsp = parseInt($(this)[0].ticketsp) + parseInt(tempArray[3]);
					//}
					return;
				}
			});
			if (!isExists && parseInt(tempArray[2]) > 0 && (tempArray[5]=="110/30" || tempArray[5]=="240/60"||tempArray[5]=="300/100"  || tempArray[5]=="110/0" || tempArray[5]=="240/0"||tempArray[5]=="300/0")) {
				result.push(item);
			}
		}
		return result;
	},
	GetTransactionData: function(fc, data, start, end) {
		var textq = ContentScript.getIframeInnerHTML(fc, data);
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var result = [];
		var fliterHourse = [];
		var textList = textq.split(";");
		console.log(textList.length);
		for (var i = 0; i < textList.length; i++) {
			var tempArray = textList[i].split("$");
			var paramValue = 700;
			if (tempArray[1].indexOf("(") >= 0) {
				paramValue = 400;
			}
			var id = tempArray[0] + tempArray[1] + tempArray[2];
			if ((!fliterHourse.contains(tempArray[1])) && parseFloat(tempArray[3]) >= start && parseFloat(tempArray[3]) <= end && parseFloat(tempArray[4]) == paramValue) {
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
	GetTransactionDataByArea: function(fc, data) {
		var textq = ContentScript.getIframeInnerHTML(fc, data);
		textq = textq.replace(/\n/g, ";");
		textq = textq.replace(/\s/g, "$");
		var result = [];
		var textList = textq.split(";");
		console.log(textList.length);
		for (var i = 0; i < textList.length; i++) {
			var tempArray = textList[i].split("$");
			var id = tempArray[0] + tempArray[1] + tempArray[2];

			var isExists = false;
			item = {
				"id": id,
				"type": "WQ",
				"matches": tempArray[0],
				"hourse": tempArray[1],
				"tickets": parseFloat(tempArray[2]),
				"discount": parseFloat(tempArray[3]),
				"limit": tempArray[4]
			}
			$(result).each(function(index) {
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
	CreateHtmlElement: function() {
		var htmlList = '';

		htmlList += '<div id="dragQ" style="background:white;width: 660px; height: 480px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right: 400;top:0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">连赢Q下注统计</h3>';
		htmlList += '<div id="divCreateQLeft" style="float: left;"></div>'
		htmlList += '<div id="divCreateQRight" style="float: right;"></div>'
		htmlList += '</div>';

		htmlList += '<div id="dragJSQ" style="background:white;width: 860px; height: 480px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right: 400;top:0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">连赢Q脚数统计  &nbsp;&nbsp;&nbsp;&nbsp;<select id="jsRedColor"><option>2</option><option>3</option><option selected="selected">4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option></select></h3>';
		htmlList += '<div id="divCreateJSQ" style="float: left;"></div>'
		htmlList += '</div>';

		$("body").append(htmlList);
	},
	CreateHtmlElementPage:function(){
		var htmlList  = '<style type="text/css">'
			htmlList += 'table.gridtable {'
			htmlList += '	font-family: verdana,arial,sans-serif;'
			htmlList += '	font-size:12px!important;'
			htmlList += '	color:#333333;'
			htmlList += '	text-align: center;'
			htmlList += '	border-width: 1px;'
			htmlList += '	border-color: #666666;'
			htmlList += '	border-collapse: collapse;'
			htmlList += '}'
			htmlList += 'table.gridtable th {'
			htmlList += '	border-width: 1px;'
			htmlList += '	padding: 1px;'
			htmlList += '	border-style: solid;'
			htmlList += '	text-align: center;'
			htmlList += '	border-color: #666666;'
			htmlList += '	background-color: #dedede;'
			htmlList += '}'
			htmlList += 'table.gridtable td {'
			htmlList += '	border-width: 1px;'
			htmlList += '	padding: 1px;'
			htmlList += '	height:15px!important;'
			htmlList += '	font-size:12px!important;'
			htmlList += '	border-style: solid;'
			htmlList += '	text-align: center;'
			htmlList += '	border-color: #666666;'
			htmlList += '	background-color: #ffffff;'
			htmlList += '}'
			htmlList += '</style>';
		htmlList += '<div id="dragTable" style="background:white;width: 900px; height: 800px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right: 400;top:0;min-height: 180px;overflow-y: auto;max-height: 800px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">新版统计相关报表软件 &nbsp;&nbsp;<select width="80px" id="notNeed123">'
		htmlList += '<option value="1">需要录入赔率</option><option value="2">不需要录入赔率</option></select> &nbsp;&nbsp;&nbsp;&nbsp;脚数阀值<input type="number" id="JSLimits" step="1" style="width: 50px;" value="4" /></h3>';
		htmlList += '<div id="divEditTable" style="float: left;">'
		htmlList += '<table class="gridtable" style="width:860px">';
		htmlList += '<tr><th width="65px">手动输入</th><th width="55px">1</th><th width="55px">2</th><th width="55px">3</th><th width="55px">4</th><th width="55px">5</th><th width="55px">6</th><th width="55px">7</th><th width="55px">8</th><th width="55px">9</th><th width="55px">10</th><th width="55px">11</th><th width="55px">12</th><th width="55px">13</th><th width="55px">14</th></tr>';
		htmlList += '<tr id="editDataLine"><td width="65px"><select width="60px" id="insertType">'
		htmlList += '<option value="1">赔率前日</option><option value="2">赔率60分</option><option value="3">赔率30分</option>'
		htmlList += '<option value="4">票数前日</option><option value="5">票数60分</option><option value="6">票数30分</option>'
		htmlList += '<option value="7">脚数前日</option><option value="8">脚数60分</option><option value="9">脚数30分</option><option value="10">表格底部</option>'
		htmlList += '</select></td>'
		htmlList += '<td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" />'
		htmlList += '</td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td>'
		htmlList += '<td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td>'
		htmlList += '<td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td>'
		htmlList += '<td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td>'
		htmlList += '<td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td>'
		htmlList += '<td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td><td width="50px"><input type="number" step="1" style="width: 50px;" value="0" /></td></tr>';
		htmlList += '<td ><td colspan="16"><input type="button" style="width:200px;height:25px;" id="btnSave" title="提交" value="提交" text="确定"/><font color="blue" id="saveStatus"></font></td></tr></table>';
		htmlList += '</div>'
		htmlList += '<div id="divCreatePL" style="float: left;"></div>'
		htmlList += '<div id="divCreateJS" style="float: left;"></div>'
		htmlList += '<div id="divCreateTicket" style="float: left;"></div>'
		htmlList += '</div>';
		
		htmlList += '<div id="dragShowResult" style="background:white;width: 600px; height: 600px; position: absolute; border: solid 1px #ccc; float: left; z-index: 100;right: 400;top:0;min-height: 180px;overflow-y: auto;max-height: 600px;">';
		htmlList += '<h3 style="color: #fff; background: none repeat scroll 0 0 rgba(16, 90, 31, 0.7); color: #FFFFFF; height: 30px; line-height: 30px; margin: 0;">最可能中马组合  &nbsp;&nbsp;买多少倍<input type="number" id="HowMuchPL" value="10" step="1" style="width: 50px;" value="0" /> &nbsp; 极限<input type="number" id="Limits" value="700" step="100" style="width: 50px;" value="0" /> <input type="button" id="btnAllOrder" value="全下单" /></h3>';
		htmlList += '<div id="divShowResult" style="float: left;">'
		htmlList += '</div>'
		htmlList += '</div>'
		
		$("body").append(htmlList);
		
		ContentScript.HtmlAddDragEvent($("#dragTable"));
		ContentScript.HtmlAddDragEvent($("#dragShowResult"));
		
		$("#btnAllOrder").bind("click",function(){
			var pl = parseInt($("#HowMuchPL"));
			if(pl>0){
				alert("多少票不能为空");
				return;
			}
			$("#btnAllOrder").hide();
			$("#divShowResult").find("input[type='button']").hide();
			//下单即不再计算马
			clearInterval(ContentScript.timerSearch);
			clearInterval(ContentScript.timerSearchQP);
			
			$(ContentScript.orderResultList).each(function(){
				ContentScript.orderBetQ($(this)[0])
			});
		});
		
		$("#btnSave").bind("click",function(){
			var type = $("#insertType").val();
			switch(type)
			{
				case "1":
				{
					ContentScript.handerPLDataOneDay=[];
					for(var i=0;i<14;i++){
						ContentScript.handerPLDataOneDay.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				case "2":
				{
					
					ContentScript.handerPLData60Min=[];
					for(var i=0;i<14;i++){
						ContentScript.handerPLData60Min.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				case "3":
				{
					
					ContentScript.handerPLData30Min=[];
					for(var i=0;i<14;i++){
						ContentScript.handerPLData30Min.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				
				case "4":
				{
					
					ContentScript.handerTicketDataOneDay=[];
					for(var i=0;i<14;i++){
						ContentScript.handerTicketDataOneDay.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				case "5":
				{
					
					ContentScript.handerTicketData60Min=[];
					for(var i=0;i<14;i++){
						ContentScript.handerTicketData60Min.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				case "6":
				{
					ContentScript.handerTicketData30Min=[];
					for(var i=0;i<14;i++){
						ContentScript.handerTicketData30Min.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				
				case "7":
				{
					
					ContentScript.handerJSDataOneDay=[];
					for(var i=0;i<14;i++){
						ContentScript.handerJSDataOneDay.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				case "8":
				{
					
					ContentScript.handerJSData60Min=[];
					for(var i=0;i<14;i++){
						ContentScript.handerJSData60Min.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				case "9":
				{
					
					ContentScript.handerJSData30Min=[];
					for(var i=0;i<14;i++){
						ContentScript.handerJSData30Min.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				case "10":
				{
					
					ContentScript.handerJSEndData=[];
					for(var i=0;i<14;i++){
						ContentScript.handerJSEndData.push($($("#editDataLine").find("input").eq(i)).val());
					}
					break;
				}
				
				
			}
			
			for(var i=0;i<14;i++){
				$($("#editDataLine").find("input").eq(i)).val("0");
			}
			$("#saveStatus").text("保存成功");
		});
	},
	orderBetQ:function(obj){
		var y;
		try{
			y = view1.options[view1.selectedIndex].value;
		}catch(e){
			y = $(".dd-selected-value").val();
		}
		var Limits = $("#Limits").val()
		var signInfo = ContentScript.GetSignInInfo();
		var postData = {};
		postData.task = "betBox";
		postData.combo ="box";
		postData.Tix = parseInt(obj.countJS) * parseInt($("#HowMuchPL").val());//多少票
		postData.Race = parseInt(y);
		if(parseInt(obj.hourse1)>parseInt(obj.hourse2) ){
			postData.Hss = obj.hourse2+"_"+obj.hourse1;
		}else{
			postData.Hss = obj.hourse1+"_"+obj.hourse2;
		}
		postData.type = "BET";
		postData.amount = 100;
		postData.fclmt = parseInt(Limits);
		postData.race_type = signInfo.RaceType;
		postData.race_date = signInfo.RaceDate;
	    postData.show = parseInt(y);
		postData.rd = Math.random();
		postData.post = 1;
		postData.fctype=0;
		///forecast?task=betBox&combo=0&Tix=2&Race=6&Hs1=1&Hs2=2&Hs3=&Hs4=&Hs5=&Hs6=&Hs7=&Hs8=&fctype=0&Q=Q&type=EAT&overflow=1&amount=90&fclmt=700&race_type=330E&race_date=12-04-2015&show=6&rd=0.05655713961459696
		///forecast?task=betBox&combo=box&Tix=10&Race=1&Hss=1_2&fctype=0&type=BET&amount=80&fclmt=700&race_type=3H&race_date=10-04-2016&show=1&post=1&rd=0.7604487739642092
		$.ajax({
					type: "get",
					url: ContentScript.urlX +"/forecast",
					data: postData,
					success: function (msg) {
						console.log(msg);
					},
					error:function(e){
						console.log(e);
					}
				});
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
			if (_move) {
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
if (host.indexOf("Q.jsp") >= 0) {
	ContentScript.onInit();
}
if (host.indexOf("playerhk.jsp") >= 0) {
	ContentScript.onPlayerInit();
	ContentScript.onInit();
}             
    