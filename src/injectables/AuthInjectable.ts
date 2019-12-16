// Imports
import ServerInjectable from "../model/ServerInjectable";
import { Server } from "@hapi/hapi";

// Define the main class
class AuthInjectable implements ServerInjectable {

   /* This method will be called whenever the server gets created */
   async onServerCreated(server: Server) {
        
    }

    /* This method will be called whenever the server gets started */
    async onServerStarted(server: Server) {
        
    }

    /* This method will be called whenever the server is disposed, being due an error or not */
    async onServerDisposed(server: Server) {
        
    }

}


module.exports = new AuthInjectable();