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
        path: "/api/pizza-complement",
        options: {
            description: "Lists all complements",
            tags: ["api", "Pizza complement"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaComplement"] as Model<any>;

                let complements = await model.find({});

                if (complements) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        complements: complements
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any pizza-complement on the database",
                        complements: []
                    };
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to search pizza-complement on database!");
            }
        }
    },
    {
        method: "POST",
        path: "/api/pizza-complement",
        options: {
            description: "Registers a pizza-complement",
            tags: ["api", "Pizza complement"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255).required(),
                    price: Joi.number().min(0).required()
                }).label("PizzaComplement")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["PizzaComplement"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        complement: document
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert pizza-complement on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert pizza-complement on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/pizza-complement/{id}",
        options: {
            description: "Update pizza-complement info",
            notes: "Requires an valid id",
            tags: ["api", "Pizza complement"],
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
                }).label("UpdatePizzaComplement")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["PizzaComplement"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update pizza-complement data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to update pizza-complement on database!");
            } 
                
        }
    },
    {
        method: "DELETE",
        path: "/api/pizza-complement/{id}",
        options: {
            description: "Delete a complement",
            notes: "Requires an valid id",
            tags: ["api", "Pizza complement"],
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

                let model = DatabaseController.instance.declaredList["PizzaComplement"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete pizza-complement!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete pizza-complement on database!");
            }                 
        }
    }
] as ServerRoute[];