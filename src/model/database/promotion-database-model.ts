import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";
import { number } from "joi";

export default class PromotionDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        let schema = new Schema({
            pizzas: { type: mongoose.Schema.Types.ObjectId, ref: "Pizza" },
            drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drink" }],
            maxSliceCount: Number
        });

        schema.virtual("price")
            .get(function () {
                return this.pizzas.reduce((a, b) => a + b.extraPrice, 0) + this.drinks.reduce((a, b) => a + b.price, 0)
            });

        schema.virtual("items")
            .get(function () {
                return this.pizzas.concat(this.drinks);
            });

        return {
            name: "Promotion",
            schema: schema
        };
    }

}