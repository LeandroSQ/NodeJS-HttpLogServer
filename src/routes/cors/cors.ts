import * as Boom from '@hapi/boom';
import { ServerRoute } from "@hapi/hapi";
import Logger from "../../utils/logger";

module.exports = [
    {
        method: ["OPTIONS"],
        path: "/{param*}",
        options: {
            auth: false,
            tags: ["api", "CORS"]
        },
        
        handler: function(request, h) {
            try {
                let response = h.response({});
                
                return response.code(200)
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Headers", request.headers['access-control-request-headers'] || "*")
                    .header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
                    .header("Access-Control-Max-Age", "86400");                    
            } catch (e) {
                console.trace(e);
                console.error(e);
                return Boom.internal("Unable to handle CORS preflight!");
            }
        }
    }
] as ServerRoute[];