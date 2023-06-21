import { provide } from "inversify-binding-decorators";
import { IBaseRepository } from "./base-repository.interface";
import { IEntity } from "@entities/base.entity";
import { PostgresProvider } from "@providers/database/postgres/postgres.provider";

@provide(BaseRepository)
class BaseRepository<T extends IEntity> implements IBaseRepository<T> {
    protected tableName!: string;

    async create(item: Omit<T, "id">): Promise<T | null> {
        const fields = Object.keys(item);
        const values = Object.values(item);
        const placeholders = fields
            .map((_, index) => `$${index + 1}`)
            .join(", ");

        const query = `INSERT INTO ${this.tableName} (${fields.join(
            ", ",
        )}) VALUES (${placeholders}) RETURNING *`;

        const result = await PostgresProvider.dataSource.query<T>(
            query,
            values,
        );

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    }

    async update(item: T): Promise<T | null> {
        const id = item.id;
        if (!id) {
            throw new Error("Missing id field in the update object");
        }

        const fields = Object.keys(item).filter((key) => key !== "id");
        const values = Object.values(item).filter((_, index) => index !== 0);
        const updates = fields.map((key, index) => `${key} = $${index + 1}`);
        const query = `UPDATE ${this.tableName} SET ${updates.join(
            ", ",
        )} WHERE id = $${values.length + 1}`;

        await PostgresProvider.dataSource.query(query, [...values, id]);

        return item;
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1`;

        const result = await PostgresProvider.dataSource.query(query, [id]);

        return result.rowCount > 0;
    }

    async find(id: string): Promise<T | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;

        const result = await PostgresProvider.dataSource.query<T>(query, [id]);

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    }

    async findAll(): Promise<T[]> {
        const query = `SELECT * FROM ${this.tableName}`;

        const result = await PostgresProvider.dataSource.query<T>(query);

        return result.rows;
    }
}

export { BaseRepository };
