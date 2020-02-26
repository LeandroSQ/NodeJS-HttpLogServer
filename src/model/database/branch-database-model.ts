import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";

export default class DrinkItemDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        return {
            name: "Branch",
            schema: new Schema({
                name: String,
                phone: { type: String, required: true },
                address: {
                    address: { type: String, required: true },
                    number: { type: String, required: true },
                    district: { type: String, required: true },
                    complement: { type: String, required: false },
                    cep: { type: String, required: true, maxlength: 8, minlength: 8 },
                    location: { 
                        latitude: Number,
                        longitude: Number
                    }
                }
                
            })
        };
    }

}