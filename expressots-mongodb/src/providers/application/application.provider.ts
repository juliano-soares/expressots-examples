import { Application, Environments, LogLevel, log } from "@expressots/core";
import { MongodbProvider } from "@providers/database/mongodb/mongodb.provider";
import { provide } from "inversify-binding-decorators";

@provide(App)
class App extends Application {
    protected configureServices(): void {
        Environments.checkAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected async postServerInitialization(): Promise<void> {
        await MongodbProvider.connect();
    }

    protected async serverShutdown(): Promise<void> {
        MongodbProvider.disconnect();
        log(LogLevel.Info, "Server is shutting down", "logger-provider");
        super.serverShutdown();
    }
}

const appInstance = new App();

export { appInstance as App };
