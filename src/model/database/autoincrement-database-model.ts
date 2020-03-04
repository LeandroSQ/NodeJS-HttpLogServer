import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";
import { number } from "joi";

export default class AutoIncrementDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        return {
            name: "AutoIncrement",
            schema: new Schema({
                name: String,
                count: { type: Number, default: 1 }
            })
        };
    }

}