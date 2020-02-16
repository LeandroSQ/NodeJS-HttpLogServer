import { PaymentTypes } from './../../enum/payment-types';
import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from '../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";
import { OrderStatus } from '../../enum/order-status';

module.exports = [
    {
        method: "GET",
        path: "/api/order",
        options: {
            description: "Lists all orders",
            tags: ["api", "Order"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Order"] as Model<any>;

                let orders = await model.find({});

                if (orders) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        orders: orders
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any order on the database",
                        orders: []
                    };
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to search order on database!");
            }
        }
    },
    {
        method: "POST",
        path: "/api/order",
        options: {
            description: "Registers an order",
            tags: ["api", "Order"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    promotions: Joi.array().items(Joi.string().min(10).max(128)).required(),
                    drinks: Joi.array().items(Joi.string().min(10).max(128)).required(),
                    customer: Joi.string().min(10).max(128).required(),
                    payment: {
                        method: Joi.object({
                            type: Joi.string().valid.apply(Joi, Object.values(PaymentTypes)).required(),
                            change: Joi.number().required()
                        }).label("PaymentMethod").required()                        
                    }
                }).label("Order")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["Order"] as Model<any>;
                
                let object: any = Object.assign(request.payload, {});

                // Calculates the total of it
                let total = object.promotions.reduce((a, b) => a + b.price, 0) + object.drinks.reduce((a, b) => a + b.price, 0);

                // Set the status of it
                object.status = OrderStatus.Requested;

                // Insert into the database
                let document = await model.create(object);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        total: total,
                        status: object.status
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert order on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert order on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/order/{id}",
        options: {
            description: "Update order info",
            notes: "Requires an valid id",
            tags: ["api", "Order"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255),
                    extraPrice: Joi.number().min(0)
                }).label("UpdateOrder")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Order"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update order data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to update order on database!");
            } 
                
        }
    },
    {
        method: "DELETE",
        path: "/api/order/{id}",
        options: {
            description: "Delete a order",
            notes: "Requires an valid id",
            tags: ["api", "Order"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                })
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Order"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete order!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete order on database!");
            }                 
        }
    }
] as ServerRoute[];