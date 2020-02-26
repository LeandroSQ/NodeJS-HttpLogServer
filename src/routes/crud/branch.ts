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
        path: "/api/branch",
        options: {
            description: "Lists all branches",
            tags: ["api", "Branch"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Branch"] as Model<any>;

                let branches = await model.find({});

                if (branches) {
                    // If we've got a valid customer from the database
                    return {
                        message: "OK",
                        branches: branches
                    };
                } else {
                    // If we haven't found any customer with that phone
                    return {
                        message: "Couldn't find any branch on the database",
                        branches: []
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
        path: "/api/branch",
        options: {
            description: "Registers a branch",
            tags: ["api", "Branch"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true }),
                payload: Joi.object({
                    name: Joi.string().min(3).max(255).required(),
                    phone: Joi.string().min(10).max(11).required(),
                    delivery: Joi.object({
                        address: Joi.string().min(3).max(255).required(),
                        number: Joi.number().required(),
                        district: Joi.string().min(3).max(255).required(),
                        complement: Joi.string().min(3).max(255),
                        cep: Joi.string().min(8).max(8).required(),
                        location: Joi.object({
                            latitude: Joi.number().required(),
                            longitude: Joi.number().required()
                        }).label("LatitudeLongitudeWrapper").required()
                    }).required().label("BranchAddress")
                }).label("Branch")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);
            
                let model = DatabaseController.instance.declaredList["Branch"] as Model<any>;
                
                // Insert into the database
                let document = await model.create(request.payload);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        branch: document
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
        path: "/api/branch/{id}",
        options: {
            description: "Update branch info",
            notes: "Requires an valid id",
            tags: ["api", "Branch"],
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
                    delivery: Joi.object({
                        address: Joi.string().min(3).max(255),
                        number: Joi.number(),
                        district: Joi.string().min(3).max(255),
                        complement: Joi.string().min(3).max(255),
                        cep: Joi.string().min(8).max(8),
                        location: Joi.object({
                            latitude: Joi.number(),
                            longitude: Joi.number()
                        }).label("UpdateLatitudeLongitudeWrapper")
                    }).required().label("UpdateBranchAddress")
                }).label("UpdateBranch")
            }
        },
        
        handler: async function(request, h) {
            try {
                Logger.route(request);

                let model = DatabaseController.instance.declaredList["Branch"] as Model<any>;

                let result = await model.updateOne({ _id: request.params.id }, request.payload);

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to update branch data!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to insert on database!");
            } 
                
        }
    },
    {
        method: "DELETE",
        path: "/api/branch/{id}",
        options: {
            description: "Delete a branch",
            notes: "Requires an valid id",
            tags: ["api", "Branch"],
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

                let model = DatabaseController.instance.declaredList["Branch"] as Model<any>;

                let result = await model.deleteOne({ _id: request.params.id });

                if (result) {
                    return {
                        message: "OK"
                    } 
                } else {
                    return Boom.internal("Unable to delete branch!");
                }
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to delete on database!");
            }                 
        }
    }
] as ServerRoute[];