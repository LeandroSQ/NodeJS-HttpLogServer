import Logger from "../utils/Logger";

// Define the delegate
export type DisposeCallback = () => void;

// Define the main class
export class ProcessShutdownController {

    // Define all the possible events to be received
    private haltEvents = [
        `SIGINT`, `SIGQUIT`, `SIGHUP`, `SIGUSR1`, `SIGKILL`, `SIGUSR2`, `SIGTERM`,
        `exit`, `unhandledRejection`, `uncaughtException` 
    ] as const;

    private disposeCallback?: DisposeCallback = null;
    private disposed: boolean = false; // Indicates whether the process has been disposed

    constructor(callback: DisposeCallback) {
        this.disposeCallback = callback;
    }

    /***
     * This method register hooks to the main process, listening for failures and uncaught exceptions
     ***/
    registerHooks(): void {
        // Iterates trough every event and hook it
        this.haltEvents.forEach(event => 
            this.hookEvent(event, this.onEventCallback)
        );
    }

    private hookEvent(event: string, callback: (event: string) => void) {
        (process as any).on(event, callback.bind(this, event));
    }

    private onEventCallback(event: any): void {
        // Ignore duplicated events
        if (this.disposed) return;
        else this.disposed = true;

        Logger.server(`Disposing server due ${event}...`);

        try {            
            // Runs the dispose callback function (If previously provided)
            if (this.disposeCallback) this.disposeCallback();
        } catch (e) {
            Logger.exception("Unable to run the callback!", e);
        }
    }

}
