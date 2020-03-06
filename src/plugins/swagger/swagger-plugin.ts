import * as Inert from "@hapi/inert";
import * as Vision from "@hapi/vision";
import * as Swagger from "hapi-swagger";
import Config from "../../utils/configuration";
import Hapi from "@hapi/hapi";

const options: Swagger.RegisterOptions = {
    documentationPath: "/api/swagger",
    grouping: "tags",
    expanded: "none",
    info: {
        title: "Test API Documentation",
        version: Config.version
    }               
};

module.exports = [
    { plugin: Inert },
    { plugin: Vision },
    { 
        plugin: Swagger,
        options: options
    }
] as Array<Hapi.ServerRegisterPluginObject<any>>;