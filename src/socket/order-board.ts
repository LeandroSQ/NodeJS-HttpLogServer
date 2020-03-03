import { Types } from 'mongoose';
import { Model } from 'mongoose';
import { SocketController } from '../controller/socket-controller';
import SocketInjectable from "../model/socket-injectable";
import { Server, Socket } from "socket.io";
import { DatabaseController } from '../controller/database-controller';
import { OrderStatus } from '../enum/order-status';
import chalk = require('chalk');
import Logger from '../utils/logger';

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
        socket.on("getOrders", async (branchId, callback) => {
            Logger.log(["server", "socket"], `Socket ${socket.id} sent 'getOrders'`);

            try {
                // Gets the database order model
                let model = DatabaseController.instance.declaredList["Order"] as Model<any>;

                // Finds the running orders targeted to the given branch
                let orders = await model.find({ 
                    closed: false,
                    branch: branchId,
                    status: { $in: [
                        OrderStatus.Processed,
                        OrderStatus.InTransportation,
                        OrderStatus.InPreparation,
                        OrderStatus.Confirmed,
                        OrderStatus.Canceled
                    ] },
                });

                // Send to the socket
                callback(null, orders);
            } catch (e) {
                callback(e, null);
                Logger.log(["server", "socket", "error"], "Error while fetching order list!\n'" + e + "'");
                console.trace(e);
            }
            
        });
    }

    /***
     *  This method will be called whenever a socket disconnects
     ***/
    async onSocketDisconnected(controller: SocketController, socket: Socket): Promise<any> {

    }

}