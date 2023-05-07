import { provide } from "inversify-binding-decorators";
import { IBaseRepository } from "./base-repository.interface";
import { IEntity } from "@entities/base.entity";
import { OptionalUnlessRequiredId } from "mongodb";
import { MongodbProvider } from "@providers/database/mongodb/mongodb.provider";
import { log } from "console";

@provide(BaseRepository)
class BaseRepository<T extends IEntity> implements IBaseRepository<T> {
    protected tableName!: string;

    async create(item: OptionalUnlessRequiredId<T>): Promise<T | null> {
        try {
            const result = await MongodbProvider.dataSource
                .collection(this.tableName)
                .insertOne(item);
            return { ...item, id: result.insertedId } as T | null;
        } catch (err) {
            log(err, "error", "base-repository");
            return null;
        }
    }

    async update(item: T): Promise<T | null> {
        try {
            const result = await MongodbProvider.dataSource
                .collection(this.tableName)
                .updateOne({ id: item.id }, { $set: item });

            if (result.modifiedCount === 1) {
                return item;
            }

            return null;
        } catch (err) {
            log(err, "error", "base-repository");
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .deleteOne({ id });
        if (result.deletedCount === 1) {
            return true;
        }
        return false;
    }

    async find(id: string): Promise<T | null> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .findOne({ id });
        return result as T | null;
    }

    async findAll(): Promise<T[]> {
        const result = await MongodbProvider.dataSource
            .collection(this.tableName)
            .find()
            .toArray();
        return result as T[] | [];
    }
}

export { BaseRepository };
