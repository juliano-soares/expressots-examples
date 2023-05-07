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

        return new Promise((resolve, reject) => {
            SqliteProvider.dataSource.run(query, values, (err: any) => {
                if (err) {
                    reject(err);
                }
                resolve(item as T);
            });
        });
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

        return new Promise((resolve, reject) => {
            SqliteProvider.dataSource.run(
                query,
                [...values, id],
                (err: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(item);
                },
            );
        });
    }

    async delete(id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            SqliteProvider.dataSource.run(
                `DELETE FROM ${this.tableName} WHERE id = ?`,
                [id],
                (err: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                },
            );
        });
    }

    async find(id: string): Promise<T | null> {
        return new Promise((resolve, reject) => {
            SqliteProvider.dataSource.get(
                `SELECT * FROM ${this.tableName} WHERE id = ?`,
                [id],
                (err: any, row: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row ? (row as unknown as T) : null);
                },
            );
        });
    }

    async findAll(): Promise<T[]> {
        return new Promise((resolve, reject) => {
            SqliteProvider.dataSource.all(
                `SELECT * FROM ${this.tableName}`,
                (err: any, rows) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows as T[] | []);
                },
            );
        });
    }
}

export { BaseRepository };
