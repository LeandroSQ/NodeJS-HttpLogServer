import { Server } from "@hapi/hapi";

export default interface ServerInjectable {

    /***
     *  This method will be called whenever the server gets initialized and created
     ***/
    onServerCreated(server: Server): Promise<any>


    /***
     *  This method will be called whenever the server gets started
     ***/
    onServerStarted(server: Server): Promise<any>

    /*** 
     * This method will be called whenever the server is disposed, being due an error or not 
     ***/
    onServerDisposed(server: Server): Promise<any>

}