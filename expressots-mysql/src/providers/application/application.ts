import { Application, Environments, LogLevel, log } from "@expressots/core";
import { MysqlProvider } from "@providers/database/mysql/mysql.provider";
import { provide } from "inversify-binding-decorators";

@provide(App)
class App extends Application {
    protected configureServices(): void {
        Environments.checkAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected async postServerInitialization(): Promise<void> {
        await MysqlProvider.connect();
        await MysqlProvider.seeds();
    }

    protected async serverShutdown(): Promise<void> {
        MysqlProvider.disconnect();
        log(LogLevel.Info, "Server is shutting down", "logger-provider");
        super.serverShutdown();
    }
}

const appInstance = new App();

export { appInstance as App };
