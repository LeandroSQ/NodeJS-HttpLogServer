// Imports
import ServerInjectable from "../model/server-injectable";
import * as Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import Logger from "../utils/logger";
import chalk = require("chalk");

// Define the main class
class AuthInjectable implements ServerInjectable {

    /* This method will be called on every Token-needed request */
    private async validateToken(request: Hapi.Request, token: string, h: Hapi.ResponseToolkit) {
        // here is where you validate your token
        // comparing with token from your database for example
        const isValid = token === "1234";

        const credentials = { token };
        const artifacts = { test: "info" };

        return { isValid, credentials, artifacts };
    }

    private setupBearerTokenAuth(server: Server) {
        Logger.log(["server", "auth"], `Injecting "bearer token authentication"...`);

        // Define the strategy 'simple'
        server.auth.strategy("simple", "bearer-access-token", {
            allowQueryToken: true,
            accessTokenName: "token",
            validate: this.validateToken
        });
    
        // Set as default
        server.auth.default("simple");
    }

    /* This method will be called whenever the server gets created */
    async onServerCreated(server: Server) {
        this.setupBearerTokenAuth(server);
    }
    
    /* This method will be called whenever the server gets started */
    async onServerStarted(server: Server) {
        
    }

    /* This method will be called whenever the server is disposed, being due an error or not */
    async onServerDisposed(server: Server) {
        
    }

}

module.exports = new AuthInjectable();