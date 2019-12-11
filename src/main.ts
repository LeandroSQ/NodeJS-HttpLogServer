// Imports
import * as Hapi from "@hapi/hapi";
import * as Boom from '@hapi/boom';
import * as Configuration from "./config.json";
import ServerInjectableController from "./controller/ServerInjectableController";
import { ProcessShutdownController } from './controller/ProcessShutdownController';
import Logger from "./utils/logger";
import Chalk from 'chalk';

// Injectables configuration
const injectableController = new ServerInjectableController();
injectableController.inject(require("./plugins/injector"));// Inject the plugins
injectableController.inject(require("./routes/injector"));// Inject the routes

// Process configuration
const processController = new ProcessShutdownController(onDispose);
processController.registerHooks();

// Define the server instance
let server : Hapi.Server = null;

// Function definition
function onError(request, h, error) {
    if (Configuration.mode === 'prod') {// NODE_ENV could also be applied here
        // In production, log a limited error message and throw the default Bad Request error.
        console.error('ValidationError:', error.message);
        throw Boom.badRequest(`Invalid request payload input`);
    } else {
        // During development, log and respond with the full error.
        Logger.exception("Error!", error);
        throw error;
    }
}

function onInit() {
    // Creates the server with the configuration from the provided .json file
    // And enables the custom error logging strategy
    server = new Hapi.Server({
        host: Configuration.server.host,
        port: Configuration.server.port,
        routes: {
            validate: { failAction: onError }
        }
    });
    
    // Notify injectables that the server has been created
    injectableController.notifyServerCreated(server)
        // Tries to start the server
        .then(() => server.start())
        .then(() => {
            // Notify injectables that the server has been started
            injectableController.notifyServerStarted(server);

            

            Logger.server(`Server running on ${Chalk.yellow(server.info.uri)}`);
        })
        .catch(error => {
            Logger.exception("Unable to start the server!", error);
        });
}

function onDispose() {
    // Notify all the injectables that the server is to be disposed
    injectableController.notifyServerDisposed(server);

    // Tries to stop the server
    server.stop()
        .then(() => { 
            Logger.server("Server fully stopped!");
        })
        .catch(error => {
            Logger.exception("Unable to stop the server!", error);
        });
}

// Runs the initial function
onInit();