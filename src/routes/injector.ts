import { ServerRoute, Server } from "@hapi/hapi";
import Logger from "../utils/logger";
import ServerInjectable from "../model/server-injectable";
import * as FileSystem from "fs";
import * as Path from "path";
import Chalk from "chalk";

class RouteInjector implements ServerInjectable {

    private routeList: ServerRoute[] = [];

    constructor() {
        this.loadRoutes(`${__dirname}/`);
    }

    /***
     * This method lists all the routes on the 'routes' folder
     * and automatically saves them to further be registered
     * 
     * @param folder The folder to search for files
     * @param recursionLevel The folder depth indicator (Optional)
     ***/
    private loadRoutes(folder: string, recursionLevel: number = 0) {
        try {
            // Lists all files inside the given folder
            let files = FileSystem.readdirSync (folder);

            // Iterates trough every file
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileStatus = FileSystem.statSync (`${folder}${file}`);
                
                if (file == "injector.ts" || file == "Injector.js") continue;

                // Check file availability
                if (!fileStatus) {
                    return Logger.log (["error", "route"], `Error getting file '${file}' status.`);
                }

                // If is a directory, analyzes it's children
                if (fileStatus.isDirectory ()) {
                    this.loadRoutes (`${folder}/${file}/`, recursionLevel + 1);
                } else {
                    // Check for the file extension
                    let fileExtension = Path.extname(file);
                    if ([".js", ".ts"].indexOf(fileExtension) !== -1) {
                        // Removes the file extension
                        var filename = Path.basename (file, ".js");

                        try {
                            // Imports the file
                            let module = require(`${folder}${filename}`);

                            if (Array.isArray(module)) {
                                // If it is an array, concatenate both 
                                this.routeList = this.routeList.concat(module);
                            } else {
                                // Otherwise, simply import it
                                this.routeList.push(module);
                            }

                            Logger.log (["server", "route"], `Found route group '${file}'`);
                        } catch (e) {
                            Logger.log(["error", "route"], `Unable to import route(s) from file '${filename}'`, e);
                        }
                    }
                }
            }
            
        } catch (e) {
            Logger.log(["error", "route"], "Unable to list routes on the 'routes' directory!", e);
        }
    }

    /* This method will be called whenever the server gets created */
    async onServerCreated(server: Server) {
        Logger.log(["server", "route"], `Injecting "${this.routeList.length} routes"...`); 
        
        // this.routeList.forEach(x => {
        //     x.options["cors"] = {
                
        //         /* additionalHeaders: [
        //             'cache-control', 
        //             'x-requested-with', 
        //             'user-agent',
        //             'referer',
        //             'origin',
        //             'host',
        //             'connection',
        //             'accept',
        //             'accept-encoding',
        //             'accept-language',
        //             'access-control-request-headers',
        //             'access-control-request-method'
        //         ], */
                
        //     }
        // })
        
        for (let x of this.routeList) {
            try {
                server.route(x);
            } catch (e) {
                console.trace(e);
                console.log("ERRO NO ARQUIVO " + JSON.stringify(x));
            }
        }
    }

    /* This method will be called whenever the server gets started */
    async onServerStarted(server: Server) {

    }

    /* This method will be called whenever the server is disposed, being due an error or not */
    async onServerDisposed(server: Server) {
        Logger.log(["server", "route"], "Disposing routes...");
    }

}

module.exports = new RouteInjector();