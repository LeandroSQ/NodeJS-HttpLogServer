import { Types } from 'mongoose';
import { Model } from 'mongoose';
import { SocketController } from '../controller/socket-controller';
import SocketInjectable from "../model/socket-injectable";
import { Server, Socket } from "socket.io";
import { DatabaseController } from '../controller/database-controller';
import { OrderStatus } from '../enum/order-status';
import chalk = require('chalk');

export default class OrderBoardSocketInjectable implements SocketInjectable {
    
    /***
     *  This method will be called whenever the socket server gets initialized and created
     ***/
    async onServerCreated(controller: SocketController): Promise<any> {
        
    }

    /***
     *  This method will be called whenever a socket connects
     ***/
    async onSocketConnected(controller: SocketController, socket: Socket): Promise<any> {
        socket.on("getOrders", async (args) => {
            // Gets the database order model
            let model = DatabaseController.instance.declaredList["Order"] as Model<any>;
            
            // Finds the running orders targeted to the given branch
            let orders = await model.find({ 
                closed: false,
                branch: args.branch,
                status: { $in: [
                    OrderStatus.Processed,
                    OrderStatus.InTransportation,
                    OrderStatus.InPreparation,
                    OrderStatus.Confirmed,
                    OrderStatus.Canceled
                ] },
            }).populate({
                path: "promotions",
                populate: {
                    path: "pizzas",
                    populate: [
                        { path: "size" },
                        { path: "flavors" },
                        { path: "complements" },
                    ]
                }
            });

            console.log(orders);

            // Send to the socket
            socket.emit("getOrdersResponse", orders);
        });
    }

    /***
     *  This method will be called whenever a socket disconnects
     ***/
    async onSocketDisconnected(controller: SocketController, socket: Socket): Promise<any> {

    }

}