import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";

export default class PizzaComplementDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        return {
            name: "PizzaComplement",
            schema: new Schema({
                name: String,
                extraPrice: { type: Number, default: 0.00 },                
            })
        };
    }

}