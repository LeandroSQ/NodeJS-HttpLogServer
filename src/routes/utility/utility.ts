import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from '../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";
import PizzaFlavorDatabaseModel from '../../model/database/pizza-flavor-database-model';

module.exports = [
    {
        method: "GET",
        path: "/api/reset-models",
        options: {
            description: "Resets and inserts the defaults",
            tags: ["api", "Utility"],
            validate: {
                headers: Joi.object({
                    authorization: Joi.string().default("Bearer 1234").required()
                }).options({ allowUnknown: true })
            }
        },

        handler: async function(request, h) {
            try {
                Logger.route(request);

                /* let customer = DatabaseController.instance.declaredList["Customer"] as Model<any>;
                await customer.deleteMany({ })
                await customer.insertMany([
                    {
                        "name": "João da Silva TESTE",
                        "phone": "51996876520",
                        "document": "30030030030",
                        "delivery": {
                            "address": "Rua 1",
                            "number": 1,
                            "district": "Bairro 1",
                            "complement": "Casa",
                            "cep": "94180000"
                        }
                    }
                ]); */

                /* let drink = DatabaseController.instance.declaredList["DrinkItem"] as Model<any>;
                await drink.deleteMany({ });
                await drink.insertMany([
                    {
                        "name": "Coca-cola 2L",
                        "price": 10
                    },
                    {
                        "name": "Guaraná 600ml",
                        "price": 3
                    }
                ]); */

                /* let complement = DatabaseController.instance.declaredList["PizzaComplement"] as Model<any>;
                await complement.deleteMany({ });
                await complement.insertMany([
                    {
                        "name": "Borda de catupiry",
                        "extraPrice": 10
                    },
                    {
                        "name": "Borda de cheddar",
                        "extraPrice": 20
                    }
                ]); */

                let flavor = DatabaseController.instance.declaredList["PizzaFlavor"] as Model<any>;
                /* await flavor.deleteMany({ });
                await flavor.insertMany([
                    {
                        "name": "4 Queijos",
                        "ingredients": [
                          "Queijo mussarela",
                          "Queijo gorgonzola",
                          "Queijo cheddar",
                          "Queijo prato",
                          "Molho de tomate",
                        ],
                        "extraPrice": 0,
                        "type": "Traditional"
                    }
                ]); */

                let size = DatabaseController.instance.declaredList["PizzaSize"] as Model<any>;
                /* await size.deleteMany({ });
                await size.insertMany([ 
                    {
                        "description": "Pizza Pequena",
                        "size": "25cm"
                    },
                    {
                        "description": "Pizza Média",
                        "size": "35cm"
                    },
                    {
                        "description": "Pizza Grande",
                        "size": "45cm"
                    },
                ]); */

                let pizza = DatabaseController.instance.declaredList["PizzaItem"] as Model<any>;
                await pizza.deleteMany({ });
                await pizza.insertMany([ 
                    {
                        "size": size.findOne({ }).map((x:any) => x._id),
                        "flavors": flavor.find({ }).map((x: any) => x._id),
                        "complements": flavor.find({ }).map((x: any) => x._id),
                        "observations": "Sem cebola"
                    }
                ]);

                /* let promotion = DatabaseController.instance.declaredList["PizzaPromotion"] as Model<any>;
                await promotion.deleteMany({ });
                await promotion.insertMany([
                    {
                        "pizzas": pizza.find({ }).map((x: any) => x._id),
                        "drinks": drink.find({ }).map((x: any) => x._id),
                        "maxSliceCount": 4
                    }
                ]); */

                return {
                    message: "OK"
                };
            } catch(e) {
                console.trace(e);
                return Boom.internal("Unable to reset the database!");
            }
        }
    }
] as ServerRoute[];