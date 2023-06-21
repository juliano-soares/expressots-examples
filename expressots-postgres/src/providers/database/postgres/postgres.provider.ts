import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { Client } from "pg";
import { UserTable } from "./seeds/user";

@provide(PostgresProvider)
class PostgresProvider {
    static dataSource: Client;

    static async connect() {
        PostgresProvider.dataSource = new Client({
            user: ENV.Database.POSTGRES_USER,
            host: ENV.Database.POSTGRES_HOST,
            database: ENV.Database.POSTGRES_DB,
            password: ENV.Database.POSTGRES_PASSWORD,
            port: ENV.Database.POSTGRES_PORT,
        });

        log(LogLevel.Info, "Connecting to Postgres", "postgres-provider");
        return await PostgresProvider.dataSource.connect();
    }

    static async disconnect() {
        log(LogLevel.Info, "Disconnecting to Postgres", "postgres-provider");
        return await PostgresProvider.dataSource.end();
    }

    static async seeds() {
        UserTable.execute(); // This line creates the table if it doesn't exist
    }
}

export { PostgresProvider };
