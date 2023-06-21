import { Application, Environments, LogLevel, log } from "@expressots/core";
import { SqliteProvider } from "@providers/database/sqlite/sqlite.provider";
import { provide } from "inversify-binding-decorators";

@provide(App)
class App extends Application {
    protected configureServices(): void {
        Environments.checkAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected postServerInitialization(): void {
        SqliteProvider.connect();
        SqliteProvider.seeds();
    }

    protected serverShutdown(): void {
        SqliteProvider.disconnect();
        log(LogLevel.Info, "Server is shutting down", "logger-provider");
        super.serverShutdown();
    }
}

const appInstance = new App();

export { appInstance as App };
