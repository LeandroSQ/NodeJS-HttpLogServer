import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from './../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";

module.exports = [
    {
        method: "GET",
        path: "/api/customer/{phone}",
        options: {
            description: "Lists all info from customer with the provided phone",
            notes: "Requires an valid phone",
            tags: ["api", "Customer"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    phone: Joi.string().min(10).max(11).required()
                })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Customer"] as Model<any>;

                let customer = await model.findOne({ phone: request.params.phone });

                if (customer) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        customer: customer
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any customer with the provided phone",
                        customer: null
                    };
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to search on database!");
            }
        }
    },
    {
        method: "GET",
        path: "/api/customer",
        options: {
            description: "Lists all customers",
            tags: ["api", "Customer"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Customer"] as Model<any>;

                let customers = await model.find({ });

                if (customers) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        customers: customers
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any customer on the database",
                        customers: []
                    };
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to search on database!");
            }
        }
    },
    {
        method: "POST",
        path: "/api/customer",
        options: {
            description: "Registers info from customer",
            notes: "Requires an valid phone",
            tags: ["api", "Customer"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255).required(),
                    phone: Joi.string().min(10).max(11).required(),
                    document: Joi.string().min(11).max(14).optional(),
                    delivery: Joi.object({
                        address: Joi.string().min(3).max(255).required(),
                        number: Joi.number().required(),
                        district: Joi.string().min(3).max(255).required(),
                        complement: Joi.string().min(3).max(255).optional(),
                        cep: Joi.string().min(8).max(8).optional()
                    }).required().label("CustomerDeliveryAddress")
                }).label("Customer")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["Customer"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        customer: document
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/customer/{id}",
        options: {
            description: "Update customer info",
            notes: "Requires an valid phone",
            tags: ["api", "Customer"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255),
                    phone: Joi.string().min(10).max(11),
                    document: Joi.string().min(11).max(14),
                    delivery: Joi.object({
                        address: Joi.string().min(3).max(255),
                        number: Joi.number(),
                        district: Joi.string().min(3).max(255),
                        complement: Joi.string().min(3).max(255),
                        cep: Joi.string().min(8).max(8)
                    }).optional().label("UpdateCustomerDeliveryAddress")
                }).label("UpdateCustomer")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Customer"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update customer data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert on database!");
            } 
        }
    }
] as ServerRoute[];