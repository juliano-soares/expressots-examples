<div style="display: flex; align-items: center; justify-content: space-evenly; margin: 20px;">
  <div style="display: flex; flex-direction: column; align-items: center;">
    <img src="https://avatars.githubusercontent.com/u/124537431?s=200&v=4" width="100px" alt="logo ExpressoTS" />
    <h1>ExpressoTS</h1>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <h1>+</h1>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center;" height="100px">
    <img src="https://avatars.githubusercontent.com/u/177543?s=200&v=4" width="100px" alt="logo PostgreSQL" />
    <h1>PostgreSQL</h1>
  </div>
</div>

A project example of Expresso TS framework with PostgreSQL database 💾

## Project Dependences

- NodeJS
- Docker 
- PostgreSQL
- Expresso TS CLI

## Tutorial using docker in development

- installing docker [Docker Download](https://docs.docker.com/engine/install/ubuntu/)
- Installing NodeJS: [NodeJS Dowload](https://nodejs.org/en/download)
- Installing Expresso TS CLI: [npm](https://www.npmjs.com/package/@expressots/cli) [yarn](https://yarnpkg.com/package/@expressots/cli)
- installind Docker Compose: [Docker Compose](https://docs.docker.com/compose/)

Use the following command with your package manager in your command shell:
```
yarn add @expressots/cli
```

- Creating a Expresso TS project with CLI: [ExpressoTS CLI Docs](https://expresso-ts.com/docs/cli/overview)

For create a Expresso TS CLI insert a command in your terminal this command: 

```bash
expressots new expressots-postgresql -p yarn -t opinionated
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
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
POSTGRES_PORT=5432
```
- Add postgres with the command:

```bash
# Using yarn
yarn add pg
yarn add @types/pg -D

# Using npm
npm install pg
npm install @types/pg -D
```

- Creating a Dockerfile
Create a file at the base of your project called Dockefile and insert the following data:

```dockerfile
FROM node:alpine
WORKDIR /usr/app

COPY package.json ./
RUN npm install && npm cache clean --force

COPY tsconfig.json ./

COPY . .
COPY .env ./

EXPOSE ${PORT}

RUN npm run build
CMD ["npm", "run", "dev"]
```
- Creating a .dockerignore

```Dockerfile
node_modules
logs
```

- Creating a Docker Compose file "docker-compose.yml"
```yml
version: "3.7"
services:
  database:
    image: postgres
    container_name: postgres
    restart: always
    ports:
      - 5432:${POSTGRES_PORT}
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - pgdata:/data/postgres
volumes:
  pgdata:
    driver: local
```

- Building Docker and Dcoker Compose

```bash
docker build .
docker-compose up
```
**Ready now you have postgresql database running with docker**

Your next steps now are to interact with the database by creating tables, adding new entities, querying, deleting and changing data.

- Creating the connection:

Create a provider with this command using ExpressoTS CLI:

```
expressots generate p database/postgres/postgres
```

This command will generate a provider file that will be our connection with postgres, following the file structure.

```
project-name/
├── src/
|   ├── providers/
│       ├── database/
|           ├── postgres/
|               ├── postgres.provider.ts
|
```

Modify the file "postgres.provider.ts" to have a Postgres connection.
```ts
import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { Client } from "pg";

@provide(PostgresProvider)
class PostgresProvider {
    static dataSource: Client;

    static async connect() {
        PostgresProvider.dataSource = new Client({
            user: ENV.Database.POSTGRES_USER,
            host: ENV.Database.POSTGRES_HOST,
            database: ENV.Database.POSTGRES_DB,
            password: ENV.Database.POSTGRES_PASSWORD,
            port: ENV.Database.POSTGRES_PORT,
        });

        log(LogLevel.Info, "Connecting to Postgres", "postgres-provider");
        return await PostgresProvider.dataSource.connect();
    }

    static async disconnect() {
        log(LogLevel.Info, "Disconnecting to Postgres", "postgres-provider");
        return await PostgresProvider.dataSource.end();
    }

    static async seeds() {
    }
}

export { PostgresProvider };
```

- For this example, let's create the users table: 
Now let's create the user entity, for this we will create a folder called "seeds" in the following directory "src/providers/database/postgres" and inside this folder we will create a file called "user.ts" which we will add the following query to create our table in the database.

```ts
import { PostgresProvider } from "../postgres.provider";

class UserTable {
    static async execute() {
        const query = `
      		CREATE TABLE IF NOT EXISTS users (
        	id VARCHAR PRIMARY KEY,
        	name TEXT NOT NULL,
        	email TEXT NOT NULL
      	)`;

        await PostgresProvider.dataSource.query(query);
    }
}

export { UserTable };
```

- Now import and add the method to create the table in the postgres provider, thus getting the file.

```ts
import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { Client } from "pg";
import { UserTable } from "./seeds/user";

@provide(PostgresProvider)
class PostgresProvider {
    static dataSource: Client;

    static async connect() {
        PostgresProvider.dataSource = new Client({
            user: ENV.Database.POSTGRES_USER,
            host: ENV.Database.POSTGRES_HOST,
            database: ENV.Database.POSTGRES_DB,
            password: ENV.Database.POSTGRES_PASSWORD,
            port: ENV.Database.POSTGRES_PORT,
        });

        log(LogLevel.Info, "Connecting to Postgres", "postgres-provider");
        return await PostgresProvider.dataSource.connect();
    }

    static async disconnect() {
        log(LogLevel.Info, "Disconnecting to Postgres", "postgres-provider");
        return await PostgresProvider.dataSource.end();
    }

    static async seeds() {
        UserTable.execute(); // This line creates the table if it doesn't exist
    }
}

export { PostgresProvider };
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
        POSTGRES_HOST: process.env.POSTGRES_HOST as string,
        POSTGRES_PORT: Number(process.env.POSTGRES_PORT),
        POSTGRES_USER: process.env.POSTGRES_USER as string,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD as string,
        POSTGRES_DB: process.env.POSTGRES_DB as string,
    },
};

export default ENV;
```

- Now that we have the connection with the database, i can start our application and see if the table was created, for this we will use the following command:

```bash
npm run dev
```

- Now let's check if the table was created, for this we will use your favorite database manager, in my case i will use [Beekeaper Studio](https://www.beekeeperstudio.io), and we will connect to our database, for this we will use the following data:

```
Host: localhost
Port: 5432
Database: postgres
User: postgres
Password: postgres
```

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
import { PostgresProvider } from "@providers/database/postgres/postgres.provider";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await PostgresProvider.dataSource.query(
            `SELECT * FROM users WHERE email = ($1)`,
            [email],
        );
        return result.rows[0] || null;
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
