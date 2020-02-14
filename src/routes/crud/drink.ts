import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from '../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";

module.exports = [
    {
        method: "GET",
        path: "/api/drink",
        options: {
            description: "Lists all drinks",
            tags: ["api", "drink"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Drink"] as Model<any>;

                let drinks = await model.find({});

                if (drinks) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        drinks: drinks
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any drink on the database",
                        drinks: []
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
        path: "/api/drink",
        options: {
            description: "Registers a drink",
            tags: ["api", "drink"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255).required(),
                    price: Joi.number().min(0).required()
                }).label("Drink")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["Drink"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        drink: document
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to update on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/drink/{id}",
        options: {
            description: "Update drink info",
            notes: "Requires an valid id",
            tags: ["api", "drink"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255),
                    price: Joi.number().min(0)
                }).label("UpdateDrink")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Drink"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update drink data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert on database!");
            } 
                
        }
    },
    {
        method: "DELETE",
        path: "/api/drink/{id}",
        options: {
            description: "Delete a drink",
            notes: "Requires an valid id",
            tags: ["api", "drink"],
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

                let model = DatabaseController.instance.declaredList["Drink"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete drink!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete on database!");
            }                 
        }
    }
] as ServerRoute[];