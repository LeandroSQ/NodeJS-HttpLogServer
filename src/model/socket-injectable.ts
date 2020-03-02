import { SocketController } from '../controller/socket-controller';
import { Server, Socket } from "socket.io";

export default interface SocketInjectable {

    /***
     *  This method will be called whenever the socket server gets initialized and created
     ***/
    onServerCreated(controller: SocketController): Promise<any>

    /***
     *  This method will be called whenever a socket connects
     ***/
    onSocketConnected(controller: SocketController, socket: Socket): Promise<any>

    /***
     *  This method will be called whenever a socket disconnects
     ***/
    onSocketDisconnected(controller: SocketController, socket: Socket): Promise<any>

}