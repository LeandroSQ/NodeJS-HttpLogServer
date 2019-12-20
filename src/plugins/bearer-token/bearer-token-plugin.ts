import Hapi from "@hapi/hapi";
import AuthBearer from "hapi-auth-bearer-token";

module.exports = [
    { plugin: AuthBearer }
] as Array<Hapi.ServerRegisterPluginObject<any>>;