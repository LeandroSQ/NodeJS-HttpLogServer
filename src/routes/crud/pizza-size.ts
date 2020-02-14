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
        path: "/api/pizza-size",
        options: {
            description: "Lists all size",
            tags: ["api", "Pizza size"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaSize"] as Model<any>;

                let sizes = await model.find({});

                if (sizes) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        sizes: sizes
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any pizza-size on the database",
                        sizes: []
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
        path: "/api/pizza-size",
        options: {
            description: "Registers a pizza size",
            tags: ["api", "Pizza size"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    description: Joi.string().min(3).max(255).required(),
                    size: Joi.string().min(3).max(255).required()
                }).label("PizzaSize")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["PizzaSize"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        size: document
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert pizza-size on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert pizza-size on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/pizza-size/{id}",
        options: {
            description: "Update pizza-size info",
            notes: "Requires an valid id",
            tags: ["api", "Pizza size"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
                payload: Joi.object({
                    description: Joi.string().min(3).max(255),
                    size: Joi.string().min(3).max(255)
                }).label("UpdatePizzaSize")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaSize"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update pizza-size data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to update pizza-size on database!");
            } 
                
        }
    },
    {
        method: "DELETE",
        path: "/api/pizza-size/{id}",
        options: {
            description: "Delete a pizza-size",
            notes: "Requires an valid id",
            tags: ["api", "Pizza size"],
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

                let model = DatabaseController.instance.declaredList["PizzaSize"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete pizza-size!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete pizza-size on database!");
            }                 
        }
    }
] as ServerRoute[];