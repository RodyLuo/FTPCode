<%@ page language="C#" autoeventwireup="true" inherits="System_Index2880941, App_Web_0crmur1w" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>后台账号管理系统</title>
    <link rel="stylesheet" href="css/style.css" type="text/css">
    <script src="Scripts/jquery-1.4.1.min.js"></script>
</head>
<body>
    <div id="container">
        <table class="zebra">
            <caption>
                后台账号管理</caption>
            <thead>
                <tr>
                    <th>
                        账号
                    </th>
                    <th>
                        密码
                    </th>
                    <th>
                        是否有效
                    </th>
                    <th>
                        有效期
                    </th>
                    <th>
                        版本
                    </th>
                    <th>
                        <a href="javascript:void(0)" class="AddColumn">新增</a><span title="新增成功后账号在最后面">?</span>
                    </th>
                </tr>
            </thead>
            <tbody id="userList">
                <% System.Collections.Generic.List<UserEntity> userList = XMLData.GetAllUserList(new UserEntity()); %>
                <% foreach (UserEntity item in userList)
                   {  %>
                <tr style='<%=((item.UserName.ToUpper()=="SYSTEM"||item.UserName.ToUpper()=="ADMIN")?"display:none":"") %>'>
                    <td>
                    
                        <span class="UserName">
                            <%= item.UserName.ToString() %></span>
                    </td>
                    <td>
                        <input type="text" disabled="false" class="PassWord" value="<%= item.PassWord.ToString() %>" />
                    </td>
                    <td>
                        <select class="Status">
                            <option value="Y" <%= (item.Status=="Y"?"checked":"") %>>有效</option>
                            <option value="N" <%= (item.Status=="N"?"checked":"") %>>禁用</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="DueTime" value="<%= item.DueTime.ToString() %>" />
                    </td>
                    <td>
                        <input type="text" class="Version" value="<%= item.Version.ToString() %>" />
                    </td>
                    <td>
                        <a href="javascript:void(0)" class="UpdateUser">修改</a>
                        <a href="javascript:void(0)" class="DeleteUser">删除</a>
                    </td>
                </tr>
                <%} %>
            </tbody>
        </table>
    </div>
    <script type="text/javascript">
        function Request(paras) {
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
        };

        $(".AddColumn").bind("click", function () {
            var htmlList = '';
            htmlList += '<tr><td><input type="text" class="UserName" value="" />';
            htmlList += '</td><td>';
            htmlList += '<input type="text" class="PassWord" value="" />';
            htmlList += '</td><td>';
            htmlList += '<select class="Status"><option value="Y">有效</option><option value="N">禁用</option></select>';
            htmlList += '</td><td><input type="text" class="DueTime" value="" /></td>';
            htmlList += '<td><input type="text" class="Version" value="" /> </td>';
            htmlList += '<td><a href="javascript:void(0)" class="AddUser">保存</a></td> </tr>';
            $("#userList").prepend(htmlList);

            $(".AddUser").bind("click", function () {
                if (confirm("确定修改账号吗？")) {
                    var UserName = $(this).parent().parent().find(".UserName").val();
                    var PassWord = $(this).parent().parent().find(".PassWord").val();
                    var Status = $(this).parent().parent().find(".Status").val();
                    var DueTime = $(this).parent().parent().find(".DueTime").val();
                    var Version = $(this).parent().parent().find(".Version").val();
                    var Type = "ADD";
                    var AuthID = Request("AuthID");
                    if (UserName != null && UserName != undefined && UserName.length > 0
                        && PassWord != null && PassWord != undefined && PassWord.length > 0
                        && Status != null && Status != undefined && Status.length > 0
                        && DueTime != null && DueTime != undefined && DueTime.length > 0
                        && Version != null && Version != undefined && Version.length > 0
                    ) {
                        var postData = { UserName: UserName, PassWord: PassWord, Status: Status, DueTime: DueTime, Version: Version, Type: Type, AuthID: AuthID };
                        $.ajax({
                            type: "get",
                            url: "AddUser.ashx",
                            data: postData,
                            success: function (msg) {
                                if (msg == "操作成功") {
                                    self.location.reload();
                                } else {
                                    alert(msg);
                                }
                            },
                            error: function (msg) {
                                alert("操作失败,请联系开发者");
                            }
                        });
                    } else {
                        alert("数据不正确无法保存")
                    }
                }
            })
        });
        $(".UpdateUser").bind("click", function () {
            if (confirm("确定修改账号吗？")) {
                var UserName = $(this).parent().parent().find(".UserName").text();
                var PassWord = $(this).parent().parent().find(".PassWord").val();
                var Status = $(this).parent().parent().find(".Status").val();
                var DueTime = $(this).parent().parent().find(".DueTime").val();
                var Version = $(this).parent().parent().find(".Version").val();
                var Type = "UPDATE";
                var AuthID = Request("AuthID");
                var postData = { UserName: UserName, PassWord: PassWord, Status: Status, DueTime: DueTime, Version: Version, Type: Type, AuthID: AuthID };
                $.ajax({
                    type: "get",
                    url: "AddUser.ashx",
                    data: postData,
                    success: function (msg) {
                        alert(msg);
                    },
                    error: function (msg) {
                        alert("操作失败,请联系开发者");
                    }
                });
            }
        });
        $(".DeleteUser").bind("click", function () {
            if (confirm("确定删除账号吗？")) {
                var UserName = $(this).parent().parent().find(".UserName").text();
                var PassWord = $(this).parent().parent().find(".PassWord").val();
                var Status = "D";
                var DueTime = $(this).parent().parent().find(".DueTime").val();
                var Version = $(this).parent().parent().find(".Version").val();
                var Type = "UPDATE";
                var AuthID = Request("AuthID");
                var postData = { UserName: UserName, PassWord: PassWord, Status: Status, DueTime: DueTime, Version: Version, Type: Type, AuthID: AuthID };
                $.ajax({
                    type: "get",
                    url: "AddUser.ashx",
                    data: postData,
                    success: function (msg) {
                        self.location.reload();
                    },
                    error: function (msg) {
                        alert("操作失败,请联系开发者");
                    }
                });
            }
        });
        
    </script>
</body>
</html>
