// Imports
import * as Hapi from "@hapi/hapi";
import * as Boom from '@hapi/boom';
import * as Configuration from "../config.json";
import ServerInjectableController from "./InjectableController";
import { ProcessShutdownController } from './ProcessShutdownController';
import Logger from "../utils/Logger";
import Chalk from 'chalk';

export default class ServerController {

    // Define HAPI server related stuff
    private hapiServer: Hapi.Server = null;
    private serverConfig: Hapi.ServerOptions = {
        host: Configuration.server.host,
        port: Configuration.server.port,
        routes: {
            validate: { failAction: this.onError }
        }
    } as const;

    // Define controller related stuff
    private processController: ProcessShutdownController = null
    private injectableController: ServerInjectableController = null

    //#region Controller setup
    private async setupProcessController() {
        // Creates the controller instance
        this.processController = new ProcessShutdownController(this.onDispose);
        this.processController.registerHooks();// Register all events on the running process instance
    }

    private async setupInjectableController() {
        // Creates the controller instance
        this.injectableController = new ServerInjectableController();

        // Inject items
        this.injectableController.inject(require("./../plugins/injector"));// Inject the plugins
        this.injectableController.inject(require("./../routes/injector"));// Inject the routes
    }

    private async setupControllers() {
        await this.setupProcessController();
        await this.setupInjectableController();
    }
    //#endregion

    start(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            // Setup all configured controllers
            await this.setupControllers();

            // Creates the server with the configuration from the provided .json file
            // And enables the custom error logging strategy
            this.hapiServer = new Hapi.Server(this.serverConfig);

            // Notify injectables that the server has been created
            await this.injectableController.notifyServerCreated(this.hapiServer);

            await this.setupBearerToken();
        
            // Starts the server
            await this.hapiServer.start();

            // Notify injectables that the server has been started
            await this.injectableController.notifyServerStarted(this.hapiServer);

            await this.onInit();

            Logger.server(`Server running on ${Chalk.yellow(this.hapiServer.info.uri)}`);
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

    private setupBearerToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.hapiServer.auth.strategy("simple", "bearer-access-token", {
                allowQueryToken: true,
                accessTokenName: "token",
                validate: async (request, token, h) => {
                    // here is where you validate your token
                    // comparing with token from your database for example
                    const isValid = token === "1234";
        
                    const credentials = { token };
                    const artifacts = { test: "info" };
        
                    return { isValid, credentials, artifacts };
                }
            });
        
            this.hapiServer.auth.default("simple");
        });
    }

    //#region Event callback definition
    /* Event: called on the server has been initialized */
    private onInit() {
        return new Promise((resolve, reject) => {
          
        });
    }

    /* Event: called on any error has occurred */
    private onError(request: Hapi.Request, h: Hapi.ResponseToolkit, error?: Error): Promise<object> {
        return new Promise((resolve, reject) => {
            if (Configuration.mode === 'prod') {// NODE_ENV could also be applied here
                // In production, log a limited error message and throw the default Bad Request error.
                Logger.exception('ValidationError:', error.message);
                throw Boom.badRequest(`Invalid request payload input`);
            } else {
                // During development, log and respond with the full error.
                Logger.exception("Error!", error);
                throw error;
            }
        });
    }

    /* Event: called on the server has been disposed */
    private onDispose() {
        return new Promise((resolve, reject) => {
            // Check if the server was created
            if (this.hapiServer == null) {
                Logger.error("Unable to stop the server, the server wasn't created!");
                reject("Server wasn't created");
                return;                
            }

            // Notify all the injectables that the server is to be disposed
            this.injectableController.notifyServerDisposed(this.hapiServer);

            // Tries to stop the server
            this.hapiServer.stop()
                .then(() => { 
                    Logger.server("Server fully stopped!");
                    resolve();
                })
                .catch(error => {
                    Logger.exception("Unable to stop the server!", error);
                    reject(error);
                });
        });
    }
    //#endregion

}