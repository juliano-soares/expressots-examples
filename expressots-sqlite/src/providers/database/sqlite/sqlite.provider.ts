import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import sqlite3 from "sqlite3";
import { UserTable } from "./seeds/user";

@provide(SqliteProvider)
class SqliteProvider {
    static dataSource: sqlite3.Database;

    static async connect() {
        SqliteProvider.dataSource = new sqlite3.Database(
            ENV.Database.SQLITE_PATH,
        );

        log(LogLevel.Info, "Connecting to SQLite3", "sqlite3-provider");
        return new Promise<void>((resolve, reject) => {
            SqliteProvider.dataSource.once("open", () => {
                resolve();
            });
            SqliteProvider.dataSource.once("error", (error) => {
                reject(error);
            });
        });
    }

    static async disconnect() {
        log(LogLevel.Info, "Disconnecting to SQLite3", "sqlite3-provider");
        return SqliteProvider.dataSource.close();
    }

    static async seeds() {
        UserTable.execute();
    }
}

export { SqliteProvider };
