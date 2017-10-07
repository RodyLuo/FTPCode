<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Collections.Generic;

public class Handler : IHttpHandler {
    // setWithOrder setMonitor
    public void ProcessRequest(HttpContext context)
    {
        string type = string.IsNullOrEmpty(context.Request["type"]) ? "" : context.Request["type"];
        switch (type.ToLower())
        {
            case "get":
                {
                    List<SignInEntity> entity = XMLData.GetAllSignIn();
                    string result = "[";
                    if (entity != null && entity.Count > 0) {
                        foreach (SignInEntity item in entity)
                        {
                           result += XMLData.EntityToJson(item)+",";
                        }
                    }
                    if (result.EndsWith(",")) {
                        result = result.Substring(0, result.Length - 1);
                    }
                    result += "]";
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                    break;
                }
            case "add":
                {
                    List<SignInEntity> entityList = XMLData.GetAllSignIn();
                    bool isBack = false;
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    foreach (SignInEntity item in entityList)
                    {
                        if (item.Id == Id) {
                            context.Response.ContentType = "text/plain";
                            context.Response.Write("1");
                            isBack = true;
                            break;
                        }
                    }
                    if (!isBack)
                    {
                        string Url = string.IsNullOrEmpty(context.Request["Url"]) ? "" : context.Request["Url"];
                        string RaceDate = string.IsNullOrEmpty(context.Request["RaceDate"]) ? "" : context.Request["RaceDate"];
                        string RaceType = string.IsNullOrEmpty(context.Request["RaceType"]) ? "" : context.Request["RaceType"];
                        string Sml = string.IsNullOrEmpty(context.Request["Sml"]) ? "" : context.Request["Sml"];
                        string SiteType = string.IsNullOrEmpty(context.Request["SiteType"]) ? "" : context.Request["SiteType"];
                        string LoginUser = string.IsNullOrEmpty(context.Request["LoginUser"]) ? "" : context.Request["LoginUser"];
                        SignInEntity entity = new SignInEntity();

                        entity.Id = Id;
                        entity.Url = Url;
                        entity.LoginUser = LoginUser;
                        entity.IsMonitor = string.Empty;
                        entity.IsWithOrder = string.Empty;
                        entity.RaceDate = RaceDate;
                        entity.RaceType = RaceType;
                        entity.Sml = Sml;
                        entity.SiteType = SiteType;
                        entity.date = DateTime.Today.ToString("yyyy-MM-dd");

                        string result = XMLData.AddSignInData(entity);

                        context.Response.ContentType = "text/plain";
                        if (result == "1")
                        {
                            result = entity.Id;
                        }
                        context.Response.Write(result);
                    }
                    break;
                }
            case "delete":
                {
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    string result = XMLData.DeleteSignInById(Id);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                    break;
                }

            case "setwithorder":
                {
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    string IsWithOrder = string.IsNullOrEmpty(context.Request["IsWithOrder"]) ? "" : context.Request["IsWithOrder"];
                    string result = XMLData.UpdateSignInSetWithOrderById(Id, IsWithOrder);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                    break;
                }
            case "setmonitor": 
                {
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    string IsMonitor = string.IsNullOrEmpty(context.Request["IsMonitor"]) ? "" : context.Request["IsMonitor"];
                    string result = XMLData.UpdateSignInSetMonitorById(Id, IsMonitor);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                    break;
                }
            case "clean": {
                List<SignInEntity> entity = XMLData.GetAllSignIn();
                int count = 0;
                foreach (SignInEntity item in entity)
                {
                    if (item.date != DateTime.Today.ToString("yyyy-MM-dd")) {
                        string temp = XMLData.DeleteSignInById(item.Id);
                        if (temp == "1") {
                            count++;
                        }
                    }
                }
                context.Response.ContentType = "text/plain";
                context.Response.Write(count==entity.Count?"1":"0");
                break;
            }
            default:
                context.Response.Write("");
                break;
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}