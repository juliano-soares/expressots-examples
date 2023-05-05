import { MysqlProvider } from "../mysql.provider";

class UserTable {
    static async execute() {
        const query = `
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL
        )`;

        await MysqlProvider.dataSource.execute(query);
    }
}

export { UserTable };
