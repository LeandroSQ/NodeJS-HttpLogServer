import { PizzaFlavorTypes } from './../../enum/pizza-flavor-types';
import { PaymentTypes } from './../../enum/payment-types';
import { OrderStatus } from './../../enum/order-status';
import { Schema } from 'mongoose';
import * as Boom from '@hapi/boom';
import { Model } from 'mongoose';
import { DatabaseController } from '../../controller/database-controller';
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";
import PizzaFlavorDatabaseModel from '../../model/database/pizza-flavor-database-model';
import { OrderSources } from '../../enum/order-sources';

function handleModel(x: any): String { 
    if (x) {
        if (Array.isArray(x)) x = x[0];

        if (x._id) return x._id;//.toString();
    }

    return null;
}

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
                let startTime = Date.now();

                let customer = DatabaseController.instance.declaredList["Customer"] as Model<any>;
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
                    },
                    {
                        "name": "Reginaldo Primo",
                        "phone": "51992566520",
                        "document": "30130130131",
                        "delivery": {
                            "address": "Rua 2",
                            "number": 2,
                            "district": "Bairro 2",
                            "complement": "Casa",
                            "cep": "94180002"
                        }
                    }
                ]);
        
                let branch =  DatabaseController.instance.declaredList["Branch"] as Model<any>;
                await branch.deleteMany({ });
                await branch.insertMany([
                    {
                        "name": "Matriz - Morada do bosque",
                        "phone": "51996876520",
                        "address": {
                            "address": "Rua 1",
                            "number": 1,
                            "district": "Bairro 1",
                            "complement": "Casa",
                            "cep": "94180000",
                            "location": {
                                "latitude": 123,
                                "longitude": 123
                            }
                        }
                    },
                    {
                        "name": "Filial - Centro Cachoeirinha",
                        "phone": "51996876520",
                        "address": {
                            "address": "Rua 1",
                            "number": 1,
                            "district": "Bairro 1",
                            "complement": "Casa",
                            "cep": "94180000",
                            "location": {
                                "latitude": 2,
                                "longitude": 4
                            }
                        }
                    }
                ])

                let drink = DatabaseController.instance.declaredList["Drink"] as Model<any>;
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
                ]);

                let complement = DatabaseController.instance.declaredList["PizzaComplement"] as Model<any>;
                await complement.deleteMany({ });
                await complement.insertMany([
                    {
                        "name": "Borda de catupiry",
                        "price": 10
                    },
                    {
                        "name": "Borda de cheddar",
                        "price": 20
                    }
                ]);

                let flavor = DatabaseController.instance.declaredList["PizzaFlavor"] as Model<any>;
                await flavor.deleteMany({ });
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
                        "price": 0,
                        "type": PizzaFlavorTypes.Traditional
                    },
                    {
                        "name": "Chocolate",
                        "ingredients": [
                            "Chocolate amargo"
                        ],
                        "price": 0,
                        "type": PizzaFlavorTypes.Sweet
                    },
                    {
                        "name": "Camarão",
                        "ingredients": [
                            "Camarão",                            
                          "Queijo prato",
                          "Molho de tomate"
                        ],
                        "price": 10,
                        "type": PizzaFlavorTypes.Premium
                    }
                ]);

                let size = DatabaseController.instance.declaredList["PizzaSize"] as Model<any>;
                await size.deleteMany({ });
                await size.insertMany([ 
                    {
                        "description": "Pequena",
                        "size": "25cm"
                    },
                    {
                        "description": "Média",
                        "size": "30cm"
                    },
                    {
                        "description": "Grande",
                        "size": "35cm"
                    },
                    {
                        "description": "Família",
                        "size": "45cm"
                    }
                ]);

                let promotion = DatabaseController.instance.declaredList["Promotion"] as Model<any>;
                await promotion.deleteMany({ });
                await promotion.insertMany([
                    {
                        pizzas: [                            
                            {
                                "size": handleModel(await size.findOne({ description: /Pequena/i })),
                                "allowedFlavorTypes": Object.values(PizzaFlavorTypes),
                                "complements": [],
                                "maxSliceCount": 2,                                
                            }
                        ],
                        "name": "Pequena",
                        "description": "2 Sabores tradicionais",
                        "drinks": [],
                        "price": 20,
                        "highlighted": false
                    },
                    {
                        pizzas: [                            
                            {
                                "size": handleModel(await size.findOne({ description: /Média/i })),
                                "allowedFlavorTypes": Object.values(PizzaFlavorTypes),
                                "complements": [],
                                "maxSliceCount": 3,                                
                            }
                        ],
                        "name": "Média",
                        "description": "3 Sabores tradicionais",
                        "drinks": [],
                        "price": 34.90,
                        "highlighted": false
                    },
                    {
                        pizzas: [                            
                            {
                                "size": handleModel(await size.findOne({ description: /Grande/i })),
                                "allowedFlavorTypes": Object.values(PizzaFlavorTypes),
                                "complements": [],
                                "maxSliceCount": 4,                                
                            }
                        ],
                        "name": "Grande",
                        "description": "4 Sabores tradicionais",
                        "drinks": [],
                        "price": 44.90,
                        "highlighted": false
                    },
                    {
                        pizzas: [
                            {
                                "size": handleModel(await size.findOne({ description: /Grande/i })),
                                "allowedFlavorTypes": Object.values(PizzaFlavorTypes),
                                "complements": [],
                                "maxSliceCount": 4,
                            }
                        ],
                        "name": "Super família",
                        "description": "4 Sabores tradicionais\n+ Guaraná",
                        "drinks": handleModel(await drink.findOne({ name: /Guaraná/i })),
                        "price": 54.90,
                        "highlighted": false
                    },
                    {
                        pizzas: [
                            {
                                "size": handleModel(await size.findOne({ description: /Grande/i })),
                                "allowedFlavorTypes": Object.values(PizzaFlavorTypes),
                                "complements": [],
                                "maxSliceCount": 2,
                            },
                            {
                                "size": handleModel(await size.findOne({ description: /Grande/i })),
                                "allowedFlavorTypes": Object.values(PizzaFlavorTypes),
                                "complements": [],
                                "maxSliceCount": 2,                                
                            }
                        ],
                        "name": "Promoção 2 pizzas grandes",
                        "description": "2 Sabores tradicionais por pizza",
                        "drinks": [],
                        "price": 54.90,
                        "highlighted": true
                    }
                ]); 

                let order = DatabaseController.instance.declaredList["Order"] as Model<any>;
                await order.deleteMany({ });                

                for (var i = 0; i < 10; i++) {
                    let statuses = Object.values(OrderStatus);
                    let status = statuses[Math.floor(Math.random() * statuses.length)];

                    let sources = Object.values(OrderSources);
                    let source = sources[Math.floor(Math.random() * sources.length)];

                    let paymentTypes = Object.values(PaymentTypes);
                    let paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];

                    let customerCount = await customer.countDocuments({ });
                    let customerIndex = Math.floor(Math.random() * (customerCount));
                    let selectedCustomer = await customer.findOne().skip(customerIndex);

                    let branchCount = await branch.countDocuments({ });
                    let branchIndex = Math.floor(Math.random() * (branchCount));
                    let selectedBranch = await branch.findOne().skip(branchIndex);

                    let drinkCount = await drink.countDocuments({ });
                    let drinkIndex = Math.floor(Math.random() * (drinkCount));                    
                    let selectedDrinks = [];
                    if (Math.random() > 0.5) {
                        let d = await drink.findOne({ }).skip(drinkIndex);
                        if (d) selectedDrinks.push(d);
                    }
                    
                    let promotionCount = await promotion.countDocuments({ });
                    let promotionIndex = Math.floor(Math.random() * (promotionCount));
                    let selectedPromotion = await promotion.findOne({}).skip(promotionIndex);  
                    let drinks = selectedPromotion.drinks;
                    let pizzas = []
                    for (const pizza of selectedPromotion.pizzas) {
                        let flavors = [];
                        let flavorPrice = 0;
                        for(const flavorType of pizza.allowedFlavorTypes) {
                            if (flavors.length >= pizza.maxSliceCount) break;

                            let flavorCount = await flavor.countDocuments({ type: flavorType });
                            let flavorIndex = Math.floor(Math.random() * flavorCount);
                            let selectedFlavor = await flavor.findOne({ type: flavorType }).select({ _id: 1, price: 1 }).skip(flavorIndex);
                            flavorPrice += selectedFlavor.price;
                            flavors.push(selectedFlavor._id);
                        }

                        // Get all the complements and price them
                        let complementPrice = 0;
                        for (const complement of pizza.complements) {
                            let selectedComplementPrice = (await complement.findById(complement).select({ price: 1 })).price
                            complementPrice += selectedComplementPrice;
                        }

                        pizzas.push({
                            size: pizza.size,
                            complements: pizza.complements,
                            flavors: flavors,
                            observations: Math.random() <= 0.5 ? "Sem cebola" : "Sem tomate",
                            price: complementPrice + flavorPrice
                        });
                    }

                    let total = selectedPromotion.price + pizzas.reduce((a, b) => a + b.price, 0)

                    let obj: any = {
                        "promotions": {
                            _id: selectedPromotion._id,
                            pizzas: pizzas,
                            drinks: drinks
                        },
                        "drinks": selectedDrinks,
                        "customer": handleModel(selectedCustomer),
                        "branch": handleModel(selectedBranch),
                        "total": total,
                        "status": status,
                        "createdAt": `2020-${Math.floor(Math.random() * 11 + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 27 + 1).toString().padStart(2, '0')} ${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}:00`,
                        "source": source,
                        "payment": {
                            "method": {
                                "type": paymentType,
                                "change": paymentType == PaymentTypes.Cash ? Math.max(Math.random() * 100, total) : 0
                            }
                        }
                    };

                    console.log(obj);

                    await order.create(obj);
                }

                console.log("Took " + (Date.now() - startTime) + "ms");

                return {
                    message: "OK"
                };
            } catch(e) {
                console.trace(e);
                console.error(e);
                return Boom.internal("Unable to reset the database!");
            }
        }
    }
] as ServerRoute[];