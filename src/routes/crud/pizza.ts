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
        path: "/api/pizza",
        options: {
            description: "Lists all pizzas",
            tags: ["api", "Pizza"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaPizza"] as Model<any>;

                let pizzas = await model.find({});

                if (pizzas) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        pizzas: pizzas
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any pizza on the database",
                        pizzas: []
                    };
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to search pizza on database!");
            }
        }
    },
    {
        method: "POST",
        path: "/api/pizza",
        options: {
            description: "Registers a pizza",
            tags: ["api", "Pizza"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    size: Joi.string().min(10).max(128).required(),
                    flavors: Joi.array().items(
                        Joi.string().min(10).max(128).required()
                    ).required(),
                    complements: Joi.array().items(
                        Joi.string().min(10).max(128).required()
                    ).required(),
                    observations: Joi.string().default("").trim(true).min(3).max(255).optional()
                }).label("PizzaPizza")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["PizzaPizza"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        pizza: document
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert pizza on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert pizza on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/pizza/{id}",
        options: {
            description: "Update pizza info",
            notes: "Requires an valid id",
            tags: ["api", "Pizza"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
                payload: Joi.object({
                    size: Joi.string().min(10).max(128),
                    flavors: Joi.array().items(
                        Joi.string().min(10).max(128).required()
                    ),
                    complements: Joi.array().items(
                        Joi.string().min(10).max(128).required()
                    ),
                    observations: Joi.string().default("").trim(true).min(3).max(255)
                }).label("UpdatePizzaPizza")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaPizza"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update pizza data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to update pizza on database!");
            } 
                
        }
    },
    {
        method: "DELETE",
        path: "/api/pizza/{id}",
        options: {
            description: "Delete a pizza",
            notes: "Requires an valid id",
            tags: ["api", "Pizza"],
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

                let model = DatabaseController.instance.declaredList["PizzaPizza"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete pizza!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete pizza on database!");
            }                 
        }
    }
] as ServerRoute[];