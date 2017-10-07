<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Collections.Generic;

public class Handler : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        string Otype = string.IsNullOrEmpty(context.Request["Otype"]) ? "" : context.Request["Otype"];
        switch (Otype.ToLower())
        {
            case "get":
                {
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    string type = string.IsNullOrEmpty(context.Request["type"]) ? "" : context.Request["type"];
                    PushDataQueryEntity query = new PushDataQueryEntity();
                    query.Id=Id;
                    query.type = type;
                    
                    List<PustDataEntity> entity  = XMLData.GetPushDataByWhere(query);
                    string result = "[";
                    if (entity != null && entity.Count > 0) {
                        foreach (PustDataEntity item in entity) {
                            if (item.date == DateTime.Today.ToString("yyyy-MM-dd"))
                            {
                                result += XMLData.EntityToJson(item) + ",";
                            }
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
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    string type = string.IsNullOrEmpty(context.Request["type"]) ? "" : context.Request["type"];
                    string matches = string.IsNullOrEmpty(context.Request["matches"]) ? "" : context.Request["matches"];
                    string rdfb = string.IsNullOrEmpty(context.Request["rdfb"]) ? "" : context.Request["rdfb"];
                    string fb = string.IsNullOrEmpty(context.Request["fb"]) ? "" : context.Request["fb"];
                    string x = string.IsNullOrEmpty(context.Request["x"]) ? "" : context.Request["x"];
                    string y = string.IsNullOrEmpty(context.Request["y"]) ? "" : context.Request["y"];
                    string t = string.IsNullOrEmpty(context.Request["t"]) ? "" : context.Request["t"];
                    
                    PushDataQueryEntity query = new PushDataQueryEntity();
                    query.Id= Id;
                    List<PustDataEntity> existsEntity = XMLData.GetPushDataByWhere(query);

                    if (existsEntity != null && existsEntity.Count > 0)
                    {
                        context.Response.ContentType = "text/plain";
                        context.Response.Write("0");
                    }
                    else
                    {

                        PustDataEntity entity = new PustDataEntity();
                        entity.Id = Id;
                        entity.type = type;
                        entity.matches = matches;
                        entity.rdfb = rdfb;
                        entity.fb = fb;
                        entity.x = x;
                        entity.y = y;
                        entity.t = t;
                        entity.date = DateTime.Today.ToString("yyyy-MM-dd");
                        string result = XMLData.AddPushData(entity);
                        context.Response.ContentType = "text/plain";
                        if (result == "1")
                        {
                            context.Response.Write(entity.Id);
                        }
                        else
                        {
                            context.Response.Write("0");
                        }
                    }
                    break;
                }
            case "delete":
                {
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    
                    string result = XMLData.DeletePushDataById(Id);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                    break;
                }
            case "update":
                {
                    string Id = string.IsNullOrEmpty(context.Request["Id"]) ? "" : context.Request["Id"];
                    string Status = string.IsNullOrEmpty(context.Request["Status"]) ? "" : context.Request["Status"];

                    string result = XMLData.UpdatePushDataStatusById(Status,Id);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                    break;
                }
            case "clean":
                {
                    PushDataQueryEntity query = new PushDataQueryEntity();
                    List<PustDataEntity> entity = XMLData.GetPushDataByWhere(query);
                    int count = 0;
                    foreach (PustDataEntity item in entity)
                    {
                        if (item.date != DateTime.Today.ToString("yyyy-MM-dd"))
                        {
                            string temp = XMLData.DeletePushDataById(item.Id);
                            if (temp == "1")
                            {
                                count++;
                            }
                        }
                    }
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(count == entity.Count ? "1" : "0");
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