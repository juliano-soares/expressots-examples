import { provide } from "inversify-binding-decorators";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";
import { SqliteProvider } from "@providers/database/sqlite/sqlite.provider";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    findByEmail(email: string): User | null {
        const result = SqliteProvider.dataSource.run(
            `SELECT * FROM ${this.tableName} WHERE email = ?`,
            [email],
        );

        return null;
    }
}

export { UserRepository };
