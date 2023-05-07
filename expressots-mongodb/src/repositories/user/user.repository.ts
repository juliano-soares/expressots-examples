import { provide } from "inversify-binding-decorators";
import { MongodbProvider } from "@providers/database/mongodb/mongodb.provider";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .findOne({ email });

        return result as User | null;
    }
}

export { UserRepository };
