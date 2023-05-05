import { provide } from "inversify-binding-decorators";
import { IBaseRepository } from "./base-repository.interface";
import { IEntity } from "@entities/base.entity";
import { SqliteProvider } from "@providers/database/sqlite/sqlite.provider";

@provide(BaseRepository)
class BaseRepository<T extends IEntity> implements IBaseRepository<T> {
    protected tableName!: string;

    async create(item: Omit<T, "id">): Promise<T | null> {
        const fields = Object.keys(item);
        const values = Object.values(item);
        const placeholders = fields.map(() => "?");
        const query = `INSERT INTO ${this.tableName} (${fields.join(
            ", ",
        )}) VALUES (${placeholders.join(", ")})`;

        const result = await SqliteProvider.dataSource.run(query, values);

        return null;
    }

    update(item: T): T | null {
        const id = item.id;
        if (!id) {
            throw new Error("Missing id field in the update object");
        }

        const fields = Object.keys(item).filter((key) => key !== "id");
        const values = Object.values(item).filter((_, index) => index !== 0);
        const updates = fields.map((key) => `${key} = ?`);
        const query = `UPDATE ${this.tableName} SET ${updates.join(
            ", ",
        )} WHERE id = ?`;

        // await SQLiteProvider.run(query, [...values, id]);

        return item;
    }

    delete(id: string): boolean {
        // const result = await SQLiteProvider.run(
        //     `DELETE FROM ${this.tableName} WHERE id = ?`,
        //     [id],
        // );

        // return result.changes > 0;
        return true;
    }

    find(id: string): T | null {
        // const result = await SQLiteProvider.get(
        //     `SELECT * FROM ${this.tableName} WHERE id = ?`,
        //     [id],
        // );

        // return result || null;
        return null;
    }

    findAll(): T[] {
        // const result = await SQLiteProvider.all(
        //     `SELECT * FROM ${this.tableName}`,
        // );

        // return result;
        return [];
    }
}

export { BaseRepository };
