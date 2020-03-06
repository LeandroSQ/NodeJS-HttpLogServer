// Imports
import ServerInjectable from "../model/server-injectable";
import * as Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import Logger from "../utils/logger";
import chalk = require("chalk");
import localtunnel from "localtunnel";
import Config from "../utils/configuration";

// Define the main class
class TunnelInjectable implements ServerInjectable {

    private tunnel: localtunnel.Tunnel = null;

    /* This method will be called whenever the server gets created */
    async onServerCreated(server: Server) {
        // When specified as inactive on the configuration file, ignore it
        if (!Config.tunnel.active) return;

        // Otherwise starts the localtunnel
        Logger.log(["server", "tunnel"], `Starting local tunnel...`);

        // Configure the port and subdomain of it
        let options = { 
            port: Config.server.port,
            subdomain: Config.tunnel.subdomain
        };

        // Attempt to start
        localtunnel(options)
            .then(x => {
                Logger.log(["server", "tunnel"], `Tunnel running at ${x.url}`);
                this.tunnel = x;

                this.tunnel.on("close", () => {
                    Logger.log(["server", "tunnel"], `Tunnel closed!`);
                });
            })
            .catch(error => {
                Logger.log(["server", "tunnel", "error"], `Error while starting tunnel!\n` + error);
            });
    }

    /* This method will be called whenever the server gets started */
    async onServerStarted(server: Server) {
        
    }

    /* This method will be called whenever the server is disposed, being due an error or not */
    async onServerDisposed(server: Server) {        
        if (this.tunnel) {
            Logger.log(["server", "tunnel"], `Disposing tunnel...`);
            this.tunnel.close();
        }
    }

}

module.exports = new TunnelInjectable();