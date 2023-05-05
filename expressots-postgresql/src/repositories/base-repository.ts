import { provide } from "inversify-binding-decorators";
import { IBaseRepository } from "./base-repository.interface";
import { IEntity } from "@entities/base.entity";
import { PostgresProvider } from "@providers/database/postgres/postgres.provider";

@provide(BaseRepository)
class BaseRepository<T extends IEntity> implements IBaseRepository<T> {
    protected tableName!: string;

    async create(item: Omit<T, "id">): Promise<T | null> {
        const keys = Object.keys(item).join(", ");
        const values = Object.values(item);
        const valuesPlaceholders = values
            .map((_, index) => `$${index + 1}`)
            .join(", ");

        const result = await PostgresProvider.dataSource.query(
            `INSERT INTO ${this.tableName} (${keys}) VALUES (${valuesPlaceholders}) RETURNING *`,
            values,
        );

        return result.rows[0] || null;
    }

    async update(item: T): Promise<T | null> {
        const id = item.id;
        if (!id) {
            throw new Error("Missing id field in the update object");
        }

        const fields = Object.keys(item);
        const values = Object.values(item);
        const updates = fields.map((key, index) => `${key} = $${index + 1}`);
        const query = `UPDATE ${this.tableName} SET ${updates.join(
            ", ",
        )} WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await PostgresProvider.dataSource.query(query, [
            ...values,
            id,
        ]);

        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await PostgresProvider.dataSource.query(
            `DELETE FROM ${this.tableName} WHERE id = $1`,
            [id],
        );

        return result.rowCount > 0;
    }

    async find(id: string): Promise<T | null> {
        const result = await PostgresProvider.dataSource.query(
            `SELECT * FROM ${this.tableName} WHERE id = $1`,
            [id],
        );

        return result.rows[0] || null;
    }

    async findAll(): Promise<T[]> {
        const result = await PostgresProvider.dataSource.query(
            `SELECT * FROM ${this.tableName}`,
        );

        return result.rows;
    }
}

export { BaseRepository };
