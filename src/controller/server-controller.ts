import { SocketController } from './socket-controller';
import { DatabaseController } from './database-controller';
// Imports
import * as Hapi from "@hapi/hapi";
import * as Boom from '@hapi/boom';
import Config from "../utils/configuration";
import ServerInjectableController from "./injectable-controller";
import { ProcessShutdownController } from './process-shutdown-controller';
import Logger from "../utils/logger";
import Chalk from 'chalk';
import { Agent } from 'http';

export default class ServerController {

    // Define HAPI server related stuff
    private hapiServer: Hapi.Server = null;
    private serverConfig: Hapi.ServerOptions = {
        host: Config.server.host,
        port: Config.server.port,
        routes: {
            validate: { failAction: this.onError },
        }
    } as const;

    // Define controller related stuff
    private processController: ProcessShutdownController = null
    private injectableController: ServerInjectableController = null
    private databaseController: DatabaseController = null
    private websocketController: SocketController = null

    //#region Controller setup
    private async setupProcessController() {
        // Creates the controller instance
        this.processController = new ProcessShutdownController(this.onDispose);
        //this.processController.registerHooks();// Register all events on the running process instance
    }

    private async setupInjectableController() {
        // Creates the controller instance
        this.injectableController = new ServerInjectableController();

        // Inject items
        this.injectableController.inject(require("./../plugins/injector"));// Inject the plugins
        this.injectableController.inject(require("./../routes/injector"));// Inject the routes
        this.injectableController.inject(require("./../injectables/auth-injectable"));// Inject the token manager
        this.injectableController.inject(require("./../injectables/cors-injectable"));// Inject the cors manager
        this.injectableController.inject(require("./../injectables/tunnel-injectable"));// Inject the tunnel manager
    }

    private async setupDatabaseController() {
        // Creates the controller instance
        this.databaseController = DatabaseController.instance;
    }

    private async setupWebSocketController() {
        // Creates the controller instance
        this.websocketController = SocketController.instance;
    }

    private async setupControllers() {
        await this.setupProcessController();
        await this.setupInjectableController();
        await this.setupDatabaseController();
        await this.setupWebSocketController();
    }
    //#endregion

    start(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            // Setup all configured controllers
            await this.setupControllers();

            Logger.log(["server"], `Running configuration '${Config.mode}'`);

            // Creates the server with the configuration from the provided .json file
            // And enables the custom error logging strategy
            this.hapiServer = new Hapi.Server(this.serverConfig);
        
            // Notify injectables that the server has been created
            await this.injectableController.notifyServerCreated(this.hapiServer);
            await this.databaseController.notifyServerCreated(this.hapiServer);
            await this.websocketController.notifyServerCreated(this.hapiServer);
        
            // Starts the server
            await this.hapiServer.start();

            // Notify injectables that the server has been started
            await this.injectableController.notifyServerStarted(this.hapiServer);
            await this.databaseController.notifyServerStarted(this.hapiServer);

            Logger.log("server", `Initializing "server"...`);
            await this.onInit();

            Logger.log("server", `Server running on '${this.hapiServer.info.uri}'!`);
            resolve("Server started successfully");
        });        
    }

    stop(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.hapiServer != null) {
                await this.hapiServer.stop();
                resolve("Server successfully stopped");
            } else {
                reject("Invalid server instance!");
            }
        });        
    }

    async inject(options: string | Hapi.ServerInjectOptions): Promise<Hapi.ServerInjectResponse> {
        return await this.hapiServer.inject(options);
    }

    //#region Event callback definition
    /* Event: called on the server has been initialized */
    private onInit() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    /* Event: called on any error has occurred */
    private onError(request: Hapi.Request, h: Hapi.ResponseToolkit, error?: Error): Promise<object> {
        return new Promise((resolve, reject) => {
            if (Configuration.mode === 'prod') {// NODE_ENV could also be applied here
                // In production, log a limited error message and throw the default Bad Request error.
                Logger.log("error", "Validation error: " + error.message);
                throw Boom.badRequest(`Invalid request payload input`);
            } else {
                // During development, log and respond with the full error.
                Logger.log("error", "Error!", error);
                throw error;
            }
        });
    }

    /* Event: called on the server has been disposed */
    private onDispose() {
        return new Promise((resolve, reject) => {
            // Check if the server was created
            if (this.hapiServer == null) {
                Logger.log(["error", "server"], "Unable to stop the server, the server wasn't created!");
                reject("Server wasn't created");
                return;                
            }

            // Notify all the injectables that the server is to be disposed
            this.injectableController.notifyServerDisposed(this.hapiServer);
            this.databaseController.notifyServerDisposed(this.hapiServer);
            this.websocketController.notifyServerDisposed(this.hapiServer);

            // Tries to stop the server
            this.hapiServer.stop()
                .then(() => { 
                    Logger.log("server", "Server fully stopped!");
                    resolve();
                })
                .catch(error => {
                    Logger.log(["error", "server"], "Unable to stop the server!", error);
                    reject(error);
                });
        });
    }
    //#endregion

}