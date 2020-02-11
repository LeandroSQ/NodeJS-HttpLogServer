import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";

export default class PizzaSizeDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        return {
            name: "PizzaSize",
            schema: new Schema({
                description: String,
                size: String
            })
        };
    }

}