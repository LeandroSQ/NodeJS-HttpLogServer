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
        path: "/api/pizza-flavor",
        options: {
            description: "Lists all flavors",
            tags: ["api", "Pizza flavor"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaFlavor"] as Model<any>;

                let flavors = await model.find({});

                if (flavors) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        flavors: flavors
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any pizza-flavor on the database",
                        flavors: []
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
        path: "/api/pizza-flavor",
        options: {
            description: "Registers a pizza flavor",
            tags: ["api", "Pizza flavor"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255).required(),
                    ingredients: Joi.array().items(Joi.string().min(3).max(255).required()).required(),
                    extraPrice: Joi.number().min(0).required(),
                    type: Joi.string().valid("Sweet", "Traditional", "Premium").required()
                }).label("PizzaFlavor")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["PizzaFlavor"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        flavor: document
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert pizza-flavor on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert pizza-flavor on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/pizza-flavor/{id}",
        options: {
            description: "Update pizza-flavor info",
            notes: "Requires an valid id",
            tags: ["api", "Pizza flavor"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255),
                    ingredients: Joi.array().items(Joi.string().min(3).max(255)),
                    extraPrice: Joi.number().min(0),
                    type: Joi.string().valid("Sweet", "Traditional", "Premium")
                }).label("UpdatePizzaFlavor")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaFlavor"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update pizza-flavor data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to update pizza-flavor on database!");
            } 
                
        }
    },
    {
        method: "DELETE",
        path: "/api/pizza-flavor/{id}",
        options: {
            description: "Delete a pizza-flavor",
            notes: "Requires an valid id",
            tags: ["api", "Pizza flavor"],
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

                let model = DatabaseController.instance.declaredList["PizzaFlavor"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete pizza-flavor!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete pizza-flavor on database!");
            }                 
        }
    }
] as ServerRoute[];