import { SocketController } from './../../controller/socket-controller';
import { OrderSources } from './../../enum/order-sources';
import { PaymentTypes } from './../../enum/payment-types';
import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from '../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import Logger from "../../utils/logger";
import { OrderStatus } from '../../enum/order-status';
const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));

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

let calculatePromotionPrice = async function (promotionArray, pizzaComplementModel, pizzaFlavorModel, promotionModel) {
    let total = 0;

    for(const promotion of promotionArray) {
        let promo = await promotionModel.findById(promotion._id);
        let basePrice = promo.price;
        let extraComplementsPrice = 0;
        let extraFlavorsPrice = 0;

        // Get all the complements and price them
        for (const pizza of promotion.pizzas) {
            // Finds the according promotion pizza definition
            let promotionPizzaDefinition = promo.pizzas.find(x => x._id.toString() === pizza._id.toString());
            let totalExtraComplementPrice = 0;
            let totalExtraFlavorPrice = 0;

            // Query all the complements that aren't on the pizza definition
            let extraComplements = pizza.complements.filter(complementId => promotionPizzaDefinition.complements.find(x => x._id.toString() === complementId));

            // Queries the complement extra-price and append it to the internal TotalExtraComplementPrice and the global ExtraComplementPrice
            for (const extraComplementId of extraComplements) {
                let complementPrice = (await pizzaComplementModel.findById(extraComplementId).select({ price: 1 })).price;
                totalExtraComplementPrice += complementPrice;
            }
            extraComplementsPrice += totalExtraComplementPrice;

            // Get all the flavors models referenced by this pizza
            let flavors = (await Promise.all(pizza.flavors.map(async x => await pizzaFlavorModel.findById(x)))) as Array<any>;
            // Query all the flavors that aren't on the pizza definition
            let extraFlavors = flavors.filter(x => promotionPizzaDefinition.allowedFlavorTypes.indexOf(x.type) === -1);

            // Queries the complement extra-price and append it to the internal TotalExtraFlavorPrice and the global ExtraFlavorPrice
            for (const extraFlavor of extraFlavors) {
                let flavorPrice = extraFlavor.price;
                totalExtraFlavorPrice += flavorPrice;
            }
            extraFlavorsPrice += totalExtraFlavorPrice;
        }     
        
        promotion.price = basePrice + extraComplementsPrice + extraFlavorsPrice;
        total += promotion.price;
    }

    return total;
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

                    drinks: Joi.array().items(Joi.object({
                        _id: Joi.string().min(10).max(128).required(),
                        name: Joi.string().min(3).max(255).required()
                        // NEED TO BE CALCULATED BY THE API - price: Joi.number().min(0).required()
                    }).label("DrinkItem")).required(),

                    promotions: Joi.array().items(Joi.object({
                        _id: Joi.string().min(10).max(128).required(),

                        pizzas: Joi.array().items(Joi.object({
                            _id: Joi.string().min(10).max(128),
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
                //let pizzasPrice = calculatePizzaPrice(object.pizzas, pizzaComplementModel, pizzaFlavorModel);
                // Calculate drinks price               
                let drinksPrice = calculateDrinkPrice(object.drinks, drinkModel);
                // Calculate promotions price               
                let promotionsPrice = await calculatePromotionPrice(object.promotions, pizzaComplementModel, pizzaFlavorModel, promotionModel);
                // Calculate orders total price
                let orderTotalPrice = promotionsPrice + drinksPrice;

                // BUSINESS LOGIC: Check if the order has at least one item
                if (orderTotalPrice <= 0) {
                    return Boom.badRequest("The total value of the order is bellow or equals zero");
                }

                // Set the status of the order
                object.status = OrderStatus.Processed;
                object.total = orderTotalPrice;

                // Insert into the database
                let document = await model.create(object);
    
                if (document) {
                    SocketController.instance.emit("newOrder", document);

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
                    branch: Joi.string().min(10).max(128).default(null),
                    customer: Joi.string().min(10).max(128),

                    code: Joi.number().min(0),
                    total: Joi.number().min(0),
                    status: Joi.string().valid.apply(Joi, Object.values(OrderStatus)),
                    createdAt: Joi.date().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),

                    source: Joi.string().valid.apply(Joi, Object.values(OrderSources)),
                    closed: Joi.boolean(),

                    drinks: Joi.array().items(Joi.object({
                        _id: Joi.string().min(10).max(128),
                        name: Joi.string().min(3).max(255),
                        price: Joi.number().min(0)
                    }).label("UpdateDrinkItem")),

                    promotions: Joi.array().items(Joi.object({
                        _id: Joi.string().min(10).max(128),

                        pizzas: Joi.array().items(Joi.object({
                            _id: Joi.string().min(10).max(128),
                            size: Joi.string().min(10).max(128),
                            flavors: Joi.array().items(Joi.string().min(10).max(128)),
                            complements: Joi.array().items(Joi.string().min(10).max(128)),
                            observations: Joi.string().min(0).max(250),
                            price: Joi.number().min(0)
                        }).label("UpdatePizzaItem")),

                        drinks: Joi.array().items(Joi.object({
                            _id: Joi.string().min(10).max(128),
                            name: Joi.string().min(3).max(255),
                            price: Joi.number().min(0)
                        }).label("UpdateDrinkItem")),

                        price: Joi.number().min(0)
                    }).label("UpdatePromotionItem")),

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