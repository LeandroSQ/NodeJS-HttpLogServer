// Imports
import ServerInjectable from "../model/server-injectable";
import * as Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import Logger from "../utils/logger";
import chalk = require("chalk");

// Define the main class
class CorsInjectable implements ServerInjectable {

    /* This method will be called whenever the server gets created */
    async onServerCreated(server: Server) {
        Logger.log(["server", "cors"], `Injecting "CORS" handler...`);
        server.ext("onPreResponse", (request, h) => {
            if (!request.headers.origin) {
                return h.continue;
            }
            
            // depending on whether we have a boom or not,
            // headers need to be set differently.
            var response = request.response.isBoom ? request.response.output : request.response
            
            response.headers["Access-Control-Allow-Origin"] = request.headers.origin;
            response.headers['access-control-allow-credentials'] = 'true'
            
            return h.continue;
        });
    }

    /* This method will be called whenever the server gets started */
    async onServerStarted(server: Server) {
        
    }

    /* This method will be called whenever the server is disposed, being due an error or not */
    async onServerDisposed(server: Server) {
        
    }

}

module.exports = new CorsInjectable();