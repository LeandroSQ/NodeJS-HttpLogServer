import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";
import { number } from "joi";

export default class CustomerDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        let schema = new Schema({
            name: String,
            phone: { type: String, required: true },
            document: { type: String, required: false },
            delivery: {
                address: { type: String, required: true },
                number: { type: String, required: true },
                district: { type: String, required: true },
                complement: { type: String, required: false },
                cep: { type: String, required: false, maxlength: 8, minlength: 8 }
            }
        });

        schema.virtual("delivery.string")
            .get(function () {
                return this.delivery.address + ", Nº " + this.delivery.number
            });

        return {
            name: "Customer",
            schema: schema
        };
    }
// "dev": "nodemon --watch \"src/\" --exec \"ts-node src/Main.ts\" -e ts",
}