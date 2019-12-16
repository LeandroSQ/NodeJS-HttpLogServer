import { Server } from '@hapi/hapi';
import ServerInjectable from "../model/ServerInjectable";

export default class ServerInjectableController {

    private injectableList: ServerInjectable[] = []

    /***
     * Adds the provided injectable to the internal list
     * 
     * @param injectable The provided injectable
     ***/
    inject(injectable: ServerInjectable): void {
        this.injectableList.push(injectable);
    }

    /***
     * Notify all added injectables that the server has been created
     * 
     * @param server The running server instance
     ***/
    notifyServerCreated(server: Server): Promise<any> {
        return new Promise((resolve, reject) => {
            let promises = this.injectableList.map(x => x.onServerCreated(server));

            Promise.all(promises)
                .then(resolve)
                .catch(reject); 
        });
    }

    /***
     * Notify all added injectables that the server has been started
     * 
     * @param server The running server instance
     ***/
    notifyServerStarted(server: Server) {
        return new Promise((resolve, reject) => {
            let promises = this.injectableList.map(x => x.onServerStarted(server));

            Promise.all(promises)
                .then(resolve)
                .catch(reject); 
        });
    }

    /***
     * Notify all added injectables that the server has been disposed
     * 
     * @param server The disposed server instance
     ***/
    async notifyServerDisposed(server: Server) {
        return new Promise((resolve, reject) => {
            let promises = this.injectableList.map(x => x.onServerDisposed(server));

            Promise.all(promises)
                .then(resolve)
                .catch(reject); 
        });
    }

}