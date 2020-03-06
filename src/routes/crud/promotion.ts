import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from '../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";
import { PizzaFlavorTypes } from '../../enum/pizza-flavor-types';

module.exports = [
    {
        method: "GET",
        path: "/api/promotion",
        options: {
            description: "Lists all promotions",
            tags: ["api", "Promotion"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Promotion"] as Model<any>;

                let promotions = await model.find({ })
                                            .populate({
                                                path: "pizzas",
                                                populate: [
                                                    { path: "size" },
                                                    { path: "complements" }
                                                ]
                                            })
                                            .populate("drinks");

                if (promotions) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        promotions: promotions
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any pizza-promotion on the database",
                        promotions: []
                    };
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to search pizza-promotion on database!");
            }
        }
    },
    {
        method: "GET",
        path: "/api/promotion/{id}",
        options: {
            description: "Lists one promotion",
            tags: ["api", "Promotion"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Promotion"] as Model<any>;

                let promotions = await model.findById(request.params.id)
                                            .populate({
                                                path: "pizzas",
                                                populate: [
                                                    { path: "size" },
                                                    { path: "complements" }
                                                ]
                                            })
                                            .populate("drinks");

                if (promotions) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        promotions: promotions
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any pizza-promotion on the database",
                        promotions: []
                    };
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to search pizza-promotion on database!");
            }
        }
    },
    {
        method: "POST",
        path: "/api/promotion",
        options: {
            description: "Registers a promotion",
            tags: ["api", "Promotion"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    pizzas: Joi.array().items(Joi.object({
                        maxSliceCount: Joi.number().required(),
                        size: Joi.string().min(10).max(128).required(),
                        complements: Joi.array().items(Joi.string().min(10).max(128)).required(),
                        allowedFlavorTypes: Joi.array().items(Joi.string().valid.apply(Joi, Object.values(PizzaFlavorTypes))).required()
                    }).label("PromotionPizzaInfo")),
                    drinks: Joi.array().items(Joi.string().min(10).max(128)).required(),
                    price: Joi.number().required(),
                    highlighted: Joi.boolean().required()
                }).label("Promotion")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["Promotion"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        promotion: document
                    };
                } else {
                    // In case of error
                    return Boom.internal("Unable to insert pizza-promotion on database!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert pizza-promotion on database!");
            }
        }
    },
    {
        method: "PUT",
        path: "/api/pizza-promotion/{id}",
        options: {
            description: "Update pizza-promotion info",
            notes: "Requires an valid id",
            tags: ["api", "Promotion"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                params: Joi.object({
                    id: Joi.string().min(10).max(128).required() 
                }),
                payload: Joi.object({
                    pizzas: Joi.array().items(Joi.object({
                        maxSliceCount: Joi.number(),
                        size: Joi.string().min(10).max(128),
                        complements: Joi.array().items(Joi.string().min(10).max(128)),
                        allowedFlavorTypes: Joi.array().items(Joi.string().valid.apply(Joi, Object.values(PizzaFlavorTypes)))
                    }).label("UpdatePromotionPizzaInfo")),
                    drinks: Joi.array().items(Joi.string().min(10).max(128)),
                    price: Joi.number(),
                    highlighted: Joi.boolean()
                }).label("UpdatePromotion")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Promotion"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update pizza-promotion data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to update pizza-promotion on database!");
            }
        }
    },
    {
        method: "DELETE",
        path: "/api/pizza-promotion/{id}",
        options: {
            description: "Delete a promotion",
            notes: "Requires an valid id",
            tags: ["api", "Promotion"],
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

                let model = DatabaseController.instance.declaredList["Promotion"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete pizza-promotion!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete pizza-promotion on database!");
            }                 
        }
    }
] as ServerRoute[];