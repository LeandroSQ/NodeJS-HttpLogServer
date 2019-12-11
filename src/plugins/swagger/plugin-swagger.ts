import * as Inert from "@hapi/inert";
import * as Vision from "@hapi/vision";
import * as Swagger from "hapi-swagger";
import * as Configuration from "../../config.json";
import Hapi from "@hapi/hapi";

const options: Swagger.RegisterOptions = {
    info: {
        title: "Test API Documentation",
        version: Configuration.version
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