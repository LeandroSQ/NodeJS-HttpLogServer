import { PaymentTypes } from './../../enum/payment-types';
import { OrderStatus } from './../../enum/order-status';
import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";
import { number } from "joi";

export default class OrderDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        let schema = new Schema({
            promotions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Promotion" }],
            drinks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drink" }],
            customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
            payment: {
                total: { 
                    type: Number, 
                    get: function () { 
                        return this.promotions.reduce((a, b) => a + b.price, 0) + this.drinks.reduce((a, b) => a + b.price, 0);
                    }
                },
                method: {
                    type: { 
                        type: String, 
                        enum: Object.values(PaymentTypes)
                    },
                    change: Number
                },
                status: {
                    type: String,
                    enum: Object.values(OrderStatus)
                },
                observations: {
                    type: String,
                    required: false
                }
            }
        }, {
            timestamps: {
                createdAt: "createdAt",
                updatedAt: "updatedAt"
            }
        });

        return {
            name: "Order",
            schema: schema
        };
    }

}