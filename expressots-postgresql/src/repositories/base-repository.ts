import { provide } from "inversify-binding-decorators";
import { IBaseRepository } from "./base-repository.interface";
import { IEntity } from "@entities/base.entity";
import { SQLiteProvider } from "@providers/database/sqlite/sqlite.provider";

@provide(BaseRepository)
class BaseRepository<T extends IEntity> implements IBaseRepository<T> {
    protected tableName!: string;

    async create(item: Omit<T, "id">): Promise<T | null> {
        const fields = Object.keys(item);
        const values = Object.values(item);
        const placeholders = fields.map((_, index) => "?").join(", ");

        const result = await SQLiteProvider.run(
            `INSERT INTO ${this.tableName} (${fields.join(", ")}) VALUES (${placeholders})`,
            values,
        );

        const id = result.lastID;
        if (!id) {
            return null;
        }

        return { ...item, id } as T;
    }

    async update(item: T): Promise<T | null> {
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

        await SQLiteProvider.run(query, [...values, id]);

        return item;
    }

    async delete(id: string): Promise<boolean> {
        const result = await SQLiteProvider.run(
            `DELETE FROM ${this.tableName} WHERE id = ?`,
            [id],
        );

        return result.changes > 0;
    }

    async find(id: string): Promise<T | null> {
        const result = await SQLiteProvider.get(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [id],
        );

        return result || null;
    }

    async findAll(): Promise<T[]> {
        const result = await SQLiteProvider.all(
            `SELECT * FROM ${this.tableName}`,
        );

        return result;
    }
}

export { BaseRepository };
