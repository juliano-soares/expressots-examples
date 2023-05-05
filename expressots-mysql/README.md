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
          <img src="https://avatars.githubusercontent.com/u/2452804?s=200&v=4" width="100px" alt="logo MySQL" />
          <p><strong>MySQL</strong></p>
        </td>
    </tr>
</table>

A project example of Expresso TS framework with MySQL database 💾

## Project Dependences

- NodeJS
- Docker 
- MySQL2
- Expresso TS CLI

## Tutorial using docker in development

- Installing docker [Docker Download](https://docs.docker.com/engine/install/ubuntu/)
- Installing NodeJS: [NodeJS Dowload](https://nodejs.org/en/download)
- Installing Expresso TS CLI: [npm](https://www.npmjs.com/package/@expressots/cli) [yarn](https://yarnpkg.com/package/@expressots/cli)
- Installind Docker Compose: [Docker Compose](https://docs.docker.com/compose/)

Use the following command with your package manager in your command shell:
```
yarn add @expressots/cli
```

- Creating a Expresso TS project with CLI: [ExpressoTS CLI Docs](https://expresso-ts.com/docs/cli/overview)

For create a Expresso TS CLI insert a command in your terminal this command: 

```bash
expressots new expressots-mysql -p yarn -t opinionated
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
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DB=mysql
MYSQL_PORT=3306
```
- Add mysql2 with the command:

```bash
# Using yarn
yarn add mysql2
yarn add @types/mysql2 -D

# Using npm
npm install mysql2
npm install @types/mysql2 -D
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
    image: mysql:5.7
    container_name: mysql
    restart: always
    ports:
      - 3306:${MYSQL_PORT}
    environment:
      - MYSQL_USERNAME=${MYSQL_USER}
      - MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DB}
    volumes:
      - mysqldata:/data/mysqldata
volumes:
  mysqldata:
    driver: local
```

- Building Docker and Docker Compose

```bash
docker build .
docker-compose up
```
**Ready now you have postgresql database running with docker**

Your next steps now are to interact with the database by creating tables, adding new entities, querying, deleting and changing data.

- Creating the connection:

Create a provider with this command using ExpressoTS CLI:

```
expressots generate p database/mysql/mysql
```

This command will generate a provider file that will be our connection with mysql, following the file structure.

```
project-name/
├── src/
|   ├── providers/
│       ├── database/
|           ├── mysql/
|               ├── mysql.provider.ts
|
```

Modify the file "mysql.provider.ts" to have a MySQL connection.
```ts
import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { createConnection, Connection } from "mysql2/promise";
import bluebird from "bluebird";

@provide(MysqlProvider)
class MysqlProvider {
    static dataSource: Connection;

    static async connect() {
        log(LogLevel.Info, "Connecting to MySQL", "mysql-provider");
        this.dataSource = await createConnection({
            host: ENV.Database.MYSQL_HOST,
            user: ENV.Database.MYSQL_USER,
            password: ENV.Database.MYSQL_PASSWORD,
            database: ENV.Database.MYSQL_DB,
            Promise: bluebird,
        });

        log(LogLevel.Info, "Connected to MySQL", "mysql-provider");
    }

    static async disconnect() {
        await this.dataSource.end();
        log(LogLevel.Info, "Disconnecting from MySQL", "mysql-provider");
    }

    static async seeds() {
    }
}

export { MysqlProvider };
```

- For this example, let's create the users table: 
Now let's create the user entity, for this we will create a folder called "seeds" in the following directory "src/providers/database/postgres" and inside this folder we will create a file called "user.ts" which we will add the following query to create our table in the database.

```ts
import { MysqlProvider } from "../mysql.provider";

class UserTable {
    static async execute() {
        const query = `
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL
        )`;

        await MysqlProvider.dataSource.execute(query);
    }
}

export { UserTable };
```

- Now import and add the method to create the table in the mysql provider, thus getting the file.

```ts
import { LogLevel, log } from "@expressots/core";
import ENV from "env";
import { provide } from "inversify-binding-decorators";
import { createConnection, Connection } from "mysql2/promise";
import { UserTable } from "./seeds/user";
import bluebird from "bluebird";

@provide(MysqlProvider)
class MysqlProvider {
    static dataSource: Connection;

    static async connect() {
        log(LogLevel.Info, "Connecting to MySQL", "mysql-provider");
        this.dataSource = await createConnection({
            host: ENV.Database.MYSQL_HOST,
            user: ENV.Database.MYSQL_USER,
            password: ENV.Database.MYSQL_PASSWORD,
            database: ENV.Database.MYSQL_DB,
            Promise: bluebird,
        });

        log(LogLevel.Info, "Connected to MySQL", "mysql-provider");
    }

    static async disconnect() {
        await this.dataSource.end();
        log(LogLevel.Info, "Disconnecting from MySQL", "mysql-provider");
    }

    static async seeds() {
        await UserTable.execute();
    }
}

export { MysqlProvider };
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
import { MysqlProvider } from "@providers/database/mysql/mysql.provider";
import { provide } from "inversify-binding-decorators";

@provide(App)
class App extends Application {
    protected configureServices(): void {
        Environments.checkAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected async postServerInitialization(): Promise<void> {
        await MysqlProvider.connect();
        await MysqlProvider.seeds();
    }

    protected async serverShutdown(): Promise<void> {
        MysqlProvider.disconnect();
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
        MYSQL_HOST: process.env.MYSQL_HOST as string,
        MYSQL_PORT: Number(process.env.MYSQL_PORT),
        MYSQL_USER: process.env.MYSQL_USER as string,
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD as string,
        MYSQL_DB: process.env.MYSQL_DB as string,
    },
};

export default ENV;
```

- Now that we have the connection with the database, i can start our application and see if the table was created, for this we will use the following command:

```bash
# yarn
yarn dev

# npm
npm run dev
```

- Now let's check if the table was created, for this we will use your favorite database manager, in my case i will use [Beekeaper Studio](https://www.beekeeperstudio.io), and we will connect to our database, for this we will use the following data:

```
Host: localhost
Port: 3306
Database: mysql
User: root
Password: root
```

- Checked the connection, we will see the tables, and we will see that the users table was created.

- In this example we already have an entity called user let's just modify the base-repository to accept mysql.

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
import { MysqlProvider } from "@providers/database/mysql/mysql.provider";
import { BaseRepository } from "@repositories/base-repository";
import { User } from "@entities/user.entity";

@provide(UserRepository)
class UserRepository extends BaseRepository<User> {
    constructor() {
        super();
        this.tableName = "users";
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await MysqlProvider.dataSource.query(
            `SELECT * FROM ${this.tableName} WHERE email = ?`,
            [email],
        );

        if (Array.isArray(result)) {
            const user = result[0][0];
            if (user) {
                return user as User;
            }
        }
        return null;
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
