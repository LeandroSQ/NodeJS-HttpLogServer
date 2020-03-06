import * as FileSystem from "fs";
import * as Path from "path";
import Logger from "../utils/logger";
import { Server } from '@hapi/hapi';
import DatabaseInjectable from "../model/database-injectable";
// import * as Mongoose from "mongoose";
import Mongoose = require("mongoose");
import Config from "../utils/configuration";

/* Define the controller */
export class DatabaseController {

    // Singleton pattern definition
    private static _instance: DatabaseController = null;
    //public static instance: DatabaseController
    public static get instance(): DatabaseController {
        if (DatabaseController._instance) {
            return DatabaseController._instance;
        } else {
            DatabaseController._instance = new DatabaseController();
            return DatabaseController._instance;
        }
    };


    private modelList: Array<DatabaseInjectable> = [];
    public declaredList: any = {};
    public mongoose: Mongoose.Connection;

    constructor() {
        this.loadDatabaseModels(`${__dirname}/../model/database/`);
    }

    /***
     * This method lists all the models on the 'database' folder
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
                            if (module && module.default) {
                                module = new module.default();
                            }
                            
                            if (Array.isArray(module)) {
                                // If it is an array, concatenate both 
                                this.modelList = this.modelList.concat(module);
                            } else {
                                // Otherwise, simply import it
                                this.modelList.push(module);                                
                            }

                            let simplifiedName = file.substring(0, file.lastIndexOf("-database-model.ts"));
                            Logger.log (["server", "database"], `Found model group '${simplifiedName}'`);
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

    private connectToDatabaseServer() {
        return new Promise(async (resolve, reject) => {
            try {
                // Connects to the server URL according to the environment
                if (Config.mode === "prod") {
                    await Mongoose.connect(`mongodb://${Config.database.user}:${Config.database.password}@${Config.database.host}/${Config.database.db_name}`, { useNewUrlParser: true, useUnifiedTopology: true });
                } else {
                    // await Mongoose.connect(`mongodb://localhost:27017/${Config.database.db_name}`, { useNewUrlParser: true, useUnifiedTopology: true });
                    await Mongoose.connect(`mongodb+srv://admin:admin@cluster0-pyrzy.gcp.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
                }         
    
                this.mongoose = Mongoose.connection;

                Logger.log(["server", "database"], `Connected with the database server! '${this.mongoose.host}'`)
                
                // Define the post-connection error handler
                Mongoose.connection.on("error", e => {
                    Logger.log(["error", "server", "database"], "The connection with the database server was lost!\n" + e);
                });

                resolve();
            } catch(e) {
                console.trace(e);
                Logger.log(["error", "server", "database"], "Unable to connect with the database!\n" + e);
                reject(e);
            } 
        });
    }

    private defineModels() {
        return new Promise(async (resolve, reject) => {
            Logger.log(["server", "database"], `Injecting "${this.modelList.length} models"...`);
           
            try {
                for (const injectable of this.modelList) {
                    let object = await injectable.onInject(Mongoose);
                    let model = Mongoose.model(object.name, object.schema);
                    this.declaredList[object.name] = model;
                }

                resolve();
            } catch (e) {
                console.trace(e);
                Logger.log(["server", "database", "error"], `Error while injecting models ${e}`);

                reject(e);
            } 
        });
    }

    private async injectAutoIncrementModel() {
        const model = this.declaredList["AutoIncrement"];

        async function defineAutoIncrementModel(collection: String): Promise<Boolean>{
            let autoIncrementInstance = await model.findOne({ "name": collection });
    
            if (!autoIncrementInstance) {
                await model.create({ name: collection, count: 1 });
                return true;
            } 
    
            return false;
        };

        let totalAutoIncrementInstancesCreated = 0;
        for (const injectable in this.declaredList) {
            if (injectable === "AutoIncrement") continue;

            if (await defineAutoIncrementModel(injectable)) {
                totalAutoIncrementInstancesCreated++;
            }
        }          

        Logger.log(["server", "database"], `Created ${totalAutoIncrementInstancesCreated} auto-increment instances!`);
    }

    /***
     * Adds the provided injectable to the internal list
     * 
     * @param injectable The provided injectable
     ***/
    inject(injectable: DatabaseInjectable | any): void {
        if (injectable && injectable.default)
            this.modelList.push(injectable.default);
        else
            this.modelList.push(injectable);
    }

    /***
     * Notify all added injectables that the server has been created
     * 
     * @param server The running server instance
     ***/
    async notifyServerCreated(server: Server): Promise<any>{
        await this;this.defineModels();
    }

    /***
     * Notify all added injectables that the server has been started
     * 
     * @param server The running server instance
     ***/
    async notifyServerStarted(server: Server) {
        await this.connectToDatabaseServer();
        await this.injectAutoIncrementModel();
    }

    /***
     * Notify all added injectables that the server has been disposed
     * 
     * @param server The disposed server instance
     ***/
    async notifyServerDisposed(server: Server) {
        try {
            Logger.log(["server", "database"], "Disposing database controller...");

            await Mongoose.disconnect();
        } catch(e) {
            Logger.log(["server", "database", "error"], "Unable to dispose database controller!\n" + e);
        }
    }
}