import ServerInjectable from "../model/server-injectable";
import Logger from "../utils/logger";
import { Server } from "@hapi/hapi";
import * as FileSystem from "fs";
import * as Path from "path";
import Hapi from "@hapi/hapi";
import Chalk from "chalk";

class PluginInjector implements ServerInjectable {

    private pluginList: Array<Hapi.ServerRegisterPluginObject<any>> = [];
    
    constructor() {
        this.loadPlugins(`${__dirname}/`);
    }

    /* This method will be called whenever the server gets created */
    async onServerCreated(server: Server) {
        Logger.log(["server", "plugin"], `Injecting "${this.pluginList.length} plugins"...`);

        await server.register(this.pluginList);
    }

    /* This method will be called whenever the server gets started */
    async onServerStarted(server: Server) {

    }

    /* This method will be called whenever the server is disposed, being due an error or not */
    async onServerDisposed(server: Server) {
        Logger.log(["server", "plugin"], "Disposing plugins...");
    }

     /***
     * This method lists all the plugins on the 'plugins' folder
     * and automatically saves them to further be registered
     * 
     * @param folder The folder to search for files
     * @param recursionLevel The folder depth indicator (Optional)
     ***/
    private loadPlugins(folder: string, recursionLevel: number = 0) {
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
                    return Logger.log (["error", "plugin"], `Error getting file '${file}' status.`);
                }

                // If is a directory, analyzes it's children
                if (fileStatus.isDirectory ()) {
                    this.loadPlugins (`${folder}/${file}/`, recursionLevel + 1);
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
                                this.pluginList = this.pluginList.concat(module);
                            } else {
                                // Otherwise, simply import it
                                this.pluginList.push(module);
                            }

                            Logger.log (["server", "plugin"], `Found plugin group '${file}'`);
                        } catch (e) {
                            Logger.log(["error", "plugin"], `Unable to import route(s) from file '${filename}'`, e);
                        }
                    }
                }
            }
            
        } catch (e) {
            Logger.log(["error", "plugin"], "Unable to list routes on the 'routes' directory!", e);
        }
    }

} 

module.exports = new PluginInjector();