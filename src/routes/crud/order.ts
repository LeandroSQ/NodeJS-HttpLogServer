import { OrderSources } from './../../enum/order-sources';
import { PaymentTypes } from './../../enum/payment-types';
import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from '../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";
import { OrderStatus } from '../../enum/order-status';

/* Utility functions */
let calculatePizzaPrice = function (pizzaArray, pizzaComplementModel, pizzaFlavorModel) {
    let pricing = pizzaArray.map(async pizza => {  

        // Get all the complements and price them
        let complementsPricing = pizza.complements.map(async complement => {
            return (await pizzaComplementModel.findById(complement).select({ price: 1 })).price;
        });
        let complementPrice = complementsPricing.reduce((a, b) => a + b, 0);// Sum all the complement pricing

        // Get all the flavors price
        let flavorsPricing = pizza.flavors.map(async flavor => {
            return (await pizzaFlavorModel.findById(flavor).select({ price: 1 })).price;
        });
        let flavorPrice = flavorsPricing.reduce((a, b) => a + b, 0);// Sum all the flavors pricing

        pizza.price = complementPrice + flavorPrice;

        return pizza;
    });

    return pricing.reduce((a, b) => a + b.price, 0);
};

let calculateDrinkPrice = function (drinkArray, drinkModel) {
    let drinksPricing = drinkArray.map(async drink => {
        let price = (await drinkModel.findById(drink).select({ price: 1 })).price;
        drink.price = price;

        return drink;
    });

    return drinksPricing.reduce((a, b) => a + b.price, 0);// Sum all the drink pricing
};

let calculatePromotionPrice = function (promotionArray, promotionModel) {
    let promotionPricing = promotionArray.map(async promotion => {
        let price = (await promotionModel.findById(promotion._id).select({ price: 1 })).price;
        promotion.price = price;

        return promotion;
    });
    return promotionPricing.reduce((a, b) => a + b.price, 0);
};

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

                let orders = await model.find({})
                                        .populate("customer")
                                        .populate("branch");

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
                    branch: Joi.string().min(10).max(128).default(null),
                    customer: Joi.string().min(10).max(128).required(),

                    source: Joi.string().valid.apply(Joi, Object.values(OrderSources)).required(),

                    pizzas: Joi.array().items(Joi.object({
                        _id: Joi.string().min(10).max(128).required(),
                        size: Joi.string().min(10).max(128).required(),
                        flavors: Joi.array().items(Joi.string().min(10).max(128)).required(),
                        complements: Joi.array().items(Joi.string().min(10).max(128)).required(),
                        observations: Joi.string().min(0).max(250)
                        // NEED TO BE CALCULATED BY THE API - price: Joi.number().min(0).required()
                    }).label("PizzaItem")).required(),

                    drinks: Joi.array().items(Joi.object({
                        _id: Joi.string().min(10).max(128).required(),
                        name: Joi.string().min(3).max(255).required()
                        // NEED TO BE CALCULATED BY THE API - price: Joi.number().min(0).required()
                    }).label("DrinkItem")).required(),

                    promotions: Joi.array().items(Joi.object({
                        _id: Joi.string().min(10).max(128).required(),

                        pizzas: Joi.array().items(Joi.object({
                            size: Joi.string().min(10).max(128).required(),
                            flavors: Joi.array().items(Joi.string().min(10).max(128)).required(),
                            complements: Joi.array().items(Joi.string().min(10).max(128)).required(),
                            observations: Joi.string().min(0).max(250)
                            // NEED TO BE CALCULATED BY THE API - price: Joi.number().min(0).required()
                        }).label("PizzaItem")).required(),

                        drinks: Joi.array().items(Joi.object({
                            _id: Joi.string().min(10).max(128).required(),
                            name: Joi.string().min(3).max(255).required(),
                            // NEED TO BE CALCULATED BY THE API - price: Joi.number().min(0).required()
                        }).label("DrinkItem")).required()

                        // NEED TO BE CALCULATED BY THE API - price: Joi.number().min(0).required()
                    }).label("PromotionItem")).required(),

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
                let pizzaComplementModel = DatabaseController.instance.declaredList["PizzaComplement"] as Model<any>;
                let pizzaFlavorModel = DatabaseController.instance.declaredList["PizzaFlavor"] as Model<any>;
                let drinkModel = DatabaseController.instance.declaredList["Drink"] as Model<any>;
                let promotionModel = DatabaseController.instance.declaredList["Promotion"] as Model<any>;
                let branchModel = DatabaseController.instance.declaredList["Branch"] as Model<any>;
                
                let object: any = Object.assign(request.payload, {});
                
                // BUSINESS LOGIC: Selects the branch
                if (!object.branch) {
                    // TODO: Check the branch with less friction on accepting the order request
                    let branchId = await branchModel.findOne({ }).select({ _id: 1 })
                    object.branch = branchId;
                }                 
                
                // Calculate pizzas price                
                let pizzasPrice = calculatePizzaPrice(object.pizzas, pizzaComplementModel, pizzaFlavorModel);
                // Calculate drinks price               
                let drinksPrice = calculateDrinkPrice(object.drinks, drinkModel);
                // Calculate promotions price               
                let promotionsPrice = calculatePromotionPrice(object.promotions, promotionModel);
                // Calculate orders total price
                let orderTotalPrice = promotionsPrice + drinksPrice + pizzasPrice;

                // BUSINESS LOGIC: Check if the order has at least one item
                if (orderTotalPrice <= 0) {
                    return Boom.badRequest("The total value of the order is bellow or equals zero");
                }

                // Set the status of the order
                object.status = OrderStatus.Processed;

                // Insert into the database
                let document = await model.create(object);
    
                if (document) {
                    // Everything is fine :)
                    return {
                        message: "OK",
                        order: object
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
                    promotions: Joi.array().items(Joi.string().min(10).max(128)),
                    drinks: Joi.array().items(Joi.string().min(10).max(128)),
                    customer: Joi.string().min(10).max(128),
                    total: Joi.number().min(0),
                    status: Joi.string().valid.apply(Joi, Object.values(OrderStatus)),
                    payment: {
                        method: Joi.object({
                            type: Joi.string().valid.apply(Joi, Object.values(PaymentTypes)),
                            change: Joi.number()
                        }).label("UpdatePaymentMethod")
                    }
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