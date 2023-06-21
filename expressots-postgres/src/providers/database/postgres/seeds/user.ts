import { PostgresProvider } from "../postgres.provider";

class UserTable {
    static async execute() {
        const query = `
      		CREATE TABLE IF NOT EXISTS users (
        	id VARCHAR PRIMARY KEY,
        	name TEXT NOT NULL,
        	email TEXT NOT NULL
      	)`;

        await PostgresProvider.dataSource.query(query);
    }
}

export { UserTable };
