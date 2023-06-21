import { provide } from "inversify-binding-decorators";
import { MysqlProvider } from "@providers/database/mysql/mysql.provider";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await MysqlProvider.dataSource.query(
            `SELECT * FROM ${this.tableName} WHERE email = ?`,
            [email],
        );

        if (Array.isArray(result) && result[0]) {
            const user = result[0][0];
            if (user) {
                return user as User;
            }
        }
        return null;
    }
}

export { UserRepository };
