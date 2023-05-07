import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { Db, MongoClient } from "mongodb";

@provide(MongodbProvider)
class MongodbProvider {
    static client: MongoClient;
    static dataSource: Db;

    static async connect() {
        log(LogLevel.Info, "Connecting to MongoDB", "mongodb-provider");
        this.client = new MongoClient(
            `mongodb://${ENV.Database.host}:${ENV.Database.port}/${ENV.Database.database}`,
        );
        await this.client.connect();

        this.dataSource = this.client.db(ENV.Database.database);
        this.createCollections();
        log(LogLevel.Info, "Connected to MongoDB", "mongodb-provider");
    }

    static async disconnect() {
        await this.client.close();
        log(LogLevel.Info, "Disconnecting from MongoDB", "mongodb-provider");
    }

    static async createCollections() {
        try {
            const collections = ["users"]; // Add new collection names here
            const existingCollections = await this.dataSource
                .listCollections()
                .toArray();
            for (const collection of collections) {
                if (existingCollections.some((c) => c.name === collection)) {
                    continue;
                } else {
                    await this.dataSource.createCollection(collection);
                }
            }
            log(LogLevel.Info, "Created collections", "mongodb-provider");
        } catch (error) {
            console.log(error);
            log(
                LogLevel.Error,
                "Error creating collections",
                "mongodb-provider",
            );
        }
    }
}

export { MongodbProvider };
