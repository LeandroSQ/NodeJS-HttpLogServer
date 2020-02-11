import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";

export default class PizzaDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        let schema = new Schema({
            size: { type: mongoose.Schema.Types.ObjectId, ref: "PizzaSize" },
            flavors: [{ type: mongoose.Schema.Types.ObjectId, ref: "PizzaFlavor" }],
            complements: [{ type: mongoose.Schema.Types.ObjectId, ref: "PizzaComplement" }]            
        });

        schema.virtual("extraPrice")
            .get(function () {
                return this.flavors.reduce((a, b) => a + b.extraPrice, 0) + this.complements.reduce((a, b) => a + b.extraPrice, 0)
            });

        return {
            name: "Pizza",
            schema: schema
        };
    }

}