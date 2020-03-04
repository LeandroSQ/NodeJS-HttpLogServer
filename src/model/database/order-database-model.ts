import { DatabaseController } from './../../controller/database-controller';
import { PaymentTypes } from './../../enum/payment-types';
import { OrderStatus } from './../../enum/order-status';
import DatabaseInjectable from "../database-injectable";
import { Schema, model } from "mongoose";
import { number, string } from "joi";
import { OrderSources } from '../../enum/order-sources';
import { shortObjectId, MongoDB_ObjectId } from "short-objectid";

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
            code: {
                type: String,
                default: function () {
                    let m = { "$oid": this._id.toString() };
                    return shortObjectId(m);
                }
            },

            /* Promotion item */
            promotions: [promotionItemSchema],
            /* Drink item */
            drinks: [drinkItemSchema],

            customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },            
            branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

            total: { type: Number, required: true },
            closed: { type: Boolean, default: false },
            reasonText: { type: String, default: null },

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
        
        // let handler = async function (next, docs) {
        //     // const autoIncrementModel = DatabaseController.instance.declaredList["AutoIncrement"];

        //     if (this && (!docs || !Array.isArray(docs))) docs = [this];

        //     for (const doc of docs) {
        //         if (doc.isNew === true || doc.isNew === undefined) {
        //             // let autoIncrementInstance = await autoIncrementModel.findOne({ name: "Order" });
        //             // let code = autoIncrementInstance.count || 0;
        //             console.log(doc._id);
        //             let obj = { "$oid" : doc._id }; 
        //             // 507f191e810c19729de860ea
        //             // 5e5f18b99640c91c8c1fd731
        //             doc.code = shortObjectId({ "$oid": doc._id } as MongoDB_ObjectId);//Math.floor(Date.now() / 10);
        //             // await autoIncrementModel.updateOne({ name: "Order" }, { $inc: { count: 1 } });
        //         }
        //     }


        //     next();
        //     /* const model = DatabaseController.instance.declaredList["Order"];

        //     if (this && (!docs || !Array.isArray(docs)))
        //         docs = [this];
            
        //     let code = await model.findOne().select({ code: 1 }).sort({ code: -1 });
        //     if (code && code.code) code = code.code;
            
        //     for (const doc of docs) {
        //         if (doc.isNew === true || doc.isNew === undefined) {
        //             doc.code = ++code;
        //         }
        //     }

        //     next(); */
        // };
        // ["insertMany", "insert", "save"].forEach(x => schema.pre(x, handler));

        return {
            name: "Order",
            schema: schema
        };
    }

}