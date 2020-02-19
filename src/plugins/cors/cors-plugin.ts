import * as Configuration from "../../config.json";
import Hapi from "@hapi/hapi";

module.exports = [
    {
        plugin: require("hapi-cors"),
        options: {
            origins: ['*'],
            allowCredentials: 'true',
            exposeHeaders: ['content-type', 'content-length'],
            maxAge: 600,
            methods: ['GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS'],
            headers: ['Accept', 'Content-Type', 'Authorization'] 
        }
    }
] as Array<Hapi.ServerRegisterPluginObject<any>>;