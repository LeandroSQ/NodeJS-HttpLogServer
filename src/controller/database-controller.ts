const DB_NAME = "pizzzaria-do-bosque";
import * as FileSystem from "fs";
import * as Path from "path";
import Logger from "../utils/logger";
import { Server } from '@hapi/hapi';
import DatabaseInjectable from "../model/database-injectable";
import * as Mongoose from "mongoose";

export default class DatabaseController {

    private modelList: Array<DatabaseInjectable> = [];
    private declaredList: Array<Mongoose.Model<any>> = [];

    constructor() {
        this.loadDatabaseModels(`${__dirname}/../model/database/`);
    }

    /***
     * This method lists all the plugins on the 'plugins' folder
     * and automatically saves them to further be registered
     * 
     * @param folder The folder to search for files
     * @param recursionLevel The folder depth indicator (Optional)
     ***/
    private loadDatabaseModels(folder: string, recursionLevel: number = 0) {
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
                    return Logger.log (["error", "server", "database"], `Error getting file '${file}' status.`);
                }

                // If is a directory, analyzes it's children
                if (fileStatus.isDirectory ()) {
                    this.loadDatabaseModels (`${folder}/${file}/`, recursionLevel + 1);
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
                                this.modelList = this.modelList.concat(module);
                            } else {
                                // Otherwise, simply import it
                                this.modelList.push(module);
                            }

                            Logger.log (["server", "server", "database"], `Found model group '${file}'`);
                        } catch (e) {
                            Logger.log(["error", "server", "database"], `Unable to import model(s) from file '${filename}'`, e);
                        }
                    }
                }
            }
            
        } catch (e) {
            Logger.log(["error", "server", "database"], "Unable to list models on the 'database' directory!", e);
        }
    }

    /***
     * Adds the provided injectable to the internal list
     * 
     * @param injectable The provided injectable
     ***/
    inject(injectable: DatabaseInjectable): void {
        this.modelList.push(injectable);
    }

    /***
     * Notify all added injectables that the server has been created
     * 
     * @param server The running server instance
     ***/
    notifyServerCreated(server: Server): Promise<any>{
        return new Promise((resolve, reject) => {
            Logger.log(["server", "database"], `Injecting "${this.modelList.length} models"...`);

            try {
                this.modelList.forEach(async databaseInjectable => {
                    let object = await databaseInjectable.onInject(Mongoose);
                    let model = Mongoose.model(object.name, object.schema);
                    this.declaredList.push(model);
                });

                resolve();
            } catch (e) {
                console.trace(e);
                Logger.log(["server", "database", "error"], `Error while injecting models ${e}`);

                reject(e);
            } 
        });
    }

    /***
     * Notify all added injectables that the server has been started
     * 
     * @param server The running server instance
     ***/
    notifyServerStarted(server: Server) {
       
    }

    /***
     * Notify all added injectables that the server has been disposed
     * 
     * @param server The disposed server instance
     ***/
    async notifyServerDisposed(server: Server) {
        
    }


}