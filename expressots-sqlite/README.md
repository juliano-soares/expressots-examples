<table align="center">
    <tr>
        <td align="center">
          <img src="https://avatars.githubusercontent.com/u/124537431?s=200&v=4" width="100px" alt="logo ExpressoTS" />
          <p><strong>ExpressoTS</strong></p>        
        </td>
        <td align="center">
          <p><strong>+</strong></p>
        </td>
        <td align="center">
          <img src="https://avatars.githubusercontent.com/u/48680494?v=4" width="100px" alt="logo SQLite" />
          <p><strong>SQLite</strong></p>
        </td>
    </tr>
</table>

A project example of Expresso TS framework with SQLite database 💾

## Project Dependences

- NodeJS
- Docker 
- SQLite
- Expresso TS CLI

## Tutorial using docker in development

- Installing NodeJS: [NodeJS Dowload](https://nodejs.org/en/download)
- Installing Expresso TS CLI: [npm](https://www.npmjs.com/package/@expressots/cli) [yarn](https://yarnpkg.com/package/@expressots/cli)

Use the following command with your package manager in your command shell:
```shell
# yarn
yarn add @expressots/cli

# npm
npm install @expressots/cli
```

- Creating a Expresso TS project with CLI: [ExpressoTS CLI Docs](https://expresso-ts.com/docs/cli/overview)

For create a Expresso TS CLI insert a command in your terminal this command: 

```bash
expressots new expressots-sqlite -p yarn -t opinionated
```

Open your project in your favorite IDE and follow the next steps.

Configure/Create the .env file based on the example

```
# Application
ENVIRONMENT="Development" #Development, Staging, Production
PORT=3000

# Log System
FILE=general #log file name
FOLDER=logs #log folder name

# Database
SQLITE_FILENAME=database.db
```

- Add postgres with the command:

```bash
# Using yarn
yarn add sqlite3
yarn add @types/sqlite3 -D

# Using npm
npm install sqlite3
npm install @types/sqlite3 -D
```

Your next steps now are to interact with the database by creating tables, adding new entities, querying, deleting and changing data.

- Creating the connection:

Create a provider with this command using ExpressoTS CLI:

```
expressots generate p database/sqlite/sqlite
```

This command will generate a provider file that will be our connection with sqlite, following the file structure.

```
project-name/
├── src/
|   ├── providers/
│       ├── database/
|           ├── sqlite/
|               ├── sqlite.provider.ts
|
```

Modify the file "sqlite.provider.ts" to have a sqlite connection.
```ts
import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import sqlite3 from "sqlite3";

@provide(Sqlite3Provider)
class Sqlite3Provider {
    static dataSource: sqlite3.Database;

    static async connect() {
        Sqlite3Provider.dataSource = new sqlite3.Database(
            ENV.Database.SQLITE_PATH,
        );

        log(LogLevel.Info, "Connecting to SQLite3", "sqlite3-provider");
        return new Promise<void>((resolve, reject) => {
            Sqlite3Provider.dataSource.once("open", () => {
                resolve();
            });
            Sqlite3Provider.dataSource.once("error", (error) => {
                reject(error);
            });
        });
    }

    static async disconnect() {
        log(LogLevel.Info, "Disconnecting to SQLite3", "sqlite3-provider");
        return Sqlite3Provider.dataSource.close();
    }

    static async seeds() {}
}
```

- For this example, let's create the users table: 
Now let's create the user entity, for this we will create a folder called "seeds" in the following directory "src/providers/database/sqlite" and inside this folder we will create a file called "user.ts" which we will add the following query to create our table in the database.

```ts
import { SqliteProvider } from "../sqlite.provider";

class UserTable {
    static async execute() {
        const query = `
          CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL
        )`;

        SqliteProvider.dataSource.run(query);
    }
}

export { UserTable };
```

- Now import and add the method to create the table in the SQLite provider, thus getting the file.

```ts
import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import sqlite3 from "sqlite3";
import { UserTable } from "./seeds/user";

@provide(SqliteProvider)
class SqliteProvider {
    static dataSource: sqlite3.Database;

    static async connect() {
        SqliteProvider.dataSource = new sqlite3.Database(
            ENV.Database.SQLITE_PATH,
        );

        log(LogLevel.Info, "Connecting to SQLite3", "sqlite3-provider");
        return new Promise<void>((resolve, reject) => {
            SqliteProvider.dataSource.once("open", () => {
                resolve();
            });
            SqliteProvider.dataSource.once("error", (error) => {
                reject(error);
            });
        });
    }

    static async disconnect() {
        log(LogLevel.Info, "Disconnecting to SQLite3", "sqlite3-provider");
        return SqliteProvider.dataSource.close();
    }

    static async seeds() {
        UserTable.execute();
    }
}

export { SqliteProvider };

```

- Add your database provider to the application in the application.ts file contained in the following file structure:

```
project-name/
├── src/
|   ├── providers/
│       ├── application/
|           ├── application.ts
|
```

- The file should look like this:

```ts
import { Application, Environments, LogLevel, log } from "@expressots/core";
import { PostgresProvider } from "@providers/database/postgres/postgres.provider";
import { provide } from "inversify-binding-decorators";

@provide(App)
class App extends Application {
    protected configureServices(): void {
        Environments.checkAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected postServerInitialization(): void {
        PostgresProvider.connect();
        PostgresProvider.seeds();
    }

    protected serverShutdown(): void {
        PostgresProvider.disconnect();
        log(LogLevel.Info, "Server is shutting down", "logger-provider");
        super.serverShutdown();
    }
}

const appInstance = new App();

export { appInstance as App };
```

- Now adjust your .env file to have the following data:
```
project-name/
├── src/
|   ├── env.ts
```

```ts
import pkg from "../package.json";

const ENV = {
    Application: {
        APP_NAME: pkg.name,
        APP_VERSION: pkg.version,
        ENVIRONMENT: process.env.ENVIRONMENT as string,
        PORT: Number(process.env.PORT),
    },
    Log: {
        FILE: process.env.FILE as string,
        FOLDER: process.env.FOLDER as string,
    },
    Database: {
        SQLITE_PATH: process.env.SQLITE_PATH as string,
    },
};

export default ENV;
```

- Now that we have the connection with the database, i can start our application and see if the table was created, for this we will use the following command:

```bash
# with npm
npm run dev

# with yarn
yarn dev
```

- Now let's check if the table was created, for this we will use your favorite database manager, in my case i will use a VSCode extension [SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer), and we will open our database with double click:

- Checked the connection, we will see the tables, and we will see that the users table was created.

- In this example we already have an entity called user let's just modify the base-repository to accept postgres.

This modification will allow us to create a generic repository that will be used by all repositories that we will create in the future. Using this approach we will not need to create the same methods in all repositories, we will only need to create the methods that are specific to each repository.

```
project-name/
├── src/
|   ├── repositories/
│       ├── base-repository.ts
```
```ts
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
```

- We will also need to modify the base-repository interface with the following code:

```ts
interface IBaseRepository<T> {
    create(item: Omit<T, "id">): Promise<T | null>;
    update(item: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    find(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
}

export { IBaseRepository };
```

- Now let's modify our user.repository.ts file to have the following code:

```ts
import { provide } from "inversify-binding-decorators";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";
import { SqliteProvider } from "@providers/database/sqlite/sqlite.provider";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    findByEmail(email: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            SqliteProvider.dataSource.get(
                `SELECT * FROM ${this.tableName} WHERE email = ?`,
                [email],
                (err: any, row: any) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row ? (row as unknown as User) : null);
                },
            );
        });
    }
}

export { UserRepository };
```

- Now let's modify our create-user.controller.ts file to have the following code:

```ts
import { BaseController, StatusCode } from "@expressots/core";
import {
    controller,
    httpPost,
    requestBody,
    response,
} from "inversify-express-utils";
import {
    ICreateUserRequestDTO,
    ICreateUserResponseDTO,
} from "./create-user.dto";
import { CreateUserUseCase } from "./create-user.usecase";

@controller("/user/create")
class CreateUserController extends BaseController {
    constructor(private createUserUseCase: CreateUserUseCase) {
        super("create-user-controller");
    }

    @httpPost("/")
    async execute(
        @requestBody() data: ICreateUserRequestDTO,
        @response() res: any,
    ): Promise<ICreateUserResponseDTO> {
        return this.callUseCaseAsync(
            this.createUserUseCase.execute(data),
            res,
            StatusCode.Created,
        );
    }
}

export { CreateUserController };
```

- And finally let's modify our create-user.usecase.ts file to have the following code:

```ts
import { AppError, Report, StatusCode } from "@expressots/core";
import { provide } from "inversify-binding-decorators";
import {
    ICreateUserRequestDTO,
    ICreateUserResponseDTO,
} from "./create-user.dto";
import { UserRepository } from "@repositories/user/user.repository";
import { User } from "@entities/user.entity";

@provide(CreateUserUseCase)
class CreateUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(
        data: ICreateUserRequestDTO,
    ): Promise<ICreateUserResponseDTO | null> {
        try {
            const { name, email } = data;

            const userExist = await this.userRepository.findByEmail(email);

            if (userExist) {
                Report.Error(
                    new AppError(
                        StatusCode.BadRequest,
                        "User already exists",
                        "create-user-usecase",
                    ),
                );
            }

            const user: User | null = await this.userRepository.create(
                new User(name, email),
            );

            let response: ICreateUserResponseDTO;

            if (user !== null) {
                response = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: "user created successfully",
                };
                return response;
            }

            return null;
        } catch (error: any) {
            throw error;
        }
    }
}

export { CreateUserUseCase };
```

creating a POST type request at the following URL "http://localhost:3000/user/create" with the following request body
```json
{
  "name": "teste",
  "email": "teste@teste.com"
}
```

And view the response in your database.

In this project there are another examples of usecases such as: findall, findbyid, update and delete. You can see the complete code in this repository and use it as a base for your projects.

## Stay in touch

Author - [Juliano Soares](https://github.com/juliano-soares)

## License

Expresso TS [MIT LICENSE](https://github.com/expressots/expressots/blob/main/LICENSE.md).
