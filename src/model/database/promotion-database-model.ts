import { PizzaFlavorTypes } from './../../enum/pizza-flavor-types';
import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";
import { number } from "joi";

export default class PromotionDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        let schema = new Schema({
            pizzas: [
                {
                    maxSliceCount: Number,
                    size: { type: mongoose.Schema.Types.ObjectId, ref: "PizzaSize" },
                    complements: [{ type: mongoose.Schema.Types.ObjectId, ref: "PizzaComplement" }],
                    allowedFlavorTypes: [{ type: String, enum: Object.values(PizzaFlavorTypes) }]
                }
            ],
            drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drink" }],
            price: { type: Number, required: true },
            name: String,
            description: String,
            highlighted: { type: Boolean, default: false }
        });

        return {
            name: "Promotion",
            schema: schema
        };
    }

}