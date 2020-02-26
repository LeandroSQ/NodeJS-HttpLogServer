import { DatabaseController } from './../../controller/database-controller';
import { PaymentTypes } from './../../enum/payment-types';
import { OrderStatus } from './../../enum/order-status';
import DatabaseInjectable from "../database-injectable";
import { Schema } from "mongoose";
import { number, string } from "joi";
import { OrderSources } from '../../enum/order-sources';

export default class OrderDatabaseModel implements DatabaseInjectable {
    
    async onInject(mongoose: typeof import("mongoose")): Promise<{ name: string, schema: Schema<any> }> {
        let pizzaItemSchema = {
            size: { type: mongoose.Schema.Types.ObjectId, ref: "PizzaSize" },
            flavors: [{ type: mongoose.Schema.Types.ObjectId, ref: "PizzaFlavor" }],
            complements: [{ type: mongoose.Schema.Types.ObjectId, ref: "PizzaComplement" }],
            observations: { type: String, required: false },
            price: { type: Number, default: 0, required: false }
        };

        let drinkItemSchema = {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "Drink" },
            price: Number,
            name: String 
        };

        let promotionItemSchema = {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" },
            pizzas: [pizzaItemSchema],
            drinks: [drinkItemSchema],
            price: Number
        };

        let schema = new Schema({
            code: { type: Number, default: 0 },

            /* Promotion item */
            promotions: [promotionItemSchema],
            /* Drink item */
            drinks: [drinkItemSchema],

            customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },            
            branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

            total: { type: Number, required: true },

            source: { type: String, enum: Object.values(OrderSources) },
            status: { type: String, enum: Object.values(OrderStatus) },

            payment: {
                method: {
                    type: {
                        type: String, 
                        enum: Object.values(PaymentTypes)
                    },
                    change: Number
                },
            }
        }, {
            timestamps: {
                createdAt: "createdAt",
                updatedAt: "updatedAt"
            }
        });
        
        let handler = async function (next, docs) {            
            const model = DatabaseController.instance.declaredList["Order"];

            if (this && (!docs || !Array.isArray(docs)))
                docs = [this];
            
            let code = await model.findOne().select({ code: 1 }).sort({ code: -1 });
            if (code && code.code) code = code.code;
            
            for (const doc of docs) {
                if (doc.isNew === true || doc.isNew === undefined) {
                    doc.code = ++code;
                }
            }

            next();
        };
        ["insertMany", "insert", "save"].forEach(x => schema.pre(x, handler));

        return {
            name: "Order",
            schema: schema
        };
    }

}