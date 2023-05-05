import { SqliteProvider } from "../sqlite.provider";

class UserTable {
    static async execute() {
        const query = `
          CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL
        )`;

        SqliteProvider.dataSource.run(query);
    }
}

export { UserTable };
