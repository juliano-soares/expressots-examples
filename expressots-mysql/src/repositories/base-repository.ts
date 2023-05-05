import { provide } from "inversify-binding-decorators";
import { IBaseRepository } from "./base-repository.interface";
import { IEntity } from "@entities/base.entity";
import { MysqlProvider } from "@providers/database/mysql/mysql.provider";

@provide(BaseRepository)
class BaseRepository<T extends IEntity> implements IBaseRepository<T> {
    protected tableName!: string;

    async create(item: Omit<T, "id">): Promise<T | null> {
        const keys = Object.keys(item).join(", ");
        const values = Object.values(item);
        const valuesPlaceholders = values.map(() => "?").join(", ");

        const result = await MysqlProvider.dataSource.query(
            `INSERT INTO ${this.tableName} (${keys}) VALUES (${valuesPlaceholders})`,
            values,
        );

        if (Array.isArray(result)) {
            const insertedRow = result[0];
            if ("affectedRows" in insertedRow) {
                return item as T;
            }
        }

        return null;
    }

    // TODO: Fix update
    async update(item: T): Promise<T | null> {
        const id = item.id;
        if (!id) {
            throw new Error("Missing id field in the update object");
        }

        const fields = Object.keys(item);
        const values = Object.values(item);
        const updates = fields.map((key) => `${key} = ?`);
        const query = `UPDATE ${this.tableName} SET ${updates.join(
            ", ",
        )} WHERE id = ?`;

        const result = await MysqlProvider.dataSource.query(query, [
            ...values,
            id,
        ]);

        if (Array.isArray(result)) {
            const updatedRow = result[0];
            if ("affectedRows" in updatedRow) {
                return item as T;
            }
        }

        return null;
    }

    async delete(id: string): Promise<boolean> {
        const result: any = await MysqlProvider.dataSource.query(
            `DELETE FROM ${this.tableName} WHERE id = ?`,
            [id],
        );
        console.log(result[0].affectedRows > 0);
        if (result[0].affectedRows > 0) {
            return true;
        }
        return false;
    }

    async find(id: string): Promise<T | null> {
        const [rows] = await MysqlProvider.dataSource.query(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [id],
        );

        return rows[0] as T | null;
    }

    async findAll(): Promise<T[]> {
        const [rows] = await MysqlProvider.dataSource.query(
            `SELECT * FROM ${this.tableName}`,
        );

        return rows as T[];
    }
}

export { BaseRepository };
