<%@ page language="C#" autoeventwireup="true" inherits="Login, App_Web_e3uido4v" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>后台账号管理系统</title>
    <link rel="stylesheet" href="css/style.css" type="text/css">
    <script src="Scripts/jquery-1.4.1.min.js"></script>
</head>
<body>
    <form runat="server">
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
                        Login
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align:center">
                        <input id="UserName" runat="server" class="UserName" type="text" />
                    </td>
                    <td style="text-align:center">
                        <input id="Password" runat="server" class="Password" type="password" />
                    </td>
                    <td style="text-align:center">
                        <asp:Button runat="server" Text="登录" OnClick="Unnamed1_Click" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    </form>
</body>
</html>
