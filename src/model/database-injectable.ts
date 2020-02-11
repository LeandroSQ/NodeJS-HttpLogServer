import { Server } from "@hapi/hapi";
import { Mongoose, Schema } from "mongoose";

export default interface DatabaseInjectable {

    /***
     *  This method will be called whenever the server gets initialized and created
     ***/
    onInject(mongoose: Mongoose): Promise<{ name: string, schema: Schema }>

}