import { provide } from "inversify-binding-decorators";
import { PostgresProvider } from "@providers/database/postgres/postgres.provider";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await PostgresProvider.dataSource.query(
            `SELECT * FROM users WHERE email = ($1)`,
            [email],
        );
        return result.rows[0] || null;
    }
}

export { UserRepository };
