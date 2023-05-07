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

    findByEmail(email: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            SqliteProvider.dataSource.get(
                `SELECT * FROM ${this.tableName} WHERE email = ?`,
                [email],
                (err: any, row: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row ? (row as unknown as User) : null);
                },
            );
        });
    }
}

export { UserRepository };
