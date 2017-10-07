<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Collections.Generic;

public class Handler : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        string UserName = string.IsNullOrEmpty(context.Request["UserName"]) ? "" : context.Request["UserName"];
        string PassWord = string.IsNullOrEmpty(context.Request["PassWord"]) ? "" : context.Request["PassWord"];
        UserEntity entity = XMLData.GetUser(UserName, PassWord);
        if (entity != null
            && !string.IsNullOrEmpty(entity.DueTime)
            && !string.IsNullOrEmpty(entity.Status)
            && Convert.ToDateTime(entity.DueTime)>=DateTime.Now 
            && entity.Status == "Y")
        {
            context.Response.ContentType = "text/plain";
            string plugIn = XMLData.GetJSFileListByVersion(string.IsNullOrEmpty(entity.Version) ? "V1" : entity.Version);
            plugIn = plugIn.Replace("YYYY-MM-DD", entity.DueTime);
            context.Response.Write(plugIn);
        }
        else if (entity != null
            && !string.IsNullOrEmpty(entity.DueTime)
            && !string.IsNullOrEmpty(entity.Status)
            && entity.Status != "Y") {
            context.Response.Write("alert(\"账号已经被禁用\")");
        }
        else if (entity != null
            && !string.IsNullOrEmpty(entity.DueTime)
            && !string.IsNullOrEmpty(entity.Status)
            && Convert.ToDateTime(entity.DueTime)<DateTime.Now )
        {
            context.Response.Write("alert(\"授权已过期,请联系续期\")");
        }
        else
        {
            context.Response.Write("alert(\"请检查密码是否错误或者账号是否过期\")");
        }

        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}