<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Collections.Generic;

public class Handler : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        try
        {
            string UserName = (string.IsNullOrEmpty(context.Request["UserName"]) ? "" : context.Request["UserName"]).Trim();
            string PassWord = (string.IsNullOrEmpty(context.Request["PassWord"]) ? "" : context.Request["PassWord"]).Trim();
            string Status = (string.IsNullOrEmpty(context.Request["Status"]) ? "" : context.Request["Status"]).Trim();
            string DueTime = (string.IsNullOrEmpty(context.Request["DueTime"]) ? "" : context.Request["DueTime"]).Trim();
            string Version = (string.IsNullOrEmpty(context.Request["Version"]) ? "" : context.Request["Version"]).Trim();
            string AuthID = (string.IsNullOrEmpty(context.Request["AuthID"]) ? "" : context.Request["AuthID"]).Trim();
            string Type = (string.IsNullOrEmpty(context.Request["Type"]) ? "" : context.Request["Type"]).Trim();

            DateTime dt;
            DateTime.TryParse(DueTime, out dt);
            if (string.IsNullOrEmpty(UserName)
                || string.IsNullOrEmpty(PassWord)
                || string.IsNullOrEmpty(Status)
                || string.IsNullOrEmpty(DueTime)
                || string.IsNullOrEmpty(Version)
                || string.IsNullOrEmpty(AuthID)
                || string.IsNullOrEmpty(Type)
                )
            {
                context.Response.Write("请检查数据是否合法！");
                return;
            }

            UserEntity entity = new UserEntity();
            entity.DueTime = DueTime;
            entity.PassWord = PassWord;
            entity.Status = Status;
            entity.UserName = UserName;
            entity.Version = Version.ToUpper();

            UserEntity systemitem = new UserEntity();
            systemitem.UserName = "system";
            string adminPassword = XMLData.GetSystemUserList(systemitem)[0].PassWord;

            if (AuthID == adminPassword)
            {
                string checkSuccess = "操作非法";
                if (Type.ToUpper() == "ADD")
                {
                    UserEntity item = new UserEntity();
                    item.UserName = UserName;
                    item.PassWord = PassWord;
                    List<UserEntity> aa = XMLData.GetAllUserList(item);
                    if (aa != null && aa.Count > 0)
                    {
                        checkSuccess = "用户名重复";
                    }
                    else
                    {
                        if (XMLData.AddUser(entity))
                        {
                            checkSuccess = "操作成功";
                        }
                    }
                }

                if (Type.ToUpper() == "UPDATE")
                {
                    UserEntity item = new UserEntity();
                    item.UserName = UserName;
                    List<UserEntity> aa = XMLData.GetAllUserList(item);
                    if (aa != null && aa.Count < 1)
                    {
                        checkSuccess = "用户名不存在";
                    }
                    else
                    {
                        item.PassWord = PassWord;
                        List<UserEntity> bb = XMLData.GetAllUserList(item);
                        if (bb != null && bb.Count == 1)
                        {
                            if (XMLData.UpdateUser(entity))
                            {
                                checkSuccess = "操作成功";
                            }
                        }
                        else {
                            checkSuccess = "没有本账号！";
                        }
                    }
                }
                context.Response.Write(checkSuccess.ToString());
            }
            else
            {
                context.Response.Write("非法操作！");
            }
        }
        catch (Exception)
        {
            context.Response.Write("请检查数据是否合法！");
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}