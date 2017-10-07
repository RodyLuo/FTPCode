<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;

public class Handler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        string type = string.IsNullOrEmpty(context.Request["type"]) ? "" : context.Request["type"];
        switch (type.ToLower()) {
            case "get": {
                string status = XMLData.GetStatus();
                context.Response.ContentType = "text/plain";
                context.Response.Write(status);
                break;
            }
            case "update":
                {
                    string status = context.Request["status"];
                    if (string.IsNullOrEmpty(status))
                    {
                        status = "0";
                    } 
                    string result = XMLData.UpdateStatus(status);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
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