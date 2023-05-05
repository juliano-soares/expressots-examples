import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { createConnection, Connection } from "mysql2/promise";
import { UserTable } from "./seeds/user";
import bluebird from "bluebird";

@provide(MysqlProvider)
class MysqlProvider {
    static dataSource: Connection;

    static async connect() {
        log(LogLevel.Info, "Connecting to MySQL", "mysql-provider");
        this.dataSource = await createConnection({
            host: ENV.Database.MYSQL_HOST,
            user: ENV.Database.MYSQL_USER,
            password: ENV.Database.MYSQL_PASSWORD,
            database: ENV.Database.MYSQL_DB,
            Promise: bluebird,
        });

        log(LogLevel.Info, "Connected to MySQL", "mysql-provider");
    }

    static async disconnect() {
        await this.dataSource.end();
        log(LogLevel.Info, "Disconnecting from MySQL", "mysql-provider");
    }

    static async seeds() {
        await UserTable.execute();
    }
}

export { MysqlProvider };
