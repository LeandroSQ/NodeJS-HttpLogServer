import * as FileSystem from "fs";
import * as Path from "path";
import Logger from "../utils/logger";
import { Server } from '@hapi/hapi';
import SocketIO from 'socket.io';
import SocketInjectable from "../model/socket-injectable";
// import * as Mongoose from "mongoose";
import Mongoose = require("mongoose");
import Hapi = require("hapi");
import Config from "../utils/configuration";
import ServerInjectable from "../model/server-injectable";

/* Define the controller */
export class SocketController {

    // Singleton pattern definition
    private static _instance: SocketController = null;
    //public static instance: SocketController
    public static get instance(): SocketController {
        if (SocketController._instance) {
            return SocketController._instance;
        } else {
            SocketController._instance = new SocketController();
            return SocketController._instance;
        }
    };

    private injectableList: Array<SocketInjectable> = [];
    private server: SocketIO.Server = null;
    private connectedSockets: Array<SocketIO.Socket> = [];

    constructor() {
        this.loadSocketInjectables(`${__dirname}/../socket/`);
    }

    /***
     * This method lists all the models on the 'socket' folder
     * and automatically saves them to further be registered
     * 
     * @param folder The folder to search for files
     * @param recursionLevel The folder depth indicator (Optional)
     ***/
    private loadSocketInjectables(folder: string, recursionLevel: number = 0) {
        try {
            // Lists all files inside the given folder
            let files = FileSystem.readdirSync (folder);

            // Iterates trough every file
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileStatus = FileSystem.statSync (`${folder}${file}`);
                
                // Check file availability
                if (!fileStatus) {
                    return Logger.log (["error", "server", "socket"], `Error getting file '${file}' status.`);
                }

                // If is a directory, analyzes it's children
                if (fileStatus.isDirectory ()) {
                    this.loadSocketInjectables (`${folder}/${file}/`, recursionLevel + 1);
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
                                this.injectableList = this.injectableList.concat(module);
                            } else {
                                // Otherwise, simply import it
                                this.injectableList.push(module);                                
                            }

                            Logger.log (["server", "socket"], `Found model group '${file}'`);
                        } catch (e) {
                            Logger.log(["error", "server", "socket"], `Unable to import model(s) from file '${filename}'`, e);
                        }
                    }
                }
            }
            
        } catch (e) {
            Logger.log(["error", "server", "socket"], "Unable to list models on the 'socket' directory!", e);
        }
    }
    
    /***
     * Adds the provided injectable to the internal list
     * 
     * @param injectable The provided injectable
     ***/
    inject(injectable: SocketInjectable | any): void {
        if (injectable && injectable.default)
            this.injectableList.push(injectable.default);
        else
            this.injectableList.push(injectable);
    }

    /***
     * Notify all added injectables that the server has been created
     * 
     * @param server The running server instance
     ***/
    async notifyServerCreated(server: Server): Promise<any>{
        // Starts the server socket
        this.server = SocketIO(server.listener)
        Logger.log(["server", "socket"], `Socket server started at port '${Config.server.port}'`);

        // Propague the event to all the injectables
        this.injectableList.forEach(x => x.onServerCreated(this));

        // Define the connection handler
        this.server.on("connection", (socket) => {
            // When a new connection is established
            // Adds the client socket to the connected list
            this.connectedSockets.push(socket);

            Logger.log(["server", "socket"], `New connection from '${socket.request.connection.remoteAddress}'`);

            // Define the disconnection event handler
            socket.on("disconnect", (e) => {
                // When a disconnection occurs
                // Remove the client socket from the connected list
                this.connectedSockets.splice(this.connectedSockets.indexOf(socket), 1);

                // Propague the event to all the injectables
                this.injectableList.forEach(x => x.onSocketDisconnected(this, socket));
            });

            // Propague the event to all the injectables
            this.injectableList.forEach(x => x.onSocketConnected(this, socket));
        });
    }

    /***
     * Notify all added injectables that the server has been started
     * 
     * @param server The running server instance
     ***/
    async notifyServerStarted(server: Server) {
        
    }

    /***
     * Notify all added injectables that the server has been disposed
     * 
     * @param server The disposed server instance
     ***/
    async notifyServerDisposed(server: Server) {
        try {
            Logger.log(["server", "socket"], "Disposing socket controller...");

            // Sends a event to all the clients
            this.connectedSockets.forEach(x => x.emit("server-disposed", {}));

            // Shuts down the web socket server
            this.server.close();
        } catch(e) {
            Logger.log(["server", "socket", "error"], "Unable to dispose socket controller!\n" + e);
        }
    }

    /***
     * Emits an event to all connected sockets
     ***/
    async emit(event: string, arg: Object) {
        this.connectedSockets.forEach(x => {
            x.emit(event, arg);  
        });       
    }
}