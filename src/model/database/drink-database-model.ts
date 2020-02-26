import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";

export default class DrinkItemDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        return {
            name: "Drink",
            schema: new Schema({
                name: String,
                price: Number
            })
        };
    }

}