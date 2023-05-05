import { Application, Environments, LogLevel, log } from "@expressots/core";
import { PostgresProvider } from "@providers/database/postgres/postgres.provider";
import { provide } from "inversify-binding-decorators";

@provide(App)
class App extends Application {
    protected configureServices(): void {
        Environments.checkAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected postServerInitialization(): void {
        PostgresProvider.connect();
        PostgresProvider.seeds();
    }

    protected serverShutdown(): void {
        PostgresProvider.disconnect();
        log(LogLevel.Info, "Server is shutting down", "logger-provider");
        super.serverShutdown();
    }
}

const appInstance = new App();

export { appInstance as App };
